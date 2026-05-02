# Lead Finder

A local-first lead generation pipeline that scrapes Google Maps, qualifies businesses, and runs targeted email outreach campaigns.

---

## What It Does

1. **Scrapes** Google Maps by city and category using Playwright
2. **Analyzes** each business website for quality signals (SSL, speed, mobile, age, etc.)
3. **Qualifies** leads by scoring them against outreach rules
4. **Exports** structured JSON and text files per city/category
5. **Hands off** reviewed output to the repo-root `email_sender/` stage for personalized outreach

---

## Tech Stack

- Python 3.11+, Playwright (browser automation)
- BeautifulSoup + httpx (website analysis)
- SQLite + JSON (storage and exports)
- Zoho SMTP (email delivery)
- Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` (email personalization)

---

## Project Structure

```
lead_finder/
  run.py                      # Main pipeline: scrape + qualify + export
  main.py                     # Qualification and storage logic
  scraper.py                  # Google Maps scraper (Playwright)
  analyzer.py                 # Website quality analyzer
  qualify.py                  # Lead scoring and suitability rules
  database.py                 # SQLite + JSON registry
  deduplicate.py              # Lead deduplication (SHA-256 fingerprint)
  models.py                   # Data models
  config.py                   # Paths, constants, status codes
  categories.txt              # One category per line (used with --categories-file)
  command.txt                 # Quick command reference

  public/data/                # All output files (gitignored)
../email_sender/              # Canonical outreach stage for the monorepo
```

---

## Setup

### 1. Clone and enter the project

```powershell
cd "D:\client finder\lead_finder"
```

### 2. Create virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
python -m playwright install
```

### 4. Create `.env` file

```env
GROQ_API_KEY=your_groq_key_here

EMAIL_SMTP_HOST=smtp.zoho.in
EMAIL_SMTP_PORT=465
EMAIL_SMTP_SECURITY=ssl    # ssl | starttls | plain
EMAIL_SMTP_USER=you@domain.com
EMAIL_HOST_PASSWORD=...   # required by email_sender/agent.py
AGENCY_NAME=Your Agency Name
AGENCY_WEBSITE=https://youragency.com
SENDER_PHONE=+1-000-000-0000
SENDER_NAME=Your Name
EMAIL_SIGNATURE=Website: https://youragency.com\nMobile: +1-000-000-0000\nYour Name
EMAIL_UNSUBSCRIBE_TEXT=To opt out, reply STOP.
EMAIL_SUPPRESSION_LIST_PATH=public/email_status/suppression_list.txt
EMAIL_BLOCKED_DOMAINS=example.com,mailinator.com
```

> `EMAIL_HOST_PASSWORD` is used by `agent.py`. It can be the same value as `EMAIL_SMTP_PASS`.

---

## Running the Pipeline

For the full monorepo flow, use the canonical root command:

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

The commands below run `lead_finder` only.

### Scrape by categories file

```powershell
python run.py --city "bengaluru" --categories-file categories.txt --max 0 --analyze-websites
```

### Scrape specific categories

```powershell
# Single category
python run.py --city "bengaluru" --categories "salon" --max 0 --analyze-websites

# Multiple categories
python run.py --city "bengaluru" --categories "salon,gym,clinic" --max 0 --analyze-websites
```

`--max 0` scrapes until listings are exhausted. Use `--max 20` to cap per category.

- `public/data/{city}/{city}_leads.json`
- `public/data/{city}/{city}_leads.txt`
- `public/data/{city}/{city}_no_website.json`
- `public/data/{city}/registry.json`
- `public/data/qualified.json`
- `public/data/{city}/scraped.db`

## Output Files

After running the pipeline, these files are created under `public/data/`:

| File | Contents |
|------|----------|
| `{city}_leads.json` | All qualified leads for a city |
| `{city}_leads.txt` | Human-readable leads grouped by category |
| `{city}_no_website.json` | Qualified leads with no website |
| `qualified.json` | All qualified leads across all cities |
| `registry.json` | Full lead registry (JSON mirror of SQLite) |
| `scraped.db` | SQLite database |
| `{city}/{category}/{category}.json` | Raw scraped rows per category |

---

## Email Sending

> **Always run from the monorepo root** when invoking `email_sender/`.

