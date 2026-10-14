/**
 * Real-browser test of the opt-in gallery capabilities (slides, hover zoom,
 * lightbox, thumbnail track) against the built bundle, on markup shaped like a
 * Shopify theme's media gallery.
 */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";

const root = fileURLToPath(new URL("../..", import.meta.url));
const bundle = await readFile(`${root}/dist/plt-web-components.bundle.js`, "utf8");
const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

const PIXEL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='600' height='600' fill='%23cde'/></svg>";

const page = (current = 0) => `<!doctype html><html lang="en"><body>
<style>
  [data-plt-gallery-slide][hidden]{display:none}
  .viewer{position:relative;width:400px;height:400px;margin-bottom:16px;overflow:hidden}
  .viewer [data-plt-gallery-slide]{position:absolute;inset:0}
  [data-plt-gallery-thumb-track]{display:flex;gap:8px;overflow-x:auto;width:240px}
  [data-plt-gallery-thumb]{flex:none;width:70px;height:70px}
  [data-plt-gallery-zoom] { overflow:hidden } [data-plt-gallery-zoom] img{width:100%;height:100%}
</style>
<plt-product-gallery>
  <div class="viewer">
    ${[0, 1, 2, 3, 4, 5].map((i) => `
    <div data-plt-gallery-slide data-media-id="${100 + i}"${i === current ? "" : " hidden"}>
      ${i === 1
        ? `<video muted loop playsinline autoplay width="400" height="400" aria-label="clip"></video>`
        : `<div data-plt-gallery-zoom><img src="${PIXEL}" alt="Photo ${i}" /></div>
           <a href="${PIXEL}" data-plt-gallery-zoom-open data-zoom-alt="Photo ${i} large" aria-label="Zoom image ${i}">zoom</a>`}
    </div>`).join("")}
  </div>
  <button type="button" data-plt-gallery-thumbs-prev aria-label="Previous thumbnails">prev</button>
  <div data-plt-gallery-thumb-track role="tablist" aria-label="Product media">
    ${[0, 1, 2, 3, 4, 5].map((i) => `<button type="button" role="tab" data-plt-gallery-thumb aria-current="${i === current}" aria-selected="${i === current}" aria-label="Media ${i}">${i}</button>`).join("")}
  </div>
  <button type="button" data-plt-gallery-thumbs-next aria-label="Next thumbnails">next</button>
  <dialog data-plt-gallery-lightbox aria-label="">
    <button type="button" data-plt-gallery-lightbox-close aria-label="Close">x</button>
    <img data-plt-gallery-lightbox-image alt="" width="300" />
  </dialog>
</plt-product-gallery>
<script type="module">${bundle}</script>
</body></html>`;

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser?.close();
});

async function open(current = 0, width = 1280) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const p = await context.newPage();
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.setContent(page(current));
  await p.waitForFunction(() => customElements.get("plt-product-gallery") && document.querySelector("plt-product-gallery")!.hasUpdated);
  return { p, errors, close: () => context.close() };
}

