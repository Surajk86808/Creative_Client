"""Helpers for country-aware city storage paths."""

from __future__ import annotations

import json
import re
import shutil
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen


_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_CITY_COUNTRY_CACHE_FILE = "_city_country_cache.json"
_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
_LOOKUP_TIMEOUT_SECONDS = 8
_USER_AGENT = "lead-finder-country-resolver/1.0"

_COUNTRY_ALIASES = {
    "india": "india",
    "bharat": "india",
    "usa": "united-states",
    "us": "united-states",
    "u-s": "united-states",
    "u-s-a": "united-states",
    "united-states": "united-states",
    "united-states-of-america": "united-states",
    "america": "united-states",
    "uk": "united-kingdom",
    "u-k": "united-kingdom",
    "united-kingdom": "united-kingdom",
    "england": "united-kingdom",
    "canada": "canada",
    "australia": "australia",
    "new-zealand": "new-zealand",
    "uae": "united-arab-emirates",
    "u-a-e": "united-arab-emirates",
    "united-arab-emirates": "united-arab-emirates",
}

_US_STATE_SLUGS = {
    "alabama",
    "alaska",
    "arizona",
    "arkansas",
    "california",
    "colorado",
    "connecticut",
    "delaware",
    "florida",
    "georgia",
    "hawaii",
    "idaho",
    "illinois",
    "indiana",
    "iowa",
    "kansas",
    "kentucky",
    "louisiana",
    "maine",
    "maryland",
    "massachusetts",
    "michigan",
    "minnesota",
    "mississippi",
    "missouri",
    "montana",
    "nebraska",
    "nevada",
    "new-hampshire",
    "new-jersey",
    "new-mexico",
    "new-york",
    "north-carolina",
    "north-dakota",
    "ohio",
    "oklahoma",
    "oregon",
    "pennsylvania",
    "rhode-island",
    "south-carolina",
    "south-dakota",
    "tennessee",
    "texas",
    "utah",
    "vermont",
    "virginia",
    "washington",
    "west-virginia",
    "wisconsin",
    "wyoming",
    "district-of-columbia",
}


def slugify(value: str) -> str:
    """Generate filesystem-safe lowercase slug."""
    lowered = value.strip().lower()
    cleaned = _NON_ALNUM_RE.sub("-", lowered)
    return cleaned.strip("-") or "unknown"


def _cache_path(base_dir: Path) -> Path:
    return base_dir / _CITY_COUNTRY_CACHE_FILE


def _load_cache(base_dir: Path) -> dict[str, str]:
    path = _cache_path(base_dir)
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if not isinstance(payload, dict):
        return {}
    return {
        str(key): str(value)
        for key, value in payload.items()
        if isinstance(key, str) and isinstance(value, str) and key and value
    }


def _save_cache(base_dir: Path, cache: dict[str, str]) -> None:
    path = _cache_path(base_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cache, indent=2, sort_keys=True), encoding="utf-8")


def _normalize_query(city: str) -> str:
    return re.sub(r"\s+", " ", city.replace("_", " ").replace("-", " ")).strip()


def _extract_country_slug(item: dict[str, Any]) -> str | None:
    address = item.get("address")
    if isinstance(address, dict):
        country = address.get("country")
        if isinstance(country, str) and country.strip():
            return slugify(country)

        country_code = address.get("country_code")
        if isinstance(country_code, str) and country_code.strip():
            alias = _COUNTRY_ALIASES.get(slugify(country_code))
            if alias:
                return alias

    display_name = item.get("display_name")
    if isinstance(display_name, str) and display_name.strip():
        parts = [part.strip() for part in display_name.split(",") if part.strip()]
        if parts:
            return slugify(parts[-1])
    return None


def _lookup_country_slug(query: str) -> str | None:
    if not query:
        return None
    url = (
        f"{_NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=1&q={quote_plus(query)}"
    )
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": _USER_AGENT,
        },
    )
    try:
        with urlopen(request, timeout=_LOOKUP_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        return None
    if not isinstance(payload, list):
        return None
    for item in payload:
        if not isinstance(item, dict):
            continue
        country_slug = _extract_country_slug(item)
        if country_slug:
            return country_slug
    return None


def _infer_country_slug(city_slug: str) -> str | None:
    parts = [part for part in city_slug.split("-") if part]
    if not parts:
        return None

    if len(parts) >= 2:
        last_two = "-".join(parts[-2:])
        if last_two in _COUNTRY_ALIASES:
            return _COUNTRY_ALIASES[last_two]

    last_part = parts[-1]
    alias = _COUNTRY_ALIASES.get(last_part)
    if alias:
        return alias
    if last_part in _US_STATE_SLUGS:
        return "united-states"
    return None


@lru_cache(maxsize=256)
def resolve_country_slug(base_dir: str, city: str) -> str | None:
    """Resolve a country slug for a city input and cache the result."""
    base_path = Path(base_dir)
    city_slug = slugify(city)
    cache = _load_cache(base_path)

    cached = cache.get(city_slug)
    if cached:
        return cached

    inferred = _infer_country_slug(city_slug)
    if inferred:
        cache[city_slug] = inferred
        _save_cache(base_path, cache)
        return inferred

    looked_up = _lookup_country_slug(_normalize_query(city))
    if looked_up:
        cache[city_slug] = looked_up
        _save_cache(base_path, cache)
        return looked_up
    return None


def city_storage_dir(base_dir: Path, city: str) -> Path:
    """Return the preferred storage directory for one city."""
    city_slug = slugify(city)
    country_slug = resolve_country_slug(str(base_dir.resolve()), city)
    if country_slug:
        return base_dir / country_slug / city_slug
    existing_country_dirs = [
        path for path in sorted(base_dir.glob(f"*/{city_slug}")) if path.is_dir()
    ]
    if len(existing_country_dirs) == 1:
        return existing_country_dirs[0]
    return base_dir / city_slug


def city_candidate_dirs(base_dir: Path, city: str) -> list[Path]:
    """Return country-aware and legacy city directories for reads."""
    city_slug = slugify(city)
    candidates: list[Path] = []
    seen: set[Path] = set()

    def _add(path: Path) -> None:
        resolved = path.resolve()
        if resolved in seen:
            return
        seen.add(resolved)
        candidates.append(path)

    _add(city_storage_dir(base_dir, city))
    _add(base_dir / city_slug)

    pattern = f"*/{city_slug}"
    for path in sorted(base_dir.glob(pattern)):
        if path.is_dir():
            _add(path)

    return candidates


def ensure_city_storage_layout(base_dir: Path, city: str) -> Path:
    """Seed the new country-aware city directory from a legacy city folder when available."""
    preferred_dir = city_storage_dir(base_dir, city)
    if preferred_dir.exists():
        return preferred_dir

    for candidate in city_candidate_dirs(base_dir, city):
        if candidate.resolve() == preferred_dir.resolve():
            continue
        if not candidate.exists() or not candidate.is_dir():
            continue
        preferred_dir.parent.mkdir(parents=True, exist_ok=True)
        for child in candidate.iterdir():
            target = preferred_dir / child.name
            if target.exists():
                continue
            if child.is_dir():
                shutil.copytree(child, target)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(child, target)
        return preferred_dir

    return preferred_dir
