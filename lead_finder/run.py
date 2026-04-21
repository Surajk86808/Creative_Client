"""Main CLI pipeline for web-agency lead generation."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
import re
from zipfile import ZIP_DEFLATED, ZipFile
from datetime import datetime

from config import (
    BIG_BRAND_KEYWORDS,
    DEFAULT_CATEGORIES,
    FRANCHISE_HINTS,
    PUBLIC_DATA_DIR,
    QUALIFIED_PATH,
    SERVICE_CATEGORY_ALIASES,
    SERVICE_KEYWORDS,
    STATUS_REJECTED,
)
from database import RegistryDB
from location_layout import city_candidate_dirs, ensure_city_storage_layout
from main import process_businesses
from models import LeadRecord
from scraper import scrape_city

AI_OPS_CATEGORIES = [
    "salon",
    "clinic",
    "dental",
    "dentist",
    "repair",
    "real estate",
    "gym",
    "restaurant",
    "medical",
    "hospital",
    "physiotherapy",
    "spa",
    "car service",
    "automobile",
]
AI_OPPORTUNITY_TOP_N = 50

VOICE_AGENT_TARGET_CATEGORIES = {
    "dentist",
    "physiotherapy",
    "chiropractor",
    "optometrist",
    "orthodontist",
    "urgent care",
    "veterinary",
    "salon",
    "spa & massage",
    "nail salon",
    "plumbing",
    "electrician",
    "roofing",
    "locksmith",
    "handyman repair shop",
    "auto repair",
    "law firm",
    "insurance agent",
    "real estate",
    "property management",
}

ENTERPRISE_VOICE_AGENT_CATEGORIES = {
    "hotel",
    "restaurant",
    "pizza restaurant",
    "cafe & coffee shop",
    "urgent care",
    "medical clinic",
}

VOICE_AGENT_BOOKING_KEYWORDS = (
    "book",
    "booking",
    "appointment",
    "reserve",
    "schedule",
    "calendly",
    "setmore",
    "squareup",
    "zocdoc",
    "vagaro",
    "mindbody",
    "simplepractice",
)


def _slugify(value: str) -> str:
    """Generate filesystem-safe lowercase slug."""
    lowered = value.strip().lower()
    cleaned = re.sub(r"[^a-z0-9]+", "-", lowered)
    return cleaned.strip("-") or "unknown"


def _normalize_city_key(value: str) -> str:
    """Normalize a city label for robust matching across punctuation variants."""
    lowered = value.strip().lower()
    collapsed = re.sub(r"[^a-z0-9]+", " ", lowered)
    return re.sub(r"\s+", " ", collapsed).strip()


def _city_matches(lead_city: str, requested_city: str) -> bool:
    """Return True when city values differ only by punctuation/formatting."""
    if not lead_city.strip() or not requested_city.strip():
        return False
    return _normalize_city_key(lead_city) == _normalize_city_key(requested_city)


def _chunks(items: list[str], size: int) -> list[list[str]]:
    """Split list into fixed-size chunks."""
    return [items[index : index + size] for index in range(0, len(items), size)]


def _parse_args() -> argparse.Namespace:
    """Parse CLI arguments for full pipeline."""
    parser = argparse.ArgumentParser(
        description="Scrape Google Maps, qualify web leads, and store them in local SQLite."
    )
    city_group = parser.add_mutually_exclusive_group(required=True)
    city_group.add_argument("--city", help="Single city, e.g. Bangalore")
    city_group.add_argument("--cities", help="Comma-separated cities")

    parser.add_argument(
        "--categories",
        default=",".join(DEFAULT_CATEGORIES),
        help="Comma-separated categories.",
    )
    parser.add_argument(
        "--categories-file",
        type=Path,
        default=None,
        help="Path to newline-separated categories file. Lines starting with # are ignored.",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=0,
        help="Max results per category per city. Use 0 to scrape until exhausted.",
    )
    parser.add_argument("--out", default=None, help="Save raw scraped rows to JSON.")
    parser.add_argument("--show-browser", action="store_true", help="Show browser while scraping.")
    parser.add_argument(
        "--analyze-websites",
        action="store_true",
        help="Analyze website quality before qualification.",
    )
    return parser.parse_args()


def _cities_from_args(args: argparse.Namespace) -> list[str]:
    """Expand city arguments into a clean list."""
    if args.city:
        return [args.city.strip()]
    return [item.strip() for item in (args.cities or "").split(",") if item.strip()]


def _categories_from_args(args: argparse.Namespace) -> list[str]:
    """Expand category string into a clean list."""
    def _normalize_categories(items: list[str]) -> list[str]:
        # Deduplicate while preserving order (case-insensitive).
        deduped: list[str] = []
        seen: set[str] = set()
        for item in items:
            key = item.strip().lower()
            if not key or key in seen:
                continue
            seen.add(key)
            deduped.append(item.strip())
        return deduped

    def _with_enterprise_categories(items: list[str]) -> list[str]:
        # Keep user order but guarantee enterprise categories are always processed.
        merged = [item.strip() for item in items if item.strip()]
        seen = {item.lower() for item in merged}
        for category in sorted(ENTERPRISE_VOICE_AGENT_CATEGORIES):
            key = category.lower()
            if key in seen:
                continue
            merged.append(category)
            seen.add(key)
        return merged

    if args.categories_file:
        if not args.categories_file.exists():
            print(f"Error: categories file not found: {args.categories_file}")
            sys.exit(1)
        lines = args.categories_file.read_text(encoding="utf-8").splitlines()
        items: list[str] = []
        for raw in lines:
            line = raw.lstrip("\ufeff").strip()
            if not line or line.startswith("#"):
                continue
            if "#" in line:
                line = line.split("#", 1)[0].strip()
                if not line:
                    continue
            # Allow comma-separated categories inside a single line.
            for part in line.split(","):
                part = part.strip()
                if part:
                    items.append(part)
        if items:
            return _with_enterprise_categories(_normalize_categories(items))
    items = [item.strip() for item in args.categories.split(",") if item.strip()]
    return _with_enterprise_categories(_normalize_categories(items))


def _banner(text: str) -> None:
    """Print section banner."""
    print("\n" + "-" * 70)
    print(text)
    print("-" * 70)


def _analyze_rows(rows: list[dict]) -> None:
    """Analyze website quality for rows that include a website."""
    from analyzer import analyze_website

    for index, row in enumerate(rows, start=1):
        website = row.get("website")
        if not website:
            continue
        try:
            report = analyze_website(website)
            row["website_report"] = report.to_dict()
        except Exception as exc:
            row["website_report"] = {"website_score": 1, "issues": [f"Analysis failed: {exc}"]}
        if index % 10 == 0:
            print(f"[analysis] processed {index}/{len(rows)} websites")


def _print_lead_preview(leads: list[LeadRecord], limit: int = 10) -> None:
    """Print a small terminal preview of newly stored leads."""
    if not leads:
        print("[preview] no new leads stored in this run.")
        return
    print("Name | City | Score | Suitability | Website")
    print("-" * 70)
    for lead in leads[:limit]:
        website = lead.website or "NO_WEBSITE"
        print(
            f"{lead.name[:24]:24} | {lead.city[:12]:12} | "
            f"{lead.lead_quality_score:>2} | {lead.outreach_suitability:8} | {website[:40]}"
        )
    if len(leads) > limit:
        print(f"... and {len(leads) - limit} more")


def _read_existing_qualified(path: Path) -> dict[str, dict]:
    """Read existing qualified export keyed by lead id."""
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if not isinstance(payload, list):
        return {}
    existing: dict[str, dict] = {}
    for item in payload:
        if not isinstance(item, dict):
            continue
        lead_id = item.get("lead_id")
        if isinstance(lead_id, str) and lead_id:
            existing[lead_id] = item
    return existing


def _read_export_by_lead_id(path: Path) -> dict[str, dict]:
    """Read export file keyed by lead_id."""
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if not isinstance(payload, list):
        return {}
    by_id: dict[str, dict] = {}
    for item in payload:
        if not isinstance(item, dict):
            continue
        lead_id = item.get("lead_id")
        if isinstance(lead_id, str) and lead_id:
            by_id[lead_id] = item
    return by_id


def _existing_city_category_slugs(city: str) -> set[str]:
    """Return already-exported category slugs for a city folder."""
    found: set[str] = set()
    for city_dir in city_candidate_dirs(PUBLIC_DATA_DIR, city):
        if not city_dir.exists() or not city_dir.is_dir():
            continue
        for child in city_dir.iterdir():
            if not child.is_dir():
                continue
            expected_json = child / f"{child.name}.json"
            if expected_json.exists():
                found.add(child.name)
                continue
            # fallback: treat as completed when any json exists inside category dir
            if any(path.suffix.lower() == ".json" for path in child.iterdir() if path.is_file()):
                found.add(child.name)
    return found


def _city_storage_dir(city: str) -> Path:
    """Return the preferred city directory and seed it from legacy layout when possible."""
    return ensure_city_storage_layout(PUBLIC_DATA_DIR, city)


def _city_leads_path(city: str) -> Path:
    """Return city-level leads export path."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_leads.json"


