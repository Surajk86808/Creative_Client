const fs = require("fs");
const path = require("path");
const { config } = require("../config");
const { initDB, isProcessed, markProcessing, markBuilt, markDeployed, markError } = require("../db");
const { readAllLeads, updateRow } = require("../excel");
const { readReadyLeads } = require("../leads_json");
const { matchTemplate } = require("../matcher");
const { fillTemplate } = require("../filler");
const { deployToVercel } = require("../deployer");
const { validateTemplates } = require("../validator");
const { sleep, ensureDir, chunkArray, createMutex } = require("../utils");
const { logErrorToFile } = require("../logger");
const { startPreviewServer } = require("../preview");
const { outputDirForLead } = require("../leads");
const { exportReports } = require("../exporter");
const { maybePushAndCleanup } = require("../output_git");
const tracker = require("../../../analytics/tracker");
const PIPELINE_LOG_STRUCTURED = String(process.env.PIPELINE_LOG_FORMAT || "").trim().toLowerCase() === "structured";

function emitPipelineEvent(entity, label, status, detail = "") {
  if (!PIPELINE_LOG_STRUCTURED) return false;
  const payload = { stage: "build", entity, label, status };
  if (detail) payload.detail = detail;
  console.log(`PIPELINE_EVENT: ${JSON.stringify(payload)}`);
  return true;
}

function emitSiteEvent(business, status, detail = "") {
  const shopId = String((business && business.shop_id) || "").trim() || "unknown";
  return emitPipelineEvent("site", shopId, status, detail);
}

function normalizeLeadText(value) {
  return String(value || "").trim().toLowerCase();
}

function leadOutputId(business) {
  const placeId = String(business.place_id || "").trim();
  return placeId || String(business.shop_id || "").trim();
}

function leadRowMatchesBusiness(row, business) {
  if (!row || typeof row !== "object") return false;

  const businessPlaceId = String(business.place_id || "").trim();
  const rowPlaceId = String(row.place_id || "").trim();
  if (businessPlaceId && rowPlaceId && businessPlaceId === rowPlaceId) return true;

  return (
    normalizeLeadText(row.name || row.shop_name) === normalizeLeadText(business.shop_name)
    && String(row.phone || row.phone_number || "").trim() === String(business.phone || "").trim()
    && normalizeLeadText(row.category) === normalizeLeadText(business.category)
  );
}

async function writeDeployedUrlToLeadRow(leadFileLock, business, deployedUrl) {
  const sourceFile = String(business._sourceFile || "").trim();
  if (!sourceFile || !deployedUrl) return false;

  return leadFileLock.run(async () => {
    if (!fs.existsSync(sourceFile)) return false;

    const raw = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
    if (!Array.isArray(raw)) return false;

    const rowIndex = raw.findIndex((row) => leadRowMatchesBusiness(row, business));
    if (rowIndex < 0) return false;

    raw[rowIndex] = {
      ...raw[rowIndex],
      deployed_url: String(deployedUrl),
      generated_website: String(deployedUrl)
    };
    fs.writeFileSync(sourceFile, JSON.stringify(raw, null, 2), "utf8");
    return true;
  });
}

