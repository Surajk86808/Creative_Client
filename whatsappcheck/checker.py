from __future__ import annotations

import os
import re
import time

import requests

DEFAULT_COUNTRY_CODE = os.getenv("WHATSAPP_DEFAULT_COUNTRY_CODE", "91")
REQUEST_DELAY_SECONDS = float(os.getenv("WHATSAPP_REQUEST_DELAY", "2.0"))


def normalize_phone(raw: str, country_code: str = DEFAULT_COUNTRY_CODE) -> str | None:
    """
    Normalize a phone number to international format (digits only).
    Returns None if number is invalid/too short.
    """
    digits = re.sub(r"\D", "", str(raw or ""))
    if not digits:
        return None

    # Remove leading + (already stripped by re.sub)
    # Handle leading 00 (international prefix)
    if digits.startswith("00"):
        digits = digits[2:]

    # If 10 digits, assume local — prepend country code
    if len(digits) == 10:
        digits = country_code + digits

    # If starts with 0, replace with country code
    elif digits.startswith("0") and len(digits) == 11:
        digits = country_code + digits[1:]

    if len(digits) < 7:
        return None

    return digits


def is_on_whatsapp(phone_normalized: str, timeout: int = 10) -> bool | None:
    """
    Returns True if number appears active on WhatsApp,
    False if not, None if check failed/inconclusive.
    Uses wa.me redirect behavior as a signal.
    """
    url = f"https://wa.me/{phone_normalized}"
    try:
        resp = requests.get(
            url,
            timeout=timeout,
            allow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36"
            },
        )
        final_url = str(resp.url).lower()
        body = resp.text.lower()
        if "api.whatsapp.com" in final_url:
            return True
        if resp.status_code == 200 and (
            "open_url" in body or ("whatsapp" in body and "send" in body)
        ):
            return True
        return False
    except Exception:
        return None


def check_with_delay(
    phone_raw: str,
    country_code: str = DEFAULT_COUNTRY_CODE,
) -> tuple[str, str]:
    """
    Returns (normalized_phone_or_raw, result_string)
    result_string is one of: "YES", "NO", "INVALID", "ERROR"
    """
    normalized = normalize_phone(phone_raw, country_code)
    if normalized is None:
        return (phone_raw, "INVALID")

    time.sleep(REQUEST_DELAY_SECONDS)
    result = is_on_whatsapp(normalized)

    if result is True:
        return (normalized, "YES")
    elif result is False:
        return (normalized, "NO")
    else:
        return (normalized, "ERROR")

