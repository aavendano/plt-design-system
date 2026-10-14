import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../src/navigation/define";
import type { PltNavbar } from "../../src/navigation/plt-navbar";

/** Overflow ("More") of <plt-navbar>. jsdom has no layout, so widths are stubbed: every link is 100px wide with a 10px gap. */

const LINKS = 5;
const WIDTH = 100;
const GAP = 10;
const MORE_WIDTH = 60;

const markup = (attributes = "") => `
  <plt-navbar ${attributes}>
    <nav id="bar" data-plt-navbar-overflow>
      <ul>
        ${Array.from({ length: LINKS }, (_, i) => {
          const id = i + 1;
          // Links 1 and 3 have a mega menu; the others are plain links.
          return id % 2
            ? `<li data-plt-navbar-item="${id}"><a id="t${id}" href="/c${id}" aria-haspopup="true" aria-expanded="false" aria-controls="panel-${id}">Item ${id}</a></li>`
            : `<li data-plt-navbar-item="${id}"><a id="t${id}" href="/c${id}">Item ${id}</a></li>`;
        }).join("")}
        <li data-plt-navbar-more id="more" hidden>
          <button type="button" id="more-toggle" data-plt-navbar-more-toggle aria-expanded="false" aria-controls="more-list">More</button>
          <ul id="more-list" data-plt-navbar-more-list hidden>
            ${Array.from({ length: LINKS }, (_, i) => {
              const id = i + 1;
              const popup = id % 2 ? ` aria-haspopup="true" aria-expanded="false" aria-controls="panel-${id}"` : "";
              return `<li data-plt-navbar-more-for="${id}" hidden><a id="m${id}" href="/c${id}"${popup}>Item ${id}</a></li>`;
            }).join("")}
          </ul>
        </li>
      </ul>
    </nav>
    <div class="mega-menu-panel" data-plt-megamenu id="panel-1" data-open="false"><a href="/c1/x">Sub</a></div>
    <div class="mega-menu-panel" data-plt-megamenu id="panel-3" data-open="false"><a href="/c3/x">Sub</a></div>
  </plt-navbar>`;

const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const navbar = () => $<PltNavbar>("plt-navbar");
const hiddenItems = () =>
  [...document.querySelectorAll<HTMLElement>("[data-plt-navbar-item]")].filter((el) => el.hidden).map((el) => el.dataset.pltNavbarItem);
const listed = () =>
  [...document.querySelectorAll<HTMLElement>("[data-plt-navbar-more-for]")].filter((el) => !el.hidden).map((el) => el.dataset.pltNavbarMoreFor);

/** Stubs the layout; returns a setter for the bar width. */
function layout(initial: number) {
  let width = initial;
  const bar = $("#bar");
  Object.defineProperty(bar, "clientWidth", { configurable: true, get: () => width });
  document.querySelectorAll<HTMLElement>("[data-plt-navbar-item]").forEach((item, index) => {
    const left = index * (WIDTH + GAP);
    item.getBoundingClientRect = () => ({ left, right: left + WIDTH, width: WIDTH, top: 0, bottom: 20, height: 20, x: left, y: 0, toJSON: () => ({}) });
  });
  $("#more").getBoundingClientRect = () => ({ left: 0, right: MORE_WIDTH, width: MORE_WIDTH, top: 0, bottom: 20, height: 20, x: 0, y: 0, toJSON: () => ({}) });
  return (next: number) => {
    width = next;
  };
}

/** Mounts the markup, stubs the layout, then measures. */
function mount(initial: number, attributes = "") {
  document.body.innerHTML = markup(attributes);
  const resize = layout(initial);
  navbar().reflow();
  return resize;
}

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0) as unknown as number);
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("<plt-navbar> overflow", () => {
  it("keeps every link and hides More when they all fit", () => {
    mount(5 * WIDTH + 4 * GAP);
    expect(hiddenItems()).toEqual([]);
    expect($("#more").hidden).toBe(true);
    expect(listed()).toEqual([]);
  });

  it("hides links from the end so the order is kept, and lists every hidden one, plain links included", () => {
    // Room for the first two links plus More: 100 + 10 + 100 + 10 + 60 = 280.
    mount(285);
    expect(hiddenItems()).toEqual(["3", "4", "5"]);
    expect($("#more").hidden).toBe(false);
    expect(listed()).toEqual(["3", "4", "5"]);
    // 3 has a mega menu, 4 and 5 are plain links: all three are reachable.
    expect($("#m4").getAttribute("href")).toBe("/c4");
  });

  it("never hides fewer than overflow-min links, and shows all of them when the bar is wide again", () => {
    const resize = mount(10, 'overflow-min="2"');
    expect(hiddenItems()).toEqual(["3", "4", "5"]);
    resize(1000);
    navbar().reflow();
    expect(hiddenItems()).toEqual([]);
    expect($("#more").hidden).toBe(true);
  });

  it("keeps at least one link by default", () => {
    mount(10);
    expect(hiddenItems()).toEqual(["2", "3", "4", "5"]);
  });

  it("emits plt:navbar-overflow only when the set of hidden links changes", () => {
    const resize = mount(1000);
    const seen: string[][] = [];
    navbar().addEventListener("plt:navbar-overflow", (event) => seen.push((event as CustomEvent<{ hidden: string[] }>).detail.hidden));
    resize(285);
    navbar().reflow();
    navbar().reflow();
    expect(seen).toEqual([["3", "4", "5"]]);
    resize(1000);
    navbar().reflow();
    expect(seen).toEqual([["3", "4", "5"], []]);
  });

  it("reflows by itself when the bar is resized", async () => {
    let notify: () => void = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    document.body.innerHTML = markup();
    const resize = layout(1000);
    // Reconnect so the observer is created after the layout stub.
    const element = navbar();
    element.remove();
    document.body.append(element);
    expect(hiddenItems()).toEqual([]);
    resize(285);
    notify();
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(hiddenItems()).toEqual(["3", "4", "5"]);
  });

  it("does nothing without the hook", () => {
    document.body.innerHTML = `<plt-navbar><ul><li data-plt-navbar-item="1">x</li></ul></plt-navbar>`;
    expect(() => navbar().reflow()).not.toThrow();
  });
});

