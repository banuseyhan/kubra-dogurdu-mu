const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sivaslıpars2026";
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const STATUS_FILE = path.join(ROOT, "data", "status.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function readStatus() {
  const raw = await fs.readFile(STATUS_FILE, "utf8");
  const status = JSON.parse(raw);
  return {
    dogurdu: Boolean(status.dogurdu),
    updatedAt: status.updatedAt || null,
  };
}

async function writeStatus(dogurdu) {
  const nextStatus = {
    dogurdu: Boolean(dogurdu),
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(STATUS_FILE), { recursive: true });
  await fs.writeFile(STATUS_FILE, `${JSON.stringify(nextStatus, null, 2)}\n`, "utf8");
  return nextStatus;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function serveStatic(res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600",
    });
    res.end(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bulunamadı");
      return;
    }

    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/status" && req.method === "GET") {
      sendJson(res, 200, await readStatus());
      return;
    }

    if (url.pathname === "/api/status" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");

      if (body.password !== ADMIN_PASSWORD) {
        sendJson(res, 401, { error: "Şifre yanlış" });
        return;
      }

      if (typeof body.dogurdu !== "boolean") {
        sendJson(res, 400, { error: "dogurdu boolean olmalı" });
        return;
      }

      sendJson(res, 200, await writeStatus(body.dogurdu));
      return;
    }

    if (url.pathname === "/admin") {
      res.writeHead(302, { Location: "/" });
      res.end();
      return;
    }

    await serveStatic(res, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Sunucu hatası" });
  }
});

server.listen(PORT, () => {
  console.log(`Site hazır: http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
