const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const LEAD_FINDER_DATA = path.resolve(__dirname, "../../lead_finder/public/data");
const CATEGORY_LEADS_FILENAME = "leads.json";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

function preferredCategoryJsonFiles(rootDir) {
  const grouped = new Map();
  for (const filePath of findAllJsonFiles(rootDir)) {
    const meta = parseMeta(filePath);
    if (!meta) continue;
    const key = `${meta.country}/${meta.city}/${meta.category}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(filePath);
  }

  const selected = [];
  for (const files of grouped.values()) {
    const preferred = files.find((filePath) => path.basename(filePath).toLowerCase() === "leads.json");
    if (preferred) {
      selected.push(preferred);
      continue;
    }
    const legacy = files.find((filePath) => {
      const category = path.basename(path.dirname(filePath));
      return path.basename(filePath).toLowerCase() === `${category}.json`;
    });
    if (legacy) {
      selected.push(legacy);
      continue;
    }
    selected.push(files[0]);
  }
  return selected;
}

function leadsJsonPath(country, city, category) {
  return path.join(
    LEAD_FINDER_DATA,
    String(country || ""),
    String(city || ""),
    String(category || ""),
    CATEGORY_LEADS_FILENAME
  );
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

  const socialLinks = Array.isArray(raw.social_media_links) ? raw.social_media_links : [];
  const emails = Array.isArray(raw.emails) ? raw.emails.map((value) => String(value || "").trim()).filter(Boolean) : [];
  const primaryEmail = raw.email || raw.primary_email || emails[0] || "";
  const qualified = typeof raw.qualified === "boolean" ? raw.qualified : true;
  return {
    shop_id,
    shop_name: raw.name || raw.shop_name || "",
    category: raw.category || meta?.category || "",
    address: raw.address || raw.full_address || "",
    phone: raw.phone || raw.phone_number || "",
    email: primaryEmail,
    primary_email: primaryEmail,
    emails,
    city: raw.city || meta?.city || "",
    country: meta?.country || "",
    website_url: raw.website || raw.website_url || "",
    social_media_links: socialLinks.map((v) => String(v || "").trim()).filter(Boolean),
    instagram: raw.instagram || firstSocialMatch({ social_media_links: socialLinks }, ["instagram.com"]),
    facebook: raw.facebook || firstSocialMatch({ social_media_links: socialLinks }, ["facebook.com"]),
    twitter: raw.twitter || firstSocialMatch({ social_media_links: socialLinks }, ["twitter.com", "x.com"]),
    linkedin: raw.linkedin || firstSocialMatch({ social_media_links: socialLinks }, ["linkedin.com"]),
    google_maps_url: raw.google_maps_url || raw.url || "",
    place_id: raw.place_id || "",
    rating: raw.rating || "",
    reviews_count: raw.reviews_count || raw.review_count || raw.reviews || "",
    score: raw.score ?? raw.lead_quality_score ?? "",
    qualified,
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

function dedupeLeads(leads) {
  const byKey = new Map();
  const scoreLead = (lead) => {
    let score = 0;
    if (lead.email) score += 5;
    if (Array.isArray(lead.emails) && lead.emails.length) score += 3;
    if (lead.website_url) score += 2;
    if (lead.phone) score += 2;
    if (Array.isArray(lead.social_media_links) && lead.social_media_links.length) score += 1;
    return score;
  };
  for (const lead of leads) {
    const key = String(lead.shop_id || lead.place_id || lead.google_maps_url || lead._sourceFile || "");
    if (!key) continue;
    const existing = byKey.get(key);
    if (!existing || scoreLead(lead) > scoreLead(existing)) {
      byKey.set(key, lead);
    }
  }
  return [...byKey.values()];
}

function directJsonFallback() {
  const prefix = String(process.env.ANALYTICS_KEY_PREFIX || "").trim().replace(/\\/g, "/");
  const prefixParts = prefix.split("/").filter(Boolean);

  const countryFilter = slugify(process.env.JSON_LEADS_COUNTRY_SLUG || prefixParts[0] || "");
  const cityFilter = slugify(process.env.JSON_LEADS_CITY_SLUG || prefixParts[1] || "");
  const categoryFilterRaw = String(
    process.env.JSON_LEADS_CATEGORY_FILTER || process.env.ANALYTICS_CATEGORY_FILTER || ""
  ).trim();
  const allowedCategories = new Set(
    categoryFilterRaw
      .split(",")
      .map((value) => slugify(value))
      .filter(Boolean)
  );

  const leads = [];
  for (const filePath of preferredCategoryJsonFiles(LEAD_FINDER_DATA)) {
    const meta = parseMeta(filePath);
    if (!meta) continue;
    if (countryFilter && slugify(meta.country) !== countryFilter) continue;
    if (cityFilter && slugify(meta.city) !== cityFilter) continue;
    if (allowedCategories.size && !allowedCategories.has(slugify(meta.category))) continue;
    leads.push(...readJsonLeads(filePath));
  }
  return dedupeLeads(leads.filter((lead) => lead.qualified !== false));
}

function readReadyLeads() {
  const { getReadyToBuild } = require("../../analytics/tracker");
  let ready = getReadyToBuild();

  const prefix = String(process.env.ANALYTICS_KEY_PREFIX || "").trim();
  if (prefix) ready = ready.filter((entry) => String(entry.key || "").startsWith(prefix));

  const categoryFilterRaw = String(process.env.ANALYTICS_CATEGORY_FILTER || "").trim();
  if (categoryFilterRaw) {
    const allowed = new Set(
      categoryFilterRaw
        .split(",")
        .map((v) => String(v || "").trim())
        .filter(Boolean)
    );
    ready = ready.filter((entry) => allowed.has(String(entry.category || "")));
  }

  const leads = [];
  for (const entry of ready) {
    const absFile = leadsJsonPath(entry.country, entry.city, entry.category);
    if (!fs.existsSync(absFile)) continue;
    leads.push(...readJsonLeads(absFile));
  }
  return dedupeLeads(leads.filter((lead) => lead.qualified !== false));
}

function readLeadsForPath(country, city, category) {
  const dirPath = path.join(LEAD_FINDER_DATA, country, city, category);
  const preferredPath = path.join(dirPath, CATEGORY_LEADS_FILENAME);
  if (fs.existsSync(preferredPath)) {
    return readJsonLeads(preferredPath).filter((lead) => lead.qualified !== false);
  }
  const legacyPath = path.join(dirPath, `${category}.json`);
  if (!fs.existsSync(legacyPath)) return [];
  return readJsonLeads(legacyPath);
}

module.exports = {
  readReadyLeads,
  readLeadsForPath,
  readJsonLeads,
  findAllJsonFiles,
  LEAD_FINDER_DATA
};
