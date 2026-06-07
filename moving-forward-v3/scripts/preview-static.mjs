import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(".output/public");
const args = process.argv.slice(2);

function readFlag(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : fallback;
}

const host = readFlag("--host", process.env.HOST ?? "127.0.0.1");
const requestedPort = Number(readFlag("--port", process.env.PORT ?? "4173"));

if (!existsSync(root)) {
  console.error("Missing .output/public. Run `pnpm build` before `pnpm preview`.");
  process.exit(1);
}

const types = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
]);

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded).replace(/^([/\\])+/, "");
  const full = resolve(root, normalized);
  return full === root || full.startsWith(root + sep) ? full : null;
}

async function resolveFile(url) {
  const pathname = fileURLToPath(new URL(url, "file:///")).replace(/^\/[A-Za-z]:/, "");
  const direct = safePath(pathname);
  if (!direct) return null;

  try {
    const info = await stat(direct);
    if (info.isFile()) return { file: direct, status: 200 };
    if (info.isDirectory()) {
      const index = join(direct, "index.html");
      if ((await stat(index)).isFile()) return { file: index, status: 200 };
    }
  } catch {}

  if (!extname(direct)) {
    const index = join(direct, "index.html");
    try {
      if ((await stat(index)).isFile()) return { file: index, status: 200 };
    } catch {}
  }

  const notFound = join(root, "404.html");
  try {
    if ((await stat(notFound)).isFile()) return { file: notFound, status: 404 };
  } catch {}

  return null;
}

async function handleRequest(request, response) {
  try {
    const result = await resolveFile(request.url ?? "/");
    if (!result) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(result.status, {
      "content-type": types.get(extname(result.file)) ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    createReadStream(result.file).pipe(response);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Internal server error");
  }
}

function listen(port) {
  const server = createServer(handleRequest);

  server.once("error", (error) => {
    if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE" && port < requestedPort + 20) {
      console.warn(`Port ${port} is busy, trying ${port + 1}.`);
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    console.log(`Static preview serving ${root}`);
    console.log(`Local: http://${host}:${port}/`);
  });
}

listen(requestedPort);
