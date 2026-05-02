const http = require("http");
const fs = require("fs");
const path = require("path");
const { safeJoin } = require("./utils");
const { listReviewEntries, updateReviewStatus } = require("./review");

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html" || ext === ".htm") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function dashboardHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BizSite Review</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7f2;
      --card: #ffffff;
      --ink: #182018;
      --muted: #5f6a5f;
      --line: #d9e1d5;
      --accent: #215732;
      --accent-soft: #e3efe5;
      --warn: #8d5a00;
      --warn-soft: #fff2d8;
      --danger: #8e2c2c;
      --danger-soft: #ffe4e4;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background: linear-gradient(160deg, #f7f2e8 0%, var(--bg) 45%, #eef5ef 100%);
      color: var(--ink);
    }
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 20px 64px;
    }
    .hero {
      margin-bottom: 28px;
      padding: 28px;
      border: 1px solid rgba(33, 87, 50, 0.12);
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(24, 32, 24, 0.06);
    }
    h1 {
      margin: 0 0 8px;
      font-size: clamp(2rem, 4vw, 3.6rem);
      line-height: 1;
    }
    .sub {
      margin: 0;
      color: var(--muted);
      max-width: 720px;
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 18px 40px rgba(24, 32, 24, 0.05);
    }
    .meta {
      color: var(--muted);
      font-size: 0.95rem;
      margin-bottom: 12px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 14px;
    }
    .pending { background: var(--warn-soft); color: var(--warn); }
    .approved { background: var(--accent-soft); color: var(--accent); }
    .rejected { background: var(--danger-soft); color: var(--danger); }
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    button, a.button {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
      text-decoration: none;
      transition: transform 120ms ease, opacity 120ms ease;
    }
    button:hover, a.button:hover { transform: translateY(-1px); }
    .open {
      background: #edf3ee;
      color: var(--ink);
    }
    .approve {
      background: var(--accent);
      color: white;
    }
    .reject {
      background: var(--danger);
      color: white;
    }
    textarea {
      width: 100%;
      min-height: 88px;
      border-radius: 14px;
      border: 1px solid var(--line);
      padding: 12px;
      font: inherit;
      margin-top: 10px;
      resize: vertical;
      background: #fbfdfb;
    }
    .empty {
      padding: 22px;
      background: rgba(255,255,255,0.75);
      border: 1px dashed var(--line);
      border-radius: 20px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>Review Generated Sites</h1>
      <p class="sub">Approve or reject each generated site before the email step. The Excel reports are updated in place so approved reviews flow straight into the sender.</p>
    </section>
    <section id="app" class="grid"></section>
  </main>
  <script>
    const app = document.getElementById("app");

    async function loadEntries() {
      const resp = await fetch("/__review/index.json");
      const items = await resp.json();
      render(items);
    }

    function badge(status) {
      return '<div class="pill ' + status + '">' + status + '</div>';
    }

    function entryCard(item) {
      const notes = item.review_notes || "";
      const previewHref = '/site/' + item.relative_path + '/';
      return '<article class="card">' +
        badge(item.review_status) +
        '<h2>' + escapeHtml(item.shop_name || item.shop_id || "Untitled site") + '</h2>' +
        '<div class="meta">' + escapeHtml([item.country, item.city, item.category].filter(Boolean).join(" / ")) + '</div>' +
        '<div class="meta">' + escapeHtml(item.email || item.phone || item.website_url || "") + '</div>' +
        '<a class="button open" target="_blank" rel="noreferrer" href="' + previewHref + '">Open Preview</a>' +
        '<textarea data-path="' + item.relative_path + '" placeholder="Optional review note...">' + escapeHtml(notes) + '</textarea>' +
        '<div class="actions">' +
          '<button class="approve" data-action="approved" data-path="' + item.relative_path + '">Approve</button>' +
          '<button class="reject" data-action="rejected" data-path="' + item.relative_path + '">Reject</button>' +
        '</div>' +
      '</article>';
    }

    function render(items) {
      if (!items.length) {
        app.innerHTML = '<div class="empty">No generated sites found under output/ yet.</div>';
        return;
      }
      app.innerHTML = items.map(entryCard).join("");
      for (const button of document.querySelectorAll("button[data-action]")) {
        button.addEventListener("click", submitReview);
      }
    }

    async function submitReview(event) {
      const path = event.currentTarget.dataset.path;
      const review_status = event.currentTarget.dataset.action;
      const notes = document.querySelector('textarea[data-path="' + path + '"]').value;
      await fetch("/__review/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relative_path: path, review_status, notes })
      });
      await loadEntries();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    loadEntries().catch((error) => {
      app.innerHTML = '<div class="empty">Failed to load review entries: ' + escapeHtml(error && error.message ? error.message : error) + '</div>';
    });
  </script>
</body>
</html>`;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) reject(new Error("Request body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStatic(rootDir, req, res, prefix = "") {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativeUrl = prefix && urlPath.startsWith(prefix) ? urlPath.slice(prefix.length) || "/" : urlPath;
  const full = safeJoin(rootDir, relativeUrl === "/" ? "/index.html" : relativeUrl);
  if (!full) {
    res.writeHead(400);
    res.end("Bad path");
    return;
  }

  let filePath = full;
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    // continue
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
}

function startPreviewServer(rootDir, port = 3000) {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

      if (req.method === "GET" && (urlPath === "/" || urlPath === "/review")) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(dashboardHtml());
        return;
      }

      if (req.method === "GET" && urlPath === "/__review/index.json") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(listReviewEntries(rootDir), null, 2));
        return;
      }

      if (req.method === "POST" && urlPath === "/__review/update") {
        const rawBody = await readRequestBody(req);
        const payload = JSON.parse(rawBody || "{}");
        const updated = await updateReviewStatus(
          rootDir,
          payload.relative_path,
          payload.review_status,
          payload.notes
        );
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(updated, null, 2));
        return;
      }

      if (urlPath.startsWith("/site/")) {
        serveStatic(rootDir, req, res, "/site");
        return;
      }

      serveStatic(rootDir, req, res);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: String(error && error.message ? error.message : error) }, null, 2));
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

module.exports = { startPreviewServer };
