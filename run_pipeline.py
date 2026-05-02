from __future__ import annotations

from pathlib import Path
import subprocess
import sys


REPO_ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = REPO_ROOT / "Leads" / "backend"
TARGET = BACKEND_ROOT / "run_pipeline.py"


def main() -> None:
    if not TARGET.is_file():
        raise SystemExit(f"Missing backend pipeline entrypoint: {TARGET}")

    completed = subprocess.run(
        [sys.executable, str(TARGET), *sys.argv[1:]],
        cwd=str(BACKEND_ROOT),
        check=False,
    )
    raise SystemExit(completed.returncode)


if __name__ == "__main__":
    main()
