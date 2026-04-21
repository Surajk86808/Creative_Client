"""Google Maps scraper using Playwright with anti-detection controls."""

from __future__ import annotations

import argparse
import json
import random
import re
import subprocess
import time
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, urljoin, urlparse

import httpx
from playwright.sync_api import BrowserContext, Page, TimeoutError as PWTimeout, sync_playwright

from config import (
    BATCH_SIZE,
    BATCH_SLEEP_MAX,
    BATCH_SLEEP_MIN,
    CITY_EXPORT_ROOT,
    CATEGORY_SLEEP_MAX,
    CATEGORY_SLEEP_MIN,
    DEFAULT_CATEGORIES,
    PLAYWRIGHT_PROFILE_DIR,
    SQLITE_PATH,
    USER_AGENTS,
)
from database import RegistryDB
from location_layout import ensure_city_storage_layout

PLACE_ID_RE = re.compile(r"!1s([^!]+)")
EMAIL_RE = re.compile(r"([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})", re.IGNORECASE)
WEBSITE_URL_RE = re.compile(r'data-item-id="authority"[^>]+href="([^"]+)"', re.IGNORECASE)
WEBSITE_DATA_URL_RE = re.compile(r'data-item-id="authority"[^>]+data-url="([^"]+)"', re.IGNORECASE)
CONTACT_PAGE_HINTS = ("contact", "about", "support", "team")
SOCIAL_HOST_HINTS = (
    "instagram.com",
    "facebook.com",
    "linkedin.com",
    "x.com",
    "twitter.com",
    "tiktok.com",
    "youtube.com",
    "youtu.be",
    "pinterest.com",
)
REPO_ROOT = Path(__file__).resolve().parent.parent
ANALYTICS_TRACKER_PATH = REPO_ROOT / "analytics" / "tracker.js"


def _sleep_random(low: float, high: float) -> None:
    """Sleep using a random interval."""
    time.sleep(random.uniform(low, high))


def _parse_rating(text: str | None) -> float | None:
    """Parse rating float from arbitrary text."""
    if not text:
        return None
    match = re.search(r"(\d+\.?\d*)", text)
    return float(match.group(1)) if match else None


def _parse_reviews(text: str | None) -> int | None:
    """Parse review count from arbitrary text."""
    if not text:
        return None
    digits = re.sub(r"[^\d]", "", text)
    return int(digits) if digits else None


def _extract_place_id(href: str | None) -> str | None:
    """Extract place id from a Google Maps listing href."""
    if not href:
        return None
    match = PLACE_ID_RE.search(href)
    return match.group(1) if match else None


def _slugify(value: str) -> str:
    """Generate filesystem-safe lowercase slug."""
    lowered = value.strip().lower()
    cleaned = re.sub(r"[^a-z0-9]+", "-", lowered)
    return cleaned.strip("-") or "unknown"


def _normalize_website_url(website: str) -> str:
    """Add scheme when missing."""
    value = website.strip()
    if value.startswith(("http://", "https://")):
        return value
    return f"https://{value}"


def _extract_emails_from_html(html: str) -> list[str]:
    """Extract likely emails from HTML and return unique sorted values."""
    found = {
        email.lower()
        for email in EMAIL_RE.findall(html)
        if not email.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg"))
    }
    return sorted(found)


def _clean_emails(emails: set[str]) -> list[str]:
    """Normalize and filter likely business emails."""
    filtered = [
        email
        for email in sorted(email.strip().lower() for email in emails if email and "@" in email)
        if "example.com" not in email
        and "wixpress.com" not in email
        and "noreply@" not in email
        and "no-reply@" not in email
    ]
    deduped: list[str] = []
    seen: set[str] = set()
    for email in filtered:
        if email in seen:
            continue
        seen.add(email)
        deduped.append(email)
    return deduped[:5]


