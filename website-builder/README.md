# Automated Business Website Generator (CLI)

This project generates and deploys small business websites from an Excel sheet.

## Setup

1. Copy `.env.example` to `.env` and fill in `GROQ_API_KEY` + `VERCEL_TOKEN`.
2. Put one or more Excel files inside `./leads/` (or set `LEADS_DIR`).
3. Templates are read from `WEBSITES_DIR` (set in `.env`). Default is `./global-website` (Vite/React templates). You can also point it to `./website-templates` (simple HTML templates).

## Placeholders

Templates can include placeholders that get filled per business:

- HTML-friendly: `{{PLACEHOLDER}}`
- JSX-friendly: `[[PLACEHOLDER]]`

## Commands

- `node src/index.js run` (process all pending)
- `node src/index.js run --limit 5`
- `node src/index.js run --id SHOP_001`
- `node src/index.js run --batch 3` (parallel fill, serialized deploy)
- `node src/index.js run --dry-run` (no deploy)
- `node src/index.js run --preview` (serves `OUTPUT_DIR` on `http://localhost:3000/` with a list of generated sites)
- `node src/index.js status`
- `node src/index.js report`
- `node src/index.js reset --id SHOP_001`
- `node src/index.js pipeline --city "bengaluru" --categories "salon,gym" --max 0 --analyze-websites --dry-run` (runs `lead_finder` then builds from JSON leads)

## Output

- Generated sites go under `../output/` by default (repo root `output/`).
- After each `run`/`pipeline`, an Excel report is written per lead_finder batch at:
  - `../output/{country}/{city}/{category}/leads.xlsx`
