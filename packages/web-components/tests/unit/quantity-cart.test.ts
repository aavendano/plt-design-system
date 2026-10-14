import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../src/quantity-selector/define";
import "../../src/cart/define";
import { clampQuantity } from "../../src/quantity-selector/quantity";
import type { PltCartLineData } from "../../src/cart/types";

const flush = (element: { updateComplete: Promise<unknown> }) => element.updateComplete;

describe("clampQuantity", () => {
  it("parses, clamps and snaps to the step grid", () => {
    expect(clampQuantity("3")).toBe(3);
    expect(clampQuantity("abc", { min: 2 })).toBe(2);
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(12, { max: 10 })).toBe(10);
    expect(clampQuantity(7, { min: 1, step: 3 })).toBe(7);
    expect(clampQuantity(8, { min: 1, step: 3 })).toBe(7);
    expect(clampQuantity(2.9)).toBe(2);
  });
});

describe("<plt-quantity-selector>", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function mount(attributes = "") {
    document.body.innerHTML = `<form><plt-quantity-selector ${attributes}>
      <input data-plt-fallback type="number" name="quantity" value="1">
    </plt-quantity-selector></form>`;
    const element = document.querySelector("plt-quantity-selector")!;
    await flush(element);
    const [decrease, increase] = element.querySelectorAll<HTMLButtonElement>(".plt-quantity-selector button");
    const input = element.querySelector<HTMLInputElement>(".plt-quantity-selector input")!;
    return { element, decrease, increase, input, form: element.closest("form")! };
  }

  it("renders the QuantitySelector anatomy and retires the fallback", async () => {
    const { element, input, decrease, form } = await mount('value="2" max="5"');
    expect(element.querySelector(".d-join.plt-quantity-selector")).not.toBeNull();
    expect(input.value).toBe("2");
    expect(input.getAttribute("aria-label")).toBe("Quantity");
    expect(decrease.getAttribute("aria-label")).toBe("Decrease quantity");
    const fallback = element.querySelector<HTMLInputElement>("[data-plt-fallback]")!;
    expect(fallback.hidden).toBe(true);
    expect(fallback.disabled).toBe(true);
    expect(new FormData(form).getAll("quantity")).toEqual(["2"]);
  });

  it("steps within bounds and keeps bound buttons focusable", async () => {
    const { element, decrease, increase } = await mount('value="1" max="2"');
    const listener = vi.fn();
    element.addEventListener("plt:quantity-change", listener);
    expect(decrease.getAttribute("aria-disabled")).toBe("true");
    expect(decrease.disabled).toBe(false);
    decrease.click();
    expect(listener).not.toHaveBeenCalled();
    increase.click();
    await flush(element);
    expect(element.value).toBe(2);
    expect(listener.mock.calls[0][0].detail).toEqual({ value: 2, previousValue: 1 });
    expect(listener.mock.calls[0][0].bubbles).toBe(true);
    expect(increase.getAttribute("aria-disabled")).toBe("true");
    increase.click();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("clamps typed values on change", async () => {
    const { element, input } = await mount('value="3" max="10"');
    input.value = "99";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await flush(element);
    expect(element.value).toBe(10);
    expect(input.value).toBe("10");
    input.value = "nope";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await flush(element);
    expect(input.value).toBe("1");
  });

  it("is fully disabled when disabled", async () => {
    const { element, input, increase } = await mount("disabled");
    expect(input.disabled).toBe(true);
    expect(increase.getAttribute("aria-disabled")).toBe("true");
    increase.click();
    expect(element.value).toBe(1);
  });
});

const line = (overrides: Partial<PltCartLineData> = {}): PltCartLineData => ({
  id: "line-1",
  title: "Play Tee",
  url: "/products/play-tee",
  imageUrl: "tee.jpg",
  variantTitle: "Red / S",
  quantity: 2,
  price: "$38.00",
  compareAtPrice: "$44.00",
  ...overrides,
});

describe("<plt-cart-line>", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function mount(data = line()) {
    document.body.innerHTML = "<plt-cart-line></plt-cart-line>";
    const element = document.querySelector("plt-cart-line")!;
    element.line = data;
    await flush(element);
    await flush(element.querySelector("plt-quantity-selector")!);
    return element;
  }

  it("renders the CartLine anatomy with formatted prices from the consumer", async () => {
    const element = await mount();
    expect(element.querySelector(".plt-cart-line__title a")!.getAttribute("href")).toBe("/products/play-tee");
    expect(element.querySelector(".plt-cart-line__meta")!.textContent).toBe("Red / S");
    expect(element.querySelector(".plt-cart-line__price")!.textContent!.replace(/\s+/g, " ").trim()).toBe("$44.00 $38.00");
    expect(element.querySelector("s.plt-cart-line__compare")).not.toBeNull();
    expect(element.querySelector("input")!.getAttribute("aria-label")).toBe("Quantity, Play Tee");
    expect(element.querySelector("input")!.hasAttribute("name")).toBe(false);
  });

  it("turns quantity changes into plt:cart-line-change and hides the inner event", async () => {
    const element = await mount();
    const outer = vi.fn();
    const inner = vi.fn();
    document.addEventListener("plt:cart-line-change", outer);
    document.addEventListener("plt:quantity-change", inner);
    element.querySelectorAll<HTMLButtonElement>(".plt-quantity-selector button")[1].click();
    expect(outer.mock.calls[0][0].detail).toEqual({ lineId: "line-1", quantity: 3, previousQuantity: 2 });
    expect(inner).not.toHaveBeenCalled();
    document.removeEventListener("plt:cart-line-change", outer);
    document.removeEventListener("plt:quantity-change", inner);
  });

  it("emits plt:cart-line-remove and disables controls while busy", async () => {
    const element = await mount();
    const remove = vi.fn();
    element.addEventListener("plt:cart-line-remove", remove);
    const button = element.querySelector<HTMLButtonElement>(".plt-cart-line__remove")!;
    expect(button.getAttribute("aria-label")).toBe("Remove: Play Tee");
    button.click();
    expect(remove.mock.calls[0][0].detail).toEqual({ lineId: "line-1" });
    element.busy = true;
    await flush(element);
    expect(button.disabled).toBe(true);
    expect(element.querySelector("article")!.getAttribute("aria-busy")).toBe("true");
  });
});

