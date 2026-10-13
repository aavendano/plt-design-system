#!/usr/bin/env node
/**
 * Builds the three consumer demos into examples/.out/ from the same
 * <plt-variant-picker> implementation:
 *   liquid/  Liquid theme section rendered with liquidjs + the self-contained bundle
 *   astro/   `astro build` of a page using the Astro adapter (package exports, dist/)
 *   react/   React server render + hydration (esbuild) using the React adapter
 * Each gets the same Tailwind 4 + daisyUI 5 + PLT design-system stylesheet.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { shopifyLiquid } from "../tests/fixtures/liquid.mjs";
import { liquidProduct } from "../tests/fixtures/product.mjs";
import * as demo from "../tests/fixtures/demo.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const bin = (name) => join(root, "../../node_modules/.bin", name);
const examples = join(root, "examples");
const out = join(examples, ".out");

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

// Shared stylesheet, compiled the way a consumer compiles the design system.
const css = join(out, "demo.css");
execFileSync(bin("tailwindcss"), ["-i", join(examples, "shared/demo.css"), "-o", css, "--minify"], {
  cwd: root,
  stdio: "pipe",
});

// Liquid: theme layout + sections; snippets from the shared adapters and the
// design-system Liquid renderers (navbar).
{
  const dir = join(out, "liquid");
  await mkdir(join(dir, "assets"), { recursive: true });
  const engine = shopifyLiquid([
    join(examples, "liquid/theme"),
    join(root, "adapters/liquid"),
    join(root, "../design-system/renderers/liquid"),
  ]);
  const product = liquidProduct();
  const data = demo.demoData({
    variants: product.variants.map((variant) => ({ id: String(variant.id), title: variant.title, available: variant.available, cents: variant.price })),
    initialVariantId: String(product.selected_or_first_available_variant.id),
    collectionMode: "navigate",
  });
  const context = {
    product,
    images: demo.images,
    nav_links: demo.navLinks,
    filters: demo.liquidFilters,
    sort_options: demo.liquidSortOptions,
    paginate: demo.liquidPaginate,
    cards: demo.cards,
    cart: { ...demo.liquidCart, item_count: 1 },
    routes: { cart_url: "/cart" },
    request: { locale: { iso_code: "en" } },
    demo_data_json: JSON.stringify(data),
  };
  const section = await engine.renderFile("sections/main-product", context);
  const page = await engine.renderFile("layout/theme", { ...context, content_for_layout: section });
  await writeFile(join(dir, "index.html"), page);
  await copyFile(join(root, "dist/plt-web-components.bundle.js"), join(dir, "assets/plt-web-components.bundle.js"));
  await copyFile(join(examples, "shared/store.js"), join(dir, "assets/store.js"));
  await copyFile(css, join(dir, "assets/demo.css"));
  await cp(join(examples, "shared/images"), join(dir, "images"), { recursive: true });
}

// Astro: a real `astro build` of a page that uses the Astro adapter.
{
  execFileSync(bin("astro"), ["build", "--root", join(examples, "astro"), "--silent"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
  });
  await copyFile(css, join(out, "astro/demo.css"));
  await cp(join(examples, "shared/images"), join(out, "astro/images"), { recursive: true });
}

// React: server render to HTML, then hydrate on the client.
{
  const dir = join(out, "react");
  await mkdir(dir, { recursive: true });
  const shared = {
    absWorkingDir: root,
    bundle: true,
    format: "esm",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "warning",
  };
  await build({
    ...shared,
    entryPoints: [join(examples, "react/client.tsx")],
    outdir: dir,
    platform: "browser",
    splitting: true,
    minify: true,
  });
  const serverFile = join(out, "react-server.mjs");
  await build({
    ...shared,
    entryPoints: [join(examples, "react/server.tsx")],
    outfile: serverFile,
    platform: "node",
    packages: "external",
  });
  const { render } = await import(pathToFileURL(serverFile).href);
  await writeFile(join(dir, "index.html"), render());
  await rm(serverFile);
  await copyFile(css, join(dir, "demo.css"));
  await cp(join(examples, "shared/images"), join(dir, "images"), { recursive: true });
}

const sizes = await Promise.all(
  ["liquid/index.html", "astro/index.html", "react/index.html"].map(async (file) => {
    const html = await readFile(join(out, file), "utf8");
    return `${file} (${html.length} bytes)`;
  }),
);
console.log(`examples built:\n  ${sizes.join("\n  ")}`);
