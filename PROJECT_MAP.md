# Project Map

## Canonical Layout

- `run_pipeline.py`
  Root compatibility entrypoint. Delegates to `Leads/backend/run_pipeline.py`.
- `Leads/backend/`
  Canonical pipeline backend and all stage implementations.
- `Leads/frontend/nexviatech-pipeline/`
  Optional dashboard/viewer layer. Not the pipeline source of truth.
- `Mcp/`
  Separate workspace area, not part of the lead pipeline runtime path.

## Backend Workflow

```text
run_pipeline.py
  -> Leads/backend/run_pipeline.py
    -> lead_finder/run.py
    -> website-builder/src/index.js
    -> website_checker/run.py
    -> screenshot-taker/run.py
    -> whatsappcheck/run.py
    -> email_sender/agent.py
```

## Stage Ownership

- `Leads/backend/lead_finder/`
  Scraping, qualification, and JSON lead exports.
- `Leads/backend/website-builder/`
  Website generation, deploy, Excel export, and review tooling.
- `Leads/backend/website_checker/`
  Writes `review_status`, `review_notes`, and `website_url` into `leads.xlsx`.
- `Leads/backend/screenshot-taker/`
  Captures screenshots for reviewed-good sites.
- `Leads/backend/whatsappcheck/`
  Writes WhatsApp availability back to batch Excel files.
- `Leads/backend/email_sender/`
  Final outreach stage gated by approved/good review status.
- `Leads/backend/output/`
  Generated websites and batch `leads.xlsx` files.
- `Leads/backend/analytics/`
  Batch tracking and pipeline status registry.

## Safe Operating Rule

If you change pipeline code, prefer changing files inside `Leads/backend/` and keep the root `run_pipeline.py` wrapper intact so older commands and scripts continue to work.
