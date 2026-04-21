from __future__ import annotations

import hashlib
import re

from models import BusinessInput 

_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_DIGITS_RE = re.compile(r"\D+")


def normalize_text(value: str | None) -> str:
    """Normalize free text for stable deduplication."""
    if not value:
        return ""
    lowered = value.strip().lower()
    collapsed = _NON_ALNUM_RE.sub(" ", lowered)
    return " ".join(collapsed.split())


def normalize_phone(value: str | None) -> str:
    """Normalize phone by keeping digits only."""
    if not value:
        return ""
    return _DIGITS_RE.sub("", value)


def normalize_website(value: str | None) -> str:
    """Normalize website by removing scheme and trailing slash."""
    if not value:
        return ""
    cleaned = value.strip().lower()
    cleaned = cleaned.removeprefix("https://")
    cleaned = cleaned.removeprefix("http://")
    cleaned = cleaned.rstrip("/")
    return cleaned


def normalized_contact_key(website: str | None, phone: str | None) -> str:
    """Return a contact key preferring website then phone."""
    normalized_website = normalize_website(website)
    if normalized_website:
        return f"website:{normalized_website}"
    normalized_phone = normalize_phone(phone)
    if normalized_phone:
        return f"phone:{normalized_phone}"
    return "contact:none"


def build_lead_id(business: BusinessInput) -> str:
    """Build deterministic lead id hash."""
    fingerprint = "|".join(
        [
            normalize_text(business.name),
            normalize_text(business.city),
            normalized_contact_key(business.website, business.phone),
        ]
    )
    return hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()
