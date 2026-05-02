const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeShopId(shopId) {
  return String(shopId || "").trim();
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function createMutex() {
  let chain = Promise.resolve();
  return {
    async run(fn) {
      const next = chain.then(fn, fn);
      chain = next.then(
        () => undefined,
        () => undefined
      );
      return next;
    }
  };
}

function safeJoin(rootDir, unsafePath) {
  const resolved = path.resolve(rootDir, "." + unsafePath);
  if (!resolved.startsWith(path.resolve(rootDir))) return null;
  return resolved;
}

module.exports = { sleep, ensureDir, normalizeShopId, chunkArray, createMutex, safeJoin };

