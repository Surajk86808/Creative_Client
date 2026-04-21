from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path

# Resolve repo root and load .env
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from dotenv import load_dotenv

load_dotenv(dotenv_path=REPO_ROOT / ".env")

from whatsappcheck.excel_updater import find_all_excel_files, process_excel_file

OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", str(REPO_ROOT / "output"))).resolve()


def _configure_logging() -> None:
    if not logging.getLogger().handlers:
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s %(levelname)s %(message)s",
        )


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Check WhatsApp availability for leads in output Excel files."
    )
    parser.add_argument(
        "--file",
        type=Path,
        default=None,
        help="Path to a specific leads.xlsx file. "
        "If not set, all leads.xlsx files under OUTPUT_DIR are processed.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be checked without making requests or writing files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=OUTPUT_DIR,
        help=f"Root output directory to scan (default: {OUTPUT_DIR})",
    )
    return parser


def main() -> None:
    _configure_logging()
    args = _build_parser().parse_args()
    logger = logging.getLogger("whatsappcheck")

    if args.file:
        files = [args.file.resolve()]
    else:
        files = find_all_excel_files(args.output_dir)

    if not files:
        logger.info("No leads.xlsx files found under %s", args.output_dir)
        return

    total_stats: dict[str, int] = {
        "checked": 0,
        "skipped": 0,
        "yes": 0,
        "no": 0,
        "invalid": 0,
        "error": 0,
    }

    for f in files:
        logger.info("Processing: %s", f)
        stats = process_excel_file(f, dry_run=args.dry_run)
        for k, v in stats.items():
            total_stats[k] = total_stats.get(k, 0) + v
        logger.info(
            "  → checked=%d skipped=%d yes=%d no=%d invalid=%d error=%d",
            stats["checked"],
            stats["skipped"],
            stats["yes"],
            stats["no"],
            stats["invalid"],
            stats["error"],
        )

    logger.info(
        "TOTAL: checked=%d skipped=%d yes=%d no=%d invalid=%d error=%d",
        total_stats["checked"],
        total_stats["skipped"],
        total_stats["yes"],
        total_stats["no"],
        total_stats["invalid"],
        total_stats["error"],
    )


if __name__ == "__main__":
    main()

