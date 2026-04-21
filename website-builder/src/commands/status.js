const { initDB, getAllProcessed } = require("../db");
const { getStats } = require("../excel");

async function statusCommand() {
  initDB();
  const stats = await getStats();
  const rows = getAllProcessed();
  const done = rows.filter((r) => r.status === "done").length;
  const processing = rows.filter((r) => r.status === "processing").length;
  const error = rows.filter((r) => r.status === "error").length;
  console.log(`â„¹ï¸  Leads: total=${stats.total} done=${stats.done} pending=${stats.pending} error=${stats.error}`);
  console.log(`â„¹ï¸  DB: done=${done} processing=${processing} error=${error}`);
}

module.exports = { statusCommand };

