const path = require("path");
const dotenv = require("dotenv");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..");

dotenv.config({ path: path.join(REPO_ROOT, ".env") });
dotenv.config({ path: path.join(PACKAGE_ROOT, ".env") });

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function resolveFromPackageRoot(value, defaultRelPath) {
  const raw = value === undefined || value === null || value === "" ? defaultRelPath : String(value);
  return path.isAbsolute(raw) ? raw : path.resolve(PACKAGE_ROOT, raw);
}

function resolveFromRepoRoot(value, defaultRelPath) {
  const raw = value === undefined || value === null || value === "" ? defaultRelPath : String(value);
  return path.isAbsolute(raw) ? raw : path.resolve(REPO_ROOT, raw);
}

function resolveDbFile(value) {
  if (value === undefined || value === null || value === "") {
    return resolveFromPackageRoot("", "./data/db.sqlite");
  }
  return resolveFromRepoRoot(value, "./data/db.sqlite");
}

function resolveWebsitesDir(value) {
  if (value === undefined || value === null || value === "") {
    return resolveFromPackageRoot("", "./global-website");
  }
  return resolveFromRepoRoot(value, "./website-builder/global-website");
}

function resolveLeadsDir(value) {
  if (value === undefined || value === null || value === "") {
    return resolveFromPackageRoot("", "./leads");
  }
  return resolveFromRepoRoot(value, "./website-builder/leads");
}

function resolveCategoryMapFile(value) {
  if (value === undefined || value === null || value === "") {
    return resolveFromPackageRoot("", "./category-map.json");
  }
  return resolveFromRepoRoot(value, "./website-builder/category-map.json");
}

function resolveErrorsLog(value) {
  if (value === undefined || value === null || value === "") {
    return resolveFromPackageRoot("", "./errors.log");
  }
  return resolveFromRepoRoot(value, "./website-builder/errors.log");
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const config = {
  ROOT_DIR: PACKAGE_ROOT,
  REPO_ROOT,
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  VERCEL_TOKEN: process.env.VERCEL_TOKEN || "",
  DB_FILE: resolveDbFile(process.env.DB_FILE),
  OUTPUT_DIR: resolveFromRepoRoot(process.env.OUTPUT_DIR, "./output"),
  WEBSITES_DIR: resolveWebsitesDir(process.env.WEBSITES_DIR),
  LEADS_DIR: resolveLeadsDir(process.env.LEADS_DIR),
  CATEGORY_MAP_FILE: resolveCategoryMapFile(process.env.CATEGORY_MAP_FILE),
  ERRORS_LOG: resolveErrorsLog(process.env.ERRORS_LOG),
  SITES_JSON_FILE: resolveFromRepoRoot(process.env.SITES_JSON_FILE, "./data/sites.json"),
  SITE_TTL_DAYS: parsePositiveInt(process.env.SITE_TTL_DAYS, 3),
  CENTRAL_SITE_BASE_URL: String(process.env.CENTRAL_SITE_BASE_URL || "").trim().replace(/\/+$/, ""),
  requiredEnv
};

module.exports = { config };
