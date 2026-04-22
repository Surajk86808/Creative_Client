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
    console.log("[info] --preview implies --dry-run (skipping deploy)");
  }

  let businesses;
  const useJsonLeads = process.env.USE_JSON_LEADS !== "false";
  if (useJsonLeads) {
    businesses = readReadyLeads();
    if (businesses.length === 0) {
      console.log("INFO: No JSON leads ready (analytics status=scraped). Falling back to Excel leads/");
      businesses = await readAllLeads();
    }
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
  for (const g of groups.values()) {
    tracker.markBuilding({ country: g.country, city: g.city, category: g.category });
  }
  console.log(`[info] Reading ${businesses.length} pending businesses from leads/`);
  if (businesses.length === 0) return;

  const excelLock = createMutex();
  const deployLock = createMutex();
  let lastDeployAt = 0;

  let server = null;
  if (preview) {
    server = await startPreviewServer(config.OUTPUT_DIR, 3000);
    console.log("[info] Preview server: http://127.0.0.1:3000/ (local only)");
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
        console.log(`[skip] [${idx}/${total}] ${shopName} - already deployed, skipping`);
        return { shopId, status: "skipped" };
      }
      console.log(`[build] [${idx}/${total}] Processing: ${shopName} (category: ${business.category || "n/a"})`);
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
      console.log("[info] Filling template via Groq...");
      const nestedOutputDir = business._country
        ? path.join(config.OUTPUT_DIR, business._country, business._city, business._category, shopId)
        : outputDirForLead(shopId, business.sourceRel || `${shopId}.xlsx`);
      const outputPath = await fillTemplate(template, business, { outputDir: nestedOutputDir });

      try {
        const pushRes = await maybePushAndCleanup(config.OUTPUT_DIR, outputPath, business);
        if (pushRes?.pushed) {
          console.log(`[push] Pushed generated code to GitHub (${pushRes.deletedLocal ? "deleted local copy" : "kept local copy"})`);
        }
      } catch (e) {
        console.log(`WARN: Output Git push failed (continuing): ${e && e.message ? e.message : e}`);
      }

      let url = null;
      if (dryRun) {
        console.log(`[info] Dry run: skipping deploy for ${shopId}`);
      } else {
        await deployLock.run(async () => {
          const now = Date.now();
          const wait = Math.max(0, 2000 - (now - lastDeployAt));
          if (wait) await sleep(wait);
          console.log("[info] Deploying to Vercel...");
          url = await deployToVercel(outputPath, shopId, template);
          lastDeployAt = Date.now();
        });
      }

      if (url) {
        markBuilt(shopId, template);
        markDeployed(shopId, template, url);
        await updateExcelRow(url, "deployed");
        console.log(`[ok] ${shopName} -> ${url}`);
        return { shopId, status: "deployed", url, groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null };
      }

      if (dryRun) {
        markBuilt(shopId, template);
        await updateExcelRow("", "built");
        console.log(`[ok] ${shopName} -> (generated locally at ${outputPath})`);
        return { shopId, status: "built", url: null, groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null };
      }

      markError(shopId, "Deploy failed");
      await updateExcelRow("", "error");
      console.log(`[error] ${shopName} - deploy failed`);
      return { shopId, status: "error", groupKey: business._country ? `${business._country}/${business._city}/${business._category}` : null };
    } catch (err) {
      markError(shopId, String(err && err.message ? err.message : err));
      try {
        await updateExcelRow("", "error");
      } catch {
        // ignore
      }
      logErrorToFile("Processing error", {
        shop_id: shopId,
        error: String(err && err.message ? err.message : err)
      });
      console.log(`[error] ${shopName} - error: ${err && err.message ? err.message : err}`);
      const groupKey = business._country ? `${business._country}/${business._city}/${business._category}` : null;
      if (groupKey) {
        tracker.markError({
          country: business._country,
          city: business._city,
          category: business._category,
          message: String(err && err.message ? err.message : err)
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
    for (const reportPath of written) console.log(`INFO: Report written: ${reportPath}`);
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
    tracker.markDeployed({
      country: g.country,
      city: g.city,
      category: g.category,
      deployedCount: summary.deployed,
      errorCount: summary.error
    });
  }
  if (server) {
    console.log("[info] Review dashboard still running at http://127.0.0.1:3000/ . Press Ctrl+C when you are finished reviewing.");
    return;
  }
  console.log("[info] Done");
}

module.exports = { runCommand };