describe("<plt-navbar> More menu", () => {
  const key = (target: HTMLElement, name: string) => target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true }));

  it("opens and closes the list from the button, with aria-expanded kept in sync", () => {
    mount(285);
    $("#more-toggle").click();
    expect($("#more-list").hidden).toBe(false);
    expect($("#more-toggle").getAttribute("aria-expanded")).toBe("true");
    $("#more-toggle").click();
    expect($("#more-list").hidden).toBe(true);
    expect($("#more-toggle").getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on Escape and returns focus to the button", () => {
    mount(285);
    navbar().openMore();
    $("#m4").focus();
    key($("#m4"), "Escape");
    expect(navbar().moreOpen).toBe(false);
    expect(document.activeElement).toBe($("#more-toggle"));
  });

  it("closes the mega menu first on Escape, then the list", () => {
    mount(285);
    navbar().openMore();
    $("#m3").focus(); // focusing a trigger opens its panel, as in the bar
    expect($("#panel-3").dataset.open).toBe("true");
    key($("#m3"), "Escape");
    expect($("#panel-3").dataset.open).toBe("false");
    expect(navbar().moreOpen).toBe(true);
    expect(document.activeElement).toBe($("#m3"));
    key($("#m3"), "Escape");
    expect(navbar().moreOpen).toBe(false);
    expect(document.activeElement).toBe($("#more-toggle"));
  });

  it("moves between entries with the arrow keys and Home/End, skipping hidden entries", () => {
    mount(285);
    $("#more-toggle").focus();
    key($("#more-toggle"), "ArrowDown");
    expect(navbar().moreOpen).toBe(true);
    expect(document.activeElement).toBe($("#m3"));
    key($("#m3"), "ArrowDown");
    expect(document.activeElement).toBe($("#m4"));
    key($("#m4"), "End");
    expect(document.activeElement).toBe($("#m5"));
    key($("#m5"), "ArrowDown");
    expect(document.activeElement).toBe($("#m3"));
    key($("#m3"), "ArrowUp");
    expect(document.activeElement).toBe($("#m5"));
    key($("#m5"), "Home");
    expect(document.activeElement).toBe($("#m3"));
  });

  it("closes when the click lands outside it", () => {
    mount(285);
    navbar().openMore();
    document.body.click();
    expect(navbar().moreOpen).toBe(false);
  });

  it("closes the list when a link in it is followed", () => {
    mount(285);
    navbar().openMore();
    $("#m4").addEventListener("click", (event) => event.preventDefault());
    $("#m4").click();
    expect(navbar().moreOpen).toBe(false);
  });

  it("closes the list when the links fit again", () => {
    const resize = mount(285);
    navbar().openMore();
    resize(1000);
    navbar().reflow();
    expect(navbar().moreOpen).toBe(false);
    expect($("#more").hidden).toBe(true);
  });

  it("closes a mega menu whose trigger moved into a closed More list", () => {
    const resize = mount(1000);
    navbar().openMegaMenu("panel-3");
    expect($("#panel-3").dataset.open).toBe("true");
    resize(285);
    navbar().reflow();
    expect($("#panel-3").dataset.open).toBe("false");
    expect($("#t3").getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps a mega menu open from its link inside the open More list", () => {
    mount(285);
    navbar().openMore();
    navbar().openMegaMenu("panel-3");
    expect($("#panel-3").dataset.open).toBe("true");
    // Both triggers of the panel, the hidden one in the bar and the one in More, report it as open.
    expect($("#m3").getAttribute("aria-expanded")).toBe("true");
    expect($("#t3").getAttribute("aria-expanded")).toBe("true");
  });
});
