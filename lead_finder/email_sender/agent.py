from __future__ import annotations

import argparse
import json
import logging
import os
import re
import smtplib
import time
from datetime import datetime, timedelta
from email.message import EmailMessage
from email.utils import parseaddr
from email.utils import make_msgid
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

try:
    from .audit_store import append_audit_log, append_jsonl, utc_now_iso
    from .guardrails import validate_generated_email
    from .rate_limiter import RateLimiter
    from .retry_utils import retry_operation
    from .validation import TemplateValidationError, validate_template_files
except ImportError:
    from audit_store import append_audit_log, append_jsonl, utc_now_iso
    from guardrails import validate_generated_email
    from rate_limiter import RateLimiter
    from retry_utils import retry_operation
    from validation import TemplateValidationError, validate_template_files


load_dotenv()


GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
SMTP_HOST = os.getenv("EMAIL_SMTP_HOST", "smtp.zoho.in")
SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", "465"))
SMTP_SECURITY = os.getenv("EMAIL_SMTP_SECURITY", "ssl").strip().lower()
SMTP_USERNAME = os.getenv("EMAIL_SMTP_USER", "").strip()
AGENCY_NAME = os.getenv("AGENCY_NAME", "").strip()
AGENCY_WEBSITE = os.getenv("AGENCY_WEBSITE", "").strip()
SENDER_PHONE = os.getenv("SENDER_PHONE", "").strip()
SENDER_NAME = os.getenv("SENDER_NAME", "").strip()
SIGNATURE = os.getenv("EMAIL_SIGNATURE", "").strip()
UNSUBSCRIBE_TEXT = os.getenv("EMAIL_UNSUBSCRIBE_TEXT", "To opt out, reply STOP.").strip()
SUPPRESSION_LIST_PATH = Path(
    os.getenv("EMAIL_SUPPRESSION_LIST_PATH", "public/email_status/suppression_list.txt")
).resolve()
BLOCKED_EMAIL_DOMAINS = {
    item.strip().lower()
    for item in os.getenv("EMAIL_BLOCKED_DOMAINS", "").split(",")
    if item.strip()
}
MAX_PER_HOUR = int(os.getenv("MAX_PER_HOUR", "50"))
MAX_PER_DAY = int(os.getenv("MAX_PER_DAY", "200"))
MAX_FAILED_ATTEMPTS_PER_LEAD = int(os.getenv("MAX_FAILED_ATTEMPTS_PER_LEAD", "3"))
FAILED_RETRY_COOLDOWN_HOURS = int(os.getenv("FAILED_RETRY_COOLDOWN_HOURS", "24"))
_LAST_GROQ_CALL_TS = 0.0

CATEGORY_BUCKET_PATH = Path("category_bucket.json")
BUCKET_TEMPLATE_PATH = Path("bucket_email_template.json")


logger = logging.getLogger("email_sender")
ROOT_DIR = Path(__file__).resolve().parents[1]
DAILY_SUMMARY_PATH = ROOT_DIR / "email_send_summary.json"
EMAIL_REGEX = re.compile(
    r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
    r"@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
)


def _sanitize_city_name(city_name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", city_name.strip().lower()).strip("-")
    if not slug:
        raise ValueError("City name must contain alphanumeric characters.")
    return slug


def _is_valid_email(email: str) -> bool:
    _, parsed = parseaddr(email)
    if not parsed or parsed != email:
        return False
    if ".." in parsed:
        return False
    return EMAIL_REGEX.match(parsed) is not None


def _parse_iso_timestamp(value: str) -> datetime | None:
    if not value:
        return None
    normalized = value.strip()
    if normalized.endswith("Z"):
        normalized = f"{normalized[:-1]}+00:00"
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def _build_signature() -> str:
    if SIGNATURE:
        return SIGNATURE
    if AGENCY_WEBSITE and SENDER_PHONE and SENDER_NAME:
        return f"Website: {AGENCY_WEBSITE}\nMobile: {SENDER_PHONE}\n{SENDER_NAME}"
    return ""


def _configure_logging() -> None:
    if not logging.getLogger().handlers:
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s %(levelname)s %(message)s",
        )


