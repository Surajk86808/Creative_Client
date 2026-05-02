const path = require("path");
const { spawn } = require("child_process");

function buildRunPipelineArgs(opts = {}) {
  const repoRoot = path.resolve(__dirname, "../../..");
  const leadFinderDir = path.join(repoRoot, "lead_finder");
  const pythonArgs = [path.join(repoRoot, "run_pipeline.py")];

  if (opts.city) pythonArgs.push("--city", String(opts.city));
  if (opts.cities) pythonArgs.push("--cities", String(opts.cities));
  if (opts.categories) pythonArgs.push("--categories", String(opts.categories));
  if (opts.categoriesFile) {
    const categoriesFile = path.isAbsolute(String(opts.categoriesFile))
      ? String(opts.categoriesFile)
      : path.join(leadFinderDir, String(opts.categoriesFile));
    pythonArgs.push("--categories-file", categoriesFile);
  }
  if (opts.max !== undefined && opts.max !== null) pythonArgs.push("--max", String(opts.max));
  if (opts.analyzeWebsites) pythonArgs.push("--analyze-websites");
  if (opts.showBrowser) pythonArgs.push("--show-browser");
  if (opts.limit !== undefined && opts.limit !== null) pythonArgs.push("--limit", String(opts.limit));
  if (opts.id) pythonArgs.push("--id", String(opts.id));
  if (opts.batch !== undefined && opts.batch !== null) pythonArgs.push("--batch", String(opts.batch));
  if (opts.dryRun) pythonArgs.push("--dry-run");
  if (opts.preview) pythonArgs.push("--preview");

  return pythonArgs;
}

function pipelineCommand(opts = {}) {
  const repoRoot = path.resolve(__dirname, "../../..");
  const pythonCmd = process.env.PYTHON || "python";
  const pythonArgs = buildRunPipelineArgs(opts);

  return new Promise((resolve, reject) => {
    const child = spawn(pythonCmd, pythonArgs, {
      cwd: repoRoot,
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env
    });

    if (child.stdout) child.stdout.pipe(process.stdout);
    if (child.stderr) child.stderr.pipe(process.stderr);

    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const exitCode = Number.isInteger(code) ? code : 1;
      const detail = signal ? `signal ${signal}` : `exit code ${exitCode}`;
      const error = new Error(`run_pipeline.py failed with ${detail}`);
      error.exitCode = exitCode;
      error.signal = signal || null;
      reject(error);
    });
  });
}

module.exports = { buildRunPipelineArgs, pipelineCommand };