def _city_leads_text_path(city: str) -> Path:
    """Return city-level human-readable leads path."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_leads.txt"


def _city_no_website_path(city: str) -> Path:
    """Return city-level no-website leads export path."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_no_website.json"


def _city_no_website_xlsx_path(city: str) -> Path:
    """Return city-level no-website leads export path (XLSX)."""
    return _city_no_website_path(city).with_suffix(".xlsx")


def _city_with_web_leads_path(city: str) -> Path:
    """Return city-level outdated-website leads export path."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_with_web_leads.json"


def _city_with_web_leads_xlsx_path(city: str) -> Path:
    """Return city-level with-web leads export path (XLSX)."""
    return _city_with_web_leads_path(city).with_suffix(".xlsx")


def _city_ai_opportunity_path(city: str) -> Path:
    """Return city-level AI opportunity leads export path."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_ai_opportunity_leads.json"


def _city_ai_opportunity_xlsx_path(city: str) -> Path:
    """Return city-level AI opportunity leads export path (XLSX)."""
    return _city_ai_opportunity_path(city).with_suffix(".xlsx")


def _city_big_brands_leads_path(city: str) -> Path:
    """Return city-level enterprise/big-brand leads export path."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_leads_big_brands_leads.json"


def _city_voice_agent_json_path(city: str) -> Path:
    """Return city-level voice-agent leads export path (JSON)."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_voice_agent.json"


def _city_voice_agent_xlsx_path(city: str) -> Path:
    """Return city-level voice-agent leads export path (XLSX)."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_voice_agent.xlsx"


def _city_voice_agent_enterprise_json_path(city: str) -> Path:
    """Return city-level enterprise voice-agent leads export path (JSON)."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_voice_agent_enterprise.json"


def _city_voice_agent_enterprise_xlsx_path(city: str) -> Path:
    """Return city-level enterprise voice-agent leads export path (XLSX)."""
    city_slug = _slugify(city)
    return _city_storage_dir(city) / f"{city_slug}_voice_agent_enterprise.xlsx"


def _city_registry_path(city: str) -> Path:
    """Return city-level registry snapshot path."""
    return _city_storage_dir(city) / "registry.json"


def _city_sqlite_path(city: str) -> Path:
    """Return city-level SQLite path."""
    return _city_storage_dir(city) / "scraped.db"


def _city_scrape_progress_path(city: str) -> Path:
    """Return city-level scrape progress path."""
    return _city_storage_dir(city) / "scrape_progress.json"


def _city_default_out_path(city: str) -> Path:
    """Return city-level default raw output path."""
    return _city_storage_dir(city) / "test_output.json"


def _resolve_city_out_path(city: str, out_arg: str | None) -> Path:
    """Resolve output path so raw output stays inside the city folder by default."""
    if not out_arg:
        return _city_default_out_path(city)
    out_path = Path(out_arg)
    if out_path.is_absolute():
        return out_path
    return (_city_storage_dir(city) / out_path).resolve()


def _legacy_city_leads_path(city: str) -> Path:
    """Return legacy city-level leads export path at data root."""
    return PUBLIC_DATA_DIR / f"{_slugify(city)}_leads.json"


def _city_category_rows_path(city: str, category_slug: str) -> Path:
    """Return stored scraped rows json path for one city/category."""
    return _city_storage_dir(city) / category_slug / f"{category_slug}.json"


def _load_city_category_rows(city: str, category_slug: str) -> list[dict]:
    """Load stored scraped rows for a city/category."""
    candidate_paths = [
        city_dir / category_slug / f"{category_slug}.json"
        for city_dir in city_candidate_dirs(PUBLIC_DATA_DIR, city)
    ]
    for path in candidate_paths:
        if not path.exists():
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(payload, list):
            continue
        return [row for row in payload if isinstance(row, dict)]
    return []


def _find_city_export_path(city: str, filename: str) -> Path | None:
    """Return the first matching city export path across new and legacy layouts."""
    for city_dir in city_candidate_dirs(PUBLIC_DATA_DIR, city):
        path = city_dir / filename
        if path.exists():
            return path
    return None


def _read_city_export_by_lead_id(city: str, filename: str) -> dict[str, dict]:
    """Read a city export file keyed by lead_id across path layouts."""
    path = _find_city_export_path(city, filename)
    if path is not None:
        return _read_export_by_lead_id(path)
    return {}


def _read_city_leads_by_lead_id(city: str) -> dict[str, dict]:
    """Read city leads keyed by lead_id across path layouts."""
    city_slug = _slugify(city)
    city_leads = _read_city_export_by_lead_id(city, f"{city_slug}_leads.json")
    if city_leads:
        return city_leads
    return _read_export_by_lead_id(_legacy_city_leads_path(city))


def _existing_city_generated_category_slugs(db: RegistryDB, city: str) -> set[str]:
    """Return category slugs that already have non-rejected leads for a city."""
    generated: set[str] = set()

    for lead in db.all_leads():
        if not _city_matches(lead.city, city):
            continue
        if lead.status == STATUS_REJECTED:
            continue
        if not isinstance(lead.category, str) or not lead.category.strip():
            continue
        generated.add(_slugify(lead.category))

    city_leads = _read_city_leads_by_lead_id(city)
    for item in city_leads.values():
        category = item.get("category")
        if isinstance(category, str) and category.strip():
            generated.add(_slugify(category))

    return generated


