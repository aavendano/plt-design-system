#!/usr/bin/env node
/**
 * Measures what each approach ships to the browser (minified + gzip/brotli).
 *
 *   node scripts/measure-bundle.mjs [--compare label=path ...] [--json]
 *
 * Always measured: the Lit pilot (with and without the Lit runtime), the Lit
 * runtime alone, and the existing vanilla custom elements of the design system.
 * `--compare` adds other files, e.g. the Liquid theme's Alpine variant picker.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

const root = fileURLToPath(new URL("..", import.meta.url));
/** Former vanilla custom elements, read from git (removed when ported to Lit). */
const VANILLA_COMMIT = "c8cae0b";
const vanilla = (path) =>
  execFileSync("git", ["show", `${VANILLA_COMMIT}:packages/design-system/src/${path}`], { cwd: root, encoding: "utf8" });

async function minify(entry, { external = [], stdin } = {}) {
  const result = await build({
    absWorkingDir: root,
    ...(stdin ? { stdin: { contents: stdin, resolveDir: root, loader: "js" } } : { entryPoints: [entry] }),
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2021",
    platform: "browser",
    external,
    write: false,
    legalComments: "none",
    logLevel: "silent",
  });
  return result.outputFiles[0].contents;
}

const sizes = (bytes) => ({
  min: bytes.length,
  gzip: gzipSync(bytes, { level: 9 }).length,
  brotli: brotliCompressSync(bytes).length,
});

const external = { external: ["lit", "lit/*"] };
const rows = [
  ["All 10 components + Lit (plt-web-components.bundle.js)", await readFile(join(root, "dist/plt-web-components.bundle.js"))],
  ["Variant picker + Lit (plt-variant-picker.bundle.js)", await readFile(join(root, "dist/plt-variant-picker.bundle.js"))],
  ["Lit runtime used by the components", await minify(null, {
    stdin: 'export { LitElement, html, nothing } from "lit"; export { live } from "lit/directives/live.js"; export { styleMap } from "lit/directives/style-map.js"; export { ifDefined } from "lit/directives/if-defined.js"; export { repeat } from "lit/directives/repeat.js";',
  })],
  ["Variant picker (Lit external)", await minify("src/variant-picker/define.ts", external)],
  ["Quantity selector (Lit external)", await minify("src/quantity-selector/define.ts", external)],
  ["Cart: line + drawer + quantity (Lit external)", await minify("src/cart/define.ts", external)],
  ["Collection: filter bar + sort + pagination (Lit external)", await minify("src/collection/define.ts", external)],
  ["Product: gallery + quick view (Lit external)", await minify("src/product/define.ts", external)],
  ["Navigation: navbar + mega menu (Lit external)", await minify("src/navigation/define.ts", external)],
  ["React adapters, all 10 (React external; elements load lazily)", await minify("src/react/index.ts", { external: ["react", "lit", "lit/*", "*/define.js"] })],
  [`Former vanilla gallery.js (${VANILLA_COMMIT})`, await minify(null, { stdin: vanilla("commerce/gallery.js") })],
  [`Former vanilla quick-view.js (${VANILLA_COMMIT})`, await minify(null, { stdin: vanilla("commerce/quick-view.js") })],
  [`Former vanilla navbar-toggle.js (${VANILLA_COMMIT})`, await minify(null, { stdin: vanilla("navigation/navbar-toggle.js") })],
];

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 1) {
  if (args[i] !== "--compare") continue;
  const [label, path] = args[i + 1].split("=");
  rows.push([label, await minify(path)]);
}

const table = rows.map(([label, bytes]) => ({ label, ...sizes(bytes) }));
if (args.includes("--json")) {
  console.log(JSON.stringify(table, null, 2));
} else {
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log("| Artifact | min | gzip | brotli |\n| --- | ---: | ---: | ---: |");
  for (const row of table) console.log(`| ${row.label} | ${kb(row.min)} | ${kb(row.gzip)} | ${kb(row.brotli)} |`);
}
