from __future__ import annotations

import asyncio
import json
import logging
import os
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool


MCP_ROOT = Path(__file__).resolve().parent
load_dotenv(MCP_ROOT / ".env")

DEFAULT_REPO_ROOT = MCP_ROOT.parent
REPO_ROOT = Path(os.getenv("NEXVIA_ROOT", str(DEFAULT_REPO_ROOT))).resolve()
BACKEND_ROOT = REPO_ROOT / "Leads" / "backend" if (REPO_ROOT / "Leads" / "backend").is_dir() else REPO_ROOT

LEAD_FINDER_DIR = BACKEND_ROOT / "lead_finder"
WEBSITE_BUILDER_DIR = BACKEND_ROOT / "website-builder"
EMAIL_SENDER_DIR = BACKEND_ROOT / "email_sender"
SCREENSHOT_TAKER_DIR = BACKEND_ROOT / "screenshot-taker"
WHATSAPP_CHECKER_DIR = BACKEND_ROOT / "whatsappcheck"
ANALYTICS_FILE = BACKEND_ROOT / "analytics" / "index.json"
OUTPUT_DIR = BACKEND_ROOT / "output"
DATA_DIR = LEAD_FINDER_DIR / "public" / "data"
PIPELINE_ENTRYPOINT = REPO_ROOT / "run_pipeline.py" if (REPO_ROOT / "run_pipeline.py").is_file() else BACKEND_ROOT / "run_pipeline.py"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("nexviatech-mcp")


def _exists(path: Path) -> bool:
    return path.exists()