def _write_city_leads_export(db: RegistryDB, city: str, rows: list[dict]) -> None:
    """Persist qualified city leads to public/data/{country}/{city}/{city}_leads.json."""
    city_path = _city_leads_path(city)
    existing = _read_city_leads_by_lead_id(city)

    place_contacts: dict[str, dict[str, object]] = {}
    for row in rows:
        place_id = row.get("place_id")
        if not isinstance(place_id, str) or not place_id:
            continue
        emails = row.get("emails") or []
        primary_email = row.get("primary_email")
        if isinstance(primary_email, str) and primary_email and primary_email not in emails:
            emails = [primary_email, *emails]
        place_contacts[place_id] = {
            "emails": emails if isinstance(emails, list) else [],
            "primary_email": primary_email if isinstance(primary_email, str) else None,
            "social_media_links": (
                row.get("social_media_links")
                if isinstance(row.get("social_media_links"), list)
                else []
            ),
        }

    city_qualified = [
        lead
        for lead in db.all_leads()
        if lead.status != STATUS_REJECTED and _city_matches(lead.city, city)
    ]

    export_map: dict[str, dict] = dict(existing)
    for lead in city_qualified:
        existing_item = existing.get(lead.lead_id, {})
        contact = place_contacts.get(lead.place_id or "", {})
        emails = contact.get("emails") or existing_item.get("emails") or []
        primary_email = (
            contact.get("primary_email")
            or existing_item.get("primary_email")
            or (emails[0] if isinstance(emails, list) and emails else None)
        )
        social_media_links = (
            contact.get("social_media_links")
            or existing_item.get("social_media_links")
            or []
        )
        export_map[lead.lead_id] = {
            "lead_id": lead.lead_id,
            "shop_name": lead.name,
            "location": lead.city,
            "category": lead.category,
            "website": lead.website,
            "phone": lead.phone,
            "emails": emails if isinstance(emails, list) else [],
            "primary_email": primary_email if isinstance(primary_email, str) else None,
            "social_media_links": social_media_links if isinstance(social_media_links, list) else [],
            "rating": lead.rating,
            "review_count": lead.review_count,
            "lead_quality_score": lead.lead_quality_score,
            "outreach_suitability": lead.outreach_suitability,
            "website_status": lead.website_status,
            "website_score": lead.website_score,
            "website_issues": lead.website_issues,
            "google_maps_url": lead.google_maps_url,
            "place_id": lead.place_id,
            "status": lead.status,
            "created_at": lead.created_at,
            "last_action_date": lead.last_action_date,
        }

    city_path.parent.mkdir(parents=True, exist_ok=True)
    output = sorted(
        export_map.values(),
        key=lambda item: str(item.get("created_at") or ""),
        reverse=True,
    )
    city_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[city-leads] exported city={city} rows={len(output)} -> {city_path.resolve()}")

    by_category: dict[str, list[dict]] = {}
    for item in output:
        category = str(item.get("category") or "").strip()
        if not category:
            category = "unknown"
        by_category.setdefault(category, []).append(item)

    lines: list[str] = []
    city_slug = _slugify(city)
    for category in sorted(by_category.keys(), key=lambda value: value.lower()):
        category_slug = _slugify(category)
        lines.append(f"########{city_slug}_{category_slug}##### leads")
        for lead in by_category[category]:
            name = str(lead.get("shop_name") or "").strip()
            website = str(lead.get("website") or "NO_WEBSITE").strip()
            phone = str(lead.get("phone") or "NO_PHONE").strip()
            score = str(lead.get("lead_quality_score") or "")
            suitability = str(lead.get("outreach_suitability") or "")
            lines.append(f"- {name} | {website} | {phone} | score={score} | {suitability}")
        lines.append("")

    text_path = _city_leads_text_path(city)
    text_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    print(f"[city-leads] exported city text -> {text_path.resolve()}")


def _write_city_no_website_export(db: RegistryDB, city: str) -> None:
    """Persist city qualified leads that do not have a website."""
    city_path = _city_no_website_path(city)
    city_leads_by_id = _read_city_leads_by_lead_id(city)
    no_website = [
        lead for lead in db.all_leads() if _is_no_website_segment(lead=lead, city=city)
    ]
    output = [
        {
            "lead_id": lead.lead_id,
            "shop_name": lead.name,
            "location": lead.city,
            "category": lead.category,
            "phone": lead.phone,
            "emails": (
                city_leads_by_id.get(lead.lead_id, {}).get("emails")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else []
            )
            or [],
            "primary_email": (
                city_leads_by_id.get(lead.lead_id, {}).get("primary_email")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else None
            ),
            "email": (
                city_leads_by_id.get(lead.lead_id, {}).get("primary_email")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else None
            ),
            "social_media_links": (
                city_leads_by_id.get(lead.lead_id, {}).get("social_media_links")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else []
            )
            or [],
            "rating": lead.rating,
            "review_count": lead.review_count,
            "lead_quality_score": lead.lead_quality_score,
            "outreach_suitability": lead.outreach_suitability,
            "google_maps_url": lead.google_maps_url,
            "place_id": lead.place_id,
            "status": lead.status,
            "created_at": lead.created_at,
            "last_action_date": lead.last_action_date,
        }
        for lead in sorted(no_website, key=lambda item: item.created_at, reverse=True)
    ]
    xlsx_path = _city_no_website_xlsx_path(city)
    columns = [
        "lead_id",
        "shop_name",
        "location",
        "category",
        "phone",
        "emails",
        "primary_email",
        "email",
        "social_media_links",
        "rating",
        "review_count",
        "lead_quality_score",
        "outreach_suitability",
        "google_maps_url",
        "place_id",
        "status",
        "created_at",
        "last_action_date",
    ]
    city_path.parent.mkdir(parents=True, exist_ok=True)
    city_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    _write_rows_xlsx(
        xlsx_path,
        output,
        columns,
        number_columns={"rating", "review_count", "lead_quality_score"},
        sheet_name="no_website",
    )
    print(
        f"[city-no-website] exported city={city} rows={len(output)} "
        f"-> {city_path.resolve()} | {xlsx_path.resolve()}"
    )


def _write_city_with_web_export(db: RegistryDB, city: str) -> None:
    """Persist city leads that have outdated websites and HIGH/MEDIUM suitability."""
    city_path = _city_with_web_leads_path(city)
    city_leads_by_id = _read_city_leads_by_lead_id(city)

    target = [
        lead for lead in db.all_leads() if _is_with_web_segment(lead=lead, city=city)
    ]
    output = [
        {
            "lead_id": lead.lead_id,
            "shop_name": lead.name,
            "location": lead.city,
            "category": lead.category,
            "website": lead.website,
            "phone": lead.phone,
            "emails": (
                city_leads_by_id.get(lead.lead_id, {}).get("emails")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else []
            )
            or [],
            "primary_email": (
                city_leads_by_id.get(lead.lead_id, {}).get("primary_email")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else None
            ),
            "email": (
                city_leads_by_id.get(lead.lead_id, {}).get("primary_email")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else None
            ),
            "social_media_links": (
                city_leads_by_id.get(lead.lead_id, {}).get("social_media_links")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else []
            )
            or [],
            "rating": lead.rating,
            "review_count": lead.review_count,
            "lead_quality_score": lead.lead_quality_score,
            "outreach_suitability": lead.outreach_suitability,
            "website_status": lead.website_status,
            "website_score": lead.website_score,
            "website_issues": lead.website_issues,
            "google_maps_url": lead.google_maps_url,
            "place_id": lead.place_id,
            "status": lead.status,
            "created_at": lead.created_at,
            "last_action_date": lead.last_action_date,
        }
        for lead in sorted(target, key=lambda item: item.created_at, reverse=True)
    ]
    xlsx_path = _city_with_web_leads_xlsx_path(city)
    columns = [
        "lead_id",
        "shop_name",
        "location",
        "category",
        "website",
        "phone",
        "emails",
        "primary_email",
        "email",
        "social_media_links",
        "rating",
        "review_count",
        "lead_quality_score",
        "outreach_suitability",
        "website_status",
        "website_score",
        "website_issues",
        "google_maps_url",
        "place_id",
        "status",
        "created_at",
        "last_action_date",
    ]
    city_path.parent.mkdir(parents=True, exist_ok=True)
    city_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    _write_rows_xlsx(
        xlsx_path,
        output,
        columns,
        number_columns={"rating", "review_count", "lead_quality_score", "website_score"},
        sheet_name="with_web",
    )
    print(
        f"[city-with-web] exported city={city} rows={len(output)} "
        f"-> {city_path.resolve()} | {xlsx_path.resolve()}"
    )


