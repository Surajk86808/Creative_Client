const fs = require("fs");
const path = require("path");
const { config } = require("./config");

function isExcelFile(filePath) {
  return /\.xlsx$/i.test(filePath);
}

function listExcelFilesRecursive(rootDir) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && isExcelFile(entry.name)) files.push(full);
    }
  };
  walk(rootDir);
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function getLeadFiles(opts = {}) {
  const allowEmpty = !!opts.allowEmpty;
  if (!fs.existsSync(config.LEADS_DIR)) {
    throw new Error("No Excel files found in leads/ folder. Please add .xlsx files and retry.");
  }
  const files = listExcelFilesRecursive(config.LEADS_DIR);
  if (!files.length) {
    if (allowEmpty) return [];
    throw new Error("No Excel files found in leads/ folder. Please add .xlsx files and retry.");
  }
  return files.map((abs) => ({
    abs,
    rel: path.relative(config.LEADS_DIR, abs)
  }));
}

function outputPrefixFromLeadRel(leadRelPath) {
  const normalized = leadRelPath.split(/[\\/]+/).join(path.sep);
  const parsed = path.parse(normalized);
  const parts = parsed.dir ? parsed.dir.split(path.sep) : [];
  parts.push(parsed.name); // strip .xlsx
  return parts.filter(Boolean).join(path.sep);
}

function outputDirForLead(shopId, leadRelPath) {
  const prefix = outputPrefixFromLeadRel(leadRelPath);
  return path.join(config.OUTPUT_DIR, prefix, shopId);
}

module.exports = { getLeadFiles, outputPrefixFromLeadRel, outputDirForLead };
