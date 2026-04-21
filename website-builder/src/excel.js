const ExcelJS = require("exceljs");
const crypto = require("crypto");
const { sleep } = require("./utils");
const { getLeadFiles } = require("./leads");

function stableIdFromSeed(seed) {
  const hash = crypto.createHash("sha1").update(String(seed || "")).digest("hex").slice(0, 10).toUpperCase();
  return `SHOP_${hash}`;
}

function normalizeRow(r) {
  const placeId = String(r.place_id || r.placeId || "").trim();
  const mapsUrl = String(r.google_maps_url || r.googleMapsUrl || "").trim();
  const website = String(r.website || "").trim();

  return {
    shop_id: String(r.shop_id || r.shopId || "").trim() || (placeId ? stableIdFromSeed(placeId) : stableIdFromSeed(mapsUrl || website || JSON.stringify(r))),
    shop_name: String(r.shop_name || r.shopName || r.name || "").trim(),
    category: String(r.category || "").trim(),
    address: String(r.address || "").trim(),
    phone: String(r.phone || "").trim(),
    email: String(r.email || r.primary_email || r.primaryEmail || "").trim(),
    city: String(r.city || "").trim(),
    website_url: String(r.website_url || r.websiteUrl || r.website || "").trim(),
    status: String(r.status || "").trim().toLowerCase()
  };
}

function cellToString(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    if (typeof value.result === "string" || typeof value.result === "number") return String(value.result);
    if (value.richText && Array.isArray(value.richText)) {
      return value.richText.map((t) => t.text || "").join("");
    }
    if (typeof value.hyperlink === "string" && typeof value.text === "string") return value.text;
  }
  return String(value);
}

function headerKey(h) {
  return String(h || "").trim().toLowerCase();
}

function findCol(colByHeader, names) {
  for (const n of names) {
    const hit = colByHeader.get(headerKey(n));
    if (hit) return hit;
  }
  return null;
}

async function readExcelRows(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headersByCol = [];
  const colByHeader = new Map();
  for (let col = 1; col <= sheet.columnCount; col += 1) {
    const header = String(cellToString(headerRow.getCell(col).value) || "").trim();
    if (!header) continue;
    headersByCol[col] = header;
    colByHeader.set(headerKey(header), col);
  }

  // Ensure a stable shop_id column exists (many exports use place_id instead).
  const shopIdCol = findCol(colByHeader, ["shop_id", "shopId"]);
  if (!shopIdCol) {
    const placeIdCol = findCol(colByHeader, ["place_id", "placeId"]);
    const mapsUrlCol = findCol(colByHeader, ["google_maps_url", "googleMapsUrl"]);
    const websiteCol = findCol(colByHeader, ["website"]);

    const newShopIdCol = sheet.columnCount + 1;
    headerRow.getCell(newShopIdCol).value = "shop_id";

    for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
      const row = sheet.getRow(rowIndex);
      const placeId = placeIdCol ? cellToString(row.getCell(placeIdCol).value) : "";
      const mapsUrl = mapsUrlCol ? cellToString(row.getCell(mapsUrlCol).value) : "";
      const website = websiteCol ? cellToString(row.getCell(websiteCol).value) : "";
      row.getCell(newShopIdCol).value = stableIdFromSeed(placeId || mapsUrl || website || `${filePath}#${rowIndex}`);
    }

    // Persist so later updates (status/url) can locate the correct row.
    await workbook.xlsx.writeFile(filePath);

    headersByCol[newShopIdCol] = "shop_id";
    colByHeader.set("shop_id", newShopIdCol);
  }

  const rows = [];
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    const obj = {};
    for (let col = 1; col <= sheet.columnCount; col += 1) {
      const header = headersByCol[col];
      if (!header) continue;
      obj[header] = cellToString(row.getCell(col).value);
    }
    rows.push(obj);
  }

  return rows.map(normalizeRow).filter((b) => b.shop_id);
}

async function readAllLeads(opts = {}) {
  const includeAll = !!opts.includeAll;
  const leadFiles = getLeadFiles();
  const out = [];
  for (const file of leadFiles) {
    // eslint-disable-next-line no-await-in-loop
    const rows = (await readExcelRows(file.abs)).map((b) => ({
      ...b,
      sourceFile: file.abs,
      sourceRel: file.rel
    }));
    for (const b of rows) {
      if (!includeAll) {
        if (b.status === "done") continue;
        if (b.website_url) continue;
      }
      out.push(b);
    }
  }
  return out;
}

async function updateRow(leadRow, url, status) {
  const filePath = leadRow.sourceFile;
  const shopId = leadRow.shop_id;

  const attemptWrite = async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error(`No sheets in Excel: ${filePath}`);

    const headerRow = sheet.getRow(1);
    const colByHeader = new Map();
    for (let col = 1; col <= sheet.columnCount; col += 1) {
      const key = headerKey(cellToString(headerRow.getCell(col).value));
      if (key) colByHeader.set(key, col);
    }

    let shopIdCol = colByHeader.get("shop_id") || colByHeader.get("shopid");
    if (!shopIdCol) {
      throw new Error("Missing required column in Excel: shop_id");
    }

    let websiteUrlCol = colByHeader.get("website_url") || colByHeader.get("websiteurl");
    if (!websiteUrlCol) {
      websiteUrlCol = sheet.columnCount + 1;
      headerRow.getCell(websiteUrlCol).value = "website_url";
      colByHeader.set("website_url", websiteUrlCol);
    }

    let statusCol = colByHeader.get("status");
    if (!statusCol) {
      statusCol = Math.max(sheet.columnCount, websiteUrlCol) + 1;
      headerRow.getCell(statusCol).value = "status";
      colByHeader.set("status", statusCol);
    }

    let found = false;
    for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
      const row = sheet.getRow(rowIndex);
      const id = String(cellToString(row.getCell(shopIdCol).value) || "").trim();
      if (id === shopId) {
        found = true;
        row.getCell(websiteUrlCol).value = url || "";
        if (status) row.getCell(statusCol).value = status;
        break;
      }
    }

    if (!found) throw new Error(`shop_id not found in Excel: ${shopId}`);

    await workbook.xlsx.writeFile(filePath);
  };

  try {
    await attemptWrite();
  } catch (err) {
    const code = err && err.code;
    if (code === "EBUSY" || code === "EPERM" || /busy|permission/i.test(String(err.message))) {
      await sleep(3000);
      await attemptWrite();
      return;
    }
    throw err;
  }
}

async function getStats() {
  const rows = await readAllLeads({ includeAll: true });
  let done = 0;
  let pending = 0;
  let error = 0;
  for (const r of rows) {
    const status = String(r.status || "").trim().toLowerCase();
    if (status === "done") done += 1;
    else if (status === "error") error += 1;
    else pending += 1;
  }
  return { total: rows.length, done, pending, error };
}

module.exports = { readAllLeads, updateRow, getStats };
