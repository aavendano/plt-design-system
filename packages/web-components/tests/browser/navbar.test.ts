/**
 * Real-browser test of the opt-in <plt-navbar> capabilities (hover intent, [data-plt-megamenu],
 * published height, deferred images) against the built bundle, on markup shaped like a Shopify
 * theme's header: panels keep their own classes and are shown by `data-open`.
 */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

const root = fileURLToPath(new URL("../..", import.meta.url));
const bundle = await readFile(`${root}/dist/plt-web-components.bundle.js`, "utf8");
const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const PIXEL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='%23cde'/></svg>";

const page = (attributes: string, beforeBundle = "") => `<!doctype html><html lang="en"><body style="margin:0">
<style>
  plt-navbar { display: block; }
  header { height: 66px; background: #eee; position: relative; }
  ul { display: flex; gap: 40px; margin: 0; padding: 20px; list-style: none; }
  .mega-menu-panel { position: absolute; left: 0; right: 0; top: 66px; height: 200px; background: #fff; }
  .mega-menu-panel[data-open="false"] { display: none; }
</style>
<plt-navbar ${attributes}>
  <header>
    <ul>
      <li><a id="a" href="#a" aria-haspopup="true" aria-expanded="false" aria-controls="panel-a">Alpha</a></li>
      <li><a id="b" href="#b" aria-haspopup="true" aria-expanded="false" aria-controls="panel-b">Beta</a></li>
    </ul>
    <div class="mega-menu-panel" data-plt-megamenu id="panel-a" data-open="false" role="region" aria-label="Alpha">
      <a href="#a1">One</a>
      <img id="img" alt="Sample" width="40" height="40" data-plt-navbar-deferred data-deferred-src="${PIXEL}">
    </div>
    <div class="mega-menu-panel" data-plt-megamenu id="panel-b" data-open="false" role="region" aria-label="Beta"><a href="#b1">Two</a></div>
  </header>
</plt-navbar>
<script>${beforeBundle}</script>
<script type="module">${bundle}</script></body></html>`;

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser?.close();
});

async function open(attributes = "") {
  const context = await browser.newContext({ viewport: { width: 1000, height: 600 } });
  const p = await context.newPage();
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.setContent(page(attributes));
  await p.waitForFunction(() => customElements.get("plt-navbar") && document.querySelector("plt-navbar")!.hasUpdated);
  return { p, errors, close: () => context.close() };
}

const isOpen = (p: Page, id: string) => p.locator(`#${id}`).evaluate((e) => (e as HTMLElement).dataset.open === "true");

