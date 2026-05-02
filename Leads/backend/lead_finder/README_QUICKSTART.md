# Lead Finder Quickstart

Fast setup and run guide. 

## 1) Open Project

```powershell
cd "D:\client finder\lead_finder"
```

## 2) Install

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m playwright install
```

## 3) Configure `.env`

```env
GROQ_API_KEY=...
EMAIL_SMTP_HOST=smtp.zoho.in
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USER=you@domain.com
EMAIL_SMTP_PASS=...
EMAIL_FROM=you@domain.com
EMAIL_USE_TLS=false
EMAIL_HOST_PASSWORD=...
```

## 4) Run Main Pipeline

```powershell
python ..\run_pipeline.py --city "bengaluru" --categories-file categories.txt --max 0
```

If you only want the scraper stage:

```powershell
python run.py --city "bengaluru" --categories-file categories.txt --max 0 --analyze-websites
```

Output files:

- `public/data/bengaluru/bengaluru_leads.json`
- `public/data/bengaluru/bengaluru_no_website.json`
- `public/data/bengaluru/registry.json`
- `public/data/qualified.json`

## 5) Run Email Sender (Correct Way)

Always run from the monorepo root:

```powershell
cd ..
python .\email_sender\agent.py bengaluru --dry-run
python .\email_sender\agent.py bengaluru
```

## 6) Important Current Rule

If all leads have `primary_email = null` and `emails = []`, sender exits early:

`No leads with valid email ... Skipping template generation and send flow.`

This is expected behavior.

## 7) Common Errors

`agent.py is not recognized`
- Use: `python .\email_sender\agent.py ...`

`can't open file ...\lead_finder\agent.py`
- Wrong path. File is in `email_sender`.

`Leads file not found: public\data\...`
- You ran command from wrong folder. Go back to project root.

`Template validation failed: Invalid JSON in category_bucket.json`
- `category_bucket.json` or `bucket_email_template.json` is empty/invalid.

## 8) Command Reference

See full commands with comments in:

- `command.txt`
- `README.md`
