from __future__ import annotations

import re


BANNED_PHRASES = (
    "data-driven",
    "digital transformation",
    "optimize operations",
)


def word_count(text: str) -> int:
    return len(text.split())


def has_unreplaced_variables(text: str) -> bool:
    return bool(re.search(r"\{\{[^{}]+\}\}", text))


def _normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def validate_generated_email(subject: str, body: str, signature: str) -> tuple[bool, str]:
    if len(subject.strip()) > 120:
        return False, "Subject exceeds 120 characters"
    if word_count(body) > 170:
        return False, "Body exceeds 170 words"
    if _normalize_whitespace(signature) not in _normalize_whitespace(body):
        return False, "Signature block missing"
    if has_unreplaced_variables(subject) or has_unreplaced_variables(body):
        return False, "Unreplaced template variables found"
    lowered = f"{subject}\n{body}".lower()
    for phrase in BANNED_PHRASES:
        if phrase in lowered:
            return False, f"Banned phrase present: {phrase}"
    return True, ""