def _ai_has_booking_link(website: str | None) -> bool:
    if not isinstance(website, str):
        return False
    text = website.strip().lower()
    if not text:
        return False
    return any(
        marker in text
        for marker in ("book", "booking", "appointment", "reserve", "schedule")
    )


def _ai_category_match(category: str | None) -> bool:
    if not isinstance(category, str):
        return False
    lowered = category.strip().lower()
    if not lowered:
        return False
    return any(cat in lowered for cat in AI_OPS_CATEGORIES)


def _ai_score(lead: LeadRecord, has_booking_link: bool) -> int:
    score = 0
    review_count = int(lead.review_count or 0)
    rating = float(lead.rating or 0.0)
    category = str(lead.category or "")
    website = str(lead.website or "").strip()
    phone = str(lead.phone or "").strip()

    # A. Demand Signal (Max 30)
    if review_count >= 150:
        score += 30
    elif review_count >= 80:
        score += 20
    elif review_count >= 50:
        score += 10

    # B. Ops Complexity (Max 20)
    if _ai_category_match(category):
        score += 20

    # C. Digital Gap (Max 25)
    if not website:
        score += 25
    elif website and not has_booking_link:
        score += 15

    # D. Contact Ready (Max 10)
    if phone:
        score += 10

    # E. Reputation Workload (Max 15)
    if review_count >= 100 and rating >= 4.0:
        score += 15

    return score


def _is_no_website_segment(*, lead: LeadRecord, city: str) -> bool:
    if lead.status == STATUS_REJECTED:
        return False
    if not _city_matches(lead.city, city):
        return False
    return not isinstance(lead.website, str) or not lead.website.strip()


def _is_with_web_segment(*, lead: LeadRecord, city: str) -> bool:
    if lead.status == STATUS_REJECTED:
        return False
    if not _city_matches(lead.city, city):
        return False
    if not isinstance(lead.website, str) or not lead.website.strip():
        return False
    if str(lead.website_status).strip().lower() != "outdated":
        return False
    return str(lead.outreach_suitability).strip().upper() in {"HIGH", "MEDIUM"}


def _voice_lead_value(lead: object, key: str, default: object = "") -> object:
    """Read a lead field from dict or LeadRecord without coupling pipelines."""
    if isinstance(lead, dict):
        return lead.get(key, default)
    return getattr(lead, key, default)


def _voice_has_booking_keywords(website: str) -> bool:
    text = website.strip().lower()
    if not text:
        return False
    return any(keyword in text for keyword in VOICE_AGENT_BOOKING_KEYWORDS)


def calculate_voice_agent_score(lead: dict) -> int:
    review_count = int(_voice_lead_value(lead, "review_count", 0) or 0)
    rating = float(_voice_lead_value(lead, "rating", 0.0) or 0.0)
    category = str(_voice_lead_value(lead, "category", "") or "").strip().lower()
    phone = str(_voice_lead_value(lead, "phone", "") or "").strip()
    website = str(_voice_lead_value(lead, "website", "") or "").strip()
    has_booking = _voice_has_booking_keywords(website) if website else False

    score = 0

    if review_count >= 300:
        score += 35
    elif review_count >= 150:
        score += 25
    elif review_count >= 80:
        score += 15
    elif review_count >= 50:
        score += 8

    if category in VOICE_AGENT_TARGET_CATEGORIES:
        score += 30

    if phone:
        score += 20
    else:
        score -= 20

    if website:
        score += 10
    else:
        score -= 10

    if website and not has_booking:
        score += 20

    if review_count >= 150 and rating >= 4.2:
        score += 15

    return score


def is_voice_agent_lead(lead: dict) -> bool:
    score = calculate_voice_agent_score(lead)
    phone = str(_voice_lead_value(lead, "phone", "") or "").strip()
    category = str(_voice_lead_value(lead, "category", "") or "").strip().lower()
    return score >= 60 and bool(phone) and category in VOICE_AGENT_TARGET_CATEGORIES


def calculate_enterprise_voice_agent_score(lead: dict) -> int:
    review_count = int(_voice_lead_value(lead, "review_count", 0) or 0)
    rating = float(_voice_lead_value(lead, "rating", 0.0) or 0.0)
    category = str(_voice_lead_value(lead, "category", "") or "").strip().lower()
    phone = str(_voice_lead_value(lead, "phone", "") or "").strip()
    website = str(_voice_lead_value(lead, "website", "") or "").strip()
    has_booking = _voice_has_booking_keywords(website) if website else False

    score = 0

    if review_count >= 1000:
        score += 50
    elif review_count >= 500:
        score += 40
    elif review_count >= 300:
        score += 30
    elif review_count >= 150:
        score += 20
    elif review_count >= 80:
        score += 10

    if category in ENTERPRISE_VOICE_AGENT_CATEGORIES:
        score += 40

    if phone:
        score += 25
    else:
        score -= 50

    if website:
        score += 15

    if website and not has_booking:
        score += 10

    if rating >= 4.0 and review_count >= 300:
        score += 20

    return score


def is_enterprise_voice_agent_lead(lead: dict) -> bool:
    category = str(_voice_lead_value(lead, "category", "") or "").strip().lower()
    phone = str(_voice_lead_value(lead, "phone", "") or "").strip()
    review_count = int(_voice_lead_value(lead, "review_count", 0) or 0)
    score = calculate_enterprise_voice_agent_score(lead)
    return (
        category in ENTERPRISE_VOICE_AGENT_CATEGORIES
        and bool(phone)
        and review_count >= 150
        and score >= 70
    )


def _voice_agent_opportunity_label(score: int) -> str:
    if score >= 80:
        return "HOT"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def _enterprise_voice_agent_opportunity_label(score: int) -> str:
    if score >= 100:
        return "ENTERPRISE_HOT"
    if score >= 80:
        return "ENTERPRISE_HIGH"
    if score >= 70:
        return "ENTERPRISE_MEDIUM"
    return "ENTERPRISE_LOW"


def _xlsx_column_name(index: int) -> str:
    name = ""
    current = index
    while current > 0:
        current, remainder = divmod(current - 1, 26)
        name = chr(65 + remainder) + name
    return name


def _xlsx_cell_ref(row: int, col: int) -> str:
    return f"{_xlsx_column_name(col)}{row}"


