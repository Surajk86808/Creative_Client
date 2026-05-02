# Creative-client-

Creative-client- is a local-first lead generation and outreach monorepo. The pipeline scrapes leads, builds websites, checks generated output, captures screenshots, enriches WhatsApp status, and sends outreach from one canonical root command.

## Primary Command

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

`run_pipeline.py` at the repo root is the only supported orchestration entrypoint.

## Canonical Modules

- `lead_finder/` - scrape, analyze, qualify, and export leads
- `analytics/` - track batch state between stages
- `website-builder/` - build and review generated websites
- `website_checker/` - validate generated/deployed output
- `screenshot-taker/` - capture screenshots and write `screenshot_path` back to `leads.xlsx`
- `whatsappcheck/` - enrich `leads.xlsx` with WhatsApp status
- `email_sender/` - send outreach from reviewed Excel output
- `output/` - generated artifacts grouped by country/city/category

## Notes

- Deprecated compatibility wrappers still exist in a few legacy locations, but they now point back to `python run_pipeline.py`.
- Experimental frontend/dashboard code lives under `frontend/nexviatech-pipeline/`, but it is no longer a second pipeline source of truth.
- Legacy screenshot-mailer flows were retired in favor of `screenshot-taker/` plus the canonical `email_sender/` stage.

## Recommended Start

1. Copy `.env.example` to `.env` and fill in required secrets.
2. Run `python run_pipeline.py --preflight`.
3. Run the primary command above.

More detail is in [ARCHITECTURE.md](./ARCHITECTURE.md), [PIPELINE.md](./PIPELINE.md), and [MASTER_WORKFLOW_GUIDE.md](./MASTER_WORKFLOW_GUIDE.md).
