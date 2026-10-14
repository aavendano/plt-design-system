/**
 * Real-browser test of <plt-navbar> overflow ("More") against the built bundle and the design
 * system's own overflow CSS, on markup shaped like a Shopify theme's header: a list of links where
 * some open mega menus and some are plain, in a bar that is narrower than its links.
 */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

const root = fileURLToPath(new URL("../..", import.meta.url));
const bundle = await readFile(`${root}/dist/plt-web-components.bundle.js`, "utf8");
const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const css = await readFile(`${root}/../design-system/src/components/web-components.css`, "utf8");
// Only the overflow block: the rest of the file depends on theme tokens this page does not define.
const overflowCss = css.slice(css.indexOf("/* Navbar overflow"), css.indexOf("/* Pagination"));

const NAMES = ["Shop", "Learn", "Brands", "Gifts", "Sale", "Blog", "About"];

const page = (attributes: string) => `<!doctype html><html lang="en"><head><title>Navbar overflow</title></head><body style="margin:0;font:16px sans-serif">
<style>
  ${overflowCss}
  plt-navbar { display: block; }
  /* A utility class must not beat the hidden attribute. */
  .theme-list { display: block; }
  header { position: relative; background: #fff; color: #111; }
  nav { width: var(--bar, 1000px); }
  nav > ul { display: flex; align-items: center; gap: 24px; margin: 0; padding: 0 16px; list-style: none; }
  nav a, nav button { color: #111; background: none; border: 0; font: inherit; padding: 12px 0; display: inline-block; }
  .mega-menu-panel { position: absolute; left: 0; right: 0; top: 48px; height: 120px; background: #fff; }
  .mega-menu-panel[data-open="false"] { display: none; }
</style>
<plt-navbar ${attributes}>
  <header>
    <nav aria-label="Main">
      <ul data-plt-navbar-overflow>
        ${NAMES.map((name, i) => {
          const id = i + 1;
          return id % 2
            ? `<li data-plt-navbar-item="${id}"><a id="t${id}" href="#c${id}" aria-haspopup="true" aria-expanded="false" aria-controls="panel-${id}">${name}</a></li>`
            : `<li data-plt-navbar-item="${id}"><a id="t${id}" href="#c${id}">${name}</a></li>`;
        }).join("")}
        <li data-plt-navbar-more hidden>
          <button type="button" id="more-toggle" data-plt-navbar-more-toggle aria-expanded="false" aria-controls="more-list">More</button>
          <ul id="more-list" data-plt-navbar-more-list hidden class="theme-list">
            ${NAMES.map((name, i) => {
              const id = i + 1;
              const popup = id % 2 ? ` aria-haspopup="true" aria-expanded="false" aria-controls="panel-${id}"` : "";
              return `<li data-plt-navbar-more-for="${id}" hidden><a id="m${id}" href="#c${id}"${popup}>${name}</a></li>`;
            }).join("")}
          </ul>
        </li>
      </ul>
    </nav>
    ${NAMES.filter((_, i) => (i + 1) % 2)
      .map((name, i) => {
        const id = i * 2 + 1;
        return `<div class="mega-menu-panel" data-plt-megamenu id="panel-${id}" data-open="false" role="region" aria-label="${name}"><a href="#s${id}">${name} sub</a></div>`;
      })
      .join("")}
  </header>
</plt-navbar>
<main><h1>Store</h1><a href="#end">Content</a></main>
<script type="module">${bundle}</script></body></html>`;

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser?.close();
});

async function open(width: number, attributes = "") {
  const context = await browser.newContext({ viewport: { width: 1200, height: 600 } });
  const p = await context.newPage();
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.setContent(page(attributes));
  await p.waitForFunction(() => customElements.get("plt-navbar") && document.querySelector("plt-navbar")!.hasUpdated);
  await resize(p, width);
  return { p, errors, close: () => context.close() };
}

const resize = async (p: Page, width: number) => {
  await p.evaluate((w) => document.querySelector("nav")!.style.setProperty("--bar", `${w}px`), width);
  await p.evaluate(() => (document.querySelector("plt-navbar") as unknown as { reflow(): void }).reflow());
};
const hidden = (p: Page) =>
  p.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-plt-navbar-item]")].filter((e) => e.hidden).map((e) => e.dataset.pltNavbarItem));
const visibleTexts = (p: Page) =>
  p.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-plt-navbar-item]")]
      .filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => e.textContent!.trim()),
  );
