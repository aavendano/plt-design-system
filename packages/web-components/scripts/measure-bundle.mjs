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
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

const root = fileURLToPath(new URL("..", import.meta.url));
const designSystem = join(root, "../design-system/src");

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

const rows = [
  ["Lit pilot: plt-variant-picker + Lit (self-contained bundle)", await readFile(join(root, "dist/plt-variant-picker.bundle.js"))],
  ["Lit pilot: component + resolver only (Lit shared/external)", await minify("src/variant-picker/define.ts", { external: ["lit", "lit/*"] })],
  ["Lit runtime used by the pilot (LitElement, html, live, styleMap)", await minify(null, {
    stdin: 'export { LitElement, html, nothing } from "lit"; export { live } from "lit/directives/live.js"; export { styleMap } from "lit/directives/style-map.js";',
  })],
  ["React adapter (React external)", await minify("src/react/variant-picker.ts", { external: ["react", "../variant-picker/define.js"] })],
  ["Vanilla CE: design-system gallery.js", await minify(join(designSystem, "commerce/gallery.js"))],
  ["Vanilla CE: design-system quick-view.js", await minify(join(designSystem, "commerce/quick-view.js"))],
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
