#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { Command } = require("commander");
const { config } = require("./config");
const { initDB, isProcessed, markProcessing, markDone, markDryRun, markError, resetShop, getAllProcessed } = require("./db");
const { readAllLeads, updateRow, getStats } = require("./excel");
const { readReadyLeads } = require("./leads_json");
const { matchTemplate } = require("./matcher");
const { fillTemplate } = require("./filler");
const { deployToVercel } = require("./deployer");
const { validateTemplates } = require("./validator");
const { sleep, ensureDir, chunkArray, createMutex } = require("./utils");
const { logErrorToFile } = require("./logger");
const { startPreviewServer } = require("./preview");
const { outputDirForLead } = require("./leads");
const { exportReports } = require("./exporter");
const tracker = require("../../analytics/tracker");

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function readCityCountryCache() {
  const cachePath = path.resolve(__dirname, "../../lead_finder/public/data/_city_country_cache.json");
  if (!fs.existsSync(cachePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function resolveCountrySlugForCity(cityInput) {
  const citySlug = slugify(cityInput);
  const cache = readCityCountryCache();
  const cached = cache[citySlug];
  if (cached) return String(cached);

  const dataRoot = path.resolve(__dirname, "../../lead_finder/public/data");
  if (!fs.existsSync(dataRoot)) return "";
  for (const entry of fs.readdirSync(dataRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const maybeCity = path.join(dataRoot, entry.name, citySlug);
    if (fs.existsSync(maybeCity) && fs.statSync(maybeCity).isDirectory()) {
      return entry.name;
    }
  }
  return "";
}

function runLeadFinder(opts) {
  const leadFinderDir = path.resolve(__dirname, "../../lead_finder");
  const pythonArgs = [path.join(leadFinderDir, "run.py")];
  if (opts.city) pythonArgs.push("--city", String(opts.city));
  if (opts.cities) pythonArgs.push("--cities", String(opts.cities));
  if (opts.categoriesFile) pythonArgs.push("--categories-file", String(opts.categoriesFile));
  if (opts.categories) pythonArgs.push("--categories", String(opts.categories));
  if (opts.max !== undefined && opts.max !== null) pythonArgs.push("--max", String(opts.max));
  if (opts.analyzeWebsites) pythonArgs.push("--analyze-websites");
  if (opts.showBrowser) pythonArgs.push("--show-browser");

  return new Promise((resolve, reject) => {
    const child = spawn("python", pythonArgs, {
      cwd: leadFinderDir,
      stdio: "inherit",
      env: process.env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`lead_finder failed with exit code ${code}`));
    });
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
    console.log("ℹ️  --preview implies --dry-run (skipping deploy)");
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

  console.log(`ℹ️  Reading ${businesses.length} pending businesses from leads/`);
  if (businesses.length === 0) return;

  const excelLock = createMutex();
  const deployLock = createMutex();
  let lastDeployAt = 0;

  let server = null;
  if (preview) {
    server = await startPreviewServer(config.OUTPUT_DIR, 3000);
    console.log("ℹ️  Preview server: http://localhost:3000/ (open / to pick a site)");
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
        console.log(`↷  [${idx}/${total}] ${shopName} — already deployed, skipping`);
        return { shopId, status: "skipped" };
      }

      console.log(`⚡️ [${idx}/${total}] Processing: ${shopName} (category: ${business.category || "n/a"})`);
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

      console.log("ℹ️  Filling template via Groq...");
      const nestedOutputDir = business._country
        ? path.join(config.OUTPUT_DIR, business._country, business._city, business._category, shopId)
        : outputDirForLead(shopId, business.sourceRel || `${shopId}.xlsx`);
      const outputPath = await fillTemplate(template, business, { outputDir: nestedOutputDir });

      let url = null;
      if (dryRun) {
        console.log(`ℹ️  Dry run: skipping deploy for ${shopId}`);
      } else {
        await deployLock.run(async () => {
          const now = Date.now();
          const wait = Math.max(0, 2000 - (now - lastDeployAt));
          if (wait) await sleep(wait);
          console.log("ℹ️  Deploying to Vercel...");
          url = await deployToVercel(outputPath, shopId, template);
          lastDeployAt = Date.now();
        });
      }

      if (url) {
        markDone(shopId, template, url);
        await updateExcelRow(url, "done");
        console.log(`✓  ${shopName} → ${url}`);
        return { shopId, status: "done", url };
      }

      if (dryRun) {
        markDryRun(shopId, template);
        await updateExcelRow("", "pending");
        console.log(`✓  ${shopName} → (generated locally at ${outputPath})`);
        return { shopId, status: "dry-run", url: null };
      }

      markError(shopId, "Deploy failed");
      await updateExcelRow("", "error");
      console.log(`✗  ${shopName} — deploy failed`);
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
      console.log(`✗  ${shopName} — error: ${err && err.message ? err.message : err}`);
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
  console.log("ℹ️  Done");
}

async function statusCommand() {
  initDB();
  const stats = await getStats();
  const rows = getAllProcessed();
  const done = rows.filter((r) => r.status === "done").length;
  const processing = rows.filter((r) => r.status === "processing").length;
  const error = rows.filter((r) => r.status === "error").length;
  console.log(`ℹ️  Leads: total=${stats.total} done=${stats.done} pending=${stats.pending} error=${stats.error}`);
  console.log(`ℹ️  DB: done=${done} processing=${processing} error=${error}`);
}

async function reportCommand() {
  initDB();
  const rows = getAllProcessed().filter((r) => r.status === "done");
  const byTemplate = new Map();
  for (const r of rows) {
    const key = r.template_used || "unknown";
    byTemplate.set(key, (byTemplate.get(key) || 0) + 1);
  }
  const sorted = [...byTemplate.entries()].sort((a, b) => b[1] - a[1]);
  console.log("ℹ️  Template usage (DB):");
  for (const [tpl, count] of sorted) console.log(`  - ${tpl}: ${count}`);

  try {
    const all = await readAllLeads({ includeAll: true });
    const categories = all.map((b) => b.category).filter(Boolean);
    const noMatch = new Map();
    for (const c of categories) {
      const { score } = matchTemplate(c, { silent: true });
      if (score === 0) noMatch.set(c, (noMatch.get(c) || 0) + 1);
    }
    const top = [...noMatch.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    if (top.length) {
      console.log("ℹ️  Categories with no keyword match (top 20):");
      for (const [c, count] of top) console.log(`  - ${c}: ${count}`);
    }
  } catch {
    // ignore
  }
}

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

  console.log(`ℹ️  Reset ${shopId}`);
}

async function pipelineCommand(opts) {
  process.env.USE_JSON_LEADS = "true";

  const citySlug = slugify(opts.city);
  if (opts.categories) {
    const allowed = String(opts.categories)
      .split(",")
      .map((c) => slugify(c))
      .filter(Boolean);
    if (allowed.length) process.env.ANALYTICS_CATEGORY_FILTER = allowed.join(",");
  }

  await runLeadFinder({
    city: opts.city,
    categories: opts.categories,
    categoriesFile: opts.categoriesFile,
    max: opts.max,
    analyzeWebsites: !!opts.analyzeWebsites,
    showBrowser: !!opts.showBrowser
  });

  const countrySlug = resolveCountrySlugForCity(opts.city);
  if (countrySlug) {
    process.env.ANALYTICS_KEY_PREFIX = `${countrySlug}/${citySlug}/`;
  }

  await runCommand({
    limit: opts.limit,
    id: opts.id,
    batch: opts.batch,
    dryRun: opts.dryRun,
    preview: opts.preview
  });
}

const program = new Command();
program.name("bizsitegen").description("Automated Business Website Generator").version("1.0.0");

program
  .command("run")
  .option("--limit <n>", "Process only N shops")
  .option("--id <shopId>", "Process only one shop_id")
  .option("--batch <n>", "Parallel batch size (default 1)", "1")
  .option("--dry-run", "Fill templates but do not deploy")
  .option("--preview", "Serve OUTPUT_DIR locally on port 3000 while running")
  .action((opts) => runCommand(opts));

program
  .command("pipeline")
  .description("Run lead_finder then build websites from JSON leads")
  .requiredOption("--city <city>", "City to scrape (lead_finder --city)")
  .option("--categories <csv>", "Comma-separated categories (lead_finder --categories)")
  .option("--categories-file <path>", "Categories file path (lead_finder --categories-file)")
  .option("--max <n>", "Max results per category (0 = unlimited)", "0")
  .option("--analyze-websites", "Enable lead_finder website analysis")
  .option("--show-browser", "Show browser while scraping")
  .option("--limit <n>", "Build only N shops")
  .option("--id <shopId>", "Build only one shop_id")
  .option("--batch <n>", "Parallel batch size (default 1)", "1")
  .option("--dry-run", "Fill templates but do not deploy")
  .option("--preview", "Serve OUTPUT_DIR locally on port 3000 while running")
  .action((opts) => pipelineCommand(opts).catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exitCode = 1;
  }));

program.command("status").action(() => statusCommand());
program.command("report").action(() => reportCommand());
program
  .command("analytics")
  .description("Show analytics/index.json summary")
  .action(() => {
    const rows = tracker.getAll();
    if (!rows.length) {
      console.log("No analytics data yet.");
      return;
    }
    console.log(`\n${"Key".padEnd(40)} ${"Status".padEnd(12)} ${"Leads".padEnd(8)} ${"Built".padEnd(8)} Scraped At`);
    console.log("-".repeat(90));
    for (const row of rows.sort((a, b) => a.key.localeCompare(b.key))) {
      console.log(
        `${row.key.padEnd(40)} ${row.status.padEnd(12)} ${String(row.lead_count).padEnd(8)} ${String(row.built_count).padEnd(8)} ${row.scraped_at}`
      );
    }
    console.log("");
  });
program.command("reset").requiredOption("--id <shopId>").action((opts) => resetCommand(opts));

program.parse(process.argv);
