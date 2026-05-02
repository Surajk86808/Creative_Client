const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { ensureDir } = require("./utils");
const { logErrorToFile } = require("./logger");
const { slugify } = require("./slugify");

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeKey(value, fallback) {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y";
}

function normalizeReviewStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "pending";
  return normalized;
}

function inferHero(name, category) {
  const cleanCategory = normalizeText(category).toLowerCase();
  if (cleanCategory) {
    return `Trusted ${cleanCategory} care for every visit`;
  }
  return `${normalizeText(name) || "Your business"} is ready to welcome you`;
}

function inferServices(category) {
  const cleanCategory = normalizeText(category).toLowerCase();
  if (!cleanCategory) return ["Consultation", "Custom Solutions", "Customer Support"];

  if (cleanCategory.includes("dent")) return ["Cleaning", "Braces", "Root Canal"];
  if (cleanCategory.includes("salon") || cleanCategory.includes("spa")) return ["Hair Styling", "Skin Care", "Bridal Packages"];
  if (cleanCategory.includes("gym") || cleanCategory.includes("fitness")) return ["Personal Training", "Strength Programs", "Group Classes"];
  if (cleanCategory.includes("clinic") || cleanCategory.includes("doctor")) return ["Consultation", "Diagnostics", "Follow-up Care"];
  if (cleanCategory.includes("restaurant") || cleanCategory.includes("cafe")) return ["Signature Menu", "Takeaway", "Reservations"];

  const title = cleanCategory
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return [
    `${title} Service`,
    `${title} Support`,
    `${title} Solutions`
  ];
}

function parseSiteExpiry(days) {
  const now = new Date();
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString()
  };
}

function safeReadSitesStore() {
  const filePath = config.SITES_JSON_FILE;
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    logErrorToFile("Failed to read sites.json", {
      file: filePath,
      error: String(error && error.message ? error.message : error)
    });
    return {};
  }
}

function safeWriteSitesStore(store) {
  const filePath = config.SITES_JSON_FILE;
  const dirPath = path.dirname(filePath);
  ensureDir(dirPath);
  const tempPath = path.join(dirPath, `sites.${process.pid}.${Date.now()}.tmp`);
  try {
    fs.writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // ignore cleanup failure
    }
    throw error;
  }
}

function buildSiteRecord(businessData, timestamps) {
  const name = normalizeText(businessData.name || businessData.shop_name) || "Untitled Business";
  const hero = normalizeText(businessData.description || businessData.tagline) || `Welcome to ${name}`;
  const services = Array.isArray(businessData.services) ? businessData.services : [];
  const phone = normalizeText(businessData.phone);
  const email = normalizeText(businessData.email);
  const address = normalizeText(businessData.address);
  const whatsapp = !!businessData.whatsapp_reachable;

  return {
    name,
    hero,
    services,
    phone,
    email,
    address,
    whatsapp,
    created_at: timestamps.createdAt,
    expires_at: timestamps.expiresAt,
    active: true
  };
}

function buildSitePath(country, category, shopSlug) {
  return `/${country}/${category}/${shopSlug}`;
}

function writeLeadMetadata(outputFolder, businessData, siteInfo) {
  const leadMetaPath = path.join(outputFolder, "_lead_meta.json");
  const payload = {
    shop_id: businessData.shop_id,
    shop_name: businessData.shop_name,
    category: businessData.category,
    city: businessData.city,
    country: businessData.country || "",
    address: businessData.address,
    phone: businessData.phone,
    email: businessData.email,
    instagram: businessData.instagram || "",
    facebook: businessData.facebook || "",
    twitter: businessData.twitter || "",
    linkedin: businessData.linkedin || "",
    google_maps_url: businessData.google_maps_url || "",
    rating: businessData.rating || "",
    reviews_count: businessData.reviews_count || "",
    website_url: siteInfo.publicUrl || siteInfo.sitePath,
    preview_path: siteInfo.sitePath,
    review_status: normalizeReviewStatus("pending"),
    review_notes: "",
    generated_at: new Date().toISOString(),
    site_slug: siteInfo.shopSlug,
    site_path: siteInfo.sitePath,
    sites_json_file: config.SITES_JSON_FILE,
    template_mode: "central-nextjs"
  };
  fs.writeFileSync(leadMetaPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function fillTemplate(templatePath, businessData, opts = {}) {
  const outputFolder = opts.outputDir
    ? String(opts.outputDir)
    : path.join(config.OUTPUT_DIR, businessData.shop_id || "unknown-shop");

  ensureDir(config.OUTPUT_DIR);
  ensureDir(outputFolder);

  const country = normalizeKey(businessData._country || businessData.country, "global");
  const category = normalizeKey(businessData._category || businessData.category, "general");
  const city = normalizeKey(businessData._city || businessData.city, "unknown-city");
  const dryRun = Boolean(opts.dryRun);

  const store = safeReadSitesStore();
  const shopSlug = slugify(businessData.name || businessData.shop_name, { sitesData: store, country, category });
  const timestamps = parseSiteExpiry(config.SITE_TTL_DAYS);
  const siteRecord = buildSiteRecord(businessData, timestamps);
  const sitePath = buildSitePath(country, category, shopSlug);
  const publicUrl = config.CENTRAL_SITE_BASE_URL ? `${config.CENTRAL_SITE_BASE_URL}${sitePath}` : "";

  if (!dryRun) {
    if (!store[country] || typeof store[country] !== "object") store[country] = {};
    if (!store[country][category] || typeof store[country][category] !== "object") store[country][category] = {};
    store[country][category][shopSlug] = siteRecord;
    safeWriteSitesStore(store);
    console.log(`✓ Site appended to sites.json: /${country}/${category}/${shopSlug}`);
  }

  const manifestPath = path.join(outputFolder, "site.json");
  const manifest = {
    template_path: templatePath,
    country,
    city,
    category,
    shop_slug: shopSlug,
    site_path: sitePath,
    public_url: publicUrl || null,
    dry_run: dryRun,
    source: "sites.json",
    site: siteRecord
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  writeLeadMetadata(outputFolder, businessData, { shopSlug, sitePath, publicUrl });

  return {
    outputFolder,
    country,
    city,
    category,
    shopSlug,
    sitePath,
    publicUrl,
    siteRecord
  };
}

module.exports = { fillTemplate };
