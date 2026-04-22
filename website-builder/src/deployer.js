const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { config } = require("./config");
const { logErrorToFile } = require("./logger");

function execFileAsync(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { ...opts, windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout: String(stdout || ""), stderr: String(stderr || "") });
      resolve({ stdout: String(stdout || ""), stderr: String(stderr || "") });
    });
  });
}

async function ensureVercelInstalled() {
  try {
    await execFileAsync("vercel", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

function ensureWorkspaceDependencies() {
  const workspaceNodeModules = path.join(config.ROOT_DIR, "node_modules");
  if (!fs.existsSync(workspaceNodeModules)) {
    throw new Error(
      "Missing website-builder/node_modules. Run `npm install` once inside website-builder/ before deploying."
    );
  }
  return workspaceNodeModules;
}

function ensureSharedNodeModulesLink(outputFolderPath) {
  const workspaceNodeModules = ensureWorkspaceDependencies();
  const target = path.join(outputFolderPath, "node_modules");
  if (fs.existsSync(target)) return;
  fs.symlinkSync(
    workspaceNodeModules,
    target,
    process.platform === "win32" ? "junction" : "dir"
  );
}

async function deployToVercel(outputFolderPath, shopId, templatePath) {
  if (!config.VERCEL_TOKEN) throw new Error("Missing VERCEL_TOKEN");
  const ok = await ensureVercelInstalled();
  if (!ok) throw new Error("Vercel CLI not found in PATH (install with: npm i -g vercel)");

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  const name = `shop-${String(shopId).toLowerCase()}`;
  const argsBase = ["--prod", "--yes", "--name", name, "--token", config.VERCEL_TOKEN];

  try {
    // Build before deploy using workspace-level dependencies.
    ensureSharedNodeModulesLink(outputFolderPath);
    await execFileAsync(npmCmd, ["run", "build"], { cwd: outputFolderPath });

    const distPath = path.join(outputFolderPath, "dist");
    if (!fs.existsSync(distPath)) throw new Error("Vite build failed: dist/ not found");

    const { stdout, stderr } = await execFileAsync("vercel", [distPath, ...argsBase], { cwd: distPath });
    const combined = `${stdout}\n${stderr}`;
    const match = combined.match(/https:\/\/[^\s]+\.vercel\.app/);
    return match ? match[0] : null;
  } catch (e) {
    logErrorToFile("Vercel deploy failed", {
      shop_id: shopId,
      error: String(e?.err?.message || e?.err || e)
    });
    return null;
  }
}

module.exports = { deployToVercel };
