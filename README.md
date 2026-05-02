# Creative-client-

Creative-client- is a local-first lead generation and outreach workspace. The current repo is organized around a root wrapper plus a canonical backend under `Leads/backend/`.

## Primary Command

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

`run_pipeline.py` at the repo root is the supported entrypoint. It delegates to `Leads/backend/run_pipeline.py`.

## Current Structure

- `run_pipeline.py`
  Root compatibility wrapper.
- `Leads/backend/`
  Canonical backend pipeline.
- `Leads/frontend/nexviatech-pipeline/`
  Optional dashboard/viewer layer.
- `Mcp/`
  Gemini MCP server and local integration tooling.

## Canonical Backend Stages

- `Leads/backend/lead_finder/`
  Scrape, qualify, export, and optionally analyze leads with AI.
- `Leads/backend/website-builder/`
  Generate website output and write batch reports.
- `Leads/backend/website_checker/`
  Validate generated websites and write review fields into `leads.xlsx`.
- `Leads/backend/screenshot-taker/`
  Capture screenshots for reviewed-good websites.
- `Leads/backend/whatsappcheck/`
  Enrich batch Excel files with WhatsApp availability.
- `Leads/backend/email_sender/`
  Send outreach from approved/reviewed output.
- `Leads/backend/analytics/`
  Track batch state between stages.
- `Leads/backend/output/`
  Generated artifacts grouped by country, city, and category.

## Recommended Start

1. Copy `Leads/backend/.env.example` to `Leads/backend/.env`.
2. Fill in the required secrets and tokens.
3. Run `python run_pipeline.py --preflight`.
4. Run the primary command above.

## Useful Root Docs

- [PROJECT_MAP.md](/p:/Creative-client-/PROJECT_MAP.md)
- [AI_USAGE_MAP.md](/p:/Creative-client-/AI_USAGE_MAP.md)
- [RELEASE_NOTES.md](/p:/Creative-client-/RELEASE_NOTES.md)
- [new.mermaid](/p:/Creative-client-/new.mermaid)
- [nexttodo.md](/p:/Creative-client-/nexttodo.md)

## Notes

- The old root-level module paths are no longer the working source tree.
- If you are changing workflow code, prefer editing inside `Leads/backend/`.
- If you are wiring Gemini tooling, use `Mcp/server.py` and `C:\Users\Laptop\.gemini\settings.json`.
