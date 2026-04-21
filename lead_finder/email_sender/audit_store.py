from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def append_audit_log(path: Path, row: dict[str, Any]) -> None:
    payload: list[dict[str, Any]] = []
    if path.exists():
        try:
            loaded = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(loaded, list):
                payload = [item for item in loaded if isinstance(item, dict)]
        except Exception:
            payload = []
    payload.append(row)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def filter_audit_logs(
    path: Path,
    date_iso: str | None = None,
    status: str | None = None,
    bucket_no: str | None = None,
) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        loaded = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    if not isinstance(loaded, list):
        return []

    rows = [item for item in loaded if isinstance(item, dict)]
    if date_iso:
        rows = [
            row for row in rows
            if isinstance(row.get("timestamp"), str)
            and row["timestamp"].startswith(date_iso)
        ]
    if status:
        rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
    if bucket_no:
        rows = [row for row in rows if str(row.get("bucket_no", "")) == str(bucket_no)]
    return rows


def utc_now_iso() -> str:
    return datetime.utcnow().isoformat()