def _xml_escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _fallback_xlsx_path(path: Path) -> Path:
    """Return a timestamped XLSX path when the target file is locked."""
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return path.with_name(f"{path.stem}_locked_{stamp}{path.suffix}")


def _write_rows_xlsx(
    path: Path,
    rows: list[dict],
    columns: list[str],
    *,
    number_columns: set[str] | None = None,
    sheet_name: str = "data",
) -> None:
    number_columns = number_columns or set()
    sheet_lines = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>']
    sheet_lines.append(
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    )
    sheet_lines.append("<sheetData>")

    for row_index, item in enumerate([{column: column for column in columns}, *rows], start=1):
        sheet_lines.append(f'<row r="{row_index}">')
        for col_index, column in enumerate(columns, start=1):
            cell_ref = _xlsx_cell_ref(row_index, col_index)
            value = item.get(column, "")
            if row_index > 1 and column in number_columns and isinstance(value, (int, float)):
                sheet_lines.append(f'<c r="{cell_ref}"><v>{value}</v></c>')
                continue
            if isinstance(value, (list, dict)):
                value = json.dumps(value, ensure_ascii=False)
            text = _xml_escape(str(value if value is not None else ""))
            sheet_lines.append(
                f'<c r="{cell_ref}" t="inlineStr"><is><t>{text}</t></is></c>'
            )
        sheet_lines.append("</row>")

    sheet_lines.append("</sheetData>")
    sheet_lines.append("</worksheet>")
    sheet_xml = "".join(sheet_lines)

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""
    workbook = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="{_xml_escape(sheet_name)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>"""

    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
            archive.writestr("[Content_Types].xml", content_types)
            archive.writestr("_rels/.rels", rels)
            archive.writestr("xl/workbook.xml", workbook)
            archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
            archive.writestr("xl/worksheets/sheet1.xml", sheet_xml)
    except PermissionError:
        fallback = _fallback_xlsx_path(path)
        with ZipFile(fallback, "w", compression=ZIP_DEFLATED) as archive:
            archive.writestr("[Content_Types].xml", content_types)
            archive.writestr("_rels/.rels", rels)
            archive.writestr("xl/workbook.xml", workbook)
            archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
            archive.writestr("xl/worksheets/sheet1.xml", sheet_xml)
        print(
            f"[warn] XLSX file is locked: {path.resolve()} -> wrote {fallback.resolve()}"
        )