def _extract_contact_links(base_url: str, html: str) -> list[str]:
    """Find likely contact/about links to improve email coverage."""
    links: list[str] = []
    for match in re.finditer(r'href=["\']([^"\']+)["\']', html, re.IGNORECASE):
        href = match.group(1).strip()
        if not href or href.startswith(("javascript:", "mailto:", "tel:", "#")):
            continue
        full = urljoin(base_url, href)
        lowered = full.lower()
        if any(hint in lowered for hint in CONTACT_PAGE_HINTS):
            links.append(full)
    deduped: list[str] = []
    seen: set[str] = set()
    for link in links:
        if link in seen:
            continue
        seen.add(link)
        deduped.append(link)
        if len(deduped) >= 2:
            break
    return deduped


def _normalize_candidate_link(link: str) -> str:
    value = link.strip()
    if not value:
        return ""
    parsed = urlparse(value)
    scheme = parsed.scheme.lower()
    if scheme not in {"http", "https"}:
        return ""
    host = parsed.netloc.lower()
    path = parsed.path.rstrip("/")
    if not host:
        return ""
    return f"{scheme}://{host}{path}"


def _clean_social_links(links: set[str]) -> list[str]:
    deduped: list[str] = []
    seen: set[str] = set()
    for raw in sorted(links):
        normalized = _normalize_candidate_link(raw)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        deduped.append(normalized)
    return deduped[:10]


def _extract_social_links_from_html(base_url: str, html: str) -> list[str]:
    found: set[str] = set()
    for match in re.finditer(r'href=["\']([^"\']+)["\']', html, re.IGNORECASE):
        href = (match.group(1) or "").strip()
        if not href:
            continue
        full = urljoin(base_url, href)
        lowered = full.lower()
        if any(host in lowered for host in SOCIAL_HOST_HINTS):
            found.add(full)
    return _clean_social_links(found)


def _extract_website_from_panel_html(html: str) -> str | None:
    """Best-effort fallback to detect a website link from Maps panel HTML."""
    if not html:
        return None
    for pattern in (WEBSITE_URL_RE, WEBSITE_DATA_URL_RE):
        match = pattern.search(html)
        if match:
            value = match.group(1).strip()
            if value:
                return value
    return None


def _collect_contact_emails(website: str | None) -> list[str]:
    """Best-effort email extraction from website homepage and contact-like subpages."""
    if not website:
        return []
    url = _normalize_website_url(website)
    timeout = httpx.Timeout(8.0, connect=5.0)
    headers = {"User-Agent": random.choice(USER_AGENTS)}
    emails: set[str] = set()
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True, headers=headers) as client:
            response = client.get(url)
            html = response.text or ""
            emails.update(_extract_emails_from_html(html))
            for link in _extract_contact_links(str(response.url), html):
                _sleep_random(0.5, 1.2)
                try:
                    sub = client.get(link)
                    emails.update(_extract_emails_from_html(sub.text or ""))
                except Exception:
                    continue
    except Exception:
        return []
    return _clean_emails(emails)


def _collect_social_links(website: str | None) -> list[str]:
    """Best-effort social profile extraction from homepage and contact-like subpages."""
    if not website:
        return []
    url = _normalize_website_url(website)
    timeout = httpx.Timeout(8.0, connect=5.0)
    headers = {"User-Agent": random.choice(USER_AGENTS)}
    found: set[str] = set()
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True, headers=headers) as client:
            response = client.get(url)
            html = response.text or ""
            base_url = str(response.url)
            found.update(_extract_social_links_from_html(base_url, html))
            for link in _extract_contact_links(base_url, html):
                _sleep_random(0.5, 1.2)
                try:
                    sub = client.get(link)
                    found.update(_extract_social_links_from_html(str(sub.url), sub.text or ""))
                except Exception:
                    continue
    except Exception:
        return []
    return _clean_social_links(found)


