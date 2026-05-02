"""Website quality analyzer for lead qualification."""

from __future__ import annotations

import contextlib
import io
import os
import re
import time
from datetime import UTC, datetime
from typing import Any
from urllib.parse import urlparse

import httpx
import whois
from bs4 import BeautifulSoup

from ai.tasks import analyze_lead
from config import REQUEST_TIMEOUT, WEBSITE_ANALYSIS_TIMEOUT
from models import WebsiteReport

JQUERY_VERSION_RE = re.compile(r"jquery[-.]([0-9]+\.[0-9]+(\.[0-9]+)?)", re.IGNORECASE)
YEAR_RE = re.compile(r"(20[0-2][0-9]|19[9][0-9])")


def _normalize_url(website: str) -> str:
    """Normalize URL by ensuring a scheme exists."""
    value = website.strip()
    if value.startswith(("http://", "https://")):
        return value
    return f"http://{value}"


def _extract_copyright_year(html: str) -> int | None:
    """Extract likely copyright/update year from page text."""
    soup = BeautifulSoup(html, "html.parser")
    text = " ".join(soup.get_text(" ", strip=True).split())
    years = [int(match.group(1)) for match in YEAR_RE.finditer(text)]
    if not years:
        return None
    return max(years)


def _is_old_jquery(html: str) -> bool:
    """Return True when jQuery version in source looks outdated."""
    for match in JQUERY_VERSION_RE.finditer(html):
        major_minor = match.group(1).split(".")
        try:
            major = int(major_minor[0])
            minor = int(major_minor[1]) if len(major_minor) > 1 else 0
        except ValueError:
            continue
        if major < 3 or (major == 3 and minor < 5):
            return True
    return False


def _domain_age_years(hostname: str | None) -> int | None:
    """Estimate domain age in years via WHOIS creation date."""
    if not hostname:
        return None
    try:
        # python-whois can print socket/DNS errors even when exceptions are handled.
        # Suppress noisy stderr/stdout so batch analysis logs stay readable.
        with contextlib.redirect_stderr(io.StringIO()), contextlib.redirect_stdout(io.StringIO()):
            data = whois.whois(hostname)
        created = data.creation_date
        if isinstance(created, list):
            created = created[0] if created else None
        if created is None:
            return None
        now = datetime.now(UTC).replace(tzinfo=None)
        return max(0, (now - created.replace(tzinfo=None)).days // 365)
    except Exception:
        return None


def _non_empty_text(value: Any) -> str:
    return str(value or "").strip()


def _lead_website_issues(lead: dict[str, Any]) -> list[str]:
    website_issues = lead.get("website_issues")
    if isinstance(website_issues, list):
        return [str(item).strip() for item in website_issues if str(item).strip()]

    website_report = lead.get("website_report")
    if isinstance(website_report, dict):
        issues = website_report.get("issues")
        if isinstance(issues, list):
            return [str(item).strip() for item in issues if str(item).strip()]
    return []


def _lead_has_phone(lead: dict[str, Any]) -> bool:
    return any(_non_empty_text(lead.get(key)) for key in ("phone", "phone_number", "whatsapp"))


def _lead_has_email(lead: dict[str, Any]) -> bool:
    if _non_empty_text(lead.get("email")):
        return True
    if _non_empty_text(lead.get("primary_email")):
        return True
    emails = lead.get("emails")
    if not isinstance(emails, list):
        return False
    return any(_non_empty_text(item) for item in emails)


def ai_score_lead(lead: dict) -> dict:
    """Enrich a lead with centralized AI scoring data when configured."""
    if not (os.getenv("NVIDIA_SCORING_API_KEY") or os.getenv("NVIDIA_API_KEY")):
        return lead

    if all(key in lead for key in ("ai_score", "weakness_summary", "outreach_angle", "priority")):
        return lead

    try:
        parsed = analyze_lead(lead)
        lead["ai_score"] = int(parsed["ai_score"])
        lead["weakness_summary"] = str(parsed["weakness_summary"]).strip()
        lead["outreach_angle"] = str(parsed["outreach_angle"]).strip()
        lead["priority"] = str(parsed["priority"]).strip().lower()
    except Exception:
        lead["ai_score_error"] = True
    return lead


def analyze_website(website: str | None) -> WebsiteReport:
    """Analyze website quality and return a structured report."""
    if not website:
        return WebsiteReport(
            reachable=False,
            website_score=1,
            issues=["No website"],
        )

    url = _normalize_url(website)
    parsed = urlparse(url)
    issues: list[str] = []
    report = WebsiteReport(issues=issues)

    if parsed.scheme == "http":
        issues.append("No SSL (HTTP only)")

    timeout = httpx.Timeout(WEBSITE_ANALYSIS_TIMEOUT, connect=REQUEST_TIMEOUT)
    html = ""
    with httpx.Client(follow_redirects=True, timeout=timeout) as client:
        start = time.perf_counter()
        try:
            response = client.get(url)
            elapsed_ms = int((time.perf_counter() - start) * 1000)
        except Exception:
            report.reachable = False
            report.website_score = 1
            issues.append("Website unreachable")
            return report

    report.reachable = True
    report.final_url = str(response.url)
    report.response_time_ms = elapsed_ms
    report.uses_https = str(response.url).startswith("https://")
    html = response.text or ""

    if not report.uses_https:
        issues.append("No SSL (HTTP only)")

    if (report.response_time_ms or 0) > 3000:
        issues.append("Slow website (>3s)")

    soup = BeautifulSoup(html, "html.parser")
    report.mobile_friendly = bool(soup.find("meta", attrs={"name": re.compile("viewport", re.I)}))
    if not report.mobile_friendly:
        issues.append("No mobile viewport")

    report.copyright_year = _extract_copyright_year(html)
    if report.copyright_year is not None and report.copyright_year < 2020:
        issues.append(f"Outdated footer year ({report.copyright_year})")

    generator = (soup.find("meta", attrs={"name": "generator"}) or {}).get("content", "")
    report.old_wordpress = "wordpress" in generator.lower() and any(
        token in generator.lower() for token in ("4.", "5.0", "5.1", "5.2", "5.3", "5.4", "5.5")
    )
    if report.old_wordpress:
        issues.append("Old WordPress signature")

    report.old_jquery = _is_old_jquery(html)
    if report.old_jquery:
        issues.append("Old jQuery detected")

    report.flash_detected = ".swf" in html.lower() or "shockwave flash" in html.lower()
    if report.flash_detected:
        issues.append("Flash reference detected")

    table_count = len(soup.find_all("table"))
    report.table_layout_heavy = table_count >= 8
    if report.table_layout_heavy:
        issues.append("Table-heavy layout")

    report.domain_age_years = _domain_age_years(urlparse(str(response.url)).hostname)
    if (report.domain_age_years or 0) > 5:
        issues.append("Domain older than 5 years")

    # Scoring from modern->poor quality, then normalized to 1..10.
    score = 10
    score -= 3 if not report.reachable else 0
    score -= 2 if not report.uses_https else 0
    score -= 1 if not report.mobile_friendly else 0
    score -= 1 if (report.response_time_ms or 0) > 3000 else 0
    score -= 1 if report.copyright_year is not None and report.copyright_year < 2020 else 0
    score -= 1 if report.old_wordpress or report.old_jquery or report.flash_detected else 0
    score -= 1 if report.table_layout_heavy else 0
    score = max(1, min(10, score))
    report.website_score = score
    report.issues = issues
    return report
