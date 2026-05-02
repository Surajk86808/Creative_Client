process.env.NEXT_TELEMETRY_DISABLED = "1";

const http = require("http");
const next = require("next");

const originalFetch = global.fetch;
if (typeof originalFetch === "function" && typeof Response === "function") {
  global.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url;
    if (url && /\/-\/package\/next\/dist-tags$/.test(url)) {
      try {
        return await originalFetch(input, init);
      } catch {
        return new Response("{}", {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }
    }
    return originalFetch(input, init);
  };
}

function readArg(name, fallback) {
  const longIndex = process.argv.indexOf(`--${name}`);
  if (longIndex !== -1 && process.argv[longIndex + 1]) {
    return process.argv[longIndex + 1];
  }

  if (name === "hostname") {
    const shortIndex = process.argv.indexOf("-H");
    if (shortIndex !== -1 && process.argv[shortIndex + 1]) {
      return process.argv[shortIndex + 1];
    }
  }

  if (name === "port") {
    const shortIndex = process.argv.indexOf("-p");
    if (shortIndex !== -1 && process.argv[shortIndex + 1]) {
      return process.argv[shortIndex + 1];
    }
  }

  return fallback;
}

const hostname = readArg("hostname", process.env.HOSTNAME || "127.0.0.1");
const port = Number(readArg("port", process.env.PORT || "3000"));
const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => handle(req, res))
    .listen(port, hostname, () => {
      console.log(`ready http://${hostname}:${port}`);
    });
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
