const { initDB, getAllProcessed } = require("../db");
const { getStats } = require("../excel");

async function statusCommand() {
  initDB();
  const stats = await getStats();
  const rows = getAllProcessed();
  const deployed = rows.filter((r) => r.status === "deployed").length;
  const built = rows.filter((r) => r.status === "built").length;
  const processing = rows.filter((r) => r.status === "processing").length;
  const error = rows.filter((r) => r.status === "error").length;
  console.log(`[info] Leads: total=${stats.total} deployed=${stats.deployed} built=${stats.built} pending=${stats.pending} error=${stats.error}`);
  console.log(`[info] DB: deployed=${deployed} built=${built} processing=${processing} error=${error}`);
}

module.exports = { statusCommand };