def _validate_required_config(*, signature: str, needs_generation: bool, needs_send: bool) -> None:
    required_values: dict[str, str] = {}
    if needs_generation:
        required_values.update(
            {
                "AGENCY_NAME": AGENCY_NAME,
                "AGENCY_WEBSITE": AGENCY_WEBSITE,
                "SENDER_PHONE": SENDER_PHONE,
                "SENDER_NAME": SENDER_NAME,
                "SIGNATURE or EMAIL_SIGNATURE": signature,
                "GROQ_API_KEY": os.getenv("GROQ_API_KEY", "").strip(),
            }
        )
    if needs_send:
        required_values.update(
            {
                "EMAIL_SMTP_USER": SMTP_USERNAME,
                "EMAIL_HOST_PASSWORD": os.getenv("EMAIL_HOST_PASSWORD", "").strip(),
            }
        )
    missing = [key for key, value in required_values.items() if not value]
    if missing:
        raise SystemExit(f"Missing required configuration: {', '.join(missing)}")


def _load_suppression_list(path: Path) -> set[str]:
    if not path.exists():
        return set()
    entries: set[str] = set()
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip().lower()
        if not line or line.startswith("#"):
            continue
        entries.add(line)
    return entries


def _email_domain(email: str) -> str:
    return email.rsplit("@", 1)[1].strip().lower() if "@" in email else ""


def _should_skip_due_to_failures(existing_status: dict[str, Any]) -> tuple[bool, str]:
    if not isinstance(existing_status, dict):
        return False, ""
    if existing_status.get("status") != "FAILED":
        return False, ""

    failed_attempts = _to_int_or_none(existing_status.get("failed_attempts")) or 0
    if failed_attempts >= MAX_FAILED_ATTEMPTS_PER_LEAD:
        return True, f"max_failed_attempts_reached={failed_attempts}"

    attempted_at = _parse_iso_timestamp(str(existing_status.get("attempted_at") or ""))
    if attempted_at is None:
        attempted_at = _parse_iso_timestamp(str(existing_status.get("sent_at") or ""))
    if attempted_at is None:
        return False, ""

    retry_after = attempted_at + timedelta(hours=FAILED_RETRY_COOLDOWN_HOURS)
    now = datetime.now(tz=attempted_at.tzinfo) if attempted_at.tzinfo else datetime.utcnow()
    if now < retry_after:
        return True, f"retry_cooldown_until={retry_after.isoformat()}"
    return False, ""