Sender eligibility rules:
- Lead must have `website_status == "none"` (no website)
- Lead must have a valid email (`primary_email` or `emails[]`)
- Lead must not already be in `EMAILED`, `RESPONDED`, `CONVERTED`, or `DO_NOT_CONTACT` status

### agent.py — Primary sender (recommended)

Generates personalized emails via Groq LLM using bucket/template config.

```powershell
cd ..
python .\email_sender\agent.py bengaluru --dry-run --dry-run-no-groq
python .\email_sender\agent.py bengaluru --dry-run

# Live run — generates and sends emails
python .\email_sender\agent.py bengaluru
```

### run.py — Alternate CLI sender

- Sends only when `website_status == "none"`.
- Sends only when a valid email exists.
- Uses `primary_email` first; falls back to first valid item in `emails[]`.
- `--dry-run-no-groq` checks eligibility only and skips AI generation/API costs.
- Honors suppression list + blocked domains before generating/sending.
- If no valid email exists for all leads, it exits early and does not start template generation/sending.

## B) Alternate sender CLI (`email_sender/run.py`)

```powershell
python email_sender/run.py --city "bengaluru" --dry-run
python email_sender/run.py --city "bengaluru"
```

Note: `email_sender/run.py` is now a compatibility wrapper that forwards to `email_sender/agent.py`.

## Template Setup (required for agent.py)

Before running `agent.py`, both template files must contain valid JSON:

**`category_bucket.json`** — maps categories to buckets and scenarios:
```json
{
  "meta": {},
  "categories": {
    "home_services": ["home cleaning", "pest control", "landscaping"]
  },
  "scenarios": {
    "home_services": "default"
  },
  "bucket_no": {
    "home_services": 1
  },
  "templates": {}
}
```

**`bucket_email_template.json`** — contains email templates per bucket:
```json
{
  "meta": {},
  "categories": {},
  "scenarios": {},
  "bucket_no": {},
  "templates": {
    "home_services": {
      "default": "Write a friendly cold email to {{business_name}} in {{city}}..."
    }
  }
}
```

---

## Troubleshooting

### `can't open file ...\lead_finder\agent.py`
You're using the wrong path. `agent.py` is in the repo-root `email_sender/` folder.
```powershell
cd ..
python .\email_sender\agent.py bengaluru --dry-run
```

### `Leads file not found: public\data\bengaluru_leads.json`
You ran the sender from the wrong directory. Go back to the monorepo root and run `python .\email_sender\agent.py ...`.

### `No leads with valid email ... Skipping template generation and send flow.`
Expected behavior. The current city dataset has no leads with both `website_status == "none"` and a valid email. Run the scraper first, or check that email extraction worked.

### `Template validation failed: Invalid JSON in category_bucket.json`
One of the template files is empty or malformed. Add valid JSON to both `category_bucket.json` and `bucket_email_template.json` before running. See the Template Setup section above for the required structure.

### `Missing GROQ_API_KEY environment variable`
Add `GROQ_API_KEY=...` to your `.env` file and make sure you're running from the project root so `.env` is found.

### `Missing EMAIL_HOST_PASSWORD environment variable`
Add `EMAIL_HOST_PASSWORD=...` to your `.env`. This can be the same value as `EMAIL_SMTP_PASS`.

---

## Running Tests

```powershell
python -m pytest email_sender/tests/ -v
```

---

## Commands Reference

See `command.txt` for annotated command examples, or `README_QUICKSTART.md` for a minimal setup guide.

---

## Lead Status Flow

```
NEW → ANALYZED → EMAILED → RESPONDED → CONVERTED
                         ↘ REJECTED
                         ↘ DO_NOT_CONTACT
```

Leads in `EMAILED`, `RESPONDED`, `CONVERTED`, or `DO_NOT_CONTACT` are blocked from outreach automatically.

---

## Rate Limits and Guardrails

- Default: 50 emails/hour, 200 emails/day (configurable via `.env`)
- Random delay between sends: 45–90 seconds
- Per-campaign deduplication prevents sending twice to the same email
- Email content is validated before sending: subject ≤ 120 chars, body ≤ 170 words, no banned phrases, signature required
- SMTP events and audit logs stored in `public/email_status/`
