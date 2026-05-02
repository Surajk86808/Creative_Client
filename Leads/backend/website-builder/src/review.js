const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "build", "coverage"]);

function normalizeReviewStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return REVIEW_STATUSES.has(normalized) ? normalized : "pending";
}

function reviewMetaPathForSite(siteDir) {
  return path.join(siteDir, "_lead_meta.json");
}

function readLeadMeta(metaPath) {
  const raw = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  if (!raw || typeof raw !== "object") return null;
  return raw;
}

function readLeadMetaForSite(siteDir) {
  const metaPath = reviewMetaPathForSite(siteDir);
  if (!fs.existsSync(metaPath)) return null;
  try {
    return readLeadMeta(metaPath);
  } catch {
    return null;
  }
}

function writeLeadMeta(metaPath, payload) {
  fs.writeFileSync(metaPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function listReviewEntries(rootDir) {
  const entries = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
        continue;
      }
      if (!entry.isFile() || entry.name !== "_lead_meta.json") continue;
      const meta = readLeadMetaForSite(path.dirname(full));
      if (!meta) continue;
      const relativePath = path.relative(rootDir, path.dirname(full)).split(path.sep).join("/");
      entries.push({
        ...meta,
        relative_path: relativePath,
        review_status: normalizeReviewStatus(meta.review_status),
        review_notes: String(meta.review_notes || "")
      });
    }
  }

  walk(rootDir);
  entries.sort((a, b) => {
    const aKey = `${a.country || ""}/${a.city || ""}/${a.category || ""}/${a.shop_name || ""}`;
    const bKey = `${b.country || ""}/${b.city || ""}/${b.category || ""}/${b.shop_name || ""}`;
    return aKey.localeCompare(bKey);
  });
  return entries;
}

async function syncReviewToReport(rootDir, meta) {
  const country = String(meta.country || "").trim();
  const city = String(meta.city || "").trim();
  const category = String(meta.category || "").trim();
  const shopId = String(meta.shop_id || "").trim();
  if (!country || !city || !category || !shopId) return;

  const reportPath = path.join(rootDir, country, city, category, "leads.xlsx");
  if (!fs.existsSync(reportPath)) return;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(reportPath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return;

  const headerRow = sheet.getRow(1);
  const colByHeader = new Map();
  for (let col = 1; col <= sheet.columnCount; col += 1) {
    const key = String(headerRow.getCell(col).value || "").trim().toLowerCase();
    if (key) colByHeader.set(key, col);
  }

  const ensureColumn = (header) => {
    const existing = colByHeader.get(header);
    if (existing) return existing;
    const nextCol = sheet.columnCount + 1;
    headerRow.getCell(nextCol).value = header;
    colByHeader.set(header, nextCol);
    return nextCol;
  };

  const shopIdCol = ensureColumn("shop_id");
  const reviewStatusCol = ensureColumn("review_status");
  const reviewNotesCol = ensureColumn("review_notes");
  const previewPathCol = ensureColumn("preview_path");

  let updated = false;
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    const currentShopId = String(row.getCell(shopIdCol).value || "").trim();
    if (currentShopId !== shopId) continue;
    row.getCell(reviewStatusCol).value = normalizeReviewStatus(meta.review_status);
    row.getCell(reviewNotesCol).value = String(meta.review_notes || "");
    row.getCell(previewPathCol).value = String(meta.preview_path || "");
    updated = true;
    break;
  }

  if (updated) await workbook.xlsx.writeFile(reportPath);
}

async function updateReviewStatus(rootDir, relativePath, reviewStatus, notes = "") {
  const siteDir = path.resolve(rootDir, String(relativePath || ""));
  if (!siteDir.startsWith(path.resolve(rootDir))) {
    throw new Error("Invalid review path.");
  }
  const metaPath = reviewMetaPathForSite(siteDir);
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Review metadata not found for ${relativePath}`);
  }
  const meta = readLeadMeta(metaPath);
  meta.review_status = normalizeReviewStatus(reviewStatus);
  meta.review_notes = String(notes || "");
  meta.review_updated_at = new Date().toISOString();
  writeLeadMeta(metaPath, meta);
  await syncReviewToReport(rootDir, meta);
  return meta;
}

module.exports = {
  listReviewEntries,
  normalizeReviewStatus,
  readLeadMetaForSite,
  reviewMetaPathForSite,
  updateReviewStatus
};
