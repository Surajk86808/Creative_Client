const path = require("path");
const dotenv = require("dotenv");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..");

// Prefer repo-root .env so one file configures the whole monorepo.
dotenv.config({ path: path.join(REPO_ROOT, ".env") });
// Back-compat: also allow website-builder/.env (won't override existing vars).
dotenv.config({ path: path.join(PACKAGE_ROOT, ".env") });

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function resolveFromPackageRoot(value, defaultRelPath) {
  const raw = (value === undefined || value === null || value === "") ? defaultRelPath : String(value);
  return path.isAbsolute(raw) ? raw : path.resolve(PACKAGE_ROOT, raw);
}

function resolveFromRepoRoot(value, defaultRelPath) {
  const raw = (value === undefined || value === null || value === "") ? defaultRelPath : String(value);
  return path.isAbsolute(raw) ? raw : path.resolve(REPO_ROOT, raw);
}

function resolveDbFile(value) {
  // Prefer repo-root paths (matches repo-root .env.example), but keep existing default location.
  if (value === undefined || value === null || value === "") {
    return resolveFromPackageRoot("", "./data/db.sqlite");
  }
  return resolveFromRepoRoot(value, "./data/db.sqlite");
}

function resolveWebsitesDir(value) {
  // These live under website-builder/ by default.
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

const config = {
  ROOT_DIR: PACKAGE_ROOT,
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  VERCEL_TOKEN: process.env.VERCEL_TOKEN || "",
  DB_FILE: resolveDbFile(process.env.DB_FILE),
  OUTPUT_DIR: resolveFromRepoRoot(process.env.OUTPUT_DIR, "./output"),
  WEBSITES_DIR: resolveWebsitesDir(process.env.WEBSITES_DIR),
  LEADS_DIR: resolveLeadsDir(process.env.LEADS_DIR),
  CATEGORY_MAP_FILE: resolveCategoryMapFile(process.env.CATEGORY_MAP_FILE),
  ERRORS_LOG: resolveErrorsLog(process.env.ERRORS_LOG),
  requiredEnv
};

module.exports = { config };
