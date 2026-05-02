const fs = require("fs");
const { config } = require("./config");

function timestamp() {
  return new Date().toISOString();
}

function logErrorToFile(message, meta = {}) {
  const line = JSON.stringify({ ts: timestamp(), message, ...meta });
  try {
    fs.appendFileSync(config.ERRORS_LOG, line + "\n", "utf8");
  } catch {
    // ignore (logging should never crash the run)
  }
}

module.exports = { logErrorToFile };

