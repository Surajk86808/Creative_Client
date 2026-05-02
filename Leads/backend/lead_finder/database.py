"""SQLite-backed persistence for leads and scraped places."""

from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from config import ALL_STATUSES, SQLITE_PATH
from models import LeadRecord


def _utc_now_iso() -> str:
    """Return current UTC timestamp as ISO8601 with Z suffix."""
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


class RegistryDB:
    """Persistence layer that stores leads in SQLite and mirrors to registry JSON."""

    def __init__(
        self,
        path: Path,
        sqlite_path: Path | None = None,
        *,
        auto_sync_json: bool = True,
    ) -> None:
        """Create database handles and bootstrap storage."""
        self.path = path
        self.sqlite_path = sqlite_path or SQLITE_PATH
        self.auto_sync_json = auto_sync_json
        self.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.sqlite_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()
        self._bootstrap_from_registry_json()
        if self.auto_sync_json:
            self._sync_json_snapshot()

    def close(self) -> None:
        """Close the SQLite connection."""
        self.conn.close()

    def _create_tables(self) -> None:
        """Create tables used by the scraper and lead pipeline."""
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scraped_places (
                place_id TEXT PRIMARY KEY,
                name TEXT,
                city TEXT,
                maps_url TEXT,
                scraped_at TEXT NOT NULL
            )
            """
        )
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                lead_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                website TEXT,
                phone TEXT,
                category TEXT,
                rating REAL,
                review_count INTEGER,
                status TEXT NOT NULL,
                manual_review_required INTEGER NOT NULL,
                website_status TEXT NOT NULL,
                website_score INTEGER NOT NULL,
                website_issues TEXT NOT NULL,
                lead_quality_score INTEGER NOT NULL,
                outreach_suitability TEXT NOT NULL,
                concrete_problems TEXT NOT NULL,
                rejection_reasons TEXT NOT NULL,
                last_action TEXT NOT NULL,
                last_action_date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                google_maps_url TEXT,
                place_id TEXT,
                last_updated TEXT NOT NULL
            )
            """
        )
        self.conn.commit()

    def _bootstrap_from_registry_json(self) -> None:
        """Import existing JSON leads into SQLite only when SQLite has no leads yet."""
        lead_count = self.conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        if lead_count > 0 or not self.path.exists():
            return
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
            leads = payload.get("leads", {}) if isinstance(payload, dict) else {}
        except Exception:
            leads = {}
        if not isinstance(leads, dict):
            return
        for row in leads.values():
            try:
                self.upsert(LeadRecord.from_dict(row), sync_json=False)
            except Exception:
                continue
        self.conn.commit()

    def _sync_json_snapshot(self) -> None:
        """Write a registry JSON snapshot from current SQLite rows."""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"leads": {record.lead_id: record.to_dict() for record in self.all_leads()}}
        self.path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")

    def exists(self, lead_id: str) -> bool:
        """Return True when a lead id already exists."""
        row = self.conn.execute("SELECT 1 FROM leads WHERE lead_id = ?", (lead_id,)).fetchone()
        return row is not None

    def get(self, lead_id: str) -> LeadRecord | None:
        """Fetch one lead by id."""
        row = self.conn.execute("SELECT * FROM leads WHERE lead_id = ?", (lead_id,)).fetchone()
        if row is None:
            return None
        return self._row_to_lead(row)

    def upsert(self, record: LeadRecord, sync_json: bool = True) -> None:
        """Insert or update one lead record."""
        if record.status not in ALL_STATUSES:
            raise ValueError(f"Invalid status: {record.status}")
        self.conn.execute(
            """
            INSERT INTO leads (
                lead_id, name, city, website, phone, category, rating, review_count,
                status, manual_review_required, website_status, website_score, website_issues,
                lead_quality_score, outreach_suitability, concrete_problems, rejection_reasons,
                last_action, last_action_date, created_at, google_maps_url, place_id, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(lead_id) DO UPDATE SET
                name=excluded.name,
                city=excluded.city,
                website=excluded.website,
                phone=excluded.phone,
                category=excluded.category,
                rating=excluded.rating,
                review_count=excluded.review_count,
                status=excluded.status,
                manual_review_required=excluded.manual_review_required,
                website_status=excluded.website_status,
                website_score=excluded.website_score,
                website_issues=excluded.website_issues,
                lead_quality_score=excluded.lead_quality_score,
                outreach_suitability=excluded.outreach_suitability,
                concrete_problems=excluded.concrete_problems,
                rejection_reasons=excluded.rejection_reasons,
                last_action=excluded.last_action,
                last_action_date=excluded.last_action_date,
                created_at=excluded.created_at,
                google_maps_url=excluded.google_maps_url,
                place_id=excluded.place_id,
                last_updated=excluded.last_updated
            """,
            (
                record.lead_id,
                record.name,
                record.city,
                record.website,
                record.phone,
                record.category,
                record.rating,
                record.review_count,
                record.status,
                int(record.manual_review_required),
                record.website_status,
                record.website_score,
                json.dumps(record.website_issues),
                record.lead_quality_score,
                record.outreach_suitability,
                json.dumps(record.concrete_problems),
                json.dumps(record.rejection_reasons),
                record.last_action,
                record.last_action_date,
                record.created_at,
                record.google_maps_url,
                record.place_id,
                _utc_now_iso(),
            ),
        )
        self.conn.commit()
        if sync_json and self.auto_sync_json:
            self._sync_json_snapshot()

    def all_leads(self) -> list[LeadRecord]:
        """Return all leads sorted by creation time descending."""
        rows = self.conn.execute(
            "SELECT * FROM leads ORDER BY created_at DESC, name ASC"
        ).fetchall()
        return [self._row_to_lead(row) for row in rows]

    def is_place_scraped(self, place_id: str | None) -> bool:
        """Return True when a Google Maps place id is already tracked."""
        if not place_id:
            return False
        row = self.conn.execute(
            "SELECT 1 FROM scraped_places WHERE place_id = ?",
            (place_id,),
        ).fetchone()
        return row is not None

    def mark_place_scraped(
        self,
        place_id: str | None,
        name: str,
        city: str,
        maps_url: str | None,
    ) -> None:
        """Persist a place id as scraped for cross-run deduplication."""
        if not place_id:
            return
        self.conn.execute(
            """
            INSERT INTO scraped_places (place_id, name, city, maps_url, scraped_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(place_id) DO UPDATE SET
                name=excluded.name,
                city=excluded.city,
                maps_url=excluded.maps_url,
                scraped_at=excluded.scraped_at
            """,
            (place_id, name, city, maps_url, _utc_now_iso()),
        )
        self.conn.commit()

    def _row_to_lead(self, row: sqlite3.Row) -> LeadRecord:
        """Convert one SQLite row to a LeadRecord."""
        return LeadRecord(
            lead_id=row["lead_id"],
            name=row["name"],
            city=row["city"],
            website=row["website"],
            phone=row["phone"],
            category=row["category"],
            rating=row["rating"],
            review_count=row["review_count"],
            status=row["status"],
            manual_review_required=bool(row["manual_review_required"]),
            website_status=row["website_status"],
            website_score=int(row["website_score"]),
            website_issues=list(json.loads(row["website_issues"] or "[]")),
            lead_quality_score=int(row["lead_quality_score"]),
            outreach_suitability=row["outreach_suitability"],
            concrete_problems=list(json.loads(row["concrete_problems"] or "[]")),
            rejection_reasons=list(json.loads(row["rejection_reasons"] or "[]")),
            last_action=row["last_action"],
            last_action_date=row["last_action_date"],
            created_at=row["created_at"],
            google_maps_url=row["google_maps_url"],
            place_id=row["place_id"],
        )
