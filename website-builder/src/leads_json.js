const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const LEAD_FINDER_DATA = path.resolve(__dirname, "../../lead_finder/public/data");

function findAllJsonFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findAllJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) results.push(full);
  }
  return results;
}

function parseMeta(filePath) {
  const rel = path.relative(LEAD_FINDER_DATA, filePath);
  const parts = rel.split(path.sep);
  if (parts.length < 4) return null;
  return { country: parts[0], city: parts[1], category: parts[2] };
}

function firstSocialMatch(raw, hostHints) {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const links = Array.isArray(raw?.social_media_links) ? raw.social_media_links : [];
  return links.find((value) => {
    const text = String(value || "").toLowerCase();
    return hostHints.some((hint) => text.includes(hint));
  }) || "";
}

function normalizeJsonLead(raw, meta, filePath) {
  const seed = raw.place_id || raw.url || raw.name || JSON.stringify(raw);
  const shop_id = raw.shop_id
    || ("SHOP_" + crypto.createHash("sha1").update(String(seed)).digest("hex").slice(0, 10).toUpperCase());

  return {
    shop_id,
    shop_name: raw.name || raw.shop_name || "",
    category: raw.category || meta?.category || "",
    address: raw.address || raw.full_address || "",
    phone: raw.phone || raw.phone_number || "",
    email: raw.email || raw.primary_email || "",
    city: raw.city || meta?.city || "",
    country: meta?.country || "",
    website_url: raw.website || raw.website_url || "",
    instagram: raw.instagram || firstSocialMatch(raw, ["instagram.com"]),
    facebook: raw.facebook || firstSocialMatch(raw, ["facebook.com"]),
    twitter: raw.twitter || firstSocialMatch(raw, ["twitter.com", "x.com"]),
    linkedin: raw.linkedin || firstSocialMatch(raw, ["linkedin.com"]),
    google_maps_url: raw.google_maps_url || raw.url || "",
    place_id: raw.place_id || "",
    rating: raw.rating || "",
    reviews_count: raw.reviews_count || raw.review_count || raw.reviews || "",
    status: raw.status || "",
    _sourceFile: filePath,
    _country: meta?.country || "",
    _city: meta?.city || "",
    _category: meta?.category || ""
  };
}

function readJsonLeads(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const arr = Array.isArray(raw) ? raw : (raw.leads || raw.data || [raw]);
  const meta = parseMeta(filePath);
  return arr
    .filter((row) => row && typeof row === "object")
    .map((row) => normalizeJsonLead(row, meta, filePath));
}

function readReadyLeads() {
  const { getReadyToBuild } = require("../../analytics/tracker");
  const ready = getReadyToBuild();
  const leads = [];
  for (const entry of ready) {
    const absFile = path.resolve(__dirname, "../../", entry.leads_file);
    if (!fs.existsSync(absFile)) continue;
    leads.push(...readJsonLeads(absFile));
  }
  return leads;
}

function readLeadsForPath(country, city, category) {
  const filePath = path.join(LEAD_FINDER_DATA, country, city, category, `${category}.json`);
  if (!fs.existsSync(filePath)) return [];
  return readJsonLeads(filePath);
}

module.exports = {
  readReadyLeads,
  readLeadsForPath,
  readJsonLeads,
  findAllJsonFiles,
  LEAD_FINDER_DATA
};