describe("gallery capabilities in Chromium", () => {
  it("shows one slide at a time, from thumbnails, keys and selectMedia", async () => {
    const { p, errors, close } = await open();
    const visible = () => p.$$eval("[data-plt-gallery-slide]", (s) => s.map((x) => !(x as HTMLElement).hidden));
    expect(await visible()).toEqual([true, false, false, false, false, false]);
    await p.locator("[data-plt-gallery-thumb]").nth(2).click();
    expect(await visible()).toEqual([false, false, true, false, false, false]);
    await p.keyboard.press("ArrowRight");
    expect(await visible()).toEqual([false, false, false, true, false, false]);
    expect(await p.evaluate(() => document.querySelector("plt-product-gallery")!.selectMedia(105))).toBe(true);
    expect(await visible()).toEqual([false, false, false, false, false, true]);
    expect(await p.locator("[data-plt-gallery-thumb]").nth(5).getAttribute("aria-selected")).toBe("true");
    expect(errors).toEqual([]);
    await close();
  });

  it("scrolls the selected thumbnail into view inside the track, not the page", async () => {
    const { p, close } = await open();
    const track = p.locator("[data-plt-gallery-thumb-track]");
    expect(await track.evaluate((t) => t.scrollLeft)).toBe(0);
    await p.evaluate(() => document.querySelector("plt-product-gallery")!.select(5));
    await expect.poll(() => track.evaluate((t) => t.scrollLeft)).toBeGreaterThan(0);
    expect(await p.evaluate(() => window.scrollY)).toBe(0);
    await p.locator("[data-plt-gallery-thumbs-prev]").click();
    await expect.poll(() => track.evaluate((t) => t.scrollLeft)).toBeLessThan(
      await track.evaluate((t) => t.scrollWidth - t.clientWidth),
    );
    await close();
  });

  it("starts with the server-marked thumbnail in view", async () => {
    const { p, close } = await open(5);
    expect(await p.locator("[data-plt-gallery-thumb-track]").evaluate((t) => t.scrollLeft)).toBeGreaterThan(0);
    await close();
  });

  it("pauses the video when its slide is hidden and plays it again when shown", async () => {
    const { p, close } = await open(1);
    await p.evaluate(() => {
      const video = document.querySelector("video")!;
      (window as unknown as { log: string[] }).log = [];
      video.pause = () => (window as unknown as { log: string[] }).log.push("pause");
      video.play = () => ((window as unknown as { log: string[] }).log.push("play"), Promise.resolve());
    });
    await p.locator("[data-plt-gallery-thumb]").nth(0).click();
    await p.locator("[data-plt-gallery-thumb]").nth(1).click();
    expect(await p.evaluate(() => (window as unknown as { log: string[] }).log)).toEqual(["pause", "play"]);
    await close();
  });

  it("zooms toward the pointer on a wide screen with a mouse", async () => {
    const { p, close } = await open();
    const pane = p.locator("[data-plt-gallery-slide]:not([hidden]) [data-plt-gallery-zoom]");
    const box = (await pane.boundingBox())!;
    await p.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.75);
    expect(await pane.evaluate((e) => (e as HTMLElement).style.getPropertyValue("--plt-zoom-x"))).toMatch(/^2[45](\.\d+)?%$/);
    expect(await pane.evaluate((e) => (e as HTMLElement).style.getPropertyValue("--plt-zoom-y"))).toMatch(/^7[45](\.\d+)?%$/);
    await p.mouse.move(0, 0);
    expect(await pane.evaluate((e) => (e as HTMLElement).style.getPropertyValue("--plt-zoom-x"))).toBe("");
    await close();
  });

  it("opens the lightbox modally, traps focus, closes with Escape and returns focus", async () => {
    const { p, close } = await open();
    const opener = p.getByRole("link", { name: "Zoom image 0" });
    await opener.focus();
    await p.keyboard.press("Enter");
    const dialog = p.locator("dialog[data-plt-gallery-lightbox]");
    expect(await dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(true);
    expect(await p.url()).toBe("about:blank");
    expect(await dialog.getAttribute("aria-label")).toBe("Photo 0 large");
    expect(await p.locator("[data-plt-gallery-lightbox-image]").getAttribute("alt")).toBe("Photo 0 large");
    // Focus lands inside the dialog; the rest of the page is inert, so Tab never reaches it.
    expect(await p.evaluate(() => document.querySelector("dialog")!.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 4; i++) {
      await p.keyboard.press("Tab");
      expect(
        await p.evaluate(() => {
          const active = document.activeElement;
          return active === document.body || document.querySelector("dialog")!.contains(active);
        }),
      ).toBe(true);
    }
    const violations = await p.evaluate(async (axe) => {
      const el = document.createElement("script");
      el.textContent = axe;
      document.head.append(el);
      const results = await (window as unknown as { axe: { run: (c: string) => Promise<{ violations: { id: string }[] }> } }).axe.run("dialog");
      return results.violations.map((v) => v.id);
    }, axeSource);
    expect(violations).toEqual([]);
    await p.keyboard.press("Escape");
    expect(await dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(false);
    expect(await p.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe("Zoom image 0");
    expect(await p.locator("[data-plt-gallery-lightbox-image]").getAttribute("src")).toBeNull();
    await close();
  });

  it("closes the lightbox from the close button and the backdrop", async () => {
    const { p, close } = await open();
    const dialog = p.locator("dialog[data-plt-gallery-lightbox]");
    await p.getByRole("link", { name: "Zoom image 0" }).click();
    await p.getByRole("button", { name: "Close" }).click();
    expect(await dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(false);
    await p.getByRole("link", { name: "Zoom image 0" }).click();
    await p.mouse.click(5, 5);
    expect(await dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(false);
    await close();
  });
});
