const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { ensureDir } = require("./utils");

let sqliteDb = null;
let fallbackStore = null;

function fallbackFilePath() {
  return `${config.DB_FILE}.json`;
}

function loadFallbackStore() {
  const filePath = fallbackFilePath();
  try {
    if (!fs.existsSync(filePath)) return { processed_shops: {} };
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { processed_shops: {} };
    if (!parsed.processed_shops || typeof parsed.processed_shops !== "object") {
      parsed.processed_shops = {};
    }
    return parsed;
  } catch {
    return { processed_shops: {} };
  }
}

function saveFallbackStore() {
  if (!fallbackStore) return;
  const filePath = fallbackFilePath();
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(fallbackStore, null, 2)}\n`, "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function initDB() {
  ensureDir(path.dirname(config.DB_FILE));
  try {
    const Database = require("better-sqlite3");
    sqliteDb = new Database(config.DB_FILE);
    sqliteDb.pragma("journal_mode = WAL");
    sqliteDb.exec(`
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
    fallbackStore = null;
    return sqliteDb;
  } catch {
    sqliteDb = null;
    fallbackStore = loadFallbackStore();
    return fallbackStore;
  }
}

function ensureInitialized() {
  if (!sqliteDb && !fallbackStore) initDB();
}

function fallbackRow(shopId) {
  ensureInitialized();
  return fallbackStore.processed_shops[String(shopId || "").trim()] || null;
}

function setFallbackRow(shopId, value) {
  ensureInitialized();
  fallbackStore.processed_shops[String(shopId || "").trim()] = value;
  saveFallbackStore();
}

function deleteFallbackRow(shopId) {
  ensureInitialized();
  delete fallbackStore.processed_shops[String(shopId || "").trim()];
  saveFallbackStore();
}

function isProcessed(shopId) {
  ensureInitialized();
  if (sqliteDb) {
    const row = sqliteDb.prepare("SELECT status FROM processed_shops WHERE shop_id = ?").get(shopId);
    return row && row.status === "deployed";
  }
  const row = fallbackRow(shopId);
  return Boolean(row && row.status === "deployed");
}

function markProcessing(shopId, shopName) {
  ensureInitialized();
  if (sqliteDb) {
    const stmt = sqliteDb.prepare(`
      INSERT INTO processed_shops (shop_id, shop_name, status, deployed_at)
      VALUES (?, ?, 'processing', datetime('now'))
      ON CONFLICT(shop_id) DO UPDATE SET
        shop_name=excluded.shop_name,
        status='processing',
        deployed_at=datetime('now'),
        error_msg=NULL
    `);
    stmt.run(shopId, shopName || "");
    return;
  }

  const existing = fallbackRow(shopId) || {};
  setFallbackRow(shopId, {
    ...existing,
    shop_id: shopId,
    shop_name: shopName || "",
    status: "processing",
    deployed_at: nowIso(),
    error_msg: null
  });
}

function markBuilt(shopId, templateUsed) {
  ensureInitialized();
  if (sqliteDb) {
    sqliteDb.prepare(
      `UPDATE processed_shops SET status='built', template_used=?, deployed_at=datetime('now'), error_msg=NULL WHERE shop_id=?`
    ).run(templateUsed || "", shopId);
    return;
  }

  const existing = fallbackRow(shopId) || {};
  setFallbackRow(shopId, {
    ...existing,
    shop_id: shopId,
    template_used: templateUsed || "",
    status: "built",
    deployed_at: nowIso(),
    error_msg: null
  });
}

function markDeployed(shopId, templateUsed, vercelUrl) {
  ensureInitialized();
  if (sqliteDb) {
    sqliteDb.prepare(
      `UPDATE processed_shops SET status='deployed', template_used=?, vercel_url=?, deployed_at=datetime('now'), error_msg=NULL WHERE shop_id=?`
    ).run(templateUsed || "", vercelUrl || "", shopId);
    return;
  }

  const existing = fallbackRow(shopId) || {};
  setFallbackRow(shopId, {
    ...existing,
    shop_id: shopId,
    template_used: templateUsed || "",
    vercel_url: vercelUrl || "",
    status: "deployed",
    deployed_at: nowIso(),
    error_msg: null
  });
}

function markError(shopId, errorMsg) {
  ensureInitialized();
  if (sqliteDb) {
    sqliteDb.prepare(`UPDATE processed_shops SET status='error', error_msg=? WHERE shop_id=?`).run(
      String(errorMsg || ""),
      shopId
    );
    return;
  }

  const existing = fallbackRow(shopId) || {};
  setFallbackRow(shopId, {
    ...existing,
    shop_id: shopId,
    status: "error",
    error_msg: String(errorMsg || "")
  });
}

function resetShop(shopId) {
  ensureInitialized();
  if (sqliteDb) {
    sqliteDb.prepare("DELETE FROM processed_shops WHERE shop_id=?").run(shopId);
    return;
  }
  deleteFallbackRow(shopId);
}

function getAllProcessed() {
  ensureInitialized();
  if (sqliteDb) {
    return sqliteDb.prepare("SELECT * FROM processed_shops ORDER BY deployed_at DESC").all();
  }
  return Object.values(fallbackStore.processed_shops).sort((a, b) => {
    const left = String(b?.deployed_at || "");
    const right = String(a?.deployed_at || "");
    return left.localeCompare(right);
  });
}

function getProcessed(shopId) {
  ensureInitialized();
  if (sqliteDb) {
    return sqliteDb.prepare("SELECT * FROM processed_shops WHERE shop_id = ?").get(shopId);
  }
  return fallbackRow(shopId);
}

module.exports = {
  initDB,
  isProcessed,
  markProcessing,
  markBuilt,
  markDeployed,
  markError,
  resetShop,
  getAllProcessed,
  getProcessed
};
