const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { getProcessed } = require("./db");
const { ensureDir } = require("./utils");
const { normalizeReviewStatus, readLeadMetaForSite } = require("./review");

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function joinLinks(items) {
  if (!Array.isArray(items)) return "";
  return items.map((v) => String(v || "").trim()).filter(Boolean).join(", ");
}

function resolveLeadEmail(lead) {
  const direct = safeText(lead && (lead.email || lead.primary_email));
  if (direct) return direct;
  if (Array.isArray(lead?.emails)) {
    const first = lead.emails.map((value) => safeText(value)).find(Boolean);
    if (first) return first;
  }
  return "";
}

function groupKeyForLead(lead) {
  if (lead && lead._country && lead._city && lead._category) {
    return `${lead._country}/${lead._city}/${lead._category}`;
  }
  return null;
}

function reportPathForGroupKey(key) {
  const parts = String(key || "").split("/").filter(Boolean);
  if (parts.length !== 3) return null;
  const [country, city, category] = parts;
  return path.join(config.OUTPUT_DIR, country, city, category, "leads.xlsx");
}

function reviewMetaForLead(lead) {
  const country = safeText(lead && (lead._country || lead.country));
  const city = safeText(lead && (lead._city || lead.city));
  const category = safeText(lead && (lead._category || lead.category));
  const shopId = safeText(lead && lead.shop_id);
  if (!country || !city || !category || !shopId) return null;
  const siteDir = path.join(config.OUTPUT_DIR, country, city, category, shopId);
  return readLeadMetaForSite(siteDir);
}

async function writeReportXlsx(filePath, leads) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("leads");

  sheet.columns = [
    { header: "shop_id", key: "shop_id", width: 16 },
    { header: "name", key: "name", width: 32 },
    { header: "phone", key: "phone", width: 18 },
    { header: "email", key: "email", width: 28 },
    { header: "source_website", key: "source_website", width: 32 },
    { header: "generated_website", key: "generated_website", width: 32 },
    { header: "instagram", key: "instagram", width: 28 },
    { header: "facebook", key: "facebook", width: 28 },
    { header: "linkedin", key: "linkedin", width: 28 },
    { header: "twitter", key: "twitter", width: 28 },
    { header: "social_media_links", key: "social_media_links", width: 50 },
    { header: "google_maps_url", key: "google_maps_url", width: 40 },
    { header: "country", key: "country", width: 16 },
    { header: "city", key: "city", width: 16 },
    { header: "category", key: "category", width: 18 },
    { header: "build_status", key: "build_status", width: 12 },
    { header: "review_status", key: "review_status", width: 14 },
    { header: "review_notes", key: "review_notes", width: 28 },
    { header: "preview_path", key: "preview_path", width: 36 },
    { header: "template_used", key: "template_used", width: 18 },
    { header: "deployed_at", key: "deployed_at", width: 22 }
  ];

  for (const lead of leads) {
    const processed = getProcessed(lead.shop_id);
    const reviewMeta = reviewMetaForLead(lead);
    sheet.addRow({
      shop_id: safeText(lead.shop_id),
      name: safeText(lead.shop_name),
      phone: safeText(lead.phone),
      email: resolveLeadEmail(lead),
      source_website: safeText(lead.website_url),
      generated_website: safeText(processed && processed.vercel_url ? processed.vercel_url : ""),
      instagram: safeText(lead.instagram),
      facebook: safeText(lead.facebook),
      linkedin: safeText(lead.linkedin),
      twitter: safeText(lead.twitter),
      social_media_links: joinLinks(lead.social_media_links),
      google_maps_url: safeText(lead.google_maps_url),
      country: safeText(lead._country || lead.country || ""),
      city: safeText(lead._city || lead.city || ""),
      category: safeText(lead._category || lead.category || ""),
      build_status: safeText(processed && processed.status ? processed.status : ""),
      review_status: normalizeReviewStatus(reviewMeta && reviewMeta.review_status),
      review_notes: safeText(reviewMeta && reviewMeta.review_notes),
      preview_path: safeText(reviewMeta && reviewMeta.preview_path),
      template_used: safeText(processed && processed.template_used ? processed.template_used : ""),
      deployed_at: safeText(processed && processed.deployed_at ? processed.deployed_at : "")
    });
  }

  ensureDir(path.dirname(filePath));
  await workbook.xlsx.writeFile(filePath);
}

async function exportReports(leads) {
  const groups = new Map();
  for (const lead of leads) {
    const key = groupKeyForLead(lead);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(lead);
  }

  const written = [];
  for (const [key, items] of groups.entries()) {
    const outPath = reportPathForGroupKey(key);
    if (!outPath) continue;
    // Keep ordering stable.
    items.sort((a, b) => String(a.shop_name || "").localeCompare(String(b.shop_name || "")));
    // eslint-disable-next-line no-await-in-loop
    await writeReportXlsx(outPath, items);
    written.push(outPath);
  }

  // If there were no JSON-grouped leads, still write a single report.
  if (!written.length && Array.isArray(leads) && leads.length) {
    const fallback = path.join(config.OUTPUT_DIR, "leads.xlsx");
    await writeReportXlsx(fallback, leads);
    written.push(fallback);
  }

  return written;
}

module.exports = { exportReports };

