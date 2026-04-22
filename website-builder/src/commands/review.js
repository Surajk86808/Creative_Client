const { config } = require("../config");
const { startPreviewServer } = require("../preview");

async function reviewCommand(opts = {}) {
  const port = Number(opts.port || 3000);
  await startPreviewServer(config.OUTPUT_DIR, port);
  console.log(`[info] Review dashboard: http://127.0.0.1:${port}/`);
  console.log("[info] Press Ctrl+C when you are finished reviewing.");
}

module.exports = { reviewCommand };