describe("<plt-cart-drawer>", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    });
  });
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  async function mount(lines: PltCartLineData[] = [line(), line({ id: "line-2", title: "Glow Ring", quantity: 1, compareAtPrice: null })]) {
    document.body.innerHTML = `<button id="cart-button">Cart</button><plt-cart-drawer subtotal="$57.00" checkout-url="/checkout" cart-url="/cart"></plt-cart-drawer>`;
    const element = document.querySelector("plt-cart-drawer")!;
    element.lines = lines;
    await flush(element);
    return element;
  }

  it("renders one plt-cart-line per line, subtotal and actions", async () => {
    const element = await mount();
    expect(element.querySelectorAll("plt-cart-line")).toHaveLength(2);
    expect(element.count).toBe(3);
    expect(element.querySelector(".plt-cart-drawer__subtotal")!.textContent!.replace(/\s+/g, "")).toBe("Subtotal$57.00");
    expect(element.querySelector('a[href="/checkout"]')!.textContent).toBe("Checkout");
    expect(element.querySelector("dialog")!.getAttribute("aria-labelledby")).toBe(element.querySelector("h2")!.id);
  });

  it("shows the empty state without footer", async () => {
    const element = await mount([]);
    expect(element.querySelector(".plt-cart-drawer__empty")!.textContent).toContain("Your cart is empty.");
    expect(element.querySelector("footer")).toBeNull();
  });

  it("opens as a modal, locks scroll, and restores focus on close", async () => {
    const element = await mount();
    const opener = document.getElementById("cart-button")!;
    opener.focus();
    const events: string[] = [];
    element.addEventListener("plt:cart-drawer-open", () => events.push("open"));
    element.addEventListener("plt:cart-drawer-close", () => events.push("close"));
    element.show();
    await flush(element);
    expect(element.dialog!.showModal).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe("hidden");
    element.querySelector<HTMLButtonElement>(".plt-cart-drawer__header button")!.click();
    await flush(element);
    expect(element.open).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(opener);
    expect(events).toEqual(["open", "close"]);
  });

  it("shows a failed-mutation message in a live region and clears it", async () => {
    const element = await mount();
    const region = () => element.querySelector<HTMLElement>(".plt-cart-drawer__error")!;
    // The region is there from the start (so the first message is announced) and empty.
    expect(region().getAttribute("role")).toBe("alert");
    expect(region().textContent!.trim()).toBe("");
    expect(region().hasAttribute("data-empty")).toBe(true);

    element.error = "We could not update your cart. Please try again.";
    await flush(element);
    expect(region().textContent).toBe("We could not update your cart. Please try again.");
    expect(region().hasAttribute("data-empty")).toBe(false);
    // Same node, so assistive technology sees the text change rather than a new element.
    expect(element.querySelectorAll(".plt-cart-drawer__error")).toHaveLength(1);
    // Lines stay as the consumer last set them.
    expect(element.querySelectorAll("plt-cart-line")).toHaveLength(2);

    element.error = "";
    await flush(element);
    expect(region().textContent!.trim()).toBe("");
    expect(region().hasAttribute("data-empty")).toBe(true);
  });

  it("reads the error from an attribute", async () => {
    document.body.innerHTML = `<plt-cart-drawer error="Out of stock"></plt-cart-drawer>`;
    const element = document.querySelector("plt-cart-drawer")!;
    await flush(element);
    expect(element.querySelector(".plt-cart-drawer__error")!.textContent).toBe("Out of stock");
  });

  it("puts the quantity back to what the cart says after a change that did not happen", async () => {
    const element = await mount();
    const line1 = element.querySelector("plt-cart-line")!;
    const selector = line1.querySelector("plt-quantity-selector")!;
    await flush(selector);
    const input = () => line1.querySelector<HTMLInputElement>(".plt-quantity-selector input")!;
    expect(input().value).toBe("2");
    // The shopper asks for 3; the selector shows it at once.
    line1.querySelectorAll<HTMLButtonElement>(".plt-quantity-selector button")[1].click();
    await flush(selector);
    expect(input().value).toBe("3");
    // The cart refused: the consumer sets the lines again with the real quantity (2).
    element.lines = [line(), line({ id: "line-2", title: "Glow Ring", quantity: 1, compareAtPrice: null })];
    await flush(element);
    await flush(line1);
    await flush(selector);
    expect(input().value).toBe("2");
  });

  it("closes on a backdrop click and lets line events bubble", async () => {
    const element = await mount();
    element.show();
    await flush(element);
    const changes = vi.fn();
    document.addEventListener("plt:cart-line-change", changes);
    const firstLine = element.querySelector("plt-cart-line")!;
    await flush(firstLine.querySelector("plt-quantity-selector")!);
    firstLine.querySelectorAll<HTMLButtonElement>(".plt-quantity-selector button")[0].click();
    expect(changes.mock.calls[0][0].detail).toMatchObject({ lineId: "line-1", quantity: 1 });
    document.removeEventListener("plt:cart-line-change", changes);
    element.dialog!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush(element);
    expect(element.open).toBe(false);
  });
});
