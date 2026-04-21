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
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def filter_audit_logs(
    path: Path,
    date_iso: str | None = None,
    status: str | None = None,
    bucket_no: str | None = None,
) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    content = path.read_text(encoding="utf-8")
    if not content.strip():
        return []

    rows: list[dict[str, Any]] = []
    first_non_ws = next((ch for ch in content if not ch.isspace()), "")
    if first_non_ws == "[":
        try:
            loaded = json.loads(content)
        except Exception:
            return []
        if not isinstance(loaded, list):
            return []
        rows = [item for item in loaded if isinstance(item, dict)]
    else:
        for line in content.splitlines():
            raw = line.strip()
            if not raw:
                continue
            try:
                parsed = json.loads(raw)
            except Exception:
                continue
            if isinstance(parsed, dict):
                rows.append(parsed)

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
