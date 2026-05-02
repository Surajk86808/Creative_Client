from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel


REPO_ROOT = Path(__file__).resolve().parents[4]
ANALYTICS_PATH = REPO_ROOT / "backend" / "analytics" / "index.json"
EMAIL_STATUS_DIR = REPO_ROOT / "backend" / "public" / "email_status"
FINAL_BUILD_STATUSES = {"built", "deployed", "done", "error", "rejected"}

app = FastAPI(title="Creative Client Pipeline Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

log_queue: asyncio.Queue = asyncio.Queue()


class LogEvent(BaseModel):
    type: str
    message: str
    ts: str
    city: str
    category: str
    status: str = "info"


def _read_json_rows(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        content = path.read_text(encoding="utf-8")
    except OSError:
        return []
    if not content.strip():
        return []

    stripped = content.lstrip()
    if stripped.startswith("["):
        try:
            payload = json.loads(content)
        except json.JSONDecodeError:
            return []
        return [row for row in payload if isinstance(row, dict)] if isinstance(payload, list) else []

    if stripped.startswith("{"):
        try:
            payload = json.loads(content)
        except json.JSONDecodeError:
            pass
        else:
            if isinstance(payload, dict):
                # If it looks like a map of entries (like analytics/index.json), return values
                if all(isinstance(v, dict) for v in payload.values()) and payload:
                    return list(payload.values())
                return [payload]

    rows: list[dict[str, Any]] = []
    for line in content.splitlines():
        raw = line.strip()
        if not raw:
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            rows.append(payload)
    return rows


def _int_value(value: Any) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def read_analytics() -> list[dict[str, Any]]:
    rows = _read_json_rows(ANALYTICS_PATH)
    return rows if isinstance(rows, list) else []


def count_emails_sent() -> int:
    if not EMAIL_STATUS_DIR.exists():
        return 0

    sent = 0
    for audit_path in EMAIL_STATUS_DIR.glob("*_audit_log.json"):
        for row in _read_json_rows(audit_path):
            status = str(row.get("status") or "").strip().upper()
            if status == "SENT" or row.get("email_sent") is True:
                sent += 1
    return sent


@app.post("/log")
async def receive_log(event: LogEvent):
    await log_queue.put(event.model_dump())
    return {"ok": True}


@app.get("/events")
async def stream_events():
    async def generator():
        while True:
            try:
                event = await asyncio.wait_for(log_queue.get(), timeout=20)
                yield f"data: {json.dumps(event)}\n\n"
            except asyncio.TimeoutError:
                yield 'data: {"type":"ping"}\n\n'

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/analytics")
async def get_analytics():
    return read_analytics()


@app.get("/stats")
async def get_stats():
    data = read_analytics()

    total_leads = sum(_int_value(entry.get("total_leads") or entry.get("lead_count")) for entry in data)
    no_web = sum(_int_value(entry.get("no_web")) for entry in data)
    weak_web = sum(_int_value(entry.get("weak_web")) for entry in data)
    deployed = sum(_int_value(entry.get("deployed_count")) for entry in data)
    emails_sent = count_emails_sent()

    categories_scraped = sum(1 for entry in data if str(entry.get("status") or "").strip().lower() == "scraped")
    categories_built = sum(
        1
        for entry in data
        if str(entry.get("build_status") or entry.get("status") or "").strip().lower()
        in {"built", "deployed", "done"}
    )
    categories_error = sum(
        1
        for entry in data
        if str(entry.get("build_status") or entry.get("status") or "").strip().lower() == "error"
    )

    active_city = next(
        (
            str(entry.get("city") or "")
            for entry in data
            if str(entry.get("build_status") or entry.get("status") or "").strip().lower()
            not in FINAL_BUILD_STATUSES
        ),
        "",
    )

    return {
        "total_leads": total_leads,
        "no_web": no_web,
        "weak_web": weak_web,
        "deployed": deployed,
        "emails_sent": emails_sent,
        "categories_scraped": categories_scraped,
        "categories_built": categories_built,
        "categories_error": categories_error,
        "active_city": active_city,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