def load_leads(city_slug: str) -> list[dict[str, Any]]:
    slug_variants = [city_slug]
    if "-" in city_slug:
        slug_variants.append(city_slug.replace("-", "_"))
    if "_" in city_slug:
        slug_variants.append(city_slug.replace("_", "-"))

    candidate_paths: list[Path] = []
    seen: set[Path] = set()

    def _add(path: Path) -> None:
        resolved = path.resolve()
        if resolved in seen:
            return
        seen.add(resolved)
        candidate_paths.append(path)

    data_root = Path("public") / "data"
    for slug in slug_variants:
        _add(data_root / slug / f"{slug}_leads.json")
        for path in sorted(data_root.glob(f"*/{slug}/{slug}_leads.json")):
            _add(path)
        # Backward compatibility with legacy export location.
        _add(data_root / f"{slug}_leads.json")

    leads_path = next((path for path in candidate_paths if path.exists()), None)
    if leads_path is None:
        searched = ", ".join(str(path) for path in candidate_paths)
        raise FileNotFoundError(f"Leads file not found. Searched: {searched}")

    payload = json.loads(leads_path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("Leads file must contain a JSON array.")
    return [item for item in payload if isinstance(item, dict)]


def load_status(city_slug: str) -> dict[str, dict[str, Any]]:
    status_path = Path("public") / "email_status" / f"{city_slug}.json"
    if not status_path.exists():
        return {}
    try:
        payload = json.loads(status_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    if not isinstance(payload, dict):
        return {}
    return {k: v for k, v in payload.items() if isinstance(k, str) and isinstance(v, dict)}


def save_status(city_slug: str, status_data: dict[str, dict[str, Any]]) -> None:
    status_path = Path("public") / "email_status" / f"{city_slug}.json"
    status_path.parent.mkdir(parents=True, exist_ok=True)
    status_path.write_text(json.dumps(status_data, indent=2, ensure_ascii=False), encoding="utf-8")


def load_dedup_store(city_slug: str) -> dict[str, dict[str, Any]]:
    dedup_path = Path("public") / "email_status" / f"{city_slug}_dedup.json"
    if not dedup_path.exists():
        return {}
    try:
        payload = json.loads(dedup_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    if not isinstance(payload, dict):
        return {}
    return {k: v for k, v in payload.items() if isinstance(k, str) and isinstance(v, dict)}


def save_dedup_store(city_slug: str, dedup: dict[str, dict[str, Any]]) -> None:
    dedup_path = Path("public") / "email_status" / f"{city_slug}_dedup.json"
    dedup_path.parent.mkdir(parents=True, exist_ok=True)
    dedup_path.write_text(json.dumps(dedup, indent=2, ensure_ascii=False), encoding="utf-8")


def update_daily_send_summary(summary_path: Path, timestamp_iso: str) -> None:
    date_key = timestamp_iso[:10]
    payload: dict[str, Any] = {}
    if summary_path.exists():
        try:
            loaded = json.loads(summary_path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                payload = loaded
        except Exception:
            payload = {}
    current = payload.get(date_key, 0)
    if not isinstance(current, int):
        current = 0
    payload[date_key] = current + 1
    summary_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def resolve_lead_email(lead: dict[str, Any]) -> str:
    primary_email = lead.get("primary_email")
    if isinstance(primary_email, str) and primary_email.strip():
        return primary_email.strip()

    emails = lead.get("emails")
    if isinstance(emails, list):
        for value in emails:
            if isinstance(value, str) and value.strip():
                return value.strip()
    return ""


def _normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _extract_subject_and_body(content: str) -> tuple[str, str]:
    subject_match = re.search(r"(?im)^\s*subject\s*:\s*(.+)$", content)
    body_match = re.search(r"(?ims)^\s*body\s*:\s*(.+)$", content)

    subject = subject_match.group(1).strip() if subject_match else ""
    body = body_match.group(1).strip() if body_match else ""

    if not body:
        lines = [line.rstrip() for line in content.splitlines() if line.strip()]
        if lines:
            if lines[0].lower().startswith("subject:"):
                subject = subject or lines[0].split(":", 1)[1].strip()
                body = "\n".join(lines[1:]).strip()
            else:
                body = "\n".join(lines).strip()

    if not subject:
        subject = "Quick idea for your business website"
    if not body:
        body = "I have a quick idea to help your business attract more local customers online."
    return subject, body


def _word_trim(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text.strip()
    return " ".join(words[:max_words]).strip()


def _to_float_or_none(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int_or_none(value: Any) -> int | None:
    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def resolve_bucket_and_scenario(
    category: str,
    category_bucket_doc: dict[str, Any],
) -> tuple[str, str, str]:
    normalized_category = _normalize_text(category)

    bucket_key = "default"
    categories = category_bucket_doc.get("categories", {})
    if isinstance(categories, dict):
        for key, value in categories.items():
            if isinstance(value, list):
                if any(_normalize_text(str(item)) == normalized_category for item in value):
                    bucket_key = str(key)
                    break
            elif isinstance(value, str):
                if _normalize_text(value) == normalized_category:
                    bucket_key = str(key)
                    break

    scenarios = category_bucket_doc.get("scenarios", {})
    scenario = "default"
    if isinstance(scenarios, dict):
        candidate = scenarios.get(bucket_key, "default")
        if isinstance(candidate, str):
            scenario = candidate

    bucket_no_map = category_bucket_doc.get("bucket_no", {})
    bucket_no = "0"
    if isinstance(bucket_no_map, dict):
        raw_no = bucket_no_map.get(bucket_key, 0)
        bucket_no = str(raw_no)

    return bucket_key, scenario, bucket_no


def render_template(template: str, context: dict[str, str]) -> str:
    rendered = template
    for key, value in context.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", value)
    return rendered


def select_template(
    bucket_key: str,
    scenario: str,
    bucket_template_doc: dict[str, Any],
) -> str:
    templates = bucket_template_doc.get("templates", {})
    if not isinstance(templates, dict):
        return ""
    bucket_templates = templates.get(bucket_key)
    if isinstance(bucket_templates, str):
        return bucket_templates
    if isinstance(bucket_templates, dict):
        scenario_template = bucket_templates.get(scenario)
        if isinstance(scenario_template, str):
            return scenario_template
        default_template = bucket_templates.get("default")
        if isinstance(default_template, str):
            return default_template
    return ""


def generate_email_via_groq(
    lead: dict[str, Any],
    bucket_key: str,
    scenario: str,
    bucket_no: str,
    template_text: str,
    signature: str,
    opt_out_footer: str,
) -> tuple[str, str]:
    global _LAST_GROQ_CALL_TS

    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_api_key:
        raise RuntimeError("Missing GROQ_API_KEY environment variable.")

    elapsed = time.monotonic() - _LAST_GROQ_CALL_TS
    if elapsed < 3:
        time.sleep(3 - elapsed)

    shop_name = str(lead.get("shop_name") or "your business").strip()
    category = str(lead.get("category") or "business").strip()
    city_name = str(lead.get("location") or "your city").strip()
    location = str(lead.get("location") or city_name).strip()
    rating = _to_float_or_none(lead.get("rating"))
    review_count = _to_int_or_none(lead.get("review_count"))

    rating_text = ""
    if rating is not None and review_count is not None:
        rating_text = f"Rating: {rating} | Reviews: {review_count}"
    elif rating is not None:
        rating_text = f"Rating: {rating}"
    elif review_count is not None:
        rating_text = f"Reviews: {review_count}"

    context = {
        "business_name": shop_name,
        "category": category,
        "city": city_name,
        "location": location,
        "rating": str(rating) if rating is not None else "",
        "review_count": str(review_count) if review_count is not None else "",
        "agency_name": AGENCY_NAME,
        "agency_website": AGENCY_WEBSITE,
        "agency_phone": SENDER_PHONE,
        "sender_name": SENDER_NAME,
        "signature": signature,
    }
    template_instructions = render_template(template_text, context)

    prompt = (
        "Return exactly this format:\n"
        "Subject: <subject line>\n"
        "Body: <email body>\n\n"
        f"Bucket: {bucket_key}\n"
        f"Bucket No: {bucket_no}\n"
        f"Scenario: {scenario}\n"
        f"Template Instructions:\n{template_instructions}\n\n"
        f"Business Name: {shop_name}\n"
        f"Category: {category}\n"
        f"City: {city_name}\n"
        f"Location: {location}\n"
        f"{rating_text}\n"
        f"Sender Agency: {AGENCY_NAME}\n"
        f"Website: {AGENCY_WEBSITE}\n"
        f"Phone: {SENDER_PHONE}\n"
        f"Sender Name: {SENDER_NAME}\n\n"
        "Include this exact signature block in the body:\n"
        f"{signature}\n"
        f"{'Also include this opt-out line: ' + opt_out_footer if opt_out_footer else ''}\n"
        "Do not include markdown."
    )

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.4,
        "messages": [
            {"role": "system", "content": "You write concise, personalized sales emails."},
            {"role": "user", "content": prompt},
        ],
    }

    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
    }

    def _call() -> requests.Response:
        return requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=45,
        )

    resp = retry_operation("groq_generation", _call, logger)
    if resp.status_code != 200:
        raise RuntimeError(f"Groq HTTP error {resp.status_code}: {resp.text}")
    raw = resp.json()
    _LAST_GROQ_CALL_TS = time.monotonic()

    content = str(raw["choices"][0]["message"]["content"])
    subject, body = _extract_subject_and_body(content)

    signature_lines = signature.splitlines()
    core_body = body
    for line in signature_lines:
        core_body = core_body.replace(line, "").strip()
    core_body = re.sub(r"\n{3,}", "\n\n", core_body).strip()
    core_body = _word_trim(core_body, 170)
    final_body = f"{core_body}\n\n{signature}".strip()
    if opt_out_footer:
        final_body = f"{final_body}\n\n{opt_out_footer}".strip()
    return subject[:120].strip(), final_body


def send_email_via_zoho(to_email: str, subject: str, body: str) -> tuple[str, str]:
    password = os.getenv("EMAIL_HOST_PASSWORD", "").strip()
    if not password:
        raise RuntimeError("Missing EMAIL_HOST_PASSWORD environment variable.")

    msg_id = make_msgid()
    message = EmailMessage()
    message["From"] = SMTP_USERNAME
    message["To"] = to_email
    message["Subject"] = subject
    message["Message-ID"] = msg_id
    message.set_content(body)

    smtp_response = "accepted"

    def _send() -> str:
        nonlocal smtp_response
        security_mode = SMTP_SECURITY if SMTP_SECURITY in {"ssl", "starttls", "plain"} else "ssl"
        if security_mode == "ssl":
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=45) as smtp:
                smtp.login(SMTP_USERNAME, password)
                refused = smtp.send_message(message)
                smtp_response = "accepted" if not refused else json.dumps(refused)
                return smtp_response
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=45) as smtp:
            smtp.ehlo()
            if security_mode == "starttls":
                smtp.starttls()
                smtp.ehlo()
            smtp.login(SMTP_USERNAME, password)
            refused = smtp.send_message(message)
            smtp_response = "accepted" if not refused else json.dumps(refused)
            return smtp_response

    provider_response = retry_operation("smtp_send", _send, logger)
    return msg_id, provider_response


def update_status(
    status_data: dict[str, dict[str, Any]],
    lead_id: str,
    subject: str,
    status: str,
    timestamp_iso: str,
) -> None:
    current = status_data.get(lead_id, {})
    if not isinstance(current, dict):
        current = {}
    previous_failed = _to_int_or_none(current.get("failed_attempts")) or 0
    status_data[lead_id] = {
        "email_sent": status == "SENT",
        "attempted_at": timestamp_iso,
        "sent_at": timestamp_iso if status == "SENT" else current.get("sent_at"),
        "subject": subject,
        "status": status,
        "failed_attempts": 0 if status == "SENT" else previous_failed + 1,
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("city_name")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--dry-run-no-groq",
        action="store_true",
        help="Only print eligible recipients; skip Groq generation and SMTP send.",
    )
    return parser


def main() -> None:
    _configure_logging()
    args = _build_parser().parse_args()
    if args.dry_run_no_groq and not args.dry_run:
        raise SystemExit("--dry-run-no-groq requires --dry-run.")

    city_name = args.city_name.strip()
    if not city_name:
        raise SystemExit("City name cannot be empty.")
    try:
        city_slug = _sanitize_city_name(city_name)
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc
    signature = _build_signature()
    needs_generation = not args.dry_run_no_groq
    needs_send = not args.dry_run
    _validate_required_config(
        signature=signature,
        needs_generation=needs_generation,
        needs_send=needs_send,
    )
    suppression_list = _load_suppression_list(SUPPRESSION_LIST_PATH)
    opt_out_footer = UNSUBSCRIBE_TEXT

    leads = load_leads(city_slug)
    emailable_leads = []
    for lead in leads:
        website_status = str(lead.get("website_status") or "").strip().lower()
        email = resolve_lead_email(lead)
        if website_status == "none" and email:
            emailable_leads.append(lead)

    if not emailable_leads:
        logger.info(
            "No leads with valid email for city=%s. Skipping template generation and send flow.",
            city_slug,
        )
        return

    category_bucket_doc: dict[str, Any] = {}
    bucket_template_doc: dict[str, Any] = {}
    if needs_generation:
        try:
            category_bucket_doc, bucket_template_doc = validate_template_files(
                CATEGORY_BUCKET_PATH, BUCKET_TEMPLATE_PATH
            )
        except TemplateValidationError as exc:
            logger.error("Template validation failed: %s", exc)
            raise SystemExit(1) from exc

    status_data = load_status(city_slug)
    dedup_store = load_dedup_store(city_slug)

    email_status_dir = Path("public") / "email_status"
    smtp_log_path = email_status_dir / f"{city_slug}_smtp_events.jsonl"
    audit_log_path = email_status_dir / f"{city_slug}_audit_log.json"
    rate_state_path = email_status_dir / f"{city_slug}_rate_state.json"
    limiter = RateLimiter(MAX_PER_HOUR, MAX_PER_DAY, rate_state_path)

    for lead in emailable_leads:
        lead_id = str(lead.get("lead_id") or "").strip()
        if not lead_id:
            continue

        email = resolve_lead_email(lead)
        if not email:
            continue

        normalized_email = normalize_email(email)
        if not _is_valid_email(normalized_email):
            logger.warning("Skipping lead with invalid email format lead=%s email=%s", lead_id, email)
            continue
        domain = _email_domain(normalized_email)
        if normalized_email in suppression_list:
            logger.info("Skipping suppressed recipient lead=%s email=%s", lead_id, normalized_email)
            continue
        if domain and domain in BLOCKED_EMAIL_DOMAINS:
            logger.info("Skipping blocked domain lead=%s domain=%s", lead_id, domain)
            continue
        campaign_id = str(lead.get("campaign_id") or city_slug).strip()
        dedup_key = f"{campaign_id}::{normalized_email}"

        existing_status = status_data.get(lead_id, {})
        if isinstance(existing_status, dict) and existing_status.get("email_sent") is True:
            continue
        should_skip, skip_reason = _should_skip_due_to_failures(existing_status)
        if should_skip:
            logger.info("Skipping lead due to failure policy lead=%s reason=%s", lead_id, skip_reason)
            continue
        if dedup_key in dedup_store:
            logger.info("Skipping duplicate recipient in same campaign: %s", dedup_key)
            continue

        if needs_send:
            allowed, reason = limiter.can_send()
            if not allowed:
                logger.info("Stopping send flow: %s", reason)
                break

        bucket_key = "na"
        scenario = "na"
        bucket_no = "0"
        subject = ""
        body = ""
        if needs_generation:
            bucket_key, scenario, bucket_no = resolve_bucket_and_scenario(
                str(lead.get("category") or ""),
                category_bucket_doc,
            )
            template_text = select_template(bucket_key, scenario, bucket_template_doc)
            if not template_text:
                logger.warning("No template found for bucket=%s scenario=%s", bucket_key, scenario)
                continue

            valid = False
            guardrail_reason = ""
            for _ in range(2):
                try:
                    subject, body = generate_email_via_groq(
                        lead,
                        bucket_key,
                        scenario,
                        bucket_no,
                        template_text,
                        signature,
                        opt_out_footer,
                    )
                except Exception as exc:  # noqa: BLE001
                    logger.error("Groq generation failed for lead=%s error=%s", lead_id, exc)
                    break
                valid, guardrail_reason = validate_generated_email(subject, body, signature)
                if valid:
                    break
            if not valid:
                logger.warning(
                    "Skipping lead due to guardrail failure lead=%s reason=%s",
                    lead_id,
                    guardrail_reason or "generation_failed",
                )
                continue

        if args.dry_run:
            if args.dry_run_no_groq:
                logger.info("[DRY-RUN-NO-GROQ] lead_id=%s email=%s", lead_id, normalized_email)
            else:
                logger.info(
                    "[DRY-RUN] lead_id=%s email=%s bucket=%s scenario=%s subject=%s",
                    lead_id,
                    normalized_email,
                    bucket_no,
                    scenario,
                    subject,
                )
            continue

        try:
            msg_id, provider_response = send_email_via_zoho(normalized_email, subject, body)
            status_value = "SENT"
            limiter.record_send()
        except Exception as exc:  # noqa: BLE001
            msg_id = ""
            provider_response = str(exc)
            status_value = "FAILED"

        timestamp = utc_now_iso()
        smtp_row = {
            "message_id": msg_id,
            "provider_response": provider_response,
            "timestamp": timestamp,
            "recipient": normalized_email,
            "subject": subject,
        }
        append_jsonl(smtp_log_path, smtp_row)

        audit_row = {
            "lead_id": lead_id,
            "normalized_email": normalized_email,
            "bucket_no": bucket_no,
            "scenario": scenario,
            "subject": subject,
            "message_id": msg_id,
            "provider_response": provider_response,
            "status": status_value,
            "timestamp": timestamp,
        }
        append_audit_log(audit_log_path, audit_row)

        update_status(status_data, lead_id, subject, status_value, timestamp)
        save_status(city_slug, status_data)

        if status_value == "SENT":
            dedup_store[dedup_key] = {
                "lead_id": lead_id,
                "email": normalized_email,
                "campaign_id": campaign_id,
                "timestamp": timestamp,
            }
            save_dedup_store(city_slug, dedup_store)
            update_daily_send_summary(DAILY_SUMMARY_PATH, timestamp)
            RateLimiter.apply_random_delay()


if __name__ == "__main__":
    main()
