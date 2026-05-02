from __future__ import annotations

import re
from typing import Any

from .model_registry import MODEL_REGISTRY
from .nvidia_client import NVIDIAClient


_client = NVIDIAClient()


def _non_empty_text(value: Any) -> str:
    return str(value or "").strip()


def _lead_has_phone(lead: dict[str, Any]) -> bool:
    return any(_non_empty_text(lead.get(key)) for key in ("phone", "phone_number", "whatsapp"))


def _lead_has_email(lead: dict[str, Any]) -> bool:
    if _non_empty_text(lead.get("email")) or _non_empty_text(lead.get("primary_email")):
        return True
    emails = lead.get("emails")
    return isinstance(emails, list) and any(_non_empty_text(item) for item in emails)


def _lead_website_issues(lead: dict[str, Any]) -> list[str]:
    website_issues = lead.get("website_issues")
    if isinstance(website_issues, list):
        return [str(item).strip() for item in website_issues if str(item).strip()]
    website_report = lead.get("website_report")
    if isinstance(website_report, dict):
        issues = website_report.get("issues")
        if isinstance(issues, list):
            return [str(item).strip() for item in issues if str(item).strip()]
    return []


def _word_trim(text: str, max_words: int) -> str:
    words = str(text or "").split()
    if len(words) <= max_words:
        return str(text or "").strip()
    return " ".join(words[:max_words]).strip()


def analyze_lead(data: dict[str, Any]) -> dict[str, Any]:
    website_present = "yes" if _non_empty_text(data.get("website")) else "no"
    phone_present = "yes" if _lead_has_phone(data) else "no"
    email_present = "yes" if _lead_has_email(data) else "no"
    website_issues = _lead_website_issues(data)
    issues_text = ", ".join(website_issues) if website_issues else "none"
    lead_summary = "\n".join(
        [
            f"business name: {_non_empty_text(data.get('name')) or 'unknown'}",
            f"category: {_non_empty_text(data.get('category')) or 'unknown'}",
            f"city: {_non_empty_text(data.get('city')) or 'unknown'}",
            f"website_present: {website_present}",
            f"website_issues: {issues_text}",
            f"phone_present: {phone_present}",
            f"email_present: {email_present}",
        ]
    )
    messages = [
        {
            "role": "user",
            "content": (
                "You are a lead qualification expert for a web development agency targeting SMBs. "
                "Return JSON only with fields: ai_score, weakness_summary, outreach_angle, priority. "
                "ai_score must be an integer 1-10. priority must be high, medium, or low.\n\n"
                f"Lead data:\n{lead_summary}"
            ),
        }
    ]
    parsed = _client.invoke_json_sync(
        task_name="analyze_lead",
        capability="analysis",
        messages=messages,
        temperature=0.2,
        max_tokens=300,
    )
    ai_score = max(1, min(10, int(parsed["ai_score"])))
    priority = str(parsed["priority"]).strip().lower()
    if priority not in {"high", "medium", "low"}:
        raise ValueError("Invalid priority from analyze_lead")
    return {
        "ai_score": ai_score,
        "weakness_summary": str(parsed["weakness_summary"]).strip(),
        "outreach_angle": str(parsed["outreach_angle"]).strip(),
        "priority": priority,
        "model": MODEL_REGISTRY["analysis"],
    }


def generate_email(lead_data: dict[str, Any]) -> dict[str, Any]:
    messages = [
        {
            "role": "system",
            "content": (
                "You write concise, personalized cold outreach emails for a web development agency. "
                "Return JSON only with fields: subject, body, ps_line."
            ),
        },
        {
            "role": "user",
            "content": (
                "Write a personalized outreach email.\n\n"
                f"Business: {_non_empty_text(lead_data.get('business_name') or lead_data.get('shop_name') or lead_data.get('name'))}\n"
                f"Category: {_non_empty_text(lead_data.get('category'))}\n"
                f"City: {_non_empty_text(lead_data.get('city') or lead_data.get('location'))}\n"
                f"Location: {_non_empty_text(lead_data.get('location') or lead_data.get('city'))}\n"
                f"Website URL: {_non_empty_text(lead_data.get('website_url')) or 'not provided'}\n"
                f"Weakness summary: {_non_empty_text(lead_data.get('weakness_summary'))}\n"
                f"Outreach angle: {_non_empty_text(lead_data.get('outreach_angle'))}\n"
                f"Template guidance:\n{_non_empty_text(lead_data.get('template_text'))}\n\n"
                "Constraints:\n"
                "- subject max 120 chars\n"
                "- body max 170 words\n"
                "- plain text only\n"
                "- do not include markdown\n"
            ),
        },
    ]
    parsed = _client.invoke_json_sync(
        task_name="generate_email",
        capability="email",
        messages=messages,
        temperature=0.4,
        max_tokens=500,
    )
    subject = str(parsed["subject"]).strip()[:120]
    body = _word_trim(str(parsed["body"]).strip(), 170)
    ps_line = str(parsed.get("ps_line") or "").strip()
    if not subject or not body:
        raise ValueError("Missing required email fields from generate_email")
    return {
        "subject": subject,
        "body": body,
        "ps_line": ps_line,
        "model": MODEL_REGISTRY["email"],
    }


def detect_pii(text: str) -> dict[str, Any]:
    messages = [
        {
            "role": "user",
            "content": (
                "Detect sensitive PII in the following text. Return JSON only with fields: "
                "contains_pii (boolean), findings (array of short strings), redacted_text (string).\n\n"
                f"Text:\n{text}"
            ),
        }
    ]
    parsed = _client.invoke_json_sync(
        task_name="detect_pii",
        capability="pii",
        messages=messages,
        temperature=0.0,
        max_tokens=500,
    )
    findings = parsed.get("findings")
    return {
        "contains_pii": bool(parsed.get("contains_pii")),
        "findings": [str(item).strip() for item in findings] if isinstance(findings, list) else [],
        "redacted_text": str(parsed.get("redacted_text") or "").strip(),
        "model": MODEL_REGISTRY["pii"],
    }


def check_safety(text: str) -> dict[str, Any]:
    messages = [
        {
            "role": "user",
            "content": (
                "Review this cold outreach email for spam signals, aggressive language, misleading claims, "
                "or unsafe outreach content. Return JSON only with fields: safe (boolean), reason (string).\n\n"
                f"Text:\n{text}"
            ),
        }
    ]
    parsed = _client.invoke_json_sync(
        task_name="check_safety",
        capability="safety",
        messages=messages,
        temperature=0.0,
        max_tokens=200,
    )
    return {
        "safe": bool(parsed.get("safe")),
        "reason": str(parsed.get("reason") or "").strip(),
        "model": MODEL_REGISTRY["safety"],
    }
