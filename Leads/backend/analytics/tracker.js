const fs = require("fs");
const path = require("path");

const ANALYTICS_DIR = path.resolve(__dirname);
const INDEX_FILE = path.join(ANALYTICS_DIR, "index.json");
const INDEX_FILE_TMP = `${INDEX_FILE}.tmp`;
const VALID_STATUSES = new Set([
  "scraped",
  "building",
  "built",
  "deployed",
  "done",
  "error",
  "rejected"
]);
const BLOCKED_BUILD_STATUSES = new Set(["building", "built", "deployed", "done"]);

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getBuildStatus(entry) {
  if (!entry || typeof entry !== "object") return "";
  return normalizeStatus(entry.build_status || entry.buildStatus || entry.status);
}

function load() {
  if (!fs.existsSync(INDEX_FILE)) return {};
  return JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
}

function save(data) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  fs.writeFileSync(INDEX_FILE_TMP, JSON.stringify(data, null, 2) + "\n", "utf8");
  if (fs.existsSync(INDEX_FILE)) {
    fs.rmSync(INDEX_FILE, { force: true });
  }
  fs.renameSync(INDEX_FILE_TMP, INDEX_FILE);
}

function makeKey(country, city, category) {
  return `${country}/${city}/${category}`;
}

function validateEntry(entry) {
  const required = ["key", "country", "city", "category", "scraped_at", "lead_count", "leads_file"];
  for (const field of required) {
    if (entry[field] === undefined || entry[field] === null) {
      throw new Error(`analytics/tracker: missing required field "${field}" in entry`);
    }
  }
  if (typeof entry.lead_count !== "number") {
    throw new Error(`analytics/tracker: lead_count must be a number, got ${typeof entry.lead_count}`);
  }
  if (!VALID_STATUSES.has(entry.status)) {
    throw new Error(`analytics/tracker: invalid status "${entry.status}"`);
  }
  if (entry.build_status !== undefined && !VALID_STATUSES.has(entry.build_status)) {
    throw new Error(`analytics/tracker: invalid build_status "${entry.build_status}"`);
  }
}

function markScraped({ country, city, category, leadCount, leadsFile }) {
  const data = load();
  const key = makeKey(country, city, category);
  const entry = {
    key,
    country,
    city,
    category,
    scraped_at: new Date().toISOString(),
    lead_count: leadCount,
    leads_file: leadsFile,
    build_started_at: null,
    build_completed_at: null,
    built_count: 0,
    deployed_count: 0,
    error_count: 0,
    last_error_at: null,
    last_error: null,
    build_status: "scraped",
    status: "scraped"
  };
  validateEntry(entry);
  data[key] = entry;
  save(data);
}

function markBuilding({ country, city, category }) {
  const data = load();
  const key = makeKey(country, city, category);
  if (!data[key]) return;
  data[key].build_started_at = new Date().toISOString();
  data[key].build_status = "building";
  data[key].status = "building";
  save(data);
}

function markBuilt({ country, city, category, builtCount, errorCount = 0 }) {
  const data = load();
  const key = makeKey(country, city, category);
  if (!data[key]) return;
  const nextBuiltCount = Number(builtCount || 0);
  const nextErrorCount = Number(errorCount || 0);
  data[key].build_completed_at = new Date().toISOString();
  data[key].built_count = nextBuiltCount;
  data[key].error_count = nextErrorCount;
  data[key].build_status = "done";
  data[key].status = "done";
  save(data);
}

function markDone(payload) {
  markBuilt(payload);
}

function markDeployed({ country, city, category, deployedCount, errorCount = 0 }) {
  const data = load();
  const key = makeKey(country, city, category);
  if (!data[key]) return;
  data[key].deployed_count = deployedCount;
  data[key].error_count = errorCount;
  if (deployedCount > 0) {
    data[key].build_status = "deployed";
    data[key].status = "deployed";
  } else if (data[key].built_count > 0) {
    data[key].build_status = "built";
    data[key].status = "built";
  } else if (errorCount > 0) {
    data[key].build_status = "error";
    data[key].status = "error";
  }
  save(data);
}

function markError({ country, city, category, message }) {
  const data = load();
  const key = makeKey(country, city, category);
  if (!data[key]) return;
  data[key].build_status = "error";
  data[key].status = "error";
  data[key].error_count = Number(data[key].error_count || 0) + 1;
  data[key].last_error_at = new Date().toISOString();
  data[key].last_error = String(message || "");
  save(data);
}

function getReadyToBuild() {
  const data = load();
  return Object.values(data).filter((entry) => {
    const status = normalizeStatus(entry && entry.status);
    const buildStatus = getBuildStatus(entry);
    return status === "scraped" && !BLOCKED_BUILD_STATUSES.has(buildStatus);
  });
}

function getAll() {
  return Object.values(load());
}

function runCli() {
  const command = process.argv[2];
  const payload = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  if (command === "mark-scraped") {
    markScraped(payload);
    return;
  }
  if (command === "mark-building") {
    markBuilding(payload);
    return;
  }
  if (command === "mark-built") {
    markBuilt(payload);
    return;
  }
  if (command === "mark-done") {
    markDone(payload);
    return;
  }
  if (command === "mark-deployed") {
    markDeployed(payload);
    return;
  }
  if (command === "mark-error") {
    markError(payload);
    return;
  }
  if (command === "get-ready") {
    process.stdout.write(JSON.stringify(getReadyToBuild(), null, 2));
    return;
  }
  if (command === "get-all") {
    process.stdout.write(JSON.stringify(getAll(), null, 2));
    return;
  }
  if (command) {
    throw new Error(`Unknown tracker command: ${command}`);
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  validateEntry,
  markScraped,
  markBuilding,
  markBuilt,
  markDone,
  markDeployed,
  markError,
  getReadyToBuild,
  getAll,
  makeKey,
  getBuildStatus
};
