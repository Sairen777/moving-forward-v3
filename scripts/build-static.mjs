import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const routes = ["/", "/writing/the-clean-cutover", "/404"];
const outputDir = resolve(".output/public");
const clientDir = resolve("dist/client");
const publicDir = resolve("public");

await rm(resolve(".output"), { recursive: true, force: true });
await rm(resolve("dist"), { recursive: true, force: true });

const buildResult = spawnSync("pnpm", ["exec", "vite", "build"], {
  env: { ...process.env, MF_MANUAL_SSG: "1" },
  stdio: "inherit",
});

if (buildResult.status !== 0) {
  throw new Error(`Vite build failed with exit code ${buildResult.status ?? "unknown"}.`);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

if (existsSync(publicDir)) await cp(publicDir, outputDir, { recursive: true });
if (existsSync(clientDir)) await cp(clientDir, outputDir, { recursive: true });

const serverEntry = resolve("dist/server/entry-server.js");
const server = await import(`${pathToFileURL(serverEntry).href}?t=${Date.now()}`);
const app = server.default;

if (!app || typeof app.fetch !== "function") {
  throw new TypeError("The SolidStart server build did not export a fetchable app.");
}

function outputFiles(route) {
  if (route === "/") return [resolve(outputDir, "index.html")];
  if (route === "/404") return [resolve(outputDir, "404.html"), resolve(outputDir, "404/index.html")];
  return [resolve(outputDir, route.slice(1), "index.html")];
}

for (const route of routes) {
  const response = await app.fetch(new Request(`http://localhost${route}`));
  const html = await response.text();

  if (route !== "/404" && response.status >= 400) {
    throw new Error(`Prerender failed for ${route}: ${response.status}`);
  }
  if (!html.includes("<!DOCTYPE html>") || !html.includes("</html>")) {
    throw new Error(`Prerender for ${route} did not produce a complete HTML document.`);
  }

  for (const file of outputFiles(route)) {
    await mkdir(resolve(file, ".."), { recursive: true });
    await writeFile(file, html, "utf8");
  }

  console.log(
    `prerendered ${route} -> ${outputFiles(route)
      .map((file) => file.replace(`${outputDir}/`, ""))
      .join(", ")}`,
  );
}

await writeFile(
  resolve(".output/nitro.json"),
  `${JSON.stringify({ preset: "static", publicDir: "public", prerenderedRoutes: routes }, null, 2)}\n`,
  "utf8",
);