const listedTexts = (p: Page) =>
  p.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-plt-navbar-more-for]")]
      .filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => e.textContent!.trim()),
  );

describe("plt-navbar overflow in Chromium", () => {
  it("shows every link and no More button when the bar is wide enough", async () => {
    const { p, errors, close } = await open(1100);
    expect(await hidden(p)).toEqual([]);
    expect(await p.locator("#more-toggle").isVisible()).toBe(false);
    expect(errors).toEqual([]);
    await close();
  });

  it("hides links from the end, keeps the order and lists every hidden one, plain links too", async () => {
    const { p, close } = await open(420);
    const shown = await visibleTexts(p);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.length).toBeLessThan(NAMES.length);
    // What stays is a prefix, in order; what is hidden is the rest.
    expect(shown).toEqual(NAMES.slice(0, shown.length));
    await p.locator("#more-toggle").click();
    expect(await listedTexts(p)).toEqual(NAMES.slice(shown.length));
    // The bar itself does not overflow.
    expect(await p.evaluate(() => document.querySelector("nav > ul")!.scrollWidth <= document.querySelector("nav")!.clientWidth)).toBe(true);
    await close();
  });

  it("the open list hangs below its button and does not cover it", async () => {
    const { p, close } = await open(420);
    await p.locator("#more-toggle").click();
    const button = (await p.locator("#more-toggle").boundingBox())!;
    const list = (await p.locator("#more-list").boundingBox())!;
    expect(list.y).toBeGreaterThanOrEqual(button.y + button.height - 1);
    // The button can be pressed again to close the list.
    await p.locator("#more-toggle").click();
    expect(await p.locator("#more-list").isVisible()).toBe(false);
    await close();
  });

  it("follows the bar width in both directions", async () => {
    const { p, close } = await open(1100);
    await resize(p, 420);
    await expect.poll(() => visibleTexts(p).then((t) => t.length)).toBeLessThan(NAMES.length);
    await resize(p, 1100);
    expect(await hidden(p)).toEqual([]);
    await close();
  });

  it("keeps overflow-min links however narrow the bar is", async () => {
    const { p, close } = await open(60, 'overflow-min="2"');
    expect((await visibleTexts(p)).slice(0, 2)).toEqual(["Shop", "Learn"]);
    await close();
  });

  it("works from the keyboard: ArrowDown opens the list on the first entry, Escape closes it onto the button", async () => {
    const { p, close } = await open(420);
    const first = (await visibleTexts(p)).length;
    await p.locator("#more-toggle").focus();
    await p.keyboard.press("ArrowDown");
    expect(await p.evaluate(() => document.activeElement?.textContent?.trim())).toBe(NAMES[first]);
    await p.keyboard.press("ArrowDown");
    expect(await p.evaluate(() => document.activeElement?.textContent?.trim())).toBe(NAMES[first + 1]);
    await p.keyboard.press("Escape");
    // A focused entry that has a mega menu closes the menu first; a second Escape closes the list.
    if (await p.locator("#more-list").isVisible()) await p.keyboard.press("Escape");
    expect(await p.locator("#more-list").isVisible()).toBe(false);
    expect(await p.evaluate(() => document.activeElement?.id)).toBe("more-toggle");
    await close();
  });

  it("closes the list on an outside click", async () => {
    const { p, close } = await open(420);
    await p.locator("#more-toggle").click();
    await p.mouse.click(700, 400);
    expect(await p.locator("#more-list").isVisible()).toBe(false);
    await close();
  });

  it("emits plt:navbar-overflow with the hidden ids", async () => {
    const { p, close } = await open(1100);
    await p.evaluate(() => {
      (window as unknown as { seen: string[][] }).seen = [];
      document.querySelector("plt-navbar")!.addEventListener("plt:navbar-overflow", (e) => (window as unknown as { seen: string[][] }).seen.push((e as CustomEvent).detail.hidden));
    });
    await resize(p, 420);
    const seen = await p.evaluate(() => (window as unknown as { seen: string[][] }).seen);
    expect(seen.length).toBe(1);
    expect(seen[0].at(-1)).toBe(String(NAMES.length));
    await close();
  });

  it("has no axe violations with the list open", async () => {
    const { p, close } = await open(420);
    await p.locator("#more-toggle").click();
    await p.evaluate(axeSource);
    const violations = await p.evaluate(async () => {
      const result = await (window as unknown as { axe: { run(): Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe.run();
      return result.violations.map((v) => `${v.id} (${v.nodes.length})`);
    });
    expect(violations).toEqual([]);
    await close();
  });
});
