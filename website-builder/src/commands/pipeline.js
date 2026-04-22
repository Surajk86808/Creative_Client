const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { runCommand } = require("./run");

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function readCityCountryCache() {
  const cachePath = path.resolve(__dirname, "../../../lead_finder/public/data/_city_country_cache.json");
  if (!fs.existsSync(cachePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function resolveCountrySlugForCity(cityInput) {
  const citySlug = slugify(cityInput);
  const cache = readCityCountryCache();
  const cached = cache[citySlug];
  if (cached) return String(cached);

  const dataRoot = path.resolve(__dirname, "../../../lead_finder/public/data");
  if (!fs.existsSync(dataRoot)) return "";
  for (const entry of fs.readdirSync(dataRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const maybeCity = path.join(dataRoot, entry.name, citySlug);
    if (fs.existsSync(maybeCity) && fs.statSync(maybeCity).isDirectory()) {
      return entry.name;
    }
  }
  return "";
}

function runLeadFinder(opts) {
  const leadFinderDir = path.resolve(__dirname, "../../../lead_finder");
  const pythonArgs = [path.join(leadFinderDir, "run.py")];
  if (opts.city) pythonArgs.push("--city", String(opts.city));
  if (opts.cities) pythonArgs.push("--cities", String(opts.cities));
  if (opts.categoriesFile) pythonArgs.push("--categories-file", String(opts.categoriesFile));
  if (opts.categories) pythonArgs.push("--categories", String(opts.categories));
  if (opts.max !== undefined && opts.max !== null) pythonArgs.push("--max", String(opts.max));
  if (opts.analyzeWebsites) pythonArgs.push("--analyze-websites");
  if (opts.showBrowser) pythonArgs.push("--show-browser");

  return new Promise((resolve, reject) => {
    const child = spawn("python", pythonArgs, {
      cwd: leadFinderDir,
      stdio: "inherit",
      env: process.env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`lead_finder failed with exit code ${code}`));
    });
  });
}

async function pipelineCommand(opts) {
  process.env.USE_JSON_LEADS = "true";

  const citySlug = slugify(opts.city);
  process.env.JSON_LEADS_CITY_SLUG = citySlug;
  if (opts.categories) {
    const allowed = String(opts.categories)
      .split(",")
      .map((c) => slugify(c))
      .filter(Boolean);
    if (allowed.length) {
      process.env.ANALYTICS_CATEGORY_FILTER = allowed.join(",");
      process.env.JSON_LEADS_CATEGORY_FILTER = allowed.join(",");
    }
  }

  await runLeadFinder({
    city: opts.city,
    categories: opts.categories,
    categoriesFile: opts.categoriesFile,
    max: opts.max,
    analyzeWebsites: !!opts.analyzeWebsites,
    showBrowser: !!opts.showBrowser
  });

  const countrySlug = resolveCountrySlugForCity(opts.city);
  if (countrySlug) {
    process.env.ANALYTICS_KEY_PREFIX = `${countrySlug}/${citySlug}/`;
    process.env.JSON_LEADS_COUNTRY_SLUG = countrySlug;
  }

  await runCommand({
    limit: opts.limit,
    id: opts.id,
    batch: opts.batch,
    dryRun: opts.dryRun,
    preview: opts.preview
  });
}

module.exports = { pipelineCommand, slugify, resolveCountrySlugForCity, runLeadFinder };

