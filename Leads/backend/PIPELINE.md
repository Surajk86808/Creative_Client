# BizSiteGen — Full Pipeline

## Before First Run
1. Run `python run_pipeline.py --preflight` first.
2. Copy `.env.example` to `.env` and fill in all `FAIL` vars.
3. Run preflight again until all checks pass.
4. Then run the full pipeline.

## Primary Command

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

## Node.js (portable, project-local)
If you want a Node that works for anyone using this repo (without relying on global installs):
1) Run `scripts\setup-node.cmd`
2) Use `scripts\npm.cmd` / `scripts\npx.cmd` (instead of `npm` / `npx`)

## Step 1: Lead Finder
    cd lead_finder
    python run.py --city "bengaluru" --categories "salon,gym" --max 50

## Step 2: Website Builder
    # Root run_pipeline.py is the canonical orchestrator.
    # The website-builder CLI still exists for focused build/review work,
    # but `node src/index.js pipeline` is deprecated.
    python run_pipeline.py --city "bengaluru" --categories "salon,gym" --dry-run

## Step 3: WhatsApp Checker
    cd whatsappcheck
    python run.py
    # Or for a specific file:
    python run.py --file ../output/india/bengaluru/salon/leads.xlsx
    # Dry run (no requests, no writes):
    python run.py --dry-run

## Step 4: Email Sender
    cd email_sender
    python agent.py
    # Or target a specific city:
    python agent.py bengaluru
    # Dry run:
    python agent.py --dry-run

## Environment Variables
Copy .env.example to .env at repo root and fill in:
- GROQ_API_KEY
- VERCEL_TOKEN
- EMAIL_SMTP_USER / EMAIL_HOST_PASSWORD
- AGENCY_NAME / AGENCY_WEBSITE / SENDER_NAME / SENDER_PHONE
- WHATSAPP_DEFAULT_COUNTRY_CODE (default: 91)
- OUTPUT_DIR (default: ./output)

## Optional: Auto-push generated shop code to GitHub (keep Excel local)
If your `output/` gets too large, you can push only the generated shop website folders to a separate GitHub repo and keep Excel (`leads.xlsx`) locally.

1) Create a new empty GitHub repo (example name: `bizsitegen-output`)
2) In repo-root `.env`, set:
   - `OUTPUT_GIT_REMOTE=git@github.com:YOUR_USER/bizsitegen-output.git` (or HTTPS remote)
   - `OUTPUT_GIT_BRANCH=main`
   - `OUTPUT_GIT_PUSH=true`
3) Run Step 2 (Website Builder) normally. After each shop is generated, it will be committed + pushed from a git repo initialized inside `output/`.

Optional cleanup:
- To delete the generated shop folder locally after a successful push, set:
  - `OUTPUT_GIT_DELETE_LOCAL_AFTER_PUSH=true`