def _collect_maps_panel_emails(page: Page) -> list[str]:
    """Extract emails directly from Google Maps details panel."""
    found: set[str] = set()
    try:
        panel_html = page.content()
        found.update(_extract_emails_from_html(panel_html))
    except Exception:
        pass

    try:
        mailto_links = page.locator('a[href^="mailto:"]')
        count = min(mailto_links.count(), 5)
        for idx in range(count):
            href = mailto_links.nth(idx).get_attribute("href") or ""
            if not href.lower().startswith("mailto:"):
                continue
            email = href.split(":", 1)[1].split("?", 1)[0].strip().lower()
            if email:
                found.add(email)
    except Exception:
        pass

    return _clean_emails(found)


def _collect_maps_panel_social_links(page: Page) -> list[str]:
    """Extract social links directly from Google Maps details panel."""
    found: set[str] = set()
    try:
        panel_html = page.content()
        found.update(_extract_social_links_from_html(page.url, panel_html))
    except Exception:
        pass

    try:
        links = page.locator("a[href]")
        count = min(links.count(), 80)
        for idx in range(count):
            href = links.nth(idx).get_attribute("href") or ""
            lowered = href.lower()
            if any(host in lowered for host in SOCIAL_HOST_HINTS):
                found.add(href)
    except Exception:
        pass

    return _clean_social_links(found)


def _save_category_rows(city: str, category: str, rows: list[dict[str, Any]]) -> Path:
    """Persist one category output to public/data/{country}/{city}/{category}/{category}.json."""
    category_slug = _slugify(category)
    out_dir = ensure_city_storage_layout(CITY_EXPORT_ROOT, city) / category_slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{category_slug}.json"
    out_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    return out_path


def _mark_scraped_analytics(out_path: Path, lead_count: int) -> None:
    """Notify analytics after a category file is fully written."""
    if not ANALYTICS_TRACKER_PATH.exists():
        return

    try:
        rel_to_data = out_path.relative_to(CITY_EXPORT_ROOT)
    except ValueError:
        return

    parts = rel_to_data.parts
    if len(parts) < 4:
        return

    payload = {
        "country": parts[0],
        "city": parts[1],
        "category": parts[2],
        "leadCount": lead_count,
        "leadsFile": out_path.relative_to(REPO_ROOT).as_posix(),
    }

    try:
        completed = subprocess.run(
            [
                "node",
                str(ANALYTICS_TRACKER_PATH),
                "mark-scraped",
                json.dumps(payload, ensure_ascii=False),
            ],
            check=False,
            capture_output=True,
            text=True,
            cwd=str(REPO_ROOT),
        )
    except FileNotFoundError:
        print("[warn] analytics tracking skipped: node command not found")
        return

    if completed.returncode != 0:
        stderr = completed.stderr.strip() or completed.stdout.strip()
        print(f"[warn] analytics tracking failed: {stderr or 'unknown error'}")


def _random_mouse_move(page: Page) -> None:
    """Move mouse cursor to random coordinates to reduce automation patterns."""
    x = random.randint(50, 1200)
    y = random.randint(50, 800)
    steps = random.randint(5, 20)
    page.mouse.move(x, y, steps=steps)


def _detect_captcha(page: Page) -> bool:
    """Detect CAPTCHA challenge heuristically on the current page."""
    patterns = [
        'text="captcha"',
        'text="unusual traffic"',
        'iframe[src*="recaptcha"]',
        'input[name="captcha"]',
    ]
    for pattern in patterns:
        try:
            if page.locator(pattern).first.is_visible(timeout=500):
                return True
        except Exception:
            continue
    return False


def _pause_for_captcha(page: Page) -> None:
    """Pause execution to allow manual CAPTCHA solving."""
    print("[warn] CAPTCHA detected. Solve it in the browser, then press Enter to continue.")
    input()
    _sleep_random(2, 4)
    if _detect_captcha(page):
        print("[warn] CAPTCHA still visible. Continuing with caution.")


