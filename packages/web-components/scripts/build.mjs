#!/usr/bin/env node
/**
 * Builds dist/:
 * - per-module ESM (lit and react stay external) for bundler consumers
 *   (Astro/Vite, Hydrogen/React Router);
 * - plt-variant-picker.bundle.js, self-contained (Lit included), for Shopify
 *   themes that load assets without a bundler;
 * - .d.ts declarations.
 *
 * `--check` builds to a temporary directory and fails when the committed
 * dist/ differs, so git-dependency consumers never get stale output.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const check = process.argv.includes("--check");
const outdir = check ? await mkdtemp(join(tmpdir(), "plt-wc-")) : join(root, "dist");

const modules = (await readdir(join(root, "src"), { withFileTypes: true, recursive: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts"))
  .map((entry) => relative(root, join(entry.parentPath, entry.name)))
  .sort();

await rm(outdir, { recursive: true, force: true });

await build({
  absWorkingDir: root,
  entryPoints: modules,
  outbase: "src",
  outdir,
  format: "esm",
  target: "es2021",
  bundle: false,
  logLevel: "warning",
});

await build({
  absWorkingDir: root,
  entryPoints: {
    // Every component, Lit included once: what a Shopify theme loads.
    "plt-web-components.bundle": "src/all.ts",
    // The pilot's single-component bundle, kept for existing theme installs.
    "plt-variant-picker.bundle": "src/variant-picker/define.ts",
  },
  outdir,
  format: "esm",
  target: "es2021",
  platform: "browser",
  bundle: true,
  minify: true,
  legalComments: "eof",
  logLevel: "warning",
});

execFileSync(
  join(root, "node_modules/.bin/tsc"),
  ["-p", "tsconfig.json", "--outDir", outdir],
  { cwd: root, stdio: "inherit" },
);

async function list(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
    .sort();
}

if (check) {
  const committed = join(root, "dist");
  const [fresh, current] = await Promise.all([list(outdir), list(committed).catch(() => [])]);
  const problems = [];
  for (const file of new Set([...fresh, ...current])) {
    const [a, b] = await Promise.all([
      readFile(join(outdir, file), "utf8").catch(() => null),
      readFile(join(committed, file), "utf8").catch(() => null),
    ]);
    if (a !== b) problems.push(file);
  }
  await rm(outdir, { recursive: true, force: true });
  if (problems.length) {
    console.error(`dist/ is stale. Run \`npm run build -w @playlovetoys/web-components\`.\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log("web-components dist/: up to date");
} else {
  console.log(`web-components: built ${(await list(outdir)).length} files into dist/`);
}

