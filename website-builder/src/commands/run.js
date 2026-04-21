const path = require("path");
const { config } = require("../config");
const { initDB, isProcessed, markProcessing, markDone, markDryRun, markError } = require("../db");
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
    console.log("â„¹ï¸  --preview implies --dry-run (skipping deploy)");
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

  console.log(`â„¹ï¸  Reading ${businesses.length} pending businesses from leads/`);
  if (businesses.length === 0) return;

  const excelLock = createMutex();
  const deployLock = createMutex();
  let lastDeployAt = 0;

  let server = null;
  if (preview) {
    server = await startPreviewServer(config.OUTPUT_DIR, 3000);
    console.log("â„¹ï¸  Preview server: http://127.0.0.1:3000/ (local only)");
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
        console.log(`â†·  [${idx}/${total}] ${shopName} â€” already deployed, skipping`);
        return { shopId, status: "skipped" };
      }

      console.log(`âš¡ï¸ [${idx}/${total}] Processing: ${shopName} (category: ${business.category || "n/a"})`);
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

      console.log("â„¹ï¸  Filling template via Groq...");
      const nestedOutputDir = business._country
        ? path.join(config.OUTPUT_DIR, business._country, business._city, business._category, shopId)
        : outputDirForLead(shopId, business.sourceRel || `${shopId}.xlsx`);
      const outputPath = await fillTemplate(template, business, { outputDir: nestedOutputDir });

      let url = null;
      if (dryRun) {
        console.log(`â„¹ï¸  Dry run: skipping deploy for ${shopId}`);
      } else {
        await deployLock.run(async () => {
          const now = Date.now();
          const wait = Math.max(0, 2000 - (now - lastDeployAt));
          if (wait) await sleep(wait);
          console.log("â„¹ï¸  Deploying to Vercel...");
          url = await deployToVercel(outputPath, shopId, template);
          lastDeployAt = Date.now();
        });
      }

      if (url) {
        markDone(shopId, template, url);
        await updateExcelRow(url, "done");
        console.log(`âœ“  ${shopName} â†’ ${url}`);
        return { shopId, status: "done", url };
      }

      if (dryRun) {
        markDryRun(shopId, template);
        await updateExcelRow("", "pending");
        console.log(`âœ“  ${shopName} â†’ (generated locally at ${outputPath})`);
        return { shopId, status: "dry-run", url: null };
      }

      markError(shopId, "Deploy failed");
      await updateExcelRow("", "error");
      console.log(`âœ—  ${shopName} â€” deploy failed`);
      return { shopId, status: "error" };
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
      console.log(`âœ—  ${shopName} â€” error: ${err && err.message ? err.message : err}`);
      return { shopId, status: "error" };
    }
  };

  const chunks = chunkArray(businesses, batch);
  let processed = 0;
  for (const group of chunks) {
    const total = businesses.length;
    const settled = await Promise.allSettled(group.map((b, i) => processOne(b, processed + i + 1, total)));
    processed += group.length;
    for (const s of settled) {
      if (s.status === "rejected") {
        logErrorToFile("Unhandled promise rejection in batch", { error: String(s.reason) });
      }
    }
  }

  if (server) server.close();

  try {
    const written = await exportReports(businesses);
    for (const reportPath of written) console.log(`INFO: Report written: ${reportPath}`);
  } catch (err) {
    console.log(`WARN: Report export failed: ${err && err.message ? err.message : err}`);
  }
  for (const g of groups.values()) {
    const builtInGroup = businesses.filter(
      (b) => b._country === g.country && b._city === g.city && b._category === g.category
    ).length;
    tracker.markBuilt({ country: g.country, city: g.city, category: g.category, builtCount: builtInGroup });
  }
  console.log("â„¹ï¸  Done");
}

module.exports = { runCommand };

