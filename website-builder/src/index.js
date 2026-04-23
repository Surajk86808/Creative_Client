#!/usr/bin/env node
const { Command } = require("commander");
const { runCommand } = require("./commands/run");
const { statusCommand } = require("./commands/status");
const { reportCommand } = require("./commands/report");
const { resetCommand } = require("./commands/reset");
const { pipelineCommand } = require("./commands/pipeline");
const { reviewCommand } = require("./commands/review");
const tracker = require("../../analytics/tracker");

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
  .description("Delegate pipeline execution to repo-root run_pipeline.py")
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
    process.exitCode = Number.isInteger(err && err.exitCode) ? err.exitCode : 1;
  }));

program.command("status").action(() => statusCommand());
program.command("report").action(() => reportCommand());
program
  .command("review")
  .description("Start the local approve/reject dashboard for generated sites")
  .option("--port <n>", "Port for the local review server", "3000")
  .action((opts) => reviewCommand(opts).catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exitCode = 1;
  }));
program
  .command("analytics")
  .description("Show analytics/index.json summary")
  .action(() => {
    const rows = tracker.getAll();
    if (!rows.length) {
      console.log("No analytics data yet.");
      return;
    }
    console.log(`\n${"Key".padEnd(40)} ${"Status".padEnd(12)} ${"Leads".padEnd(8)} ${"Built".padEnd(8)} ${"Deployed".padEnd(10)} Scraped At`);
    console.log("-".repeat(108));
    for (const row of rows.sort((a, b) => a.key.localeCompare(b.key))) {
      console.log(
        `${row.key.padEnd(40)} ${row.status.padEnd(12)} ${String(row.lead_count).padEnd(8)} ${String(row.built_count || 0).padEnd(8)} ${String(row.deployed_count || 0).padEnd(10)} ${row.scraped_at}`
      );
    }
    console.log("");
  });
program.command("reset").requiredOption("--id <shopId>").action((opts) => resetCommand(opts));

program.parse(process.argv);

