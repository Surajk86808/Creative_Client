from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path


SITES_FILE = Path(__file__).resolve().parents[1] / "data" / "sites.json"


def _read_sites() -> dict:
    try:
        if not SITES_FILE.exists():
            return {}
        raw = SITES_FILE.read_text(encoding="utf-8").strip()
        if not raw:
            return {}
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _write_sites(payload: dict) -> None:
    SITES_FILE.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix="sites.", suffix=".tmp", dir=str(SITES_FILE.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
            handle.write("\n")
        os.replace(temp_path, SITES_FILE)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def _parse_iso_utc(value: str) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None


def cleanup_sites() -> dict[str, int]:
    payload = _read_sites()
    now = datetime.now(timezone.utc)
    deactivated = 0
    remaining = 0

    country_keys = list(payload.keys())
    for country in country_keys:
        categories = payload.get(country)
        if not isinstance(categories, dict):
            continue
        category_keys = list(categories.keys())
        for category in category_keys:
            shops = categories.get(category)
            if not isinstance(shops, dict):
                continue
            shop_keys = list(shops.keys())
            for shop_name in shop_keys:
                site = shops.get(shop_name)
                if not isinstance(site, dict):
                    continue
                expires_at = _parse_iso_utc(site.get("expires_at", ""))
                if site.get("active") is not False and expires_at and now > expires_at:
                    site["active"] = False
                    deactivated += 1
                if site.get("active") is True:
                    remaining += 1

    _write_sites(payload)
    summary = {"deactivated": deactivated, "remaining": remaining}
    print(json.dumps(summary))
    return summary


if __name__ == "__main__":
    cleanup_sites()