async function runCommand(opts) {
  ensureDir(path.dirname(config.DB_FILE));
  ensureDir(config.OUTPUT_DIR);

  validateTemplates();
  initDB();

  const limit = opts.limit ? Number(opts.limit) : null;
  const onlyId = opts.id ? String(opts.id).trim() : null;
  let dryRun = !!opts.dryRun;
  const batch = Math.max(1, Number(opts.batch || 1));
  const preview = !!opts.preview;
  if (preview && !dryRun) {
    dryRun = true;
    if (!PIPELINE_LOG_STRUCTURED) console.log("[info] --preview implies --dry-run (skipping deploy)");
  }

  let businesses;
  const useJsonLeads = process.env.USE_JSON_LEADS !== "false";
  if (useJsonLeads) {
    businesses = readReadyLeads();
  } else {
    businesses = await readAllLeads();
  }
  if (onlyId) businesses = businesses.filter((b) => b.shop_id === onlyId);
  if (limit) businesses = businesses.slice(0, limit);

  const groups = new Map();
  for (const b of businesses) {
    if (b._country && b._city && b._category) {
      const key = `${b._country}/${b._city}/${b._category}`;
      if (!groups.has(key)) {
        groups.set(key, { country: b._country, city: b._city, category: b._category, count: 0 });
      }
      groups.get(key).count += 1;
    }
  }
  if (!PIPELINE_LOG_STRUCTURED) console.log(`[info] Reading ${businesses.length} pending businesses from leads/`);
  if (businesses.length === 0) {
    console.log("PIPELINE_STAT: sites_built=0");
    console.log("PIPELINE_STAT: sites_deployed=0");
    return;
  }

  const excelLock = createMutex();
  const deployLock = createMutex();
  const leadFileLock = createMutex();
  let lastDeployAt = 0;

  let server = null;
  if (preview) {
    server = await startPreviewServer(config.OUTPUT_DIR, 3000);
    if (!PIPELINE_LOG_STRUCTURED) console.log("[info] Preview server: http://127.0.0.1:3000/ (local only)");
  }

  const processOne = async (business, idx, total) => {
    const shopId = business.shop_id;
    const shopName = business.shop_name;
    const updateExcelRow = async (url, status) => {
      if (business.sourceFile) {
        await excelLock.run(() => updateRow(business, url || "", status));
      }
    };
    try {
      if (isProcessed(shopId)) {
        if (!emitSiteEvent(business, "SKIPPED", "already deployed")) {
          console.log(`[skip] [${idx}/${total}] ${shopName} - already deployed, skipping`);
        }
        return {
          shopId,
          status: "deployed",
          groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null
        };
      }
      if (!emitSiteEvent(business, "TEMPLATE_FILL")) {
        console.log(`[build] [${idx}/${total}] Processing: ${shopName} (category: ${business.category || "n/a"})`);
      }
      markProcessing(shopId, shopName);
      await updateExcelRow("", "processing");

      const { template, score } = matchTemplate(business.category);
      if (score === 0) {
        logErrorToFile("Category had no keyword match (fallback used)", {
          shop_id: shopId,
          category: business.category,
          template_used: template
        });
      }
      if (!PIPELINE_LOG_STRUCTURED) console.log("[info] Filling template via Groq...");
      const nestedOutputDir = business._country
        ? path.join(config.OUTPUT_DIR, business._country, business._city, business._category, leadOutputId(business))
        : outputDirForLead(shopId, business.sourceRel || `${shopId}.xlsx`);
      const outputPath = await fillTemplate(template, business, { outputDir: nestedOutputDir });
      emitSiteEvent(business, "PLACEHOLDER_CHECK");

      try {
        const pushRes = await maybePushAndCleanup(config.OUTPUT_DIR, outputPath, business);
        if (pushRes?.pushed) {
          if (!PIPELINE_LOG_STRUCTURED) {
            console.log(`[push] Pushed generated code to GitHub (${pushRes.deletedLocal ? "deleted local copy" : "kept local copy"})`);
          }
        }
      } catch (e) {
        console.log(`WARN: Output Git push failed (continuing): ${e && e.message ? e.message : e}`);
      }

      let url = null;
      if (dryRun) {
        if (!PIPELINE_LOG_STRUCTURED) console.log(`[info] Dry run: skipping deploy for ${shopId}`);
      } else {
        await deployLock.run(async () => {
          const now = Date.now();
          const wait = Math.max(0, 2000 - (now - lastDeployAt));
          if (wait) await sleep(wait);
          if (!PIPELINE_LOG_STRUCTURED) console.log("[info] Deploying to Vercel...");
          url = await deployToVercel(outputPath, shopId, template);
          lastDeployAt = Date.now();
        });
      }

      if (url) {
        markBuilt(shopId, template);
        markDeployed(shopId, template, url);
        await writeDeployedUrlToLeadRow(leadFileLock, business, url);
        await updateExcelRow(url, "deployed");
        emitSiteEvent(business, "DEPLOYED");
        emitSiteEvent(business, "EXCEL_UPDATED");
        if (!PIPELINE_LOG_STRUCTURED) console.log(`[ok] ${shopName} -> ${url}`);
        return { shopId, status: "deployed", url, groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null };
      }

      if (dryRun) {
        markBuilt(shopId, template);
        await updateExcelRow("", "built");
        emitSiteEvent(business, "BUILT");
        emitSiteEvent(business, "EXCEL_UPDATED");
        if (!PIPELINE_LOG_STRUCTURED) console.log(`[ok] ${shopName} -> (generated locally at ${outputPath})`);
        return { shopId, status: "built", url: null, groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null };
      }

      markError(shopId, "Deploy failed");
      await updateExcelRow("", "error");
      emitSiteEvent(business, "FAILED", "deploy failed");
      if (!PIPELINE_LOG_STRUCTURED) console.log(`[error] ${shopName} - deploy failed`);
      return { shopId, status: "error", groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null };
    } catch (err) {
      const errorMessage = String(err && err.message ? err.message : err);
      if (errorMessage.toLowerCase().includes("unresolved placeholders remain")) {
        const pendingDetail = errorMessage
          .replace(/^Template fill failed for [^:]+:\s*/i, "")
          .replace(/^unresolved placeholders remain\s*/i, "")
          .replace(/^\((.*)\)$/, "$1");
        emitSiteEvent(business, "PLACEHOLDERS_PENDING", pendingDetail || "unreplaced placeholders");
      }
      emitSiteEvent(business, "FAILED", errorMessage);
      markError(shopId, String(err && err.message ? err.message : err));
      try {
        await updateExcelRow("", "error");
      } catch {
        // ignore
      }
      logErrorToFile("Processing error", {
        shop_id: shopId,
        error: errorMessage
      });
      if (!PIPELINE_LOG_STRUCTURED) console.log(`[error] ${shopName} - error: ${errorMessage}`);
      const groupKey = business._country ? `${business._country}/${business._city}/${business._category}` : null;
      if (groupKey) {
        tracker.markError({
          country: business._country,
          city: business._city,
          category: business._category,
          message: errorMessage
        });
      }
      return { shopId, status: "error", groupKey };
    }
  };

  const chunks = chunkArray(businesses, batch);
  let processed = 0;
  const groupResults = new Map();
  for (const group of chunks) {
    const total = businesses.length;
    const settled = await Promise.allSettled(group.map((b, i) => processOne(b, processed + i + 1, total)));
    processed += group.length;
    for (const s of settled) {
      if (s.status === "rejected") {
        logErrorToFile("Unhandled promise rejection in batch", { error: String(s.reason) });
      } else {
        const result = s.value;
        if (!result || !result.groupKey) continue;
        if (!groupResults.has(result.groupKey)) {
          groupResults.set(result.groupKey, { built: 0, deployed: 0, error: 0 });
        }
        const summary = groupResults.get(result.groupKey);
        if (result.status === "built" || result.status === "deployed") summary.built += 1;
        if (result.status === "deployed") summary.deployed += 1;
        if (result.status === "error") summary.error += 1;
      }
    }
  }

  try {
    const written = await exportReports(businesses);
    if (!PIPELINE_LOG_STRUCTURED) {
      for (const reportPath of written) console.log(`INFO: Report written: ${reportPath}`);
    }
  } catch (err) {
    console.log(`WARN: Report export failed: ${err && err.message ? err.message : err}`);
  }
  for (const g of groups.values()) {
    const key = `${g.country}/${g.city}/${g.category}`;
    const summary = groupResults.get(key) || { built: 0, deployed: 0, error: 0 };
    tracker.markBuilt({
      country: g.country,
      city: g.city,
      category: g.category,
      builtCount: summary.built,
      errorCount: summary.error
    });
  }
  const totals = [...groupResults.values()].reduce(
    (acc, summary) => ({
      built: acc.built + Number(summary.built || 0),
      deployed: acc.deployed + Number(summary.deployed || 0)
    }),
    { built: 0, deployed: 0 }
  );
  console.log(`PIPELINE_STAT: sites_built=${totals.built}`);
  console.log(`PIPELINE_STAT: sites_deployed=${totals.deployed}`);
  if (server) {
    if (!PIPELINE_LOG_STRUCTURED) {
      console.log("[info] Review dashboard still running at http://127.0.0.1:3000/ . Press Ctrl+C when you are finished reviewing.");
    }
    return;
  }
  if (!PIPELINE_LOG_STRUCTURED) console.log("[info] Done");
}

module.exports = { runCommand };
