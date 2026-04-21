const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const ROOT_DIR = process.cwd();

const config = {
  ROOT_DIR,
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  VERCEL_TOKEN: process.env.VERCEL_TOKEN || "",
  DB_FILE: path.resolve(ROOT_DIR, process.env.DB_FILE || "./data/db.sqlite"),
  OUTPUT_DIR: path.resolve(ROOT_DIR, process.env.OUTPUT_DIR || "./output"),
  WEBSITES_DIR: path.resolve(ROOT_DIR, process.env.WEBSITES_DIR || "./global-website"),
  LEADS_DIR: path.resolve(ROOT_DIR, process.env.LEADS_DIR || "./leads"),
  CATEGORY_MAP_FILE: path.resolve(ROOT_DIR, "./category-map.json"),
  ERRORS_LOG: path.resolve(ROOT_DIR, "./errors.log"),
  requiredEnv
};

module.exports = { config };