def _write_voice_agent_xlsx(path: Path, rows: list[dict]) -> None:
    columns = [
        "name",
        "category",
        "rating",
        "review_count",
        "phone",
        "website",
        "google_maps_url",
        "voice_agent_score",
        "voice_agent_opportunity",
        "city",
    ]
    number_columns = {"rating", "review_count", "voice_agent_score"}

    sheet_lines = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>']
    sheet_lines.append(
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    )
    sheet_lines.append("<sheetData>")

    for row_index, item in enumerate([{column: column for column in columns}, *rows], start=1):
        sheet_lines.append(f'<row r="{row_index}">')
        for col_index, column in enumerate(columns, start=1):
            cell_ref = _xlsx_cell_ref(row_index, col_index)
            value = item.get(column, "")
            if column in number_columns and row_index > 1:
                if value == "" or value is None:
                    sheet_lines.append(f'<c r="{cell_ref}"/>')
                else:
                    sheet_lines.append(f'<c r="{cell_ref}"><v>{value}</v></c>')
                continue

            text = _xml_escape(str(value))
            sheet_lines.append(
                f'<c r="{cell_ref}" t="inlineStr"><is><t>{text}</t></is></c>'
            )
        sheet_lines.append("</row>")

    sheet_lines.append("</sheetData>")
    sheet_lines.append("</worksheet>")
    sheet_xml = "".join(sheet_lines)

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""
    workbook = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="voice_agent" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>"""

    path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", rels)
        archive.writestr("xl/workbook.xml", workbook)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        archive.writestr("xl/worksheets/sheet1.xml", sheet_xml)


def export_voice_agent_leads(city_name: str, leads: list) -> None:
    filtered: list[dict] = []
    city_value = str(city_name or "").strip()

    for lead in leads:
        if str(_voice_lead_value(lead, "status", "") or "") == STATUS_REJECTED:
            continue
        if not _city_matches(str(_voice_lead_value(lead, "city", "") or ""), city_name):
            continue
        if not is_voice_agent_lead(lead):
            continue

        score = calculate_voice_agent_score(lead)
        filtered.append(
            {
                "name": str(_voice_lead_value(lead, "name", "") or ""),
                "category": str(_voice_lead_value(lead, "category", "") or ""),
                "rating": float(_voice_lead_value(lead, "rating", 0.0) or 0.0),
                "review_count": int(_voice_lead_value(lead, "review_count", 0) or 0),
                "phone": str(_voice_lead_value(lead, "phone", "") or ""),
                "website": str(_voice_lead_value(lead, "website", "") or ""),
                "google_maps_url": str(_voice_lead_value(lead, "google_maps_url", "") or ""),
                "voice_agent_score": score,
                "voice_agent_opportunity": _voice_agent_opportunity_label(score),
                "city": city_value,
            }
        )

    filtered.sort(key=lambda row: int(row.get("voice_agent_score", 0)), reverse=True)
    limited = filtered[:100]

    json_path = _city_voice_agent_json_path(city_name)
    xlsx_path = _city_voice_agent_xlsx_path(city_name)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(limited, indent=2, ensure_ascii=False), encoding="utf-8")
    _write_voice_agent_xlsx(xlsx_path, limited)
    print(
        f"[city-voice-agent] exported city={city_name} rows={len(limited)} "
        f"(top_n=100) -> {json_path.resolve()} | {xlsx_path.resolve()}"
    )


def export_enterprise_voice_agent_leads(city_name: str, leads: list) -> None:
    filtered: list[dict] = []
    city_value = str(city_name or "").strip()

    for lead in leads:
        if str(_voice_lead_value(lead, "status", "") or "") == STATUS_REJECTED:
            continue
        if not _city_matches(str(_voice_lead_value(lead, "city", "") or ""), city_name):
            continue
        if not is_enterprise_voice_agent_lead(lead):
            continue

        score = calculate_enterprise_voice_agent_score(lead)
        filtered.append(
            {
                "name": str(_voice_lead_value(lead, "name", "") or ""),
                "category": str(_voice_lead_value(lead, "category", "") or ""),
                "rating": float(_voice_lead_value(lead, "rating", 0.0) or 0.0),
                "review_count": int(_voice_lead_value(lead, "review_count", 0) or 0),
                "phone": str(_voice_lead_value(lead, "phone", "") or ""),
                "website": str(_voice_lead_value(lead, "website", "") or ""),
                "enterprise_voice_agent_score": score,
                "enterprise_voice_agent_opportunity": _enterprise_voice_agent_opportunity_label(score),
                "city": city_value,
                "google_maps_url": str(_voice_lead_value(lead, "google_maps_url", "") or ""),
            }
        )

    filtered.sort(key=lambda row: int(row.get("enterprise_voice_agent_score", 0)), reverse=True)
    limited = filtered[:100]

    json_path = _city_voice_agent_enterprise_json_path(city_name)
    xlsx_path = _city_voice_agent_enterprise_xlsx_path(city_name)
    columns = [
        "name",
        "category",
        "rating",
        "review_count",
        "phone",
        "website",
        "enterprise_voice_agent_score",
        "enterprise_voice_agent_opportunity",
        "city",
        "google_maps_url",
    ]

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(limited, indent=2, ensure_ascii=False), encoding="utf-8")
    _write_rows_xlsx(
        xlsx_path,
        limited,
        columns,
        number_columns={"rating", "review_count", "enterprise_voice_agent_score"},
        sheet_name="voice_agent_enterprise",
    )
    print(
        f"[city-voice-agent-enterprise] exported city={city_name} rows={len(limited)} "
        f"(top_n=100) -> {json_path.resolve()} | {xlsx_path.resolve()}"
    )


def _issue_contains(lead: LeadRecord, needle: str) -> bool:
    text = needle.strip().lower()
    if not text:
        return False
    for issue in (lead.website_issues or []):
        if text in str(issue).strip().lower():
            return True
    return False


def _reason_contains(lead: LeadRecord, needle: str) -> bool:
    text = needle.strip().lower()
    if not text:
        return False
    for reason in (lead.rejection_reasons or []):
        if text in str(reason).strip().lower():
            return True
    return False


def _looks_service_based(category: str | None) -> bool:
    if not isinstance(category, str) or not category.strip():
        return False
    lowered = category.lower()
    terms = set(keyword.lower() for keyword in SERVICE_KEYWORDS)
    for canonical, aliases in SERVICE_CATEGORY_ALIASES.items():
        if canonical in SERVICE_KEYWORDS:
            terms.update(alias.lower() for alias in aliases)
    return any(term in lowered for term in terms)


def _is_big_brand_lead(lead: LeadRecord) -> bool:
    if _reason_contains(lead, "big brand"):
        return True
    text = str(lead.name or "").lower()
    return any(keyword in text for keyword in BIG_BRAND_KEYWORDS)


def _is_franchise_lead(lead: LeadRecord) -> bool:
    if _reason_contains(lead, "franchise"):
        return True
    text = f"{lead.name or ''} {lead.category or ''}".lower()
    return any(hint in text for hint in FRANCHISE_HINTS)


def _has_ssl(lead: LeadRecord) -> bool:
    if _issue_contains(lead, "no ssl"):
        return False
    website = str(lead.website or "").strip().lower()
    return website.startswith("https://")


def _has_mobile_viewport(lead: LeadRecord) -> bool:
    return not _issue_contains(lead, "viewport")


def _is_website_slow(lead: LeadRecord) -> bool:
    return _issue_contains(lead, "slow website")


def _is_website_broken(lead: LeadRecord) -> bool:
    if str(lead.website_status or "").strip().lower() == "broken":
        return True
    return _issue_contains(lead, "unreachable") or _issue_contains(lead, "broken")


def _is_domain_old(lead: LeadRecord) -> bool:
    return _issue_contains(lead, "older than 5 years")


def _has_online_booking(lead: LeadRecord) -> bool:
    website = str(lead.website or "").strip().lower()
    if not website:
        return False
    return any(token in website for token in ("book", "booking", "appointment", "reserve", "schedule"))


def _decide_outreach_suitability(lead: LeadRecord) -> str:
    """
    Rule set for both normal and enterprise leads.
    Returns one of:
    HIGH/MEDIUM/LOW, ENTERPRISE_HIGH/ENTERPRISE_MEDIUM/ENTERPRISE_LOW, or SKIP.
    """
    score = 0
    enterprise_score = 0

    is_big_brand = _is_big_brand_lead(lead)
    is_franchise = _is_franchise_lead(lead)
    locations_count = 1
    is_enterprise = is_big_brand or is_franchise or locations_count >= 3

    website = str(lead.website or "").strip()
    has_website = bool(website)
    website_slow = _is_website_slow(lead)
    has_mobile_viewport = _has_mobile_viewport(lead)
    has_ssl = _has_ssl(lead)
    has_online_booking = _has_online_booking(lead)
    website_broken = _is_website_broken(lead)
    domain_old = _is_domain_old(lead)
    rating = float(lead.rating or 0.0)
    review_count = int(lead.review_count or 0)
    is_non_service_category = _reason_contains(lead, "not service-based")
    is_service_category = _looks_service_based(lead.category)
    website_modern_and_good = int(lead.website_score or 0) > 5

    if is_enterprise:
        if has_website:
            enterprise_score += 1
        if website_slow:
            enterprise_score += 2
        if not has_mobile_viewport:
            enterprise_score += 2
        if not has_ssl:
            enterprise_score += 2
        if not has_online_booking:
            enterprise_score += 3
        if locations_count >= 5:
            enterprise_score += 2

        enterprise_score = min(enterprise_score, 10)
        if enterprise_score >= 7:
            return "ENTERPRISE_HIGH"
        if enterprise_score >= 4:
            return "ENTERPRISE_MEDIUM"
        if enterprise_score >= 2:
            return "ENTERPRISE_LOW"
        return "SKIP"

    if rating < 2.5:
        return "LOW"
    if is_non_service_category:
        return "LOW"
    if website_modern_and_good:
        return "LOW"

    if not has_website:
        score += 4
    if website_broken:
        score += 4
    if not has_ssl:
        score += 3
    if domain_old:
        score += 2
    if not has_mobile_viewport:
        score += 2
    if website_slow:
        score += 1
    if 2.5 <= rating < 4.0:
        score += 3
    elif rating >= 4.0:
        score += 1
    if review_count >= 50:
        score += 1
    if is_service_category:
        score += 2

    score = min(score, 10)
    if score >= 8:
        return "HIGH"
    if score >= 5:
        return "MEDIUM"
    return "LOW"


def _write_city_big_brands_export(db: RegistryDB, city: str) -> None:
    """Persist city enterprise leads into a dedicated export file."""
    city_path = _city_big_brands_leads_path(city)
    city_leads_by_id = _read_city_leads_by_lead_id(city)

    target: list[tuple[LeadRecord, str]] = []
    for lead in db.all_leads():
        if lead.status == STATUS_REJECTED:
            continue
        if not _city_matches(lead.city, city):
            continue
        suitability = _decide_outreach_suitability(lead)
        if not suitability.startswith("ENTERPRISE_"):
            continue
        target.append((lead, suitability))

    output = [
        {
            "lead_id": lead.lead_id,
            "shop_name": lead.name,
            "location": lead.city,
            "category": lead.category,
            "website": lead.website,
            "phone": lead.phone,
            "emails": (
                city_leads_by_id.get(lead.lead_id, {}).get("emails")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else []
            )
            or [],
            "primary_email": (
                city_leads_by_id.get(lead.lead_id, {}).get("primary_email")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else None
            ),
            "email": (
                city_leads_by_id.get(lead.lead_id, {}).get("primary_email")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else None
            ),
            "social_media_links": (
                city_leads_by_id.get(lead.lead_id, {}).get("social_media_links")
                if isinstance(city_leads_by_id.get(lead.lead_id), dict)
                else []
            )
            or [],
            "rating": lead.rating,
            "review_count": lead.review_count,
            "lead_quality_score": lead.lead_quality_score,
            "outreach_suitability": lead.outreach_suitability,
            "enterprise_outreach_suitability": enterprise_suitability,
            "is_big_brand": _is_big_brand_lead(lead),
            "is_franchise": _is_franchise_lead(lead),
            "locations_count": 1,
            "website_status": lead.website_status,
            "website_score": lead.website_score,
            "website_issues": lead.website_issues,
            "google_maps_url": lead.google_maps_url,
            "place_id": lead.place_id,
            "status": lead.status,
            "created_at": lead.created_at,
            "last_action_date": lead.last_action_date,
        }
        for lead, enterprise_suitability in sorted(
            target, key=lambda pair: pair[0].created_at, reverse=True
        )
    ]
    city_path.parent.mkdir(parents=True, exist_ok=True)
    city_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[city-big-brands] exported city={city} rows={len(output)} -> {city_path.resolve()}")


def _write_city_ai_opportunity_export(db: RegistryDB, city: str, top_n: int = AI_OPPORTUNITY_TOP_N) -> None:
    """Export AI-opportunity leads according to the scoring specification."""
    city_path = _city_ai_opportunity_path(city)
    rows: list[dict[str, Any]] = []

    for lead in db.all_leads():
        if lead.status == STATUS_REJECTED:
            continue
        if not _city_matches(lead.city, city):
            continue
        # Enforce strict segmentation: one lead belongs to only one export bucket.
        if _is_no_website_segment(lead=lead, city=city):
            continue
        if _is_with_web_segment(lead=lead, city=city):
            continue

        review_count = int(lead.review_count or 0)
        phone = str(lead.phone or "").strip()

        # Safety filters (non-negotiable)
        if review_count < 50:
            continue
        if not phone:
            continue

        has_booking_link = _ai_has_booking_link(lead.website)
        score = _ai_score(lead, has_booking_link)
        lead_type = "ai_opportunity" if score >= 60 else "normal"
        if lead_type != "ai_opportunity":
            continue

        rows.append(
            {
                "name": str(lead.name or ""),
                "category": str(lead.category or ""),
                "review_count": review_count,
                "rating": float(lead.rating or 0.0),
                "phone": phone,
                "website": str(lead.website or ""),
                "google_maps_url": str(lead.google_maps_url or ""),
                "has_booking_link": has_booking_link,
                "ai_opportunity_score": score,
                "lead_type": lead_type,
            }
        )

    rows.sort(key=lambda item: int(item["ai_opportunity_score"]), reverse=True)
    limited_rows = rows[: max(0, int(top_n))]

    xlsx_path = _city_ai_opportunity_xlsx_path(city)
    columns = [
        "name",
        "category",
        "review_count",
        "rating",
        "phone",
        "website",
        "google_maps_url",
        "has_booking_link",
        "ai_opportunity_score",
        "lead_type",
    ]
    city_path.parent.mkdir(parents=True, exist_ok=True)
    city_path.write_text(json.dumps(limited_rows, indent=2, ensure_ascii=False), encoding="utf-8")
    _write_rows_xlsx(
        xlsx_path,
        limited_rows,
        columns,
        number_columns={"review_count", "rating", "ai_opportunity_score"},
        sheet_name="ai_opportunity",
    )
    print(
        f"[city-ai-opportunity] exported city={city} rows={len(limited_rows)} "
        f"(top_n={top_n}) -> {city_path.resolve()} | {xlsx_path.resolve()}"
    )


def _write_city_registry_export(db: RegistryDB, city: str) -> None:
    """Persist city-scoped registry snapshot as public/data/{country}/{city}/registry.json."""
    city_path = _city_registry_path(city)
    leads = [lead for lead in db.all_leads() if _city_matches(lead.city, city)]
    payload = {"leads": {record.lead_id: record.to_dict() for record in leads}}
    city_path.parent.mkdir(parents=True, exist_ok=True)
    city_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
    print(f"[city-registry] exported city={city} rows={len(leads)} -> {city_path.resolve()}")


def _write_qualified_export(db: RegistryDB, rows: list[dict]) -> None:
    """Persist all qualified leads to public/data/qualified.json."""
    place_contacts: dict[str, dict[str, object]] = {}
    for row in rows:
        place_id = row.get("place_id")
        if not isinstance(place_id, str) or not place_id:
            continue
        emails = row.get("emails") or []
        primary_email = row.get("primary_email")
        if isinstance(primary_email, str) and primary_email and primary_email not in emails:
            emails = [primary_email, *emails]
        place_contacts[place_id] = {
            "emails": emails if isinstance(emails, list) else [],
            "primary_email": primary_email if isinstance(primary_email, str) else None,
            "social_media_links": (
                row.get("social_media_links")
                if isinstance(row.get("social_media_links"), list)
                else []
            ),
        }

    existing = _read_existing_qualified(QUALIFIED_PATH)
    qualified = [lead for lead in db.all_leads() if lead.status != STATUS_REJECTED]
    export_map: dict[str, dict] = dict(existing)

    for lead in qualified:
        existing_item = existing.get(lead.lead_id, {})
        contact = place_contacts.get(lead.place_id or "", {})
        emails = contact.get("emails") or existing_item.get("emails") or []
        primary_email = (
            contact.get("primary_email")
            or existing_item.get("primary_email")
            or (emails[0] if isinstance(emails, list) and emails else None)
        )
        social_media_links = (
            contact.get("social_media_links")
            or existing_item.get("social_media_links")
            or []
        )
        export_map[lead.lead_id] = {
            "lead_id": lead.lead_id,
            "shop_name": lead.name,
            "location": lead.city,
            "category": lead.category,
            "website": lead.website,
            "phone": lead.phone,
            "emails": emails if isinstance(emails, list) else [],
            "primary_email": primary_email if isinstance(primary_email, str) else None,
            "social_media_links": social_media_links if isinstance(social_media_links, list) else [],
            "rating": lead.rating,
            "review_count": lead.review_count,
            "lead_quality_score": lead.lead_quality_score,
            "outreach_suitability": lead.outreach_suitability,
            "website_status": lead.website_status,
            "website_score": lead.website_score,
            "website_issues": lead.website_issues,
            "google_maps_url": lead.google_maps_url,
            "place_id": lead.place_id,
            "status": lead.status,
            "created_at": lead.created_at,
            "last_action_date": lead.last_action_date,
        }

    QUALIFIED_PATH.parent.mkdir(parents=True, exist_ok=True)
    output = sorted(
        export_map.values(),
        key=lambda item: str(item.get("created_at") or ""),
        reverse=True,
    )
    QUALIFIED_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[qualified] exported {len(output)} rows -> {QUALIFIED_PATH.resolve()}")


def _process_single_category(
    *,
    db: RegistryDB,
    city: str,
    category: str,
    category_rows: list[dict],
    analyze_websites: bool,
    all_rows: list[dict],
    out_path_arg: str | None,
    phase_label: str,
    batch_index: int,
) -> None:
    """Analyze, qualify, and export after one category."""
    if not category_rows:
        _write_city_leads_export(db=db, city=city, rows=[])
        _write_city_no_website_export(db=db, city=city)
        _write_city_with_web_export(db=db, city=city)
        _write_city_big_brands_export(db=db, city=city)
        _write_city_ai_opportunity_export(db=db, city=city)
        return

    all_rows.extend(category_rows)

    if analyze_websites:
        _banner(
            f"Step 2: Website Quality Analysis [{city} {phase_label} batch {batch_index} | {category}]"
        )
        _analyze_rows(category_rows)
    else:
        _banner(
            f"Step 2: Website Quality Analysis [{city} {phase_label} batch {batch_index} | {category}] (skipped)"
        )

    _banner(f"Step 3: Qualification + Storage [{city} {phase_label} batch {batch_index} | {category}]")
    cat_summary = process_businesses(category_rows, db=db)
    print(
        f"[category-summary] city={city} category={category} "
        f"skipped_existing={cat_summary['skipped_existing']} "
        f"new_qualified={cat_summary['new_qualified']} "
        f"new_rejected={cat_summary['new_rejected']}"
    )
    _write_city_leads_export(db=db, city=city, rows=category_rows)
    _write_city_no_website_export(db=db, city=city)
    _write_city_with_web_export(db=db, city=city)
    _write_city_big_brands_export(db=db, city=city)
    _write_city_ai_opportunity_export(db=db, city=city)

    if out_path_arg:
        out_path = Path(out_path_arg)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(all_rows, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[saved] raw rows -> {out_path.resolve()}")


def run_pipeline(args: argparse.Namespace) -> None:
    """Run the full lead-generation workflow."""
    cities = _cities_from_args(args)
    categories = _categories_from_args(args)
    if not cities:
        print("Error: no cities provided.")
        sys.exit(1)

    all_rows: list[dict] = []
    all_new_leads: list[LeadRecord] = []
    all_qualified_new_leads: list[LeadRecord] = []

    _banner("Step 1: Scraping Google Maps (batched by 5 categories)")
    for city in cities:
        city_db = RegistryDB(
            _city_registry_path(city),
            sqlite_path=_city_sqlite_path(city),
            auto_sync_json=False,
        )
        try:
            city_before_ids = {lead.lead_id for lead in city_db.all_leads()}
            city_rows: list[dict] = []
            city_out_path = _resolve_city_out_path(city, args.out)
            city_progress_path = _city_scrape_progress_path(city)

            existing_category_slugs = _existing_city_category_slugs(city)
            generated_category_slugs = _existing_city_generated_category_slugs(db=city_db, city=city)
            categories_missing_leads_with_data = [
                category
                for category in categories
                if _slugify(category) in existing_category_slugs
                and _slugify(category) not in generated_category_slugs
            ]

            scrape_completed_category_slugs = existing_category_slugs | generated_category_slugs
            pending_categories = [
                category for category in categories if _slugify(category) not in scrape_completed_category_slugs
            ]
            categories_to_scrape = pending_categories if scrape_completed_category_slugs else categories

            print(
                f"[city] {city}: requested={len(categories)} "
                f"scraped_present={len(existing_category_slugs)} "
                f"leads_generated={len(generated_category_slugs)} "
                f"missing_leads_with_data={len(categories_missing_leads_with_data)} "
                f"pending_scrape={len(categories_to_scrape)}"
            )

            pre_batches = _chunks(categories_missing_leads_with_data, 5)
            for batch_index, batch_categories in enumerate(pre_batches, start=1):
                print(
                    f"[batch-existing] city={city} batch={batch_index}/{len(pre_batches)} "
                    f"categories={', '.join(batch_categories)}"
                )
                for category in batch_categories:
                    category_slug = _slugify(category)
                    category_rows = _load_city_category_rows(city=city, category_slug=category_slug)
                    print(
                        f"[load-existing] city={city} category={category} loaded_rows={len(category_rows)}"
                    )
                    _process_single_category(
                        db=city_db,
                        city=city,
                        category=category,
                        category_rows=category_rows,
                        analyze_websites=args.analyze_websites,
                        all_rows=city_rows,
                        out_path_arg=str(city_out_path),
                        phase_label="existing",
                        batch_index=batch_index,
                    )
                    export_voice_agent_leads(city, city_db.all_leads())
                    export_enterprise_voice_agent_leads(city, city_db.all_leads())

            if not categories_to_scrape:
                print(f"[city] {city}: no categories left for scraping.")
                _write_city_leads_export(db=city_db, city=city, rows=[])
                _write_city_no_website_export(db=city_db, city=city)
                _write_city_with_web_export(db=city_db, city=city)
                _write_city_big_brands_export(db=city_db, city=city)
                _write_city_ai_opportunity_export(db=city_db, city=city)
                _write_city_registry_export(db=city_db, city=city)
                _write_qualified_export(db=city_db, rows=city_rows)
                city_after_leads = city_db.all_leads()
                city_new_leads = [lead for lead in city_after_leads if lead.lead_id not in city_before_ids]
                city_qualified_new = [lead for lead in city_new_leads if lead.status != STATUS_REJECTED]
                all_rows.extend(city_rows)
                all_new_leads.extend(city_new_leads)
                all_qualified_new_leads.extend(city_qualified_new)
                continue

            scrape_batches = _chunks(categories_to_scrape, 5)
            for batch_index, batch_categories in enumerate(scrape_batches, start=1):
                print(
                    f"[batch] city={city} batch={batch_index}/{len(scrape_batches)} "
                    f"categories={', '.join(batch_categories)}"
                )
                for category in batch_categories:
                    category_rows = scrape_city(
                        city=city,
                        categories=[category],
                        max_per_category=(args.max if args.max > 0 else None),
                        headless=not args.show_browser,
                        db=city_db,
                        progress_path=city_progress_path,
                    )
                    print(
                        f"[scrape] city={city} batch={batch_index} category={category} rows={len(category_rows)}"
                    )
                    _process_single_category(
                        db=city_db,
                        city=city,
                        category=category,
                        category_rows=category_rows,
                        analyze_websites=args.analyze_websites,
                        all_rows=city_rows,
                        out_path_arg=str(city_out_path),
                        phase_label="scrape",
                        batch_index=batch_index,
                    )
                    export_voice_agent_leads(city, city_db.all_leads())
                    export_enterprise_voice_agent_leads(city, city_db.all_leads())
            _write_city_registry_export(db=city_db, city=city)
            _write_qualified_export(db=city_db, rows=city_rows)
            city_after_leads = city_db.all_leads()
            city_new_leads = [lead for lead in city_after_leads if lead.lead_id not in city_before_ids]
            city_qualified_new = [lead for lead in city_new_leads if lead.status != STATUS_REJECTED]
            all_rows.extend(city_rows)
            all_new_leads.extend(city_new_leads)
            all_qualified_new_leads.extend(city_qualified_new)
        finally:
            city_db.close()

    high = sum(1 for lead in all_qualified_new_leads if lead.outreach_suitability == "HIGH")
    medium = sum(1 for lead in all_qualified_new_leads if lead.outreach_suitability == "MEDIUM")
    low = sum(1 for lead in all_qualified_new_leads if lead.outreach_suitability == "LOW")

    _banner("Step 4: Local Storage")
    print("[sqlite] city databases stored under: public/data/{country}/{city}/scraped.db")
    print("[registry] city snapshots stored under: public/data/{country}/{city}/registry.json")
    _print_lead_preview(all_new_leads)

    _banner("Summary")
    print(f"Scraped:         {len(all_rows)} businesses")
    print(
        f"Qualified leads: {len(all_qualified_new_leads)} "
        f"(HIGH: {high}, MEDIUM: {medium}, LOW: {low})"
    )
    print(f"Stored:          {len(all_new_leads)} new rows in SQLite")


def main() -> None:
    """CLI entrypoint."""
    args = _parse_args()
    run_pipeline(args)


if __name__ == "__main__":
    main()
