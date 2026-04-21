const Database = require("better-sqlite3");
const { config } = require("./config");
const { ensureDir } = require("./utils");

let db;

function initDB() {
  ensureDir(require("path").dirname(config.DB_FILE));
  db = new Database(config.DB_FILE);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS processed_shops (
      shop_id TEXT PRIMARY KEY,
      shop_name TEXT,
      template_used TEXT,
      vercel_url TEXT,
      deployed_at DATETIME,
      status TEXT,
      error_msg TEXT
    );
  `);
  return db;
}

function isProcessed(shopId) {
  const row = db.prepare("SELECT status FROM processed_shops WHERE shop_id = ?").get(shopId);
  return row && row.status === "done";
}

function markProcessing(shopId, shopName) {
  const stmt = db.prepare(`
    INSERT INTO processed_shops (shop_id, shop_name, status, deployed_at)
    VALUES (?, ?, 'processing', datetime('now'))
    ON CONFLICT(shop_id) DO UPDATE SET
      shop_name=excluded.shop_name,
      status='processing',
      deployed_at=datetime('now'),
      error_msg=NULL
  `);
  stmt.run(shopId, shopName || "");
}

function markDone(shopId, templateUsed, vercelUrl) {
  db.prepare(
    `UPDATE processed_shops SET status='done', template_used=?, vercel_url=?, deployed_at=datetime('now'), error_msg=NULL WHERE shop_id=?`
  ).run(templateUsed || "", vercelUrl || "", shopId);
}

function markDryRun(shopId, templateUsed) {
  db.prepare(
    `UPDATE processed_shops SET status='dry-run', template_used=?, vercel_url='', deployed_at=datetime('now'), error_msg=NULL WHERE shop_id=?`
  ).run(templateUsed || "", shopId);
}

function markError(shopId, errorMsg) {
  db.prepare(`UPDATE processed_shops SET status='error', error_msg=? WHERE shop_id=?`).run(
    String(errorMsg || ""),
    shopId
  );
}

function resetShop(shopId) {
  db.prepare("DELETE FROM processed_shops WHERE shop_id=?").run(shopId);
}

function getAllProcessed() {
  return db.prepare("SELECT * FROM processed_shops ORDER BY deployed_at DESC").all();
}

function getProcessed(shopId) {
  return db.prepare("SELECT * FROM processed_shops WHERE shop_id = ?").get(shopId);
}

module.exports = {
  initDB,
  isProcessed,
  markProcessing,
  markDone,
  markDryRun,
  markError,
  resetShop,
  getAllProcessed,
  getProcessed
};
