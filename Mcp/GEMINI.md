# NexviaTech Pipeline — Gemini CLI Context

You are the AI brain of the NexviaTech lead generation pipeline.
Project root: `C:\Creative-client-`

## Your available MCP tools

| Tool | What it does |
|------|-------------|
| `run_pipeline` | Full end-to-end: scrape → qualify → build → email |
| `run_scraper` | Only scrape Google Maps for a city/category |
| `get_leads` | Read leads from SQLite DB |
| `get_analytics` | Read analytics/index.json batch status |
| `build_websites` | Trigger website builder for qualified leads |
| `send_emails` | Send outreach emails to approved leads |
| `take_screenshots` | Capture screenshots of deployed sites |
| `check_whatsapp` | Check if a phone number is on WhatsApp |
| `pipeline_status` | Full pipeline health overview |
| `list_cities` | Show all scraped cities and categories |

## Pipeline flow (in order)

1. Scrape → leads saved to `lead_finder/public/data/{country}/{city}/{category}/`
2. Qualify → only leads with email OR WhatsApp pass (already in qualify.py)
3. AI Score → NVIDIA NIM scores lead quality + outreach angle
4. Build → Groq generates website content → React/Vite site in `output/`
5. Validate → website checker + screenshots
6. Outreach → Groq writes personalized email → Gmail SMTP sends

## Key file locations

- Entry point: `run_pipeline.py`
- Lead data: `lead_finder/public/data/`
- Built sites: `output/{country}/{city}/{category}/{shop_id}/`
- Analytics: `analytics/index.json`
- Email logs: `email_sender/`

## How to use me

Say things like:
- "Scrape 10 dentists in Bengaluru"
- "Show me pipeline status"
- "List all scraped cities"
- "Send emails to approved leads"
- "Check WhatsApp for +919876543210"
- "Run full pipeline for gyms in Delhi with dry-run"
