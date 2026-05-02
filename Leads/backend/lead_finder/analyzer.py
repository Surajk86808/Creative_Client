"""Website quality analyzer for lead qualification."""

from __future__ import annotations

import contextlib
import io
import json
import os
import re
import time
from datetime import UTC, datetime
from typing import Any
from urllib.parse import urlparse

import httpx
import whois
from bs4 import BeautifulSoup

from config import REQUEST_TIMEOUT, WEBSITE_ANALYSIS_TIMEOUT
from models import WebsiteReport

JQUERY_VERSION_RE = re.compile(r"jquery[-.]([0-9]+\.[0-9]+(\.[0-9]+)?)", re.IGNORECASE)
YEAR_RE = re.compile(r"(20[0-2][0-9]|19[9][0-9])")
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
NVIDIA_PRIMARY_MODEL = "nvidia/llama-3.1-nemotron-ultra-253b-v1"
NVIDIA_FALLBACK_MODEL = "nvidia/nemotron-mini-4b-instruct"
AI_SCORE_PROMPT = """You are a lead qualification expert for a web development agency targeting SMBs.
Analyze this business lead and return a JSON object with these fields only:
- ai_score: integer 1-10 (10 = highest conversion potential)
- weakness_summary: one sentence describing the biggest website weakness
- outreach_angle: one sentence on best way to pitch this business
- priority: "high" | "medium" | "low"

Lead data:
{lead_summary}
"""


def _normalize_url(website: str) -> str:
    """Normalize URL by ensuring a scheme exists."""
    value = website.strip()
    if value.startswith(("http://", "https://")):
        return value
    return f"http://{value}"


def _extract_copyright_year(html: str) -> int | None:
    """Extract likely copyright/update year from page text."""
    soup = BeautifulSoup(html, "html.parser")
    text = " ".join(soup.get_text(" ", strip=True).split())
    years = [int(match.group(1)) for match in YEAR_RE.finditer(text)]
    if not years:
        return None
    return max(years)


def _is_old_jquery(html: str) -> bool:
    """Return True when jQuery version in source looks outdated."""
    for match in JQUERY_VERSION_RE.finditer(html):
        major_minor = match.group(1).split(".")
        try:
            major = int(major_minor[0])
            minor = int(major_minor[1]) if len(major_minor) > 1 else 0
        except ValueError:
            continue
        if major < 3 or (major == 3 and minor < 5):
            return True
    return False