def _get_text(page: Page, selector: str, timeout: int = 2500) -> str | None:
    """Read text from first locator match."""
    try:
        loc = page.locator(selector).first
        loc.wait_for(timeout=timeout)
        text = loc.inner_text().strip()
        return text or None
    except Exception:
        return None


def _get_attr(page: Page, selector: str, attr: str, timeout: int = 2500) -> str | None:
    """Read an attribute from first locator match."""
    try:
        loc = page.locator(selector).first
        loc.wait_for(timeout=timeout)
        value = loc.get_attribute(attr)
        return value.strip() if isinstance(value, str) and value.strip() else value
    except Exception:
        return None


def _scrape_listing(page: Page, city: str, category: str, place_id: str | None) -> dict[str, Any]:
    """Scrape fields from currently opened listing details."""
    name = _get_text(page, "h1.DUwDvf") or _get_text(page, "h1")
    address = _get_text(page, 'button[data-item-id="address"] .Io6YTe')
    phone = _get_text(page, 'button[data-item-id^="phone"] .Io6YTe')
    website = _get_attr(page, 'a[data-item-id="authority"]', "href")
    if not website:
        website = _get_attr(page, 'a[aria-label*="Website"]', "href")
    if not website:
        website = _get_attr(page, 'button[data-item-id="authority"]', "data-url")
    if not website:
        website = _get_attr(page, 'button[aria-label*="Website"]', "data-url")
    rating_text = _get_text(page, 'div.F7nice span[aria-hidden="true"]')
    review_text = (
        _get_text(page, 'div.F7nice span[aria-label*="review"]')
        or _get_text(page, 'button[jsaction*="reviewChart"] span')
    )
    if not website:
        try:
            website = _extract_website_from_panel_html(page.content())
        except Exception:
            website = None
    emails: list[str] = []
    social_media_links: list[str] = []
    if website:
        emails.extend(_collect_contact_emails(website))
        social_media_links.extend(_collect_social_links(website))
    panel_emails = _collect_maps_panel_emails(page)
    panel_social_links = _collect_maps_panel_social_links(page)
    if panel_emails:
        emails = _clean_emails(set(emails) | set(panel_emails))
    if panel_social_links:
        social_media_links = _clean_social_links(set(social_media_links) | set(panel_social_links))
    else:
        social_media_links = _clean_social_links(set(social_media_links))

    return {
        "name": (name or "").strip(),
        "city": city,
        "category": category,
        "address": (address or "").strip(),
        "phone": (phone or "").strip() or None,
        "website": (website or "").strip() or None,
        "rating": _parse_rating(rating_text),
        "review_count": _parse_reviews(review_text),
        "emails": emails,
        "primary_email": emails[0] if emails else None,
        "social_media_links": social_media_links,
        "google_maps_url": page.url,
        "place_id": place_id,
    }


def _load_all_cards(page: Page, max_results: int | None) -> None:
    """Scroll result feed first to load a large set of cards before clicking."""
    previous_count = 0
    stable_rounds = 0
    for _ in range(400):
        cards = page.locator("a.hfpxzc")
        count = cards.count()
        if max_results is not None and count >= max_results:
            break
        if count == previous_count:
            stable_rounds += 1
        else:
            stable_rounds = 0
        if stable_rounds >= 10:
            break
        previous_count = count

        scroll_by = random.randint(900, 2400)
        try:
            page.locator('div[role="feed"]').first.evaluate(f"el => el.scrollBy(0, {scroll_by})")
        except Exception:
            page.mouse.wheel(0, scroll_by)
        try:
            if count > 0:
                cards.nth(count - 1).scroll_into_view_if_needed(timeout=1500)
        except Exception:
            pass
        _sleep_random(1.5, 3.0)


def _save_progress(progress_path: Path, rows: list[dict[str, Any]]) -> None:
    """Persist in-run progress to JSON so crashes do not lose data."""
    progress_path.parent.mkdir(parents=True, exist_ok=True)
    progress_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")


