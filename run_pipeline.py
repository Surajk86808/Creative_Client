from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from dotenv import load_dotenv


REPO_ROOT = Path(__file__).resolve().parent
load_dotenv(dotenv_path=REPO_ROOT / ".env")


def _slugify(value: str) -> str:
    import re

    out = str(value or "").strip().lower()
    out = re.sub(r"[^a-z0-9]+", "-", out).strip("-")
    return out or "unknown"


def _resolve_country_slug_for_city(city_input: str) -> str:
    city_slug = _slugify(city_input)
    cache_path = REPO_ROOT / "lead_finder" / "public" / "data" / "_city_country_cache.json"
    if cache_path.exists():
        try:
            raw = json.loads(cache_path.read_text(encoding="utf-8"))
            if isinstance(raw, dict) and city_slug in raw:
                return str(raw[city_slug] or "")
        except Exception:
            pass

    data_root = REPO_ROOT / "lead_finder" / "public" / "data"
    if not data_root.exists():
        return ""
    for entry in sorted(data_root.iterdir()):
        if not entry.is_dir():
            continue
        maybe_city = entry / city_slug
        if maybe_city.exists() and maybe_city.is_dir():
            return entry.name
    return ""


def _run_step(
    *,
    name: str,
    cmd: list[str],
    env: dict[str, str] | None = None,
) -> float:
    print(f"\n=== START: {name} ===")
    print("CMD:", " ".join(cmd))
    start = time.perf_counter()
    proc = subprocess.run(cmd, cwd=str(REPO_ROOT), env=env, check=False)
    elapsed = time.perf_counter() - start
    if proc.returncode != 0:
        print(f"=== FAIL: {name} (exit {proc.returncode}, {elapsed:.2f}s) ===")
        raise SystemExit(proc.returncode)
    print(f"=== DONE: {name} ({elapsed:.2f}s) ===")
    return elapsed


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Run BizSiteGen full pipeline.")
    p.add_argument("--city", required=True, help='City, e.g. "bengaluru"')
    p.add_argument("--categories", required=True, help='CSV categories, e.g. "salon,gym"')
    p.add_argument("--max", type=int, default=0, help="Max results per category (0 = unlimited)")
    p.add_argument("--dry-run", action="store_true", help="Skip deploy, and do dry-runs where supported")
    p.add_argument("--skip-scrape", action="store_true", help="Skip lead_finder step")
    p.add_argument("--skip-build", action="store_true", help="Skip website-builder step")
    p.add_argument("--skip-whatsapp", action="store_true", help="Skip WhatsApp checker step")
    p.add_argument("--skip-email", action="store_true", help="Skip email sender step")
    return p


def main() -> None:
    args = _build_parser().parse_args()

    node = shutil.which("node")
    if not node:
        raise SystemExit("node not found in PATH (required for website-builder step).")

    steps: list[tuple[str, list[str], dict[str, str] | None, bool]] = []

    if not args.skip_scrape:
        steps.append(
            (
                "Lead Finder (scrape)",
                [
                    sys.executable,
                    str(REPO_ROOT / "lead_finder" / "run.py"),
                    "--city",
                    str(args.city),
                    "--categories",
                    str(args.categories),
                    "--max",
                    str(args.max),
                ],
                None,
                True,
            )
        )

    if not args.skip_build:
        env = dict(os.environ)
        env["USE_JSON_LEADS"] = "true"

        allowed = [c for c in (_slugify(x) for x in str(args.categories).split(",")) if c]
        if allowed:
            env["ANALYTICS_CATEGORY_FILTER"] = ",".join(allowed)

        country_slug = _resolve_country_slug_for_city(args.city)
        if country_slug:
            env["ANALYTICS_KEY_PREFIX"] = f"{country_slug}/{_slugify(args.city)}/"

        build_cmd = [
            node,
            str(REPO_ROOT / "website-builder" / "src" / "index.js"),
            "run",
            "--batch",
            "1",
        ]
        if args.dry_run:
            build_cmd.append("--dry-run")

        steps.append(("Website Builder (build)", build_cmd, env, True))

    if not args.skip_whatsapp:
        wa_cmd = [sys.executable, "-m", "whatsappcheck.run"]
        if args.dry_run:
            wa_cmd.append("--dry-run")
        steps.append(("WhatsApp Checker", wa_cmd, None, True))

    if not args.skip_email:
        email_cmd = [sys.executable, str(REPO_ROOT / "email_sender" / "agent.py"), str(args.city)]
        if args.dry_run:
            email_cmd.append("--dry-run")
        steps.append(("Email Sender", email_cmd, None, True))

    timings: dict[str, float] = {}
    overall_start = time.perf_counter()
    for name, cmd, env, enabled in steps:
        if not enabled:
            continue
        timings[name] = _run_step(name=name, cmd=cmd, env=env)
    overall = time.perf_counter() - overall_start

    print("\n=== SUMMARY ===")
    for name, secs in timings.items():
        print(f"- {name}: {secs:.2f}s")
    print(f"- TOTAL: {overall:.2f}s")


if __name__ == "__main__":
    main()

