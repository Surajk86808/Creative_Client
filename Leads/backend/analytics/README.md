# Analytics

`index.json` - auto-managed, do not edit manually.

Fields per entry:
- `key`: "{country}/{city}/{category}"
- `status`: "scraped" | "building" | "done"
- `scraped_at`: ISO timestamp when lead_finder finished writing JSON
- `lead_count`: number of leads in the JSON file
- `leads_file`: relative path from repo root to the JSON file
- `build_started_at`: when website-builder began processing this batch
- `build_completed_at`: when website-builder finished
- `built_count`: how many sites were successfully generated

Do not delete entries; they prevent re-processing already-built sites.
