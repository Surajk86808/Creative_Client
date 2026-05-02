const { initDB, resetShop } = require("../db");
const { readAllLeads, updateRow } = require("../excel");

async function resetCommand(opts) {
  const shopId = String(opts.id || "").trim();
  if (!shopId) throw new Error("reset requires --id SHOP_XXX");

  initDB();
  resetShop(shopId);

  try {
    const all = await readAllLeads({ includeAll: true });
    const hits = all.filter((b) => b.shop_id === shopId);
    for (const hit of hits) {
      // eslint-disable-next-line no-await-in-loop
      await updateRow(hit, "", "pending");
    }
  } catch {
    // ignore
  }

  console.log(`â„¹ï¸  Reset ${shopId}`);
}

module.exports = { resetCommand };