def _run(cmd: list[str], cwd: Path | None = None, timeout: int = 300) -> dict[str, object]:
    try:
        result = subprocess.run(
            cmd,
            cwd=str(cwd or BACKEND_ROOT),
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return {
            "command": cmd,
            "cwd": str(cwd or BACKEND_ROOT),
            "returncode": result.returncode,
            "stdout": (result.stdout or "")[-4000:],
            "stderr": (result.stderr or "")[-3000:],
        }
    except subprocess.TimeoutExpired:
        return {
            "command": cmd,
            "cwd": str(cwd or BACKEND_ROOT),
            "returncode": -1,
            "stdout": "",
            "stderr": f"Timed out after {timeout}s",
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "command": cmd,
            "cwd": str(cwd or BACKEND_ROOT),
            "returncode": -1,
            "stdout": "",
            "stderr": str(exc),
        }


def _ok(data: dict | list | str) -> list[TextContent]:
    text = data if isinstance(data, str) else json.dumps(data, indent=2, ensure_ascii=False)
    return [TextContent(type="text", text=text)]


def _err(message: str, **extra: object) -> list[TextContent]:
    payload: dict[str, object] = {"error": message}
    payload.update(extra)
    return [TextContent(type="text", text=json.dumps(payload, indent=2, ensure_ascii=False))]


def _tool_result(stage: str, result: dict[str, object]) -> list[TextContent]:
    return _ok(
        {
            "stage": stage,
            "status": "success" if result.get("returncode") == 0 else "failed",
            "returncode": result.get("returncode"),
            "cwd": result.get("cwd"),
            "command": " ".join(str(part) for part in result.get("command", [])),
            "output": result.get("stdout"),
            "errors": result.get("stderr"),
        }
    )


def _repo_summary() -> dict[str, str]:
    return {
        "repo_root": str(REPO_ROOT),
        "backend_root": str(BACKEND_ROOT),
        "pipeline_entrypoint": str(PIPELINE_ENTRYPOINT),
    }


def tool_run_pipeline(city: str, categories: str, max_leads: int = 10, dry_run: bool = False) -> list[TextContent]:
    if not _exists(PIPELINE_ENTRYPOINT):
        return _err("Pipeline entrypoint not found.", **_repo_summary())

    cmd = [
        sys.executable,
        str(PIPELINE_ENTRYPOINT),
        "--city",
        city,
        "--categories",
        categories,
        "--max",
        str(max_leads),
    ]
    if dry_run:
        cmd.append("--dry-run")

    return _tool_result("pipeline", _run(cmd, cwd=REPO_ROOT, timeout=900))


def tool_run_scraper(city: str, categories: str, max_leads: int = 10, dry_run: bool = False) -> list[TextContent]:
    script = LEAD_FINDER_DIR / "run.py"
    if not _exists(script):
        return _err("lead_finder/run.py not found.", script=str(script), **_repo_summary())

    cmd = [
        sys.executable,
        str(script),
        "--city",
        city,
        "--categories",
        categories,
        "--max",
        str(max_leads),
    ]
    if dry_run:
        cmd.append("--dry-run")

    return _tool_result("scraper", _run(cmd, cwd=BACKEND_ROOT, timeout=600))


def tool_get_leads(
    country: str = "india",
    city: str = "indore",
    category: str = "dentist",
    priority: str = "all",
    limit: int = 20,
) -> list[TextContent]:
    db_path = DATA_DIR / country / city / category / "scraped.db"
    if not db_path.exists():
        db_path = LEAD_FINDER_DIR / "scraped.db"
    if not db_path.exists():
        return _err("No lead database found.", attempted=str(db_path), **_repo_summary())

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        table = "leads" if "leads" in tables else (tables[0] if tables else None)
        if table is None:
            conn.close()
            return _err("No tables found in lead database.", db=str(db_path))

        columns = [row[1] for row in cur.execute(f"PRAGMA table_info({table})").fetchall()]
        query = f"SELECT * FROM {table}"
        params: list[object] = []
        if priority != "all" and "priority" in columns:
            query += " WHERE priority = ?"
            params.append(priority)
        query += " LIMIT ?"
        params.append(int(limit))

        rows = cur.execute(query, params).fetchall()
        conn.close()
        return _ok(
            {
                "db": str(db_path),
                "table": table,
                "count": len(rows),
                "leads": [dict(row) for row in rows],
            }
        )
    except Exception as exc:  # noqa: BLE001
        return _err(str(exc), db=str(db_path))


def tool_get_analytics() -> list[TextContent]:
    if not ANALYTICS_FILE.exists():
        return _err("analytics/index.json not found.", file=str(ANALYTICS_FILE), **_repo_summary())
    try:
        return _ok(json.loads(ANALYTICS_FILE.read_text(encoding="utf-8")))
    except Exception as exc:  # noqa: BLE001
        return _err(str(exc), file=str(ANALYTICS_FILE))


def tool_build_websites(dry_run: bool = False) -> list[TextContent]:
    script = WEBSITE_BUILDER_DIR / "src" / "index.js"
    if not _exists(script):
        return _err("website-builder/src/index.js not found.", script=str(script), **_repo_summary())

    cmd = ["node", str(script), "run"]
    if dry_run:
        cmd.append("--dry-run")

    return _tool_result("website_builder", _run(cmd, cwd=WEBSITE_BUILDER_DIR, timeout=900))


def tool_send_emails(dry_run: bool = False) -> list[TextContent]:
    script = EMAIL_SENDER_DIR / "agent.py"
    if not _exists(script):
        return _err("email_sender/agent.py not found.", script=str(script), **_repo_summary())

    cmd = [sys.executable, str(script), "--require-approved-review"]
    if dry_run:
        cmd.extend(["--dry-run", "--dry-run-no-groq"])

    return _tool_result("email_sender", _run(cmd, cwd=BACKEND_ROOT, timeout=600))


def tool_take_screenshots(dry_run: bool = False) -> list[TextContent]:
    script = SCREENSHOT_TAKER_DIR / "run.py"
    if not _exists(script):
        return _err("screenshot-taker/run.py not found.", script=str(script), **_repo_summary())

    cmd = [sys.executable, str(script)]
    if dry_run:
        cmd.append("--dry-run")

    return _tool_result("screenshot_taker", _run(cmd, cwd=BACKEND_ROOT, timeout=600))


def tool_check_whatsapp(phone: str) -> list[TextContent]:
    script = WHATSAPP_CHECKER_DIR / "checker.py"
    if not _exists(script):
        return _err("whatsappcheck/checker.py not found.", script=str(script), **_repo_summary())

    code = (
        "import json, pathlib, sys; "
        "sys.path.insert(0, str(pathlib.Path(sys.argv[1]).resolve())); "
        "from checker import check_whatsapp; "
        "normalized, status = check_whatsapp(sys.argv[2]); "
        "print(json.dumps({'normalized_phone': normalized, 'status': status}))"
    )
    result = _run([sys.executable, "-c", code, str(WHATSAPP_CHECKER_DIR), phone], cwd=BACKEND_ROOT, timeout=60)
    return _tool_result("whatsapp_single_check", result)


def tool_pipeline_status() -> list[TextContent]:
    status: dict[str, object] = {
        "timestamp": datetime.now().isoformat(),
        **_repo_summary(),
        "paths": {
            "analytics_file": str(ANALYTICS_FILE),
            "output_dir": str(OUTPUT_DIR),
            "data_dir": str(DATA_DIR),
        },
        "exists": {
            "pipeline_entrypoint": _exists(PIPELINE_ENTRYPOINT),
            "lead_finder": LEAD_FINDER_DIR.is_dir(),
            "website_builder": WEBSITE_BUILDER_DIR.is_dir(),
            "website_checker": (BACKEND_ROOT / "website_checker" / "run.py").is_file(),
            "screenshot_taker": (SCREENSHOT_TAKER_DIR / "run.py").is_file(),
            "whatsappcheck": WHATSAPP_CHECKER_DIR.is_dir(),
            "email_sender": EMAIL_SENDER_DIR.is_dir(),
            "analytics_file": ANALYTICS_FILE.is_file(),
            "output_dir": OUTPUT_DIR.is_dir(),
        },
        "stages": {},
    }

    if ANALYTICS_FILE.exists():
        try:
            status["analytics"] = json.loads(ANALYTICS_FILE.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            status["analytics"] = "parse_error"

    status["stages"]["built_sites"] = len(list(OUTPUT_DIR.rglob("_lead_meta.json"))) if OUTPUT_DIR.exists() else 0
    db_files = list(DATA_DIR.rglob("scraped.db")) if DATA_DIR.exists() else []
    status["stages"]["lead_dbs"] = len(db_files)
    status["stages"]["cities_scraped"] = sorted({str(path.parent.parent.name) for path in db_files})
    status["stages"]["batch_excels"] = len(list(OUTPUT_DIR.rglob("leads.xlsx"))) if OUTPUT_DIR.exists() else 0
    return _ok(status)


def tool_list_cities() -> list[TextContent]:
    if not DATA_DIR.exists():
        return _err("Lead data directory not found.", path=str(DATA_DIR), **_repo_summary())

    result: dict[str, dict[str, list[str]]] = {}
    for country_dir in sorted(DATA_DIR.iterdir()):
        if not country_dir.is_dir() or country_dir.name.startswith("_"):
            continue
        result[country_dir.name] = {}
        for city_dir in sorted(country_dir.iterdir()):
            if not city_dir.is_dir():
                continue
            categories = sorted(
                child.name
                for child in city_dir.iterdir()
                if child.is_dir() and not child.name.startswith("_")
            )
            result[country_dir.name][city_dir.name] = categories
    return _ok(result)


server = Server("nexviatech-pipeline")

TOOLS: list[Tool] = [
    Tool(
        name="run_pipeline",
        description="Run the full NexviaTech pipeline end-to-end.",
        inputSchema={
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "categories": {"type": "string"},
                "max_leads": {"type": "integer", "default": 10},
                "dry_run": {"type": "boolean", "default": False},
            },
            "required": ["city", "categories"],
        },
    ),
    Tool(
        name="run_scraper",
        description="Run only the lead scraper stage.",
        inputSchema={
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "categories": {"type": "string"},
                "max_leads": {"type": "integer", "default": 10},
                "dry_run": {"type": "boolean", "default": False},
            },
            "required": ["city", "categories"],
        },
    ),
    Tool(
        name="get_leads",
        description="Read scraped leads from SQLite.",
        inputSchema={
            "type": "object",
            "properties": {
                "country": {"type": "string", "default": "india"},
                "city": {"type": "string", "default": "indore"},
                "category": {"type": "string", "default": "dentist"},
                "priority": {"type": "string", "default": "all"},
                "limit": {"type": "integer", "default": 20},
            },
        },
    ),
    Tool(
        name="get_analytics",
        description="Read analytics/index.json.",
        inputSchema={"type": "object", "properties": {}},
    ),
    Tool(
        name="build_websites",
        description="Run the website builder for ready leads.",
        inputSchema={
            "type": "object",
            "properties": {
                "dry_run": {"type": "boolean", "default": False},
            },
        },
    ),
    Tool(
        name="send_emails",
        description="Run the email sender for approved leads.",
        inputSchema={
            "type": "object",
            "properties": {
                "dry_run": {"type": "boolean", "default": False},
            },
        },
    ),
    Tool(
        name="take_screenshots",
        description="Capture screenshots for reviewed-good sites.",
        inputSchema={
            "type": "object",
            "properties": {
                "dry_run": {"type": "boolean", "default": False},
            },
        },
    ),
    Tool(
        name="check_whatsapp",
        description="Check whether a single phone number appears reachable on WhatsApp.",
        inputSchema={
            "type": "object",
            "properties": {
                "phone": {"type": "string"},
            },
            "required": ["phone"],
        },
    ),
    Tool(
        name="pipeline_status",
        description="Return a health and path summary for the current pipeline.",
        inputSchema={"type": "object", "properties": {}},
    ),
    Tool(
        name="list_cities",
        description="List scraped countries, cities, and categories.",
        inputSchema={"type": "object", "properties": {}},
    ),
]


@server.list_tools()
async def list_tools() -> list[Tool]:
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    log.info("Tool called: %s args=%s", name, arguments)
    try:
        if name == "run_pipeline":
            return tool_run_pipeline(**arguments)
        if name == "run_scraper":
            return tool_run_scraper(**arguments)
        if name == "get_leads":
            return tool_get_leads(**arguments)
        if name == "get_analytics":
            return tool_get_analytics()
        if name == "build_websites":
            return tool_build_websites(**arguments)
        if name == "send_emails":
            return tool_send_emails(**arguments)
        if name == "take_screenshots":
            return tool_take_screenshots(**arguments)
        if name == "check_whatsapp":
            return tool_check_whatsapp(**arguments)
        if name == "pipeline_status":
            return tool_pipeline_status()
        if name == "list_cities":
            return tool_list_cities()
        return _err(f"Unknown tool: {name}")
    except Exception as exc:  # noqa: BLE001
        log.exception("Tool %s crashed", name)
        return _err(f"Internal error in {name}: {exc}")


async def main() -> None:
    log.info("NexviaTech MCP Server starting repo=%s backend=%s", REPO_ROOT, BACKEND_ROOT)
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