def _city_progress_path(city: str) -> Path:
    return ensure_city_storage_layout(CITY_EXPORT_ROOT, city) / "scrape_progress.json"


def _city_registry_path(city: str) -> Path:
    return ensure_city_storage_layout(CITY_EXPORT_ROOT, city) / "registry.json"


def _city_sqlite_path(city: str) -> Path:
    return ensure_city_storage_layout(CITY_EXPORT_ROOT, city) / "scraped.db"


def _city_default_out_path(city: str) -> Path:
    return ensure_city_storage_layout(CITY_EXPORT_ROOT, city) / "test_output.json"


def _scrape_category(
    page: Page,
    city: str,
    category: str,
    max_results: int | None,
    db: RegistryDB,
    progress_rows: list[dict[str, Any]],
    progress_path: Path,
) -> list[dict[str, Any]]:
    """Scrape one category in one city using batch processing."""
    query = f"{category} in {city}"
    search_url = f"https://www.google.com/maps/search/{quote_plus(query)}"
    print(f"[category] {query}")

    page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
    _sleep_random(3, 5)
    if _detect_captcha(page):
        _pause_for_captcha(page)

    try:
        page.locator('button:has-text("Accept all")').first.click(timeout=2500)
        _sleep_random(2, 4)
    except Exception:
        pass

    _load_all_cards(page, max_results=max_results)
    cards = page.locator("a.hfpxzc")
    total_cards = cards.count()
    if max_results is not None:
        total_cards = min(total_cards, max_results)
    print(f"[category] loaded cards: {total_cards}")

    results: list[dict[str, Any]] = []
    total_scraped = 0
    batch_no = 0
    skipped_already_scraped = 0
    skipped_no_name = 0
    skipped_timeout = 0
    skipped_error = 0

    for start in range(0, total_cards, BATCH_SIZE):
        if max_results is not None and len(results) >= max_results:
            break
        batch_no += 1
        end = min(start + BATCH_SIZE, total_cards)
        print(f"[progress] category={category} batch={batch_no} cards={start + 1}-{end}")

        for idx in range(start, end):
            if max_results is not None and len(results) >= max_results:
                break
            card = cards.nth(idx)
            href = card.get_attribute("href")
            place_id = _extract_place_id(href)

            if db.is_place_scraped(place_id):
                skipped_already_scraped += 1
                continue

            try:
                _random_mouse_move(page)
                card.click(timeout=6000)
                _sleep_random(2, 5)
                if _detect_captcha(page):
                    _pause_for_captcha(page)

                row = _scrape_listing(page, city=city, category=category, place_id=place_id)
                if not row["name"]:
                    skipped_no_name += 1
                    continue
                db.mark_place_scraped(
                    place_id=row.get("place_id"),
                    name=row["name"],
                    city=row["city"],
                    maps_url=row.get("google_maps_url"),
                )
                results.append(row)
                progress_rows.append(row)
                total_scraped += 1
                print(
                    f"[lead] {total_scraped:04d} name={row['name'][:45]} "
                    f"rating={row.get('rating') or '?'} web={'yes' if row.get('website') else 'no'}"
                )
                if total_scraped % BATCH_SIZE == 0:
                    _save_progress(progress_path, progress_rows)
            except PWTimeout:
                skipped_timeout += 1
                continue
            except Exception as exc:
                print(f"[warn] listing skipped: {exc}")
                skipped_error += 1
                continue
            finally:
                _sleep_random(2, 5)

        _save_progress(progress_path, progress_rows)
        # Save partial category data so interrupted runs still preserve progress.
        _save_category_rows(city=city, category=category, rows=results)
        print(
            f"[batch-summary] category={category} batch={batch_no} "
            f"new={len(results)} skipped_already_scraped={skipped_already_scraped} "
            f"skipped_no_name={skipped_no_name} skipped_timeout={skipped_timeout} "
            f"skipped_error={skipped_error}"
        )
        should_continue = end < total_cards and (
            max_results is None or len(results) < max_results
        )
        if should_continue:
            sleep_for = random.uniform(BATCH_SLEEP_MIN, BATCH_SLEEP_MAX)
            print(f"[pause] batch complete -> sleeping {sleep_for:.1f}s")
            time.sleep(sleep_for)

    print(f"[category] done: {category} scraped={len(results)}")
    return results


