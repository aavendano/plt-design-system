/**
 * Real-browser integration tests: the same <plt-variant-picker> in the built
 * Liquid, Astro and React (SSR + hydration) demos. Run `npm run test:browser`.
 *
 * Chromium comes from Playwright (`npx playwright install chromium`, or
 * PLAYWRIGHT_BROWSERS_PATH pointing at an existing install).
 */
import { createServer, type Server } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

const root = fileURLToPath(new URL("../..", import.meta.url));
const out = join(root, "examples/.out");
const screenshots = join(out, "screenshots");
const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
};

let server: Server;
let browser: Browser;
let origin = "";

beforeAll(async () => {
  server = createServer(async (request, response) => {
    let path = decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(out, path));
    if (!file.startsWith(out)) return void response.writeHead(403).end();
    try {
      const body = await readFile(file);
      response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  origin = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  browser = await chromium.launch();
  await mkdir(screenshots, { recursive: true });
});

afterAll(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

const frontends = [
  { name: "liquid", field: "id", ids: (n: number) => String(n) },
  { name: "astro", field: "merchandiseId", ids: (n: number) => `gid://shopify/ProductVariant/${n}` },
  { name: "react", field: "merchandiseId", ids: (n: number) => `gid://shopify/ProductVariant/${n}` },
] as const;

async function open(name: string, javaScriptEnabled = true) {
  const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 640, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${origin}/${name}/`);
  if (javaScriptEnabled) {
    await page.waitForFunction(() => {
      const picker = document.querySelector("plt-variant-picker");
      return Boolean(picker && customElements.get("plt-variant-picker") && picker.querySelector("fieldset"));
    });
  }
  return { page, errors, close: () => context.close() };
}

const value = (page: Page, option: string, text: string) =>
  page
    .locator("plt-variant-picker fieldset")
    .filter({ has: page.locator("legend", { hasText: option }) })
    .locator(`label:has(> input[value="${text}"])`);

const hiddenField = (page: Page, field: string) =>
  page.locator(`plt-variant-picker > input[type=hidden][name="${field}"]`).inputValue();

describe.each(frontends)("$name frontend", ({ name, field, ids }) => {
  it("upgrades the server-rendered markup", async () => {
    const { page, errors, close } = await open(name);
    expect(await page.locator("[data-plt-fallback]").isHidden()).toBe(true);
    expect(await page.locator("[data-plt-fallback] select").isDisabled()).toBe(true);
    expect(await page.locator("plt-variant-picker fieldset").count()).toBe(2);
    expect(await value(page, "Color", "Red").locator("input").isChecked()).toBe(true);
    expect(await hiddenField(page, field)).toBe(ids(40001));
    // Exactly one variant field is submitted with the form.
    const submitted = await page.evaluate(
      (f) => new FormData(document.querySelector("form")!).getAll(f),
      field,
    );
    expect(submitted).toEqual([ids(40001)]);
    expect(await value(page, "Size", "M").getAttribute("data-status")).toBe("sold-out");
    await page.locator("plt-variant-picker").screenshot({ path: join(screenshots, `${name}-picker.png`), animations: "disabled" });
    await page.screenshot({ path: join(screenshots, `${name}-page.png`), fullPage: true, animations: "disabled" });
    expect(errors).toEqual([]);
    await close();
  });

  it("selects by pointer, emits plt:variant-change and lets the frontend react", async () => {
    const { page, close } = await open(name);
    await value(page, "Color", "Blue").click();
    expect(await hiddenField(page, field)).toBe(ids(40004));
    await expect.poll(() => page.locator("[data-log]").textContent()).toContain(`"variantId":"${ids(40004)}"`);
    expect(await page.locator("[data-price]").textContent()).toBe("$19.00");

    await value(page, "Size", "L").click();
    await expect.poll(() => page.locator("[data-add-to-cart]").isDisabled()).toBe(true);
    expect(await page.locator("[data-add-to-cart]").textContent()).toContain("Sold out");
    expect(await page.locator("[data-price]").textContent()).toBe("$23.00");
    expect(await value(page, "Size", "L").locator("input").isChecked()).toBe(true);
    await page.locator("main").screenshot({ path: join(screenshots, `${name}-sold-out.png`), animations: "disabled" });
    await close();
  });

  it("resolves a missing combination to the closest variant", async () => {
    const { page, close } = await open(name);
    await value(page, "Size", "L").click();
    await value(page, "Color", "Green").click();
    expect(await hiddenField(page, field)).toBe(ids(40007));
    expect(await value(page, "Size", "S").locator("input").isChecked()).toBe(true);
    expect(await value(page, "Size", "L").getAttribute("data-status")).toBe("unavailable");
    await page.locator("plt-variant-picker").screenshot({ path: join(screenshots, `${name}-unavailable.png`), animations: "disabled" });
    await close();
  });

  it("is operable with the keyboard alone", async () => {
    const { page, close } = await open(name);
    await page.locator("body").click({ position: { x: 1, y: 1 } });
    await page.keyboard.press("Tab");
    const focused = () =>
      page.evaluate(() => {
        const element = document.activeElement as HTMLInputElement | null;
        return element ? `${element.type}:${element.value}` : "";
      });
    expect(await focused()).toBe("radio:Red");
    const outline = await value(page, "Color", "Red").evaluate((label) => getComputedStyle(label).outlineStyle);
    expect(outline).toBe("solid");

    await page.keyboard.press("ArrowRight");
    expect(await focused()).toBe("radio:Blue");
    await expect.poll(() => page.locator("[data-log]").textContent()).toContain(`"variantId":"${ids(40004)}"`);

    await page.keyboard.press("Tab");
    expect(await focused()).toBe("radio:S");
    await page.keyboard.press("ArrowRight");
    expect(await hiddenField(page, field)).toBe(ids(40005));
    expect(await page.locator("plt-variant-picker [role=status]").textContent()).toBe("Blue / M");
    await page.locator("plt-variant-picker").screenshot({ path: join(screenshots, `${name}-keyboard.png`), animations: "disabled" });
    await close();
  });

  it("accepts data updates from the consumer", async () => {
    const { page, close } = await open(name);
    await page.evaluate(() => {
      const picker = document.querySelector("plt-variant-picker")!;
      picker.variants = picker.variants.map((variant) =>
        variant.options.join("/") === "Red/L" ? { ...variant, available: false } : variant,
      );
    });
    await expect.poll(() => value(page, "Size", "L").getAttribute("data-status")).toBe("sold-out");
    await page.evaluate((id) => {
      document.querySelector("plt-variant-picker")!.selectedVariantId = id;
    }, ids(40005));
    await expect.poll(() => value(page, "Color", "Blue").locator("input").isChecked()).toBe(true);
    expect(await value(page, "Size", "M").locator("input").isChecked()).toBe(true);
    await close();
  });

  it("has no axe-core accessibility violations", async () => {
    const { page, close } = await open(name);
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(() =>
      (window as unknown as { axe: { run: (context: string) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe.run(
        "plt-variant-picker",
      ),
    );
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    await close();
  });

  it("works without JavaScript through the fallback select", async () => {
    const { page, close } = await open(name, false);
    const select = page.locator(`[data-plt-fallback] select[name="${field}"]`);
    expect(await select.isVisible()).toBe(true);
    expect(await select.isEnabled()).toBe(true);
    expect(await select.inputValue()).toBe(ids(40001));
    expect(await page.locator(`option[value="${ids(40002)}"]`).evaluate((o: HTMLOptionElement) => o.disabled)).toBe(true);
    await close();
  });
});

describe("cross-frontend parity", () => {
  it("renders pixel-identical pickers in Liquid, Astro and React", async () => {
    const images: Buffer[] = [];
    for (const frontend of frontends) {
      const { page, close } = await open(frontend.name);
      // Same box in every page, so headers of different heights cannot shift it.
      const picker = page.locator("plt-variant-picker");
      await picker.evaluate((element: HTMLElement) => {
        document.body.style.visibility = "hidden";
        Object.assign(element.style, { position: "fixed", top: "0", left: "0", width: "600px", visibility: "visible" });
      });
      images.push(await picker.screenshot({ path: join(screenshots, `${frontend.name}-parity.png`), animations: "disabled" }));
      await close();
    }
    expect(images[1].equals(images[0])).toBe(true);
    expect(images[2].equals(images[0])).toBe(true);
  });

  it("exposes the same markup to assistive technology", async () => {
    const trees: string[] = [];
    for (const frontend of frontends) {
      const { page, close } = await open(frontend.name);
      trees.push(await page.locator("plt-variant-picker").ariaSnapshot());
      await close();
    }
    await writeFile(join(screenshots, "aria-snapshot.yml"), trees[0]);
    expect(trees[1]).toBe(trees[0]);
    expect(trees[2]).toBe(trees[0]);
  });
});
