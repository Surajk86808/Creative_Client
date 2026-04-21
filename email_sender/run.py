"""Backward-compatible wrapper for the canonical email sender CLI.

This command now delegates to `email_sender/agent.py`.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess
import sys


def _slugify(value: str) -> str:
    import re

    lowered = value.strip().lower()
    cleaned = re.sub(r"[^a-z0-9]+", "-", lowered)
    return cleaned.strip("-") or "unknown"


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Send outreach emails to qualified leads.")
    parser.add_argument("--city", required=True, help="City name, e.g. bengaluru")
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Input leads file. Default: public/data/{country}/{city}/{city}_leads.json",
    )
    parser.add_argument(
        "--numbers-out",
        type=Path,
        default=None,
        help="Output file for leads without email.",
    )
    parser.add_argument(
        "--subject",
        default="Quick website improvement idea",
        help="Email subject line.",
    )
    parser.add_argument(
        "--category",
        default=None,
        help="Optional category filter (example: accounting).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not send emails, only prepare splits and output no-email leads.",
    )
    return parser.parse_args()


def _warn_ignored(args: argparse.Namespace) -> None:
    ignored = []
    if args.input is not None:
        ignored.append("--input")
    if args.numbers_out is not None:
        ignored.append("--numbers-out")
    if args.subject != "Quick website improvement idea":
        ignored.append("--subject")
    if args.category is not None:
        ignored.append("--category")
    if ignored:
        print(
            "[warn] Ignored options with canonical sender: "
            f"{', '.join(ignored)}. Use email_sender/agent.py templates instead."
        )


def main() -> None:
    args = _parse_args()
    _warn_ignored(args)
    city_slug = _slugify(args.city)
    agent_path = Path(__file__).with_name("agent.py")
    cmd = [sys.executable, str(agent_path), city_slug]
    if args.dry_run:
        cmd.append("--dry-run")
    completed = subprocess.run(cmd, check=False)
    raise SystemExit(completed.returncode)


if __name__ == "__main__":
    main()
