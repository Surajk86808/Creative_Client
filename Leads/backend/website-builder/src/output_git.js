const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function envBool(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === "") return defaultValue;
  return ["1", "true", "yes", "y", "on"].includes(String(raw).trim().toLowerCase());
}

function execFileAsync(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { ...opts, windowsHide: true }, (err, stdout, stderr) => {
      const out = { stdout: String(stdout || ""), stderr: String(stderr || "") };
      if (err) return reject({ err, ...out });
      resolve(out);
    });
  });
}

async function git(cwd, args) {
  return execFileAsync("git", args, { cwd });
}

function ensureGitignoreBlock(outputRoot) {
  const fp = path.join(outputRoot, ".gitignore");
  const markerStart = "# --- BizSiteGen output ignores (managed) ---";
  const block = [
    markerStart,
    "# Keep Excel local only",
    "**/*.xlsx",
    "",
    "# Never push large build artifacts",
    "**/node_modules/",
    "**/dist/",
    "**/build/",
    "**/coverage/",
    "**/.vercel/",
    "**/.npm-cache/",
    "",
    "# OS / editor junk",
    "**/.DS_Store",
    "**/Thumbs.db",
    ""
  ].join("\n");

  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, `${block}\n`, "utf-8");
    return;
  }

  const existing = fs.readFileSync(fp, "utf-8");
  if (existing.includes(markerStart)) return;
  const next = existing.trimEnd() + "\n\n" + block + "\n";
  fs.writeFileSync(fp, next, "utf-8");
}

async function ensureOutputRepo(outputRoot) {
  // DISABLED: replaced by sites.json direct write
  return { remote: "", branch: "main" };
}

async function maybePushAndCleanup(outputRoot, outputFolderAbs, business) {
  // DISABLED: replaced by sites.json direct write
  return { pushed: false };
}

module.exports = { maybePushAndCleanup };

