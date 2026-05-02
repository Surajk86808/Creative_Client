const { initDB, getAllProcessed } = require("../db");
const { readAllLeads } = require("../excel");
const { matchTemplate } = require("../matcher");

async function reportCommand() {
  initDB();
  const rows = getAllProcessed().filter((r) => r.status === "deployed" || r.status === "built");
  const byTemplate = new Map();
  for (const r of rows) {
    const key = r.template_used || "unknown";
    byTemplate.set(key, (byTemplate.get(key) || 0) + 1);
  }
  const sorted = [...byTemplate.entries()].sort((a, b) => b[1] - a[1]);
  console.log("[info] Template usage (DB):");
  for (const [tpl, count] of sorted) console.log(`  - ${tpl}: ${count}`);

  try {
    const all = await readAllLeads({ includeAll: true });
    const categories = all.map((b) => b.category).filter(Boolean);
    const noMatch = new Map();
    for (const c of categories) {
      const { score } = matchTemplate(c, { silent: true });
      if (score === 0) noMatch.set(c, (noMatch.get(c) || 0) + 1);
    }
    const top = [...noMatch.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    if (top.length) {
      console.log("[info] Categories with no keyword match (top 20):");
      for (const [c, count] of top) console.log(`  - ${c}: ${count}`);
    }
  } catch {
    // ignore
  }
}

module.exports = { reportCommand };
