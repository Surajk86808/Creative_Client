"""Project configuration constants."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DATA_DIR = BASE_DIR / "public" / "data"
REGISTRY_PATH = PUBLIC_DATA_DIR / "registry.json"
SQLITE_PATH = PUBLIC_DATA_DIR / "scraped.db"
QUALIFIED_PATH = PUBLIC_DATA_DIR / "qualified.json"
CITY_EXPORT_ROOT = PUBLIC_DATA_DIR
PLAYWRIGHT_PROFILE_DIR = BASE_DIR / ".playwright_profile"
SCRAPE_PROGRESS_PATH = PUBLIC_DATA_DIR / "scrape_progress.json"

STATUS_NEW = "NEW"
STATUS_ANALYZED = "ANALYZED"
STATUS_EMAILED = "EMAILED"
STATUS_RESPONDED = "RESPONDED"
STATUS_CONVERTED = "CONVERTED"
STATUS_REJECTED = "REJECTED"
STATUS_DO_NOT_CONTACT = "DO_NOT_CONTACT"

ALL_STATUSES = {
    STATUS_NEW,
    STATUS_ANALYZED,
    STATUS_EMAILED,
    STATUS_RESPONDED,
    STATUS_CONVERTED,
    STATUS_REJECTED,
    STATUS_DO_NOT_CONTACT,
}

BLOCKED_OUTREACH_STATUSES = {
    STATUS_EMAILED,
    STATUS_RESPONDED,
    STATUS_CONVERTED,
    STATUS_DO_NOT_CONTACT,
}

BATCH_SIZE = 10
BATCH_SLEEP_MIN = 15
BATCH_SLEEP_MAX = 30
CATEGORY_SLEEP_MIN = 30
CATEGORY_SLEEP_MAX = 60
REQUEST_TIMEOUT = 10
WEBSITE_ANALYSIS_TIMEOUT = 15

DEFAULT_CATEGORIES = [
    "salon",
    "clinic",
    "dental",
    "gym",
    "repair shop",
    "auto repair",
    "chiropractor",
    "physiotherapy",
    "plumbing",
    "electrician",
    "law firm",
    "accounting",
    "real estate",
    "photography",
    "cleaning service",
    "landscaping",
    "veterinary",
    "spa",
    "tutoring",
    "roofing",
    "bakery",
    "barber shop",
    "beauty salon",
    "book store",
    "boutique",
    "cafe",
    "car wash",
    "child care",
    "coffee shop",
    "computer repair",
    "day spa",
    "driving school",
    "event planner",
    "furniture store",
    "hardware store",
    "home cleaning",
    "home inspector",
    "home remodeler",
    "hotel",
    "interior designer",
    "jewelry store",
    "laundry service",
    "locksmith",
    "martial arts school",
    "massage therapist",
    "moving company",
    "nail salon",
    "optometrist",
    "orthodontist",
    "paint store",
    "painter",
    "pet grooming",
    "pharmacy",
    "pizza restaurant",
    "print shop",
    "private tutor",
    "property management",
    "restaurant",
    "solar installer",
    "tattoo shop",
    "tax consultant",
    "travel agency",
    "urgent care",
    "wedding planner",
    "window cleaning",
]

SERVICE_KEYWORDS = {
    "clinic",
    "agency",
    "real estate",
    "education",
    "repair",
    "dental",
    "medical",
    "plumbing",
    "electric",
    "landscaping",
    "salon",
    "spa",
    "law",
    "accounting",
    "consulting",
    "marketing",
    "construction",
    "cleaning",
    "gym",
    "fitness",
    "chiropractic",
    "therapy",
    "veterinary",
    "insurance",
    "mortgage",
    "roofing",
    "hvac",
    "physio",
    "dentist",
    "orthodontist",
    "optometrist",
    "physiotherapist",
    "physiotherapy",
    "chiropractor",
}

SERVICE_CATEGORY_ALIASES = {
    "dental": {"dentist", "dentistry", "orthodontist", "periodontist", "endodontist"},
    "therapy": {"physiotherapy", "physiotherapist", "physical therapy", "therapist"},
    "medical": {"healthcare", "urgent care", "walk-in clinic"},
    "salon": {"barber", "barbershop", "beauty salon", "nail salon"},
    "repair": {"auto repair", "computer repair", "appliance repair"},
}

BIG_BRAND_KEYWORDS = {
    "mcdonald",
    "starbucks",
    "walmart",
    "target",
    "costco",
    "subway",
    "kfc",
    "burger king",
    "domino",
    "pizza hut",
    "amazon",
    "apple",
    "google",
    "microsoft",
    "cvs",
    "walgreens",
}

FRANCHISE_HINTS = {
    "franchise",
    "franchising",
    "location #",
    "branch",
    "unit ",
    "franchisee",
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_4) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/121.0.6167.184 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.6099.224 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/119.0.6045.200 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_7_3) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/117.0.5938.149 Safari/537.36",
]
