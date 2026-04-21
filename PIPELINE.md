# BizSiteGen — Full Pipeline

## Step 1: Lead Finder
    cd lead_finder
    python run.py --city "bengaluru" --categories "salon,gym" --max 50

## Step 2: Website Builder
    cd website-builder
    node src/index.js pipeline --city "bengaluru" --categories "salon,gym" --dry-run

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

