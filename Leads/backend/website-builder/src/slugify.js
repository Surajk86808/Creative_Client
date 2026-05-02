const fs = require("fs");
const path = require("path");

const SITES_FILE = path.resolve(__dirname, "..", "..", "data", "sites.json");

function baseSlug(value) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "site";
}

function readSitesData() {
  try {
    if (!fs.existsSync(SITES_FILE)) return {};
    const raw = fs.readFileSync(SITES_FILE, "utf8");
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function collectExistingSlugs(sitesData, country, category) {
  if (!sitesData || typeof sitesData !== "object") return new Set();

  if (country && category) {
    const scoped = sitesData?.[country]?.[category];
    if (scoped && typeof scoped === "object" && !Array.isArray(scoped)) {
      return new Set(Object.keys(scoped));
    }
    return new Set();
  }

  const slugs = new Set();
  for (const countryValue of Object.values(sitesData)) {
    if (!countryValue || typeof countryValue !== "object") continue;
    for (const categoryValue of Object.values(countryValue)) {
      if (!categoryValue || typeof categoryValue !== "object") continue;
      for (const slug of Object.keys(categoryValue)) slugs.add(slug);
    }
  }
  return slugs;
}

function slugify(name, options = {}) {
  const slug = baseSlug(name);
  const sitesData = options.sitesData && typeof options.sitesData === "object"
    ? options.sitesData
    : readSitesData();
  const existing = collectExistingSlugs(sitesData, options.country, options.category);

  if (!existing.has(slug)) return slug;

  let index = 1;
  while (existing.has(`${slug}-${index}`)) {
    index += 1;
  }
  return `${slug}-${index}`;
}

module.exports = { slugify };
