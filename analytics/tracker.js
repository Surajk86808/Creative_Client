const fs = require("fs");
const path = require("path");

const ANALYTICS_DIR = path.resolve(__dirname);
const INDEX_FILE = path.join(ANALYTICS_DIR, "index.json");

function load() {
  if (!fs.existsSync(INDEX_FILE)) return {};
  return JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
}

function save(data) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function makeKey(country, city, category) {
  return `${country}/${city}/${category}`;
}

function markScraped({ country, city, category, leadCount, leadsFile }) {
  const data = load();
  const key = makeKey(country, city, category);
  data[key] = {
    key,
    country,
    city,
    category,
    scraped_at: new Date().toISOString(),
    lead_count: leadCount,
    leads_file: leadsFile,
    build_started_at: data[key]?.build_started_at || null,
    build_completed_at: data[key]?.build_completed_at || null,
    built_count: data[key]?.built_count || 0,
    status: data[key]?.status === "done" ? "done" : "scraped"
  };
  save(data);
}

function markBuilding({ country, city, category }) {
  const data = load();
  const key = makeKey(country, city, category);
  if (!data[key]) return;
  data[key].build_started_at = new Date().toISOString();
  data[key].status = "building";
  save(data);
}

function markBuilt({ country, city, category, builtCount }) {
  const data = load();
  const key = makeKey(country, city, category);
  if (!data[key]) return;
  data[key].build_completed_at = new Date().toISOString();
  data[key].built_count = builtCount;
  data[key].status = "done";
  save(data);
}

function getReadyToBuild() {
  const data = load();
  return Object.values(data).filter((entry) => entry.status === "scraped");
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
  markScraped,
  markBuilding,
  markBuilt,
  getReadyToBuild,
  getAll,
  makeKey
};
