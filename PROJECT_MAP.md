# Project Map

## Canonical Layout

- `run_pipeline.py`
  Root compatibility entrypoint. Delegates to `Leads/backend/run_pipeline.py`.
- `Leads/backend/`
  Canonical backend pipeline and the only source of truth for runtime workflow.
- `Leads/frontend/nexviatech-pipeline/`
  Optional dashboard/viewer layer. Not an orchestration source of truth.
- `Mcp/`
  Gemini MCP bridge and local tooling integration.

## Current Runtime Flow

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

## Directory Ownership

- `Leads/backend/lead_finder/`
  Scraping, qualification, data export, and optional AI lead analysis.
- `Leads/backend/website-builder/`
  Website generation, deploy, report export, and review helpers.
- `Leads/backend/website_checker/`
  Writes review results back to `leads.xlsx` and metadata files.
- `Leads/backend/screenshot-taker/`
  Captures screenshots for reviewed-good sites and updates workbooks.
- `Leads/backend/whatsappcheck/`
  Writes WhatsApp availability back into batch Excel files.
- `Leads/backend/email_sender/`
  Sends reviewed outreach and manages send state.
- `Leads/backend/analytics/`
  Batch-level tracker and status registry.
- `Leads/backend/output/`
  Generated websites, screenshots, and per-batch `leads.xlsx` files.
- `Leads/backend/nexviamain_web/`
  Separate preview platform app, not the canonical backend pipeline.
- `Leads/frontend/nexviatech-pipeline/`
  Dashboard API/web layer for monitoring and operator workflows.
- `Mcp/`
  Gemini CLI MCP server that exposes pipeline tools from this repo.

## Important Notes

- Root-level legacy paths like `lead_finder/`, `website-builder/`, and `email_sender/` are no longer the working source tree.
- If you are changing pipeline behavior, prefer editing `Leads/backend/` and keep the root wrapper stable.
- If you are documenting AI usage or env requirements, also check `AI_USAGE_MAP.md`.
