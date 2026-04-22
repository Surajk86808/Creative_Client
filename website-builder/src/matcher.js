const fs = require("fs");
const { config } = require("./config");

function normalizeTemplates(obj) {
  const templates = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (Array.isArray(value)) {
      templates[key] = { keywords: value, dir: key };
      continue;
    }

    if (value && typeof value === "object") {
      const keywords = Array.isArray(value.keywords) ? value.keywords : [];
      const dir = String(value.dir || value.templateDir || value.template || key);
      templates[key] = { ...value, keywords, dir };
      continue;
    }

    templates[key] = { keywords: [], dir: key };
  }
  return templates;
}

function loadCategoryMap() {
  const raw = fs.readFileSync(config.CATEGORY_MAP_FILE, "utf8");
  const parsed = JSON.parse(raw);

  if (parsed.keywords && typeof parsed.keywords === "object") {
    const templates = normalizeTemplates(parsed.keywords);
    const fallbackKey = parsed.fallback || "general-business";
    const fallbackDir = templates[fallbackKey]?.dir || String(fallbackKey);
    return { templates, fallbackDir };
  }
  if (parsed.templates && typeof parsed.templates === "object") {
    const templates = normalizeTemplates(parsed.templates);
    const fallbackKey = parsed.fallback || "general-business";
    const fallbackDir = templates[fallbackKey]?.dir || String(fallbackKey);
    return { templates, fallbackDir };
  }
  throw new Error("Invalid category-map.json (expected 'keywords' or 'templates').");
}

let cached;
function getMap() {
  if (!cached) cached = loadCategoryMap();
  return cached;
}

function resetCache() {
  cached = undefined;
}

function matchTemplate(categoryString, opts = {}) {
  const { templates, fallbackDir } = getMap();
  const input = String(categoryString || "").toLowerCase();
  if (!input.trim()) {
    if (!opts.silent) console.log(`[info] Matched template: ${fallbackDir} (score: 0) [no category]`);
    return { template: fallbackDir, score: 0 };
  }

  let best = { template: fallbackDir, score: 0, priority: -1 };

  for (const [templateKey, cfg] of Object.entries(templates)) {
    const templateDir = String(cfg?.dir || templateKey);
    const list = Array.isArray(cfg?.keywords) ? cfg.keywords : [];
    const priority = Number(cfg?.priority || 0);
    let score = 0;
    for (const kw of list || []) {
      const needle = String(kw || "").toLowerCase().trim();
      if (!needle) continue;
      if (input.includes(needle)) score += 1;
    }
    if (score > best.score) best = { template: templateDir, score, priority };
    else if (score > 0 && score === best.score && priority > best.priority) {
      best = { template: templateDir, score, priority };
    }
  }

  if (!opts.silent) console.log(`[info] Matched template: ${best.template} (score: ${best.score})`);
  return { template: best.template, score: best.score };
}

module.exports = { matchTemplate, getMap, resetCache };
