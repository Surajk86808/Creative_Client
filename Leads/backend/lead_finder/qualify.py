"""Lead qualification and scoring rules."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from config import (
    BIG_BRAND_KEYWORDS,
    FRANCHISE_HINTS,
    SERVICE_CATEGORY_ALIASES,
    SERVICE_KEYWORDS,
)
from models import BusinessInput, QualificationResult
from whatsappcheck.checker import check_with_delay


def _normalize_url(website: str) -> str:
    """Normalize a URL by adding scheme when missing."""
    value = website.strip()
    if value.startswith(("http://", "https://")):
        return value
    return f"http://{value}"


def detect_website_status(website: str | None) -> str:
    """Classify website status from URL presence and scheme."""
    if not website:
        return "none"
    parsed = urlparse(_normalize_url(website))
    host = parsed.netloc.strip()
    if not host or "." not in host:
        return "broken"
    if parsed.scheme == "http":
        return "outdated"
    if parsed.scheme == "https":
        return "modern"
    return "unknown"


def _looks_service_based(category: str | None) -> bool:
    """Return True when category appears service-based."""
    if not category:
        return False
    text = category.lower()
    terms = set(SERVICE_KEYWORDS)
    for canonical, aliases in SERVICE_CATEGORY_ALIASES.items():
        if canonical in SERVICE_KEYWORDS:
            terms.update(alias.lower() for alias in aliases)
    return any(keyword in text for keyword in terms)


def _is_big_brand(name: str) -> bool:
    """Return True when business name resembles a major brand."""
    text = name.lower()
    return any(keyword in text for keyword in BIG_BRAND_KEYWORDS)


def _is_franchise(name: str, category: str | None) -> bool:
    """Return True when business appears franchise-like."""
    text = f"{name} {category or ''}".lower()
    return any(hint in text for hint in FRANCHISE_HINTS)


def _non_empty_text(value: Any) -> str:
    text = str(value or "").strip()
    return text


def _first_phone_value(lead: dict[str, Any]) -> str:
    for key in ("phone", "phone_number", "whatsapp"):
        value = _non_empty_text(lead.get(key))
        if value:
            return value
    return ""


def has_valid_contact(lead: dict) -> bool:
    """Return True when a lead has email or verified WhatsApp availability."""
    email = _non_empty_text(lead.get("email"))

    whatsapp_available = lead.get("whatsapp_available")
    if isinstance(whatsapp_available, bool):
        return bool(email) or whatsapp_available

    phone_value = _first_phone_value(lead)
    if phone_value:
        _, whatsapp_status = check_with_delay(phone_value)
        lead["whatsapp_available"] = whatsapp_status == "YES"
    else:
        lead["whatsapp_available"] = False

    return bool(email) or bool(lead.get("whatsapp_available"))


def qualify_lead(business: BusinessInput) -> QualificationResult:
    """Score one business and decide if it is a lead candidate."""
    problems: list[str] = []
    rejection_reasons: list[str] = []

    website_status = detect_website_status(business.website)
    website_score = business.website_report.website_score if business.website_report else 1
    website_issues = list((business.website_report.issues or []) if business.website_report else [])

    if not business.website:
        website_score = 1
        website_issues = ["No website"]
    elif website_status == "broken" and "Website unreachable" not in website_issues:
        website_issues.append("Website unreachable")

    score = 0

    if not business.website:
        score += 4
        problems.append("No website")
    if any("unreachable" in issue.lower() or "broken" in issue.lower() for issue in website_issues):
        score += 4
        problems.append("Broken website")
    if any("http" in issue.lower() and "ssl" in issue.lower() for issue in website_issues):
        score += 3
        problems.append("No SSL")
    if any("older than 5 years" in issue.lower() for issue in website_issues):
        score += 2
        problems.append("Domain older than 5 years")
    if any("viewport" in issue.lower() for issue in website_issues):
        score += 2
        problems.append("No mobile viewport")
    if any("slow website" in issue.lower() for issue in website_issues):
        score += 1
        problems.append("Slow website")

    rating = business.rating or 0.0
    review_count = business.review_count or 0
    service_match = _looks_service_based(business.category)

    if 2.5 <= rating < 4.0:
        score += 3
        problems.append("Rating in 2.5-4.0 target range")
    elif rating >= 4.0:
        score += 1
    if review_count >= 50:
        score += 1
    if service_match:
        score += 2

    if rating < 2.5:
        rejection_reasons.append("Rating below 2.5")
    if review_count < 10:
        rejection_reasons.append("Review count below 10")
    if website_score > 5:
        rejection_reasons.append("Website appears modern enough")
    if _is_big_brand(business.name):
        rejection_reasons.append("Business appears to be a big brand")
    if _is_franchise(business.name, business.category):
        rejection_reasons.append("Business appears to be a franchise")
    if not service_match:
        rejection_reasons.append("Category is not service-based")

    score = max(1, min(10, score))
    rejected = bool(rejection_reasons)

    if rejected:
        suitability = "LOW"
    elif score >= 8:
        suitability = "HIGH"
    elif score >= 5:
        suitability = "MEDIUM"
    else:
        suitability = "LOW"

    return QualificationResult(
        website_status=website_status,
        website_score=website_score,
        website_issues=website_issues,
        lead_quality_score=score,
        outreach_suitability=suitability,
        concrete_problems=sorted(set(problems)),
        rejected=rejected,
        rejection_reasons=rejection_reasons,
    )
