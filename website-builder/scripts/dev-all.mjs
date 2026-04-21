import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const sitesDir = path.join(rootDir, "global-website");

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listWorkspaceDirs() {
  if (!isDirectory(sitesDir)) return [];
  return fs
    .readdirSync(sitesDir)
    .map((name) => ({ name, abs: path.join(sitesDir, name) }))
    .filter((d) => isDirectory(d.abs))
    .filter((d) => fs.existsSync(path.join(d.abs, "package.json")))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const portStart = Number(process.env.DEV_PORT_START || "3100");
const host = process.env.DEV_HOST || "0.0.0.0";

const workspaces = listWorkspaceDirs();
if (!workspaces.length) {
  console.error("No workspaces found under global-website/* (missing package.json).");
  process.exit(1);
}

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

console.log(`Starting ${workspaces.length} dev servers...`);
console.log(`Base port: ${portStart} (override with DEV_PORT_START)`);

for (let i = 0; i < workspaces.length; i += 1) {
  const ws = workspaces[i];
  const port = portStart + i;
  console.log(`- ${ws.name}: http://localhost:${port}/`);

  const child = spawn(
    npmCmd,
    ["run", "dev", "--", "--port", String(port), "--host", host],
    { cwd: ws.abs, stdio: "inherit" }
  );
  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) process.exitCode = code;
  });
}

function shutdown(signal) {
  for (const c of children) {
    try {
      c.kill(signal);
    } catch {
      // ignore
    }
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