describe("plt-navbar capabilities in Chromium", () => {
  it("hover-delay: a pointer crossing the bar opens nothing, one that stays opens the panel", async () => {
    const { p, errors, close } = await open('hover-delay="200"');
    const a = (await p.locator("#a").boundingBox())!;
    const b = (await p.locator("#b").boundingBox())!;
    // Cross both triggers quickly.
    await p.mouse.move(a.x + 5, a.y + 5);
    await p.mouse.move(b.x + 5, b.y + 5);
    await p.mouse.move(900, 400);
    await p.waitForTimeout(400);
    expect(await isOpen(p, "panel-a")).toBe(false);
    expect(await isOpen(p, "panel-b")).toBe(false);
    // Stay on one.
    await p.mouse.move(a.x + 5, a.y + 5);
    await p.waitForTimeout(100);
    expect(await isOpen(p, "panel-a")).toBe(false);
    await expect.poll(() => isOpen(p, "panel-a")).toBe(true);
    expect(await p.locator("#panel-a").isVisible()).toBe(true);
    // Leaving closes it after the existing delay.
    await p.mouse.move(900, 500);
    await expect.poll(() => isOpen(p, "panel-a")).toBe(false);
    expect(errors).toEqual([]);
    await close();
  });

  it("without hover-delay the panel opens at once, as before", async () => {
    const { p, close } = await open();
    const a = (await p.locator("#a").boundingBox())!;
    await p.mouse.move(a.x + 5, a.y + 5);
    expect(await isOpen(p, "panel-a")).toBe(true);
    await close();
  });

  it("works with the [data-plt-megamenu] attribute: focus, ArrowDown, Escape", async () => {
    const { p, close } = await open();
    await p.locator("#a").focus();
    expect(await isOpen(p, "panel-a")).toBe(true);
    await p.keyboard.press("ArrowDown");
    expect(await p.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#a1");
    const violations = await p.evaluate(async (axe) => {
      const el = document.createElement("script");
      el.textContent = axe;
      document.head.append(el);
      const results = await (window as unknown as { axe: { run: (c: string) => Promise<{ violations: { id: string }[] }> } }).axe.run("header");
      return results.violations.map((v) => v.id);
    }, axeSource);
    expect(violations).toEqual([]);
    await p.keyboard.press("Escape");
    expect(await isOpen(p, "panel-a")).toBe(false);
    expect(await p.evaluate(() => document.activeElement?.id)).toBe("a");
    await close();
  });

  it('publish-height="root": --plt-navbar-height follows the real height', async () => {
    const { p, close } = await open('publish-height="root"');
    const value = () => p.evaluate(() => document.documentElement.style.getPropertyValue("--plt-navbar-height"));
    expect(await value()).toBe("66px");
    await p.evaluate(() => ((document.querySelector("header") as HTMLElement).style.height = "90px"));
    await expect.poll(value).toBe("90px");
    await close();
  });

  it("publish-height without a value sets it on the element only", async () => {
    const { p, close } = await open("publish-height");
    expect(await p.evaluate(() => document.querySelector("plt-navbar")!.style.getPropertyValue("--plt-navbar-height"))).toBe("66px");
    expect(await p.evaluate(() => document.documentElement.style.getPropertyValue("--plt-navbar-height"))).toBe("");
    await close();
  });

  it("deferred images are not requested until hover intent, then load", async () => {
    const context = await browser.newContext({ viewport: { width: 1000, height: 600 } });
    const p = await context.newPage();
    // Hold the idle callback off so that only intent can load the image (the page is idle at once otherwise).
    await p.setContent(page('hover-delay="200"', "window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {};"));
    await p.waitForFunction(() => customElements.get("plt-navbar"));
    expect(await p.locator("#img").getAttribute("src")).toBeNull();
    const a = (await p.locator("#a").boundingBox())!;
    await p.mouse.move(a.x + 5, a.y + 5);
    expect(await p.locator("#img").getAttribute("src")).toBe(PIXEL);
    await expect.poll(() => p.locator("#img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await context.close();
  });

  it("modal drawer: showModal, focus trap, scroll lock, Escape returns focus", async () => {
    const context = await browser.newContext({ viewport: { width: 1000, height: 600 } });
    const p = await context.newPage();
    await p.setContent(`<!doctype html><html lang="en"><body style="margin:0;height:2000px">
<style>plt-navbar{display:block}dialog[data-plt-navbar-drawer]{width:min(20rem,100vw);height:100dvh;margin:0;border:0;padding:1rem}</style>
<plt-navbar>
  <button id="toggle" data-plt-navbar-toggle aria-expanded="false" aria-controls="drawer"
    data-label-open="Open menu" data-label-close="Close menu" aria-label="Open menu">Menu</button>
  <dialog id="drawer" data-plt-navbar-drawer data-open="false">
    <button type="button" data-plt-navbar-drawer-close id="close">Close</button>
    <a id="link" href="#shop">Shop</a>
  </dialog>
</plt-navbar>
<script type="module">${bundle}</script></body></html>`);
    await p.waitForFunction(() => customElements.get("plt-navbar") && document.querySelector("plt-navbar")!.hasUpdated);
    await p.locator("#toggle").click();
    await expect.poll(() => p.locator("#drawer").evaluate((d) => (d as HTMLDialogElement).open)).toBe(true);
    expect(await p.evaluate(() => document.body.style.overflow)).toBe("hidden");
    expect(await p.locator("#toggle").getAttribute("aria-label")).toBe("Close menu");
    await p.locator("#link").focus();
    expect(await p.evaluate(() => document.activeElement?.id)).toBe("link");
    const violations = await p.evaluate(async (axe) => {
      const el = document.createElement("script");
      el.textContent = axe;
      document.head.append(el);
      const results = await (window as unknown as { axe: { run: (c: Element) => Promise<{ violations: { id: string }[] }> } }).axe.run(
        document.querySelector("dialog")!,
      );
      return results.violations.map((v) => v.id);
    }, axeSource);
    expect(violations).toEqual([]);
    await p.keyboard.press("Escape");
    await expect.poll(() => p.locator("#drawer").evaluate((d) => (d as HTMLDialogElement).open)).toBe(false);
    expect(await p.evaluate(() => document.body.style.overflow)).toBe("");
    expect(await p.evaluate(() => document.activeElement?.id)).toBe("toggle");
    await context.close();
  });
});
