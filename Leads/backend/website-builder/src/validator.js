const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { getMap } = require("./matcher");

function hasEntrypoint(templateDir) {
  const indexHtml = path.join(templateDir, "index.html");
  const pkg = path.join(templateDir, "package.json");
  return fs.existsSync(indexHtml) || fs.existsSync(pkg);
}

function validateTemplates() {
  if (!fs.existsSync(config.WEBSITES_DIR)) {
    throw new Error(`Templates folder not found: ${config.WEBSITES_DIR} (set WEBSITES_DIR in .env)`);
  }

  const { templates, fallbackDir } = getMap();
  const dirs = new Set([fallbackDir, ...Object.values(templates).map((t) => String(t?.dir || ""))].filter(Boolean));

  const missing = [];
  const invalid = [];

  for (const dir of dirs) {
    const abs = path.join(config.WEBSITES_DIR, dir);
    if (!fs.existsSync(abs)) {
      missing.push(dir);
      continue;
    }
    if (!hasEntrypoint(abs)) invalid.push(dir);
  }

  if (missing.length) {
    throw new Error(
      `Missing template folder(s) under ${config.WEBSITES_DIR}: ${missing.join(", ")}`
    );
  }
  if (invalid.length) {
    throw new Error(
      `Template folder(s) missing index.html or package.json under ${config.WEBSITES_DIR}: ${invalid.join(", ")}`
    );
  }
}

module.exports = { validateTemplates };

