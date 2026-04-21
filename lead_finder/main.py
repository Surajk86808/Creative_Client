"""Lead processing entrypoints used by CLI pipeline."""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterable

from config import (
    BLOCKED_OUTREACH_STATUSES,
    REGISTRY_PATH,
    STATUS_ANALYZED,
    STATUS_NEW,
    STATUS_REJECTED,
)
from database import RegistryDB
from deduplicate import build_lead_id
from models import BusinessInput, LeadRecord, WebsiteReport
from qualify import qualify_lead


def utc_now_iso() -> str:
    """Return current UTC timestamp as ISO8601."""
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def can_email(lead: LeadRecord) -> bool:
    """Return True when a lead can be contacted."""
    if lead.status in BLOCKED_OUTREACH_STATUSES:
        return False
    if lead.manual_review_required:
        return False
    return lead.status in {STATUS_NEW, STATUS_ANALYZED}


def _to_business_input(item: dict[str, Any]) -> BusinessInput:
    """Convert raw dict into BusinessInput."""
    report = item.get("website_report")
    website_report = WebsiteReport.from_dict(report) if isinstance(report, dict) else None
    return BusinessInput(
        name=str(item.get("name", "")).strip(),
        city=str(item.get("city", "")).strip(),
        website=item.get("website"),
        phone=item.get("phone"),
        category=item.get("category"),
        rating=float(item["rating"]) if item.get("rating") is not None else None,
        review_count=int(item["review_count"]) if item.get("review_count") is not None else None,
        address=item.get("address"),
        google_maps_url=item.get("google_maps_url"),
        place_id=item.get("place_id"),
        website_report=website_report,
    )


def process_businesses(items: Iterable[dict[str, Any]], db: RegistryDB | None = None) -> dict[str, int]:
    """Qualify raw businesses and persist new leads."""
    registry = db or RegistryDB(REGISTRY_PATH)
    summary = {
        "skipped_existing": 0,
        "new_qualified": 0,
        "new_rejected": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    for raw in items:
        business = _to_business_input(raw)
        if not business.name or not business.city:
            summary["new_rejected"] += 1
            continue

        lead_id = build_lead_id(business)
        if registry.exists(lead_id):
            summary["skipped_existing"] += 1
            continue

        result = qualify_lead(business)
        now = utc_now_iso()

        if result.rejected:
            status = STATUS_REJECTED
            last_action = "REJECTED_AT_QUALIFICATION"
            summary["new_rejected"] += 1
            manual_review_required = False
        else:
            status = STATUS_NEW
            last_action = "QUALIFIED_FOR_OUTREACH"
            summary["new_qualified"] += 1
            manual_review_required = False

        suit = result.outreach_suitability.lower()
        if suit in summary:
            summary[suit] += 1

        record = LeadRecord(
            lead_id=lead_id,
            name=business.name,
            city=business.city,
            website=business.website,
            phone=business.phone,
            category=business.category,
            rating=business.rating,
            review_count=business.review_count,
            status=status,
            manual_review_required=manual_review_required,
            website_status=result.website_status,
            website_score=result.website_score,
            website_issues=result.website_issues,
            lead_quality_score=result.lead_quality_score,
            outreach_suitability=result.outreach_suitability,
            concrete_problems=result.concrete_problems,
            rejection_reasons=result.rejection_reasons,
            last_action=last_action,
            last_action_date=now,
            created_at=now,
            google_maps_url=business.google_maps_url,
            place_id=business.place_id,
        )
        registry.upsert(record)

    return summary


def load_businesses_from_file(path: Path) -> list[dict[str, Any]]:
    """Load list of business objects from JSON file."""
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("Input file must be a JSON array of business objects.")
    return [item for item in raw if isinstance(item, dict)]


def parse_args() -> argparse.Namespace:
    """Parse CLI args for standalone usage."""
    parser = argparse.ArgumentParser(description="Local web agency lead finder.")
    parser.add_argument(
        "--input",
        type=Path,
        help="Path to a JSON file containing a list of business objects.",
    )
    return parser.parse_args()


def print_summary(summary: dict[str, int]) -> None:
    """Print lead processing summary."""
    print(f"skipped_existing: {summary['skipped_existing']}")
    print(f"new_qualified: {summary['new_qualified']}")
    print(f"new_rejected: {summary['new_rejected']}")
    print(f"high: {summary.get('high', 0)}")
    print(f"medium: {summary.get('medium', 0)}")
    print(f"low: {summary.get('low', 0)}")


def main() -> None:
    """Standalone processor entrypoint."""
    args = parse_args()
    businesses = load_businesses_from_file(args.input) if args.input else []
    summary = process_businesses(businesses)
    print_summary(summary)


if __name__ == "__main__":
    main()
