import os
import logging

log = logging.getLogger("country_code")

COUNTRY_CODE_MAP = {
    "india": "91",
    "united states": "1",
    "usa": "1",
    "united kingdom": "44",
    "uk": "44",
    "canada": "1",
    "australia": "61",
    "germany": "49",
    "france": "33",
}

def get_country_code(country: str) -> str:
    if not country:
        return os.getenv("WHATSAPP_DEFAULT_COUNTRY_CODE", "91")

    country_clean = country.lower().strip()

    if country_clean in COUNTRY_CODE_MAP:
        return COUNTRY_CODE_MAP[country_clean]

    log.warning(f"Using default country code for: {country}")
    return os.getenv("WHATSAPP_DEFAULT_COUNTRY_CODE", "91")