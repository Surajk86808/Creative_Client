# 🗺️ Local Lead Finder

Scrape Google Maps for local businesses **with no website or an outdated one**, qualify them as freelance outreach leads, and push everything into a **Google Sheet** — all filtered by city.

---

## How It Works

```
City Name  →  Google Maps Places API  →  qualify.py  →  registry.json  →  Google Sheets
```

1. **Scrape** – search Google Maps for businesses by category *inside a specific city*
2. **Qualify** – score each business (no website? low reviews? service-based? → high score)
3. **Deduplicate** – SHA-256 fingerprint prevents the same shop being added twice
4. **Export** – push leads to your Google Sheet, one tab per city (or a shared tab)

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up API keys

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Places API**
3. Create an API Key → copy it

```bash
export GOOGLE_MAPS_API_KEY="AIza..."
```

#### Google Sheets Service Account
1. Enable **Google Sheets API** and **Google Drive API** in the same project
2. Create a **Service Account** → download the JSON key → save as `service_account.json` in the project root
3. Open your Google Sheet → **Share** → paste the service account email → give **Editor** access
4. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`

---

## Usage

### Scrape a single city
```bash
python run.py --city "Bangalore" --spreadsheet-id YOUR_SHEET_ID
```

### Scrape multiple cities at once
```bash
python run.py --cities "London,Manchester,Birmingham" --spreadsheet-id YOUR_SHEET_ID
```

### Scrape US / Canada / UK cities
```bash
# USA
python run.py --city "New York" --spreadsheet-id YOUR_SHEET_ID
python run.py --city "Los Angeles" --spreadsheet-id YOUR_SHEET_ID
python run.py --city "Chicago" --spreadsheet-id YOUR_SHEET_ID

# Canada
python run.py --city "Toronto" --spreadsheet-id YOUR_SHEET_ID
python run.py --city "Vancouver" --spreadsheet-id YOUR_SHEET_ID

# UK
python run.py --city "London" --spreadsheet-id YOUR_SHEET_ID
python run.py --city "Leeds" --spreadsheet-id YOUR_SHEET_ID
```

### Custom categories
```bash
python run.py --city "Dubai" \
  --categories "salon,dental,gym,photography,tutoring" \
  --spreadsheet-id YOUR_SHEET_ID
```

### Save raw JSON without Sheets export
```bash
python run.py --city "Pune" --no-sheets --out pune_raw.json
```

### Full options
```
--city              Single city to scrape
--cities            Comma-separated list of cities
--categories        Comma-separated business categories (default: 15 common types)
--max               Max results per category per city (default: 60)
--spreadsheet-id    Google Spreadsheet ID
--sheet-name        Worksheet tab name (default: "Leads")
--no-sheets         Skip Google Sheets export
--out               Save raw scraped JSON to this path
--clear-sheet       Wipe the sheet before writing (overwrite mode)
```

---

## Google Sheet Output

Each row in the sheet = one lead. Columns:

| Column | Description |
|--------|-------------|
| `name` | Business name |
| `city` | City you searched |
| `category` | Search category used |
| `phone` | Phone number |
| `website` | Website (empty = no website!) |
| `website_status` | `none` / `broken` / `outdated` / `modern` |
| `rating` | Google rating |
| `review_count` | Number of reviews |
| `lead_quality_score` | 1–10 (higher = better lead) |
| `outreach_suitability` | `HIGH` / `MEDIUM` / `LOW` |
| `status` | `NEW` / `ANALYZED` / `EMAILED` / etc. |
| `concrete_problems` | Why they need help |
| `manual_review_required` | Whether you should check before emailing |

---

## Qualifying Logic

| Signal | Points |
|--------|--------|
| No website | +3 |
| Broken website URL | +3 |
| HTTP (not HTTPS) website | +2 |
| Rating ≥ 3.5 | +2 |
| Service-based category | +2 |
| 20+ reviews | +2 |

**Rejected automatically if:** modern HTTPS website, < 5 reviews, big brand name, or franchise indicator.

---

## Project Structure

```
├── run.py            ← 🚀 Main pipeline (scrape + qualify + export)
├── scraper.py        ← Google Maps Places API scraper
├── sheets.py         ← Google Sheets exporter
├── main.py           ← Process & qualify business list
├── qualify.py        ← Lead scoring logic
├── deduplicate.py    ← SHA-256 deduplication
├── database.py       ← JSON registry (local store)
├── models.py         ← Data classes
├── config.py         ← Keywords & status constants
├── registry.json     ← Local lead store (auto-created)
├── service_account.json  ← Your Google service account key (YOU add this)
└── requirements.txt
```

---

## Tips

- **Start small**: use `--max 20` on first run to test your API keys
- **City names**: use the same names Google Maps understands — "Bengaluru" and "Bangalore" both work
- **Multiple runs**: re-running on the same city is safe — duplicates are skipped automatically
- **Costs**: Google Maps Places API has a free tier ($200/month credit). ~1000 businesses ≈ $17