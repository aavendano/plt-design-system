import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../src/collection/define";
import "../../src/navigation/define";
import "../../src/product/define";
import { activeFilters, selectedValues, toQuery } from "../../src/collection/params";
import type { PltFilter } from "../../src/collection/types";

const flush = (element: { updateComplete: Promise<unknown> }) => element.updateComplete;

const filters: PltFilter[] = [
  {
    id: "filter.v.option.color",
    label: "Color",
    options: [
      { label: "All", value: "" },
      { label: "Red", value: "Red", selected: true },
      { label: "Blue", value: "Blue" },
    ],
  },
  {
    id: "filter.v.option.size",
    label: "Size",
    options: [
      { label: "All", value: "" },
      { label: "S", value: "S" },
    ],
  },
];

describe("collection params", () => {
  it("derives selection, query and active chips", () => {
    const values = selectedValues(filters);
    expect(values).toEqual({ "filter.v.option.color": "Red", "filter.v.option.size": "" });
    expect(toQuery(values)).toBe("filter.v.option.color=Red");
    expect(activeFilters(filters, values)).toEqual([
      { id: "filter.v.option.color", label: "Color", value: "Red", valueLabel: "Red" },
    ]);
  });
});

describe("<plt-filter-bar>", () => {
  let submit: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    submit = vi.spyOn(HTMLFormElement.prototype, "requestSubmit").mockImplementation(() => {});
  });
  afterEach(() => {
    submit.mockRestore();
    document.body.innerHTML = "";
  });

  async function mount(attributes = "") {
    document.body.innerHTML = `<plt-filter-bar action="/collections/all" ${attributes}><form data-plt-fallback class="plt-filter-bar"><select name="x"></select></form></plt-filter-bar>`;
    const element = document.querySelector("plt-filter-bar")!;
    element.filters = filters;
    await flush(element);
    return element;
  }

  const select = (element: HTMLElement, index: number) =>
    element.querySelectorAll<HTMLSelectElement>("form.plt-filter-bar:not([data-plt-fallback]) select")[index];

  it("renders the FilterBar anatomy with labelled selects and retires the fallback", async () => {
    const element = await mount();
    const form = element.querySelector<HTMLFormElement>("form.plt-filter-bar:not([data-plt-fallback])")!;
    expect(form.getAttribute("action")).toBe("/collections/all");
    expect(form.method).toBe("get");
    const color = select(element, 0);
    expect(color.value).toBe("Red");
    expect(element.querySelector(`label[for="${color.id}"]`)!.textContent).toBe("Color");
    expect(element.querySelector<HTMLElement>("[data-plt-fallback]")!.hidden).toBe(true);
    expect(element.querySelector('button[type="submit"]')).toBeNull();
    expect(element.querySelector(".plt-filter-bar__chips")!.textContent).toContain("Color: Red");
  });

  it("emits a cancelable plt:filter-change and submits unless cancelled", async () => {
    const element = await mount();
    const events: CustomEvent[] = [];
    element.addEventListener("plt:filter-change", (event) => events.push(event as CustomEvent));
    const size = select(element, 1);
    size.value = "S";
    size.dispatchEvent(new Event("change", { bubbles: true }));
    expect(events[0].cancelable).toBe(true);
    expect(events[0].detail).toEqual({
      values: { "filter.v.option.color": "Red", "filter.v.option.size": "S" },
      changed: "filter.v.option.size",
      query: "filter.v.option.color=Red&filter.v.option.size=S",
    });
    expect(submit).toHaveBeenCalledTimes(1);

    element.addEventListener("plt:filter-change", (event) => event.preventDefault());
    size.value = "";
    size.dispatchEvent(new Event("change", { bubbles: true }));
    expect(submit).toHaveBeenCalledTimes(1);
    expect(element.values).toEqual({ "filter.v.option.color": "Red" });
  });

  it("removes a chip, clears all, and returns focus to the select", async () => {
    const element = await mount();
    element.addEventListener("plt:filter-change", (event) => event.preventDefault());
    const chip = element.querySelector<HTMLButtonElement>(".plt-filter-bar__chips button")!;
    expect(chip.getAttribute("aria-label")).toBe("Remove filter: Color Red");
    chip.click();
    await flush(element);
    await Promise.resolve();
    expect(element.values).toEqual({});
    expect(element.querySelector(".plt-filter-bar__active")).toBeNull();
    expect(document.activeElement).toBe(select(element, 0));
  });

  it("submits its own form, never the server-rendered fallback", async () => {
    const element = await mount();
    submit.mockImplementation(function (this: HTMLFormElement) {
      expect(this.hasAttribute("data-plt-fallback")).toBe(false);
    });
    const size = select(element, 1);
    size.value = "S";
    size.dispatchEvent(new Event("change", { bubbles: true }));
    expect(submit).toHaveBeenCalledTimes(1);
    expect(element.form!.hasAttribute("data-plt-fallback")).toBe(false);
  });

  it("in manual mode shows Apply and only reports on submit", async () => {
    const element = await mount("manual");
    const listener = vi.fn((event: Event) => event.preventDefault());
    element.addEventListener("plt:filter-change", listener);
    const color = select(element, 0);
    color.value = "Blue";
    color.dispatchEvent(new Event("change", { bubbles: true }));
    expect(submit).not.toHaveBeenCalled();
    const form = element.querySelector<HTMLFormElement>("form.plt-filter-bar:not([data-plt-fallback])")!;
    const submitEvent = new Event("submit", { cancelable: true });
    form.dispatchEvent(submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
    expect(listener.mock.calls.at(-1)![0].detail.values).toEqual({ "filter.v.option.color": "Blue" });
  });
});

