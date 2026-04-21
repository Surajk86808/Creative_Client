"""Data models used across scraping, qualification, and export."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(slots=True)
class WebsiteReport:
    """Website quality analysis result."""

    reachable: bool = False
    final_url: str | None = None
    uses_https: bool = False
    response_time_ms: int | None = None
    mobile_friendly: bool = False
    copyright_year: int | None = None
    old_wordpress: bool = False
    old_jquery: bool = False
    flash_detected: bool = False
    table_layout_heavy: bool = False
    domain_age_years: int | None = None
    website_score: int = 1
    issues: list[str] | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serialize the report to a plain dict."""
        payload = asdict(self)
        payload["issues"] = self.issues or []
        return payload

    @staticmethod
    def from_dict(payload: dict[str, Any]) -> "WebsiteReport":
        """Create a report from a dict payload."""
        return WebsiteReport(
            reachable=bool(payload.get("reachable", False)),
            final_url=payload.get("final_url"),
            uses_https=bool(payload.get("uses_https", False)),
            response_time_ms=payload.get("response_time_ms"),
            mobile_friendly=bool(payload.get("mobile_friendly", False)),
            copyright_year=payload.get("copyright_year"),
            old_wordpress=bool(payload.get("old_wordpress", False)),
            old_jquery=bool(payload.get("old_jquery", False)),
            flash_detected=bool(payload.get("flash_detected", False)),
            table_layout_heavy=bool(payload.get("table_layout_heavy", False)),
            domain_age_years=payload.get("domain_age_years"),
            website_score=int(payload.get("website_score", 1)),
            issues=list(payload.get("issues", [])),
        )


@dataclass(slots=True)
class BusinessInput:
    """Raw business data used for qualification."""

    name: str
    city: str
    website: str | None = None
    phone: str | None = None
    category: str | None = None
    rating: float | None = None
    review_count: int | None = None
    address: str | None = None
    google_maps_url: str | None = None
    place_id: str | None = None
    website_report: WebsiteReport | None = None


@dataclass(slots=True)
class QualificationResult:
    """Qualification output used when creating lead records."""

    website_status: str
    website_score: int
    website_issues: list[str]
    lead_quality_score: int
    outreach_suitability: str
    concrete_problems: list[str]
    rejected: bool
    rejection_reasons: list[str]


@dataclass(slots=True)
class LeadRecord:
    """Persisted lead record."""

    lead_id: str
    name: str
    city: str
    website: str | None
    phone: str | None
    category: str | None
    rating: float | None
    review_count: int | None
    status: str
    manual_review_required: bool
    website_status: str
    website_score: int
    website_issues: list[str]
    lead_quality_score: int
    outreach_suitability: str
    concrete_problems: list[str]
    rejection_reasons: list[str]
    last_action: str
    last_action_date: str
    created_at: str
    google_maps_url: str | None = None
    place_id: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serialize to a plain dict."""
        return asdict(self)

    @staticmethod
    def from_dict(payload: dict[str, Any]) -> "LeadRecord":
        """Create a record from a dict payload with backward-compatible defaults."""
        return LeadRecord(
            lead_id=str(payload["lead_id"]),
            name=str(payload.get("name", "")),
            city=str(payload.get("city", "")),
            website=payload.get("website"),
            phone=payload.get("phone"),
            category=payload.get("category"),
            rating=payload.get("rating"),
            review_count=payload.get("review_count"),
            status=str(payload.get("status", "NEW")),
            manual_review_required=bool(payload.get("manual_review_required", False)),
            website_status=str(payload.get("website_status", "unknown")),
            website_score=int(payload.get("website_score", payload.get("lead_quality_score", 1))),
            website_issues=list(payload.get("website_issues", [])),
            lead_quality_score=int(payload.get("lead_quality_score", 1)),
            outreach_suitability=str(payload.get("outreach_suitability", "LOW")),
            concrete_problems=list(payload.get("concrete_problems", [])),
            rejection_reasons=list(payload.get("rejection_reasons", [])),
            last_action=str(payload.get("last_action", "UNKNOWN")),
            last_action_date=str(payload.get("last_action_date", "")),
            created_at=str(payload.get("created_at", "")),
            google_maps_url=payload.get("google_maps_url"),
            place_id=payload.get("place_id"),
        )