def _domain_age_years(hostname: str | None) -> int | None:
    """Estimate domain age in years via WHOIS creation date."""
    if not hostname:
        return None
    try:
        # python-whois can print socket/DNS errors even when exceptions are handled.
        # Suppress noisy stderr/stdout so batch analysis logs stay readable.
        with contextlib.redirect_stderr(io.StringIO()), contextlib.redirect_stdout(io.StringIO()):
            data = whois.whois(hostname)
        created = data.creation_date
        if isinstance(created, list):
            created = created[0] if created else None
        if created is None:
            return None
        now = datetime.now(UTC).replace(tzinfo=None)
        return max(0, (now - created.replace(tzinfo=None)).days // 365)
    except Exception:
        return None


def _non_empty_text(value: Any) -> str:
    return str(value or "").strip()


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


def _lead_has_phone(lead: dict[str, Any]) -> bool:
    return any(_non_empty_text(lead.get(key)) for key in ("phone", "phone_number", "whatsapp"))


def _lead_has_email(lead: dict[str, Any]) -> bool:
    if _non_empty_text(lead.get("email")):
        return True
    if _non_empty_text(lead.get("primary_email")):
        return True
    emails = lead.get("emails")
    if not isinstance(emails, list):
        return False
    return any(_non_empty_text(item) for item in emails)


def _build_lead_summary(lead: dict[str, Any]) -> str:
    website_present = "yes" if _non_empty_text(lead.get("website")) else "no"
    phone_present = "yes" if _lead_has_phone(lead) else "no"
    email_present = "yes" if _lead_has_email(lead) else "no"
    website_issues = _lead_website_issues(lead)
    issues_text = ", ".join(website_issues) if website_issues else "none"
    parts = [
        f"business name: {_non_empty_text(lead.get('name')) or 'unknown'}",
        f"category: {_non_empty_text(lead.get('category')) or 'unknown'}",
        f"city: {_non_empty_text(lead.get('city')) or 'unknown'}",
        f"website_present: {website_present}",
        f"website_issues: {issues_text}",
        f"phone_present: {phone_present}",
        f"email_present: {email_present}",
    ]
    return "\n".join(parts)


def _load_openai_client(api_key: str):
    from openai import OpenAI

    return OpenAI(base_url=NVIDIA_BASE_URL, api_key=api_key)


def _extract_json_object(raw: str) -> dict[str, Any]:
    text = str(raw or "").strip()
    if not text:
        raise ValueError("Empty model response")
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model response")
    parsed = json.loads(text[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("Parsed response is not an object")
    return parsed


def _is_quota_exceeded_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return "quota" in message or "429" in message or "insufficient_quota" in message


def _request_ai_score(client, model: str, lead_summary: str) -> dict[str, Any]:
    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {
                "role": "user",
                "content": AI_SCORE_PROMPT.format(lead_summary=lead_summary),
            }
        ],
    )
    content = response.choices[0].message.content if response.choices else ""
    return _extract_json_object(content or "")


def ai_score_lead(lead: dict) -> dict:
    """Enrich a lead with AI scoring data from NVIDIA NIM when configured."""
    api_key = os.getenv("NVIDIA_API_KEY", "").strip()
    if not api_key:
        return lead

    if all(key in lead for key in ("ai_score", "weakness_summary", "outreach_angle", "priority")):
        return lead

    try:
        client = _load_openai_client(api_key)
    except Exception:
        return lead

    lead_summary = _build_lead_summary(lead)
    try:
        parsed = _request_ai_score(client, NVIDIA_PRIMARY_MODEL, lead_summary)
    except Exception as exc:
        if not _is_quota_exceeded_error(exc):
            return lead
        try:
            parsed = _request_ai_score(client, NVIDIA_FALLBACK_MODEL, lead_summary)
        except Exception:
            return lead

    try:
        ai_score = int(parsed["ai_score"])
        weakness_summary = str(parsed["weakness_summary"]).strip()
        outreach_angle = str(parsed["outreach_angle"]).strip()
        priority = str(parsed["priority"]).strip().lower()
        if priority not in {"high", "medium", "low"}:
            raise ValueError("Invalid priority")
        lead["ai_score"] = max(1, min(10, ai_score))
        lead["weakness_summary"] = weakness_summary
        lead["outreach_angle"] = outreach_angle
        lead["priority"] = priority
    except Exception:
        lead["ai_score_error"] = True
    return lead


def analyze_website(website: str | None) -> WebsiteReport:
    """Analyze website quality and return a structured report."""
    if not website:
        return WebsiteReport(
            reachable=False,
            website_score=1,
            issues=["No website"],
        )

    url = _normalize_url(website)
    parsed = urlparse(url)
    issues: list[str] = []
    report = WebsiteReport(issues=issues)

    if parsed.scheme == "http":
        issues.append("No SSL (HTTP only)")

    timeout = httpx.Timeout(WEBSITE_ANALYSIS_TIMEOUT, connect=REQUEST_TIMEOUT)
    html = ""
    with httpx.Client(follow_redirects=True, timeout=timeout) as client:
        start = time.perf_counter()
        try:
            response = client.get(url)
            elapsed_ms = int((time.perf_counter() - start) * 1000)
        except Exception:
            report.reachable = False
            report.website_score = 1
            issues.append("Website unreachable")
            return report

    report.reachable = True
    report.final_url = str(response.url)
    report.response_time_ms = elapsed_ms
    report.uses_https = str(response.url).startswith("https://")
    html = response.text or ""

    if not report.uses_https:
        issues.append("No SSL (HTTP only)")

    if (report.response_time_ms or 0) > 3000:
        issues.append("Slow website (>3s)")

    soup = BeautifulSoup(html, "html.parser")
    report.mobile_friendly = bool(soup.find("meta", attrs={"name": re.compile("viewport", re.I)}))
    if not report.mobile_friendly:
        issues.append("No mobile viewport")

    report.copyright_year = _extract_copyright_year(html)
    if report.copyright_year is not None and report.copyright_year < 2020:
        issues.append(f"Outdated footer year ({report.copyright_year})")

    generator = (soup.find("meta", attrs={"name": "generator"}) or {}).get("content", "")
    report.old_wordpress = "wordpress" in generator.lower() and any(
        token in generator.lower() for token in ("4.", "5.0", "5.1", "5.2", "5.3", "5.4", "5.5")
    )
    if report.old_wordpress:
        issues.append("Old WordPress signature")

    report.old_jquery = _is_old_jquery(html)
    if report.old_jquery:
        issues.append("Old jQuery detected")

    report.flash_detected = ".swf" in html.lower() or "shockwave flash" in html.lower()
    if report.flash_detected:
        issues.append("Flash reference detected")

    table_count = len(soup.find_all("table"))
    report.table_layout_heavy = table_count >= 8
    if report.table_layout_heavy:
        issues.append("Table-heavy layout")

    report.domain_age_years = _domain_age_years(urlparse(str(response.url)).hostname)
    if (report.domain_age_years or 0) > 5:
        issues.append("Domain older than 5 years")

    # Scoring from modern->poor quality, then normalized to 1..10.
    score = 10
    score -= 3 if not report.reachable else 0
    score -= 2 if not report.uses_https else 0
    score -= 1 if not report.mobile_friendly else 0
    score -= 1 if (report.response_time_ms or 0) > 3000 else 0
    score -= 1 if report.copyright_year is not None and report.copyright_year < 2020 else 0
    score -= 1 if report.old_wordpress or report.old_jquery or report.flash_detected else 0
    score -= 1 if report.table_layout_heavy else 0
    score = max(1, min(10, score))
    report.website_score = score
    report.issues = issues
    return report
