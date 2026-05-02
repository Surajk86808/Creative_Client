# Command Reference

## Primary Command

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

This root command delegates to `Leads/backend/run_pipeline.py`.

## Preflight

```powershell
python run_pipeline.py --preflight
```

Use this before live runs to verify env vars, Python dependencies, Node availability, and output write access.

## Common Pipeline Variants

### Run one city with a category file

```powershell
python run_pipeline.py --city "bengaluru" --categories-file categories.txt --max 0
```

### Run one city with inline categories

```powershell
python run_pipeline.py --city "bengaluru" --categories "salon,gym,dentist" --max 25
```

### Dry run

```powershell
python run_pipeline.py --city "bengaluru" --categories "salon,gym" --max 10 --dry-run
```

### Pause after build for manual review

```powershell
python run_pipeline.py --city "bengaluru" --categories "salon,gym" --pause-after-build
```

### Skip selected stages

```powershell
python run_pipeline.py --city "bengaluru" --categories "salon,gym" --skip-build
python run_pipeline.py --city "bengaluru" --categories "salon,gym" --skip-email
python run_pipeline.py --city "bengaluru" --categories "salon,gym" --skip-whatsapp
```

### Enable website analysis during lead finding

```powershell
python run_pipeline.py --city "bengaluru" --categories "salon,gym" --analyze-websites
```

## Canonical Stage Entry Points

These are the real stage commands under `Leads/backend/` if you need focused runs.

### Lead finder

```powershell
python Leads/backend/lead_finder/run.py --city "bengaluru" --categories "salon,gym" --max 25
```

### Website builder

```powershell
cd Leads/backend/website-builder
node src/index.js run --dry-run
```

### Website checker

```powershell
python Leads/backend/website_checker/run.py --output-dir Leads/backend/output
```

### Screenshot taker

```powershell
python Leads/backend/screenshot-taker/run.py --output-dir Leads/backend/output
```

### WhatsApp checker

```powershell
python Leads/backend/whatsappcheck/run.py --output-dir Leads/backend/output
```

### Email sender

```powershell
python Leads/backend/email_sender/agent.py --require-approved-review
python Leads/backend/email_sender/agent.py bengaluru --dry-run --dry-run-no-groq
```

## MCP

### Start Gemini after MCP setup

```powershell
gemini
```

The Gemini MCP server config lives in `C:\Users\Laptop\.gemini\settings.json` and points to `Mcp/server.py`.
