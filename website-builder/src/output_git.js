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
  const remote = String(process.env.OUTPUT_GIT_REMOTE || "").trim();
  const branch = String(process.env.OUTPUT_GIT_BRANCH || "main").trim() || "main";
  if (!remote) throw new Error("OUTPUT_GIT_REMOTE is required to push output to GitHub");

  if (!fs.existsSync(outputRoot)) fs.mkdirSync(outputRoot, { recursive: true });
  ensureGitignoreBlock(outputRoot);

  const gitDir = path.join(outputRoot, ".git");
  if (!fs.existsSync(gitDir)) {
    await git(outputRoot, ["init"]);
    await git(outputRoot, ["checkout", "-B", branch]);
  }

  // Ensure we can commit even on fresh machines (repo-local config).
  try {
    const email = (await git(outputRoot, ["config", "--get", "user.email"])).stdout.trim();
    const name = (await git(outputRoot, ["config", "--get", "user.name"])).stdout.trim();
    if (!email) await git(outputRoot, ["config", "user.email", process.env.OUTPUT_GIT_USER_EMAIL || "output-bot@local"]);
    if (!name) await git(outputRoot, ["config", "user.name", process.env.OUTPUT_GIT_USER_NAME || "output-bot"]);
  } catch {
    // ignore
  }

  // Ensure origin remote.
  let hasOrigin = false;
  try {
    const remotes = (await git(outputRoot, ["remote"])).stdout
      .split(/\r?\n/g)
      .map((s) => s.trim())
      .filter(Boolean);
    hasOrigin = remotes.includes("origin");
  } catch {
    hasOrigin = false;
  }
  if (!hasOrigin) {
    await git(outputRoot, ["remote", "add", "origin", remote]);
  } else {
    await git(outputRoot, ["remote", "set-url", "origin", remote]);
  }

  // Make sure .gitignore is tracked (so Excel never gets pushed).
  await git(outputRoot, ["add", "-A", "--", ".gitignore"]);
  return { remote, branch };
}

async function maybePushAndCleanup(outputRoot, outputFolderAbs, business) {
  const enabled = envBool("OUTPUT_GIT_PUSH", false) || !!String(process.env.OUTPUT_GIT_REMOTE || "").trim();
  if (!enabled) return { pushed: false };

  const { branch } = await ensureOutputRepo(outputRoot);

  const rel = path.relative(outputRoot, outputFolderAbs) || ".";
  await git(outputRoot, ["add", "-A", "--", rel]);

  const staged = (await git(outputRoot, ["diff", "--cached", "--name-only"])).stdout
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (staged.length === 0) return { pushed: false };

  const parts = [];
  if (business?._country) parts.push(String(business._country));
  if (business?._city) parts.push(String(business._city));
  if (business?._category) parts.push(String(business._category));
  if (business?.shop_id) parts.push(String(business.shop_id));
  const label = parts.length ? parts.join("/") : rel;

  await git(outputRoot, ["commit", "-m", `chore(output): add ${label}`]);
  await git(outputRoot, ["push", "-u", "origin", branch]);

  const deleteLocal = envBool("OUTPUT_GIT_DELETE_LOCAL_AFTER_PUSH", false);
  if (deleteLocal) {
    try {
      fs.rmSync(outputFolderAbs, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  return { pushed: true, deletedLocal: deleteLocal };
}

module.exports = { maybePushAndCleanup };

