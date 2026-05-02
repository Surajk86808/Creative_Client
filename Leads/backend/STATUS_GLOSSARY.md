# Status Glossary

This table centralizes the status terms used across the pipeline so each stage has a clear owner and consumer.

| Term | Owner File | Possible Values | Set By | Consumed By |
| --- | --- | --- | --- | --- |
| `scraped` | [analytics/tracker.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/analytics/tracker.js) | `scraped` | `lead_finder/scraper.py` calling `analytics/tracker.js mark-scraped` | `website-builder/src/leads_json.js`, operator analytics views |
| `building` | [analytics/tracker.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/analytics/tracker.js) | `building` | `website-builder/src/commands/run.js` via `tracker.markBuilding()` | analytics views, operators diagnosing active batches |
| `built` | [analytics/tracker.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/analytics/tracker.js) | `built` | `website-builder/src/commands/run.js` via `tracker.markBuilt()` | analytics views, downstream monitoring |
| `deployed` | [analytics/tracker.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/analytics/tracker.js) | `deployed` | `website-builder/src/commands/run.js` via `tracker.markDeployed()` | analytics views, deployment monitoring |
| `error` | [analytics/tracker.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/analytics/tracker.js) | `error` | `website-builder/src/commands/run.js` via `tracker.markError()` | analytics views, retry and operator debugging |
| `build_status` | [website-builder/src/exporter.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/website-builder/src/exporter.js) and [website-builder/src/excel.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/website-builder/src/excel.js) | `processing`, `built`, `deployed`, `error`, `dry-run`, `done`, `""` | `website-builder/src/commands/run.js` through Excel updates and report export | `email_sender/excel_leads.py`, operators reviewing `leads.xlsx` |
| `review_status` | [website-builder/src/review.js](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/website-builder/src/review.js) and `_lead_meta.json` under `output/` | `pending`, `approved`, `rejected`, `""` | review dashboard in `website-builder/src/preview.js`, synced by `review.js` | `email_sender/excel_leads.py`, root review gate, operators in Excel and preview UI |
| `whatsapp` | [whatsappcheck/excel_updater.py](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/whatsappcheck/excel_updater.py) | `YES`, `NO`, `INVALID`, `ERROR`, `""` | `whatsappcheck/run.py` and `whatsappcheck/checker.py` | operators reading `leads.xlsx`, `email_sender/agent.py` audit rows |
| `email_status` | [email_sender/agent.py](/c:/Users/Laptop/OneDrive/Desktop/Creative-client-/email_sender/agent.py) with files under `public/email_status/` | `SENT`, `FAILED` plus `email_sent=true/false` in the per-lead map | `email_sender/agent.py` after each SMTP attempt | reruns of `email_sender/agent.py`, audit review, suppression/dedup logic |

## Notes

- Analytics status is batch-level and lives in `analytics/index.json`.
- `build_status`, `review_status`, and `whatsapp` are row-level workbook fields in `output/.../leads.xlsx`.
- Email sender status is campaign-level and per-lead under `public/email_status/`.
- `review_status=approved` is the key handoff used to allow outreach after human review.
