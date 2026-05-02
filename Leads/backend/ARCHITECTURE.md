# Architecture

## Canonical Entrypoint

The only supported orchestration entrypoint is:

```powershell
python run_pipeline.py
```

All legacy pipeline launchers are deprecated compatibility wrappers or retired fragments.

## Pipeline Stages

1. `lead_finder/` scrapes and qualifies leads into canonical JSON output.
2. `analytics/` records batch lifecycle state.
3. `website-builder/` watches analytics and generates websites into `output/`.
4. `website_checker/` validates generated sites and syncs review metadata.
5. `screenshot-taker/` captures approved-site screenshots and updates `leads.xlsx`.
6. `whatsappcheck/` enriches `leads.xlsx` with WhatsApp reachability.
7. `email_sender/` sends outreach only from reviewed output.

## Top-Level Structure

- `analytics/`
  Batch tracking and pipeline state.
- `email_sender/`
  Canonical email sending implementation.
- `frontend/nexviatech-pipeline/`
  Optional dashboard/viewer assets. Not a separate source of truth.
- `lead_finder/`
  Canonical scraping and qualification implementation.
- `output/`
  Generated artifacts and handoff files.
- `screenshot-taker/`
  Canonical screenshot stage.
- `scripts/`
  Local runtime bootstrap helpers.
- `website-builder/`
  Canonical website generation stage.
- `website_checker/`
  Post-build site validation.
- `whatsappcheck/`
  WhatsApp enrichment stage.

## Deprecated Components

- `website-builder/src/commands/pipeline.js`
  Deprecated wrapper that delegates to root `run_pipeline.py`.
- `frontend/nexviatech-pipeline/run_pipeline.py`
  Deprecated wrapper that delegates to root `run_pipeline.py`.
- `frontend/nexviatech-pipeline/pipeline.py`
  Deprecated wrapper that delegates to root `run_pipeline.py`.
- Legacy frontend snapshot pipeline fragments
  Old duplicate scraper/watcher/screenshot fragments were removed from the frontend snapshot so the dashboard can point at canonical root data instead.
- Legacy screenshot mailer flow
  `screenshot-mailer-v2` style combined screenshot/email scripts are deprecated. Use `screenshot-taker/` and `email_sender/`.

## Migration Notes

- Use `python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0` from the repo root.
- If you previously used `node src/index.js pipeline`, it still delegates to the root pipeline but now prints a deprecation warning.
- If you previously used the frontend snapshot pipeline launchers, run the root pipeline instead and keep the frontend folder for dashboard work only.
- `website-builder/` keeps its historical folder name for compatibility with existing scripts and imports.
