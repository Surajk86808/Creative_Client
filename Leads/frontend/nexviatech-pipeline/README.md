# NexviaTech Dashboard Snapshot

This folder now exists as an optional dashboard/viewer layer for the canonical root pipeline.

## Canonical Pipeline Command

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

Do not use this folder as a second orchestration source of truth. Legacy pipeline launchers in this folder are deprecated wrappers that delegate back to the repo root.

## What Still Lives Here

- `dashboard/api/` - FastAPI viewer API that reads the root repo analytics and email status data
- `dashboard/web/` - Next.js dashboard frontend

## Deprecated In This Folder

- local pipeline orchestration logic
- duplicate scraper/build/screenshot fragments
- local analytics as a separate source of truth

Use the root pipeline for execution and this folder only for dashboard work.
