const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { ensureDir } = require("./utils");

const DISPLAY_COLUMNS = [
  { header: "name", key: "name", width: 32 },
  { header: "category", key: "category", width: 20 },
  { header: "city", key: "city", width: 18 },
  { header: "country", key: "country", width: 18 },
  { header: "phone", key: "phone", width: 20 },
  { header: "email", key: "email", width: 30 },
  { header: "website", key: "website", width: 34 },
  { header: "score", key: "score", width: 12 },
  { header: "build_status", key: "build_status", width: 16 },
  { header: "website_url", key: "website_url", width: 34 },
  { header: "review_status", key: "review_status", width: 16 },
  { header: "whatsapp", key: "whatsapp", width: 14 },
  { header: "email_status", key: "email_status", width: 24 }
];
const INTERNAL_COLUMNS = [
  { header: "shop_id", key: "shop_id", width: 16 }
];
const BASE_HEADERS = [...DISPLAY_COLUMNS, ...INTERNAL_COLUMNS].map((column) => column.header);
const STATIC_HEADERS = new Set(["name", "category", "city", "country", "phone", "email", "website", "score", "shop_id"]);
const PRESERVED_HEADERS = new Set(["build_status", "website_url", "review_status", "whatsapp", "email_status"]);

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function resolveLeadEmail(lead) {
  const direct = safeText(lead && (lead.email || lead.primary_email));
  if (direct) return direct;
  if (Array.isArray(lead?.emails)) {
    const first = lead.emails.map((value) => safeText(value)).find(Boolean);
    if (first) return first;
  }
  return "";
}

function groupKeyForLead(lead) {
  if (lead && lead._country && lead._city && lead._category) {
    return `${lead._country}/${lead._city}/${lead._category}`;
  }
  return null;
}

function reportPathForGroupKey(key) {
  const parts = String(key || "").split("/").filter(Boolean);
  if (parts.length !== 3) return null;
  const [country, city, category] = parts;
  return path.join(config.OUTPUT_DIR, country, city, category, "leads.xlsx");
}

function resolveLeadWebsite(lead) {
  return safeText(lead && (lead.website || lead.website_url || lead.source_website));
}

function resolveLeadScore(lead) {
  if (!lead || typeof lead !== "object") return "";
  return safeText(lead.score ?? lead.lead_quality_score ?? "");
}

function normalizeHeader(value) {
  return safeText(value).trim().toLowerCase();
}

function extractHeaders(sheet) {
  const headers = [];
  for (let col = 1; col <= sheet.columnCount; col += 1) {
    const header = safeText(sheet.getRow(1).getCell(col).value).trim();
    if (!header) continue;
    headers.push(header);
  }
  return headers;
}

async function readExistingWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    return { headers: [], rowsByShopId: new Map(), orderedShopIds: [] };
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { headers: [], rowsByShopId: new Map(), orderedShopIds: [] };
  }

  const headers = extractHeaders(sheet);
  const headerIndex = new Map(headers.map((header, index) => [normalizeHeader(header), index + 1]));
  const shopIdCol = headerIndex.get("shop_id");
  const rowsByShopId = new Map();
  const orderedShopIds = [];

  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    const rowData = {};
    for (const header of headers) {
      const colIndex = headerIndex.get(normalizeHeader(header));
      rowData[header] = colIndex ? safeText(row.getCell(colIndex).value) : "";
    }

    const shopId = shopIdCol ? safeText(row.getCell(shopIdCol).value).trim() : "";
    if (!shopId) continue;
    rowData.shop_id = shopId;
    rowsByShopId.set(shopId, rowData);
    orderedShopIds.push(shopId);
  }

  return { headers, rowsByShopId, orderedShopIds };
}

function columnConfigForHeader(header) {
  const normalized = normalizeHeader(header);
  const configured = [...DISPLAY_COLUMNS, ...INTERNAL_COLUMNS].find(
    (column) => normalizeHeader(column.header) === normalized
  );
  if (configured) return configured;
  return { header, key: header, width: 24 };
}

function orderedHeaders(existingHeaders) {
  const baseHeaderKeys = new Set(BASE_HEADERS.map((header) => normalizeHeader(header)));
  const extras = existingHeaders.filter((header) => !baseHeaderKeys.has(normalizeHeader(header)));
  return [...BASE_HEADERS, ...extras];
}

function initialLeadRow(lead) {
  return {
    name: safeText(lead.shop_name || lead.name),
    category: safeText(lead._category || lead.category || ""),
    city: safeText(lead._city || lead.city || ""),
    country: safeText(lead._country || lead.country || ""),
    phone: safeText(lead.phone),
    email: resolveLeadEmail(lead),
    website: resolveLeadWebsite(lead),
    score: resolveLeadScore(lead),
    build_status: "built",
    website_url: "",
    review_status: "",
    whatsapp: "",
    email_status: "",
    shop_id: safeText(lead.shop_id)
  };
}

function mergeRow(existingRow, nextRow, headers) {
  const merged = {};

  for (const header of headers) {
    if (STATIC_HEADERS.has(header)) {
      merged[header] = nextRow[header] || existingRow[header] || "";
      continue;
    }
    if (PRESERVED_HEADERS.has(header)) {
      merged[header] = existingRow[header] ?? nextRow[header] ?? "";
      continue;
    }
    merged[header] = existingRow[header] ?? nextRow[header] ?? "";
  }

  merged.shop_id = nextRow.shop_id || existingRow.shop_id || "";
  return merged;
}

async function writeReportXlsx(filePath, leads) {
  const { headers: existingHeaders, rowsByShopId, orderedShopIds } = await readExistingWorkbook(filePath);
  const headers = orderedHeaders(existingHeaders);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("leads");

  sheet.columns = headers.map((header) => {
    const config = columnConfigForHeader(header);
    return {
      header,
      key: header,
      width: config.width
    };
  });

  const usedShopIds = new Set();
  for (const lead of leads) {
    const nextRow = initialLeadRow(lead);
    if (!nextRow.shop_id) continue;
    const existingRow = rowsByShopId.get(nextRow.shop_id) || {};
    sheet.addRow(mergeRow(existingRow, nextRow, headers));
    usedShopIds.add(nextRow.shop_id);
  }

  for (const shopId of orderedShopIds) {
    if (usedShopIds.has(shopId)) continue;
    const existingRow = rowsByShopId.get(shopId);
    if (!existingRow) continue;
    sheet.addRow(mergeRow(existingRow, { shop_id: shopId }, headers));
  }

  ensureDir(path.dirname(filePath));
  await workbook.xlsx.writeFile(filePath);
}

async function exportReports(leads) {
  const groups = new Map();
  for (const lead of leads) {
    const key = groupKeyForLead(lead);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(lead);
  }

  const written = [];
  for (const [key, items] of groups.entries()) {
    const outPath = reportPathForGroupKey(key);
    if (!outPath) continue;
    // Keep ordering stable.
    items.sort((a, b) => String(a.shop_name || "").localeCompare(String(b.shop_name || "")));
    // eslint-disable-next-line no-await-in-loop
    await writeReportXlsx(outPath, items);
    written.push(outPath);
  }

  // If there were no JSON-grouped leads, still write a single report.
  if (!written.length && Array.isArray(leads) && leads.length) {
    const fallback = path.join(config.OUTPUT_DIR, "leads.xlsx");
    await writeReportXlsx(fallback, leads);
    written.push(fallback);
  }

  return written;
}

module.exports = { exportReports };

