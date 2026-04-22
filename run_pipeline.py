# -*- coding: utf-8 -*-
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


def _cities_from_args(args: argparse.Namespace) -> list[str]:
    if args.city:
        return [args.city.strip()]
    return [item.strip() for item in str(args.cities or "").split(",") if item.strip()]


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
    city_group = p.add_mutually_exclusive_group(required=True)
    city_group.add_argument("--city", help='Single city, e.g. "bengaluru"')
    city_group.add_argument("--cities", help='Comma-separated cities, e.g. "bengaluru,mysuru"')
    p.add_argument("--categories", required=True, help='CSV categories, e.g. "salon,gym"')
    p.add_argument("--max", type=int, default=0, help="Max results per category (0 = unlimited)")
    p.add_argument("--dry-run", action="store_true", help="Skip deploy, and do dry-runs where supported")
    p.add_argument(
        "--city-rate-limit-seconds",
        type=float,
        default=0.0,
        help="Pause between cities to avoid hammering external services.",
    )
    p.add_argument("--skip-scrape", action="store_true", help="Skip lead_finder step")
    p.add_argument("--skip-build", action="store_true", help="Skip website-builder step")
    p.add_argument("--skip-whatsapp", action="store_true", help="Skip WhatsApp checker step")
    p.add_argument("--skip-email", action="store_true", help="Skip email sender step")
    return p


def _build_steps_for_city(
    *,
    node: str,
    city: str,
    categories: str,
    max_results: int,
    dry_run: bool,
    skip_scrape: bool,
    skip_build: bool,
    skip_whatsapp: bool,
    skip_email: bool,
) -> list[tuple[str, list[str], dict[str, str] | None]]:
    steps: list[tuple[str, list[str], dict[str, str] | None]] = []
    country_slug = _resolve_country_slug_for_city(city)

    if not skip_scrape:
        steps.append(
            (
                f"Lead Finder (scrape) [{city}]",
                [
                    sys.executable,
                    str(REPO_ROOT / "lead_finder" / "run.py"),
                    "--city",
                    city,
                    "--categories",
                    categories,
                    "--max",
                    str(max_results),
                ],
                None,
            )
        )

    if not skip_build:
        env = dict(os.environ)
        env["USE_JSON_LEADS"] = "true"
        env["JSON_LEADS_CITY_SLUG"] = _slugify(city)

        allowed = [c for c in (_slugify(x) for x in str(categories).split(",")) if c]
        if allowed:
            env["ANALYTICS_CATEGORY_FILTER"] = ",".join(allowed)
            env["JSON_LEADS_CATEGORY_FILTER"] = ",".join(allowed)

        if country_slug:
            env["ANALYTICS_KEY_PREFIX"] = f"{country_slug}/{_slugify(city)}/"
            env["JSON_LEADS_COUNTRY_SLUG"] = country_slug

        build_cmd = [
            node,
            str(REPO_ROOT / "website-builder" / "src" / "index.js"),
            "run",
            "--batch",
            "1",
        ]
        if dry_run:
            build_cmd.append("--dry-run")

        steps.append((f"Website Builder (build) [{city}]", build_cmd, env))

    if not skip_whatsapp:
        wa_cmd = [sys.executable, "-m", "whatsappcheck.run"]
        if dry_run:
            wa_cmd.append("--dry-run")
        if country_slug:
            wa_cmd.extend(
                [
                    "--output-dir",
                    str(REPO_ROOT / "output" / country_slug / _slugify(city)),
                ]
            )
        steps.append((f"WhatsApp Checker [{city}]", wa_cmd, None))

    if not skip_email:
        email_cmd = [sys.executable, str(REPO_ROOT / "email_sender" / "agent.py"), city]
        if dry_run:
            email_cmd.append("--dry-run")
        steps.append((f"Email Sender [{city}]", email_cmd, None))

    return steps


def main() -> None:
    args = _build_parser().parse_args()
    cities = _cities_from_args(args)
    if not cities:
        raise SystemExit("No cities provided.")

    node = shutil.which("node")
    if not node:
        raise SystemExit("node not found in PATH (required for website-builder step).")

    timings: dict[str, float] = {}
    overall_start = time.perf_counter()

    for index, city in enumerate(cities, start=1):
        print(f"\n=== CITY {index}/{len(cities)}: {city} ===")
        city_start = time.perf_counter()
        for name, cmd, env in _build_steps_for_city(
            node=node,
            city=city,
            categories=args.categories,
            max_results=args.max,
            dry_run=args.dry_run,
            skip_scrape=args.skip_scrape,
            skip_build=args.skip_build,
            skip_whatsapp=args.skip_whatsapp,
            skip_email=args.skip_email,
        ):
            timings[name] = _run_step(name=name, cmd=cmd, env=env)
        city_elapsed = time.perf_counter() - city_start
        print(f"=== CITY DONE: {city} ({city_elapsed:.2f}s) ===")

        should_wait = index < len(cities) and args.city_rate_limit_seconds > 0
        if should_wait:
            print(
                f"=== PAUSE: waiting {args.city_rate_limit_seconds:.1f}s before next city ==="
            )
            time.sleep(args.city_rate_limit_seconds)

    overall = time.perf_counter() - overall_start

    print("\n=== SUMMARY ===")
    for name, secs in timings.items():
        print(f"- {name}: {secs:.2f}s")
    print(f"- TOTAL: {overall:.2f}s")


if __name__ == "__main__":
    main()