def _new_context(pw, headless: bool) -> BrowserContext:
    """Create a persistent context with randomized user agent."""
    PLAYWRIGHT_PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    return pw.chromium.launch_persistent_context(
        user_data_dir=str(PLAYWRIGHT_PROFILE_DIR),
        headless=headless,
        viewport={"width": 1280, "height": 900},
        user_agent=random.choice(USER_AGENTS),
        locale="en-US",
        args=["--disable-blink-features=AutomationControlled"],
    )


def scrape_city(
    city: str,
    categories: list[str] | None = None,
    max_per_category: int | None = None,
    headless: bool = True,
    db: RegistryDB | None = None,
    progress_path: Path | None = None,
) -> list[dict[str, Any]]:
    """Scrape one city across categories and return deduplicated results."""
    if categories is None:
        categories = DEFAULT_CATEGORIES
    db = db or RegistryDB(
        path=_city_registry_path(city),
        sqlite_path=_city_sqlite_path(city),
        auto_sync_json=False,
    )
    progress_path = progress_path or _city_progress_path(city)

    progress_rows: list[dict[str, Any]] = []
    all_results: list[dict[str, Any]] = []

    with sync_playwright() as pw:
        context = _new_context(pw, headless=headless)
        page = context.new_page()
        page.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
        )

        for category in categories:
            try:
                rows = _scrape_category(
                    page=page,
                    city=city,
                    category=category,
                    max_results=max_per_category,
                    db=db,
                    progress_rows=progress_rows,
                    progress_path=progress_path,
                )
                all_results.extend(rows)
                out_path = _save_category_rows(city=city, category=category, rows=rows)
                _mark_scraped_analytics(out_path=out_path, lead_count=len(rows))
                print(f"[saved] category output -> {out_path.resolve()}")
                category_sleep = random.uniform(CATEGORY_SLEEP_MIN, CATEGORY_SLEEP_MAX)
                print(f"[pause] category complete -> sleeping {category_sleep:.1f}s")
                time.sleep(category_sleep)
            except Exception as exc:
                print(f"[warn] category failed ({category}): {exc}")
                continue

        context.close()

    unique: dict[str, dict[str, Any]] = {}
    for row in all_results:
        key = row.get("place_id") or f"{row.get('name','').lower()}|{row.get('phone','')}"
        unique[key] = row
    print(f"[summary] city={city} unique_scraped={len(unique)}")
    return list(unique.values())


def _parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(description="Scrape Google Maps using Playwright.")
    parser.add_argument("--city", required=True, help="City name, e.g. Bangalore")
    parser.add_argument(
        "--categories",
        default=",".join(DEFAULT_CATEGORIES),
        help="Comma-separated categories.",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=0,
        help="Max results per category. Use 0 to scrape until listings are exhausted.",
    )
    parser.add_argument("--out", default=None, help="Output JSON path.")
    parser.add_argument("--show-browser", action="store_true", help="Run in visible mode.")
    return parser.parse_args()


def _cli_main() -> None:
    """CLI entrypoint."""
    args = _parse_args()
    categories = [item.strip() for item in args.categories.split(",") if item.strip()]
    rows = scrape_city(
        city=args.city,
        categories=categories,
        max_per_category=(args.max if args.max > 0 else None),
        headless=not args.show_browser,
    )
    out_path = Path(args.out) if args.out else _city_default_out_path(args.city)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[saved] {out_path} rows={len(rows)}")


if __name__ == "__main__":
    _cli_main()
