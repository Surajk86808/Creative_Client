"""Standalone WhatsApp availability checker helpers."""

from __future__ import annotations

import os
import random
import re
import time
import logging
import sys
from pathlib import Path
from typing import Final
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

try:
    from utils.country_code import get_country_code
except ImportError:
    # Fallback if utils module isn't accessible
    def get_country_code(country: str) -> str:
        return os.getenv("WHATSAPP_DEFAULT_COUNTRY_CODE", "91").strip() or "91"

log = logging.getLogger("whatsapp_checker")

USER_AGENT: Final[str] = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
INVALID_MARKERS: Final[tuple[str, ...]] = (
    "phone number shared via url is invalid",
    "phone number shared via url is not valid",
    "invalid phone number",
)
UNAVAILABLE_MARKERS: Final[tuple[str, ...]] = (
    "isn't on whatsapp",
    "not on whatsapp",
)
AVAILABLE_MARKERS: Final[tuple[str, ...]] = (
    "continue to chat",
    "use whatsapp",
    "message ",
)


def normalize_phone(value: str, country: str = "") -> str:
    """Normalize a phone number into an international digits-only string."""
    raw = str(value or "").strip()
    if not raw:
        log.error("Invalid phone number, skipping lead")
        return ""

    has_plus = raw.startswith("+")
    digits = re.sub(r"\D+", "", raw)
    if len(digits) < 8:
        log.error("Invalid phone number, skipping lead")
        return ""
    if has_plus:
        return digits
    if raw.startswith("00") and len(digits) > 2:
        return digits[2:]
    if len(digits) == 10:
        code = get_country_code(country)
        return f"{code}{digits}"
    return digits


def check_whatsapp(phone: str, country: str = "") -> tuple[str, str]:
    """Return `(normalized_phone, status)` using a best-effort WhatsApp web probe."""
    normalized = normalize_phone(phone, country)
    if not normalized:
        return "", "INVALID"

    url = f"https://wa.me/{quote(normalized)}"
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8", errors="ignore").lower()
            final_url = str(response.geturl()).lower()
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore").lower()
        final_url = str(exc.geturl()).lower()
    except URLError as exc:
        print(f"URL Error for {normalized}: {exc}")
        return normalized, "ERROR"
    except Exception as exc:
        print(f"Unexpected Error for {normalized}: {exc}")
        return normalized, "ERROR"

    haystack = f"{final_url}\n{body}"
    if any(marker in haystack for marker in INVALID_MARKERS):
        return normalized, "INVALID"
    if any(marker in haystack for marker in UNAVAILABLE_MARKERS):
        return normalized, "NO"
    if any(marker in haystack for marker in AVAILABLE_MARKERS):
        return normalized, "YES"
    if "api.whatsapp.com" in final_url or "wa.me/message" in final_url:
        return normalized, "YES"
    return normalized, "NO"


def check_with_delay(phone: str, *, min_seconds: float = 0.6, max_seconds: float = 1.4, country: str = "") -> tuple[str, str]:
    """Sleep briefly, then run the WhatsApp availability check."""
    if max_seconds > 0:
        low = max(0.0, min_seconds)
        high = max(low, max_seconds)
        time.sleep(random.uniform(low, high))
    return check_whatsapp(phone, country)