describe("<plt-sort-select> and <plt-pagination>", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("sort: emits plt:sort-change and submits unless cancelled", async () => {
    const submit = vi.spyOn(HTMLFormElement.prototype, "requestSubmit").mockImplementation(() => {});
    document.body.innerHTML = '<plt-sort-select name="sort_by" label="Sort"></plt-sort-select>';
    const element = document.querySelector("plt-sort-select")!;
    element.options = [
      { label: "Featured", value: "manual" },
      { label: "Price, low to high", value: "price-ascending", selected: true },
    ];
    await flush(element);
    const selectEl = element.querySelector("select")!;
    expect(selectEl.name).toBe("sort_by");
    expect(selectEl.value).toBe("price-ascending");
    const listener = vi.fn();
    element.addEventListener("plt:sort-change", listener);
    selectEl.value = "manual";
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[0][0].detail).toEqual({ name: "sort_by", value: "manual" });
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("pagination: renders links, marks the current page, lets clicks be cancelled", async () => {
    document.body.innerHTML = '<plt-pagination previous-url="?page=1" next-url="?page=3"></plt-pagination>';
    const element = document.querySelector("plt-pagination")!;
    element.pages = [
      { label: "1", url: "?page=1" },
      { label: "2", current: true },
      { label: "3", url: "?page=3" },
    ];
    await flush(element);
    const nav = element.querySelector("nav.plt-pagination")!;
    expect(nav.getAttribute("aria-label")).toBe("Pagination");
    expect(element.querySelector('[aria-current="page"]')!.textContent).toBe("2");
    expect([...element.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["?page=1", "?page=1", "?page=3", "?page=3"]);
    element.addEventListener("plt:page-change", (event) => event.preventDefault());
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    element.querySelectorAll("a")[2].dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    const modified = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
    element.querySelectorAll("a")[2].dispatchEvent(modified);
    expect(modified.defaultPrevented).toBe(false);
  });
});

describe("<plt-navbar>", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="outside">Outside</button>
      <plt-navbar>
        <header class="plt-navbar">
          <button data-plt-navbar-toggle aria-expanded="false" aria-controls="mobile">Menu</button>
          <ul>
            <li><a id="shop" href="/shop" aria-haspopup="true" aria-expanded="false" aria-controls="mega-shop">Shop</a></li>
            <li><a id="toys" href="/toys" aria-haspopup="true" aria-expanded="false" aria-controls="mega-toys">Toys</a></li>
            <li><a id="about" href="/about">About</a></li>
          </ul>
          <div class="plt-megamenu" id="mega-shop" data-open="false"><a id="shop-first" href="/shop/new">New</a><a href="/shop/sale">Sale</a></div>
          <div class="plt-megamenu" id="mega-toys" data-open="false"><a id="toys-first" href="/toys/all">All toys</a></div>
          <div id="mobile" data-open="false" hidden><a href="/shop">Shop</a></div>
        </header>
      </plt-navbar>`;
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
  const key = (target: HTMLElement, name: string) =>
    target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }));

  it("keeps the mobile toggle contract: click, Escape, outside click", () => {
    const toggle = $("[data-plt-navbar-toggle]");
    const panel = $("#mobile");
    toggle.click();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(panel.dataset.open).toBe("true");
    expect(panel.hidden).toBe(false);
    key(panel, "Escape");
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);
    toggle.click();
    $("#outside").click();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens a mega menu on focus, one at a time, and closes on Escape", () => {
    const events: Array<{ id: string; open: boolean }> = [];
    $("plt-navbar").addEventListener("plt:megamenu-toggle", (event) => events.push((event as CustomEvent).detail));
    $("#shop").focus();
    expect($("#mega-shop").dataset.open).toBe("true");
    expect($("#shop").getAttribute("aria-expanded")).toBe("true");
    $("#toys").focus();
    expect($("#mega-shop").dataset.open).toBe("false");
    expect($("#mega-toys").dataset.open).toBe("true");
    key($("#toys"), "ArrowDown");
    expect(document.activeElement).toBe($("#toys-first"));
    key($("#toys-first"), "Escape");
    expect($("#mega-toys").dataset.open).toBe("false");
    expect(document.activeElement).toBe($("#toys"));
    expect(events.slice(0, 3)).toEqual([
      { id: "mega-shop", open: true },
      { id: "mega-shop", open: false },
      { id: "mega-toys", open: true },
    ]);
  });

  it("opens on hover and closes after leaving trigger and panel", () => {
    vi.useFakeTimers();
    const over = (target: HTMLElement, relatedTarget: Element | null = null) =>
      target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse", relatedTarget }));
    const out = (target: HTMLElement, relatedTarget: Element | null) =>
      target.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse", relatedTarget }));
    over($("#shop"));
    expect($("#mega-shop").dataset.open).toBe("true");
    out($("#shop"), $("#mega-shop"));
    over($("#mega-shop"));
    vi.advanceTimersByTime(300);
    expect($("#mega-shop").dataset.open).toBe("true");
    out($("#mega-shop"), $("#outside"));
    vi.advanceTimersByTime(100);
    expect($("#mega-shop").dataset.open).toBe("true");
    vi.advanceTimersByTime(100);
    expect($("#mega-shop").dataset.open).toBe("false");
  });

  it("closes when focus leaves and when a panel link is followed", () => {
    $("#shop").focus();
    $("#about").focus();
    expect($("#mega-shop").dataset.open).toBe("false");
    $("#shop").focus();
    $("#shop-first").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect($("#mega-shop").dataset.open).toBe("false");
  });
});

describe("<plt-product-gallery> additions", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("moves with arrow keys, copies srcset and reports the change", async () => {
    document.body.innerHTML = `<plt-product-gallery>
      <div class="plt-product-detail__gallery-main"><img src="a.jpg" srcset="a.jpg 1x, a2.jpg 2x" alt="A"></div>
      <button class="plt-product-detail__thumb" aria-label="Front"><img src="a.jpg" srcset="a.jpg 1x, a2.jpg 2x" alt=""></button>
      <button class="plt-product-detail__thumb" aria-label="Back"><img src="b.jpg" srcset="b.jpg 1x, b2.jpg 2x" alt=""></button>
    </plt-product-gallery>`;
    const gallery = document.querySelector("plt-product-gallery")!;
    const [first, second] = gallery.thumbs;
    const main = gallery.querySelector<HTMLImageElement>(".plt-product-detail__gallery-main img")!;
    const changes = vi.fn();
    gallery.addEventListener("plt:gallery-change", changes);
    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(second);
    expect(main.getAttribute("srcset")).toBe("b.jpg 1x, b2.jpg 2x");
    expect(main.alt).toBe("Back");
    expect(second.getAttribute("aria-current")).toBe("true");
    expect(changes.mock.calls[0][0].detail).toMatchObject({ index: 1 });
    gallery.selectedIndex = 0;
    await gallery.updateComplete;
    expect(main.getAttribute("srcset")).toBe("a.jpg 1x, a2.jpg 2x");
  });
});
