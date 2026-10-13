import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { definePltVariantPicker, PltVariantPicker } from "../../src/variant-picker/define";
import { fromStorefrontProduct } from "../../src/variant-picker/storefront";
import type { PltVariantChangeDetail } from "../../src/variant-picker/types";
import { storefrontProduct } from "../fixtures/product.mjs";

const data = fromStorefrontProduct(storefrontProduct());
const gid = (n: number) => `gid://shopify/ProductVariant/${n}`;

async function mount(html = "<plt-variant-picker></plt-variant-picker>", withData = true) {
  document.body.innerHTML = `<form>${html}</form>`;
  const picker = document.querySelector("plt-variant-picker")!;
  if (withData) {
    picker.options = data.options;
    picker.variants = data.variants;
    picker.selectedVariantId = data.selectedVariantId;
  }
  await picker.updateComplete;
  return picker;
}

const radios = (picker: HTMLElement, option: number) =>
  [...picker.querySelectorAll<HTMLFieldSetElement>("fieldset")[option].querySelectorAll<HTMLInputElement>("input[type=radio]")];

function choose(picker: HTMLElement, option: number, value: string) {
  const radio = radios(picker, option).find((input) => input.value === value)!;
  radio.click();
  return picker.updateComplete;
}

const status = (picker: HTMLElement, option: number, value: string) =>
  radios(picker, option).find((input) => input.value === value)!.closest("label")!.dataset.status;

describe("<plt-variant-picker>", () => {
  beforeEach(() => definePltVariantPicker());
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("registers once and tolerates repeated definition", () => {
    expect(customElements.get("plt-variant-picker")).toBe(PltVariantPicker);
    expect(definePltVariantPicker()).toBe(true);
    expect(definePltVariantPicker(undefined as unknown as CustomElementRegistry)).toBe(true);
  });

  it("renders option groups as native radio groups with daisyUI anatomy", async () => {
    const picker = await mount();
    const fieldsets = picker.querySelectorAll("fieldset");
    expect(fieldsets).toHaveLength(2);
    expect(fieldsets[0].querySelector("legend")!.textContent).toMatch(/Color\s*:\s*Red/);
    expect(radios(picker, 0).map((r) => r.value)).toEqual(["Red", "Blue", "Green"]);
    expect(radios(picker, 0)[0].checked).toBe(true);
    const label = radios(picker, 0)[0].closest("label")!;
    expect(label.className).toContain("d-btn");
    expect(label.className).toContain("d-btn-primary");
    expect(label.querySelector(".plt-swatch")).not.toBeNull();
    // One radio group per option, unique per instance.
    expect(new Set(radios(picker, 0).map((r) => r.name)).size).toBe(1);
    expect(radios(picker, 0)[0].name).not.toBe(radios(picker, 1)[0].name);
  });

  it("writes the resolved variant id into a hidden form field", async () => {
    const picker = await mount('<plt-variant-picker name="merchandiseId"></plt-variant-picker>');
    const form = picker.closest("form")!;
    expect(new FormData(form).get("merchandiseId")).toBe(gid(40001));
    await choose(picker, 1, "L");
    expect(new FormData(form).get("merchandiseId")).toBe(gid(40003));
    expect(picker.getAttribute("selected-variant-id")).toBe(gid(40003));
  });

  it("marks sold-out and unavailable values relative to the current selection", async () => {
    const picker = await mount();
    expect(status(picker, 1, "M")).toBe("sold-out");
    expect(status(picker, 1, "S")).toBe("available");
    await choose(picker, 0, "Green");
    expect(status(picker, 1, "M")).toBe("unavailable");
    expect(status(picker, 1, "L")).toBe("unavailable");
    const radio = radios(picker, 1).find((r) => r.value === "M")!;
    expect(radio.getAttribute("aria-label")).toBe("M, Unavailable");
    expect(radios(picker, 1).find((r) => r.value === "S")!.getAttribute("aria-label")).toBe("S");
  });

  it("emits plt:variant-change with selection, id and availability", async () => {
    const picker = await mount();
    const events: CustomEvent<PltVariantChangeDetail>[] = [];
    document.addEventListener("plt:variant-change", (event) => events.push(event));

    await choose(picker, 0, "Blue");
    expect(events).toHaveLength(1);
    const [event] = events;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail).toMatchObject({
      variantId: gid(40004),
      available: true,
      previousVariantId: gid(40001),
      selectedOptions: [
        { name: "Color", value: "Blue" },
        { name: "Size", value: "S" },
      ],
    });
    expect(event.detail.variant?.title).toBe("Blue / S");

    await choose(picker, 1, "L");
    expect(events[1].detail).toMatchObject({ variantId: gid(40006), available: false });
  });

  it("resolves a missing combination to the closest variant", async () => {
    const picker = await mount();
    picker.selectedVariantId = gid(40003); // Red / L
    await picker.updateComplete;
    const listener = vi.fn();
    picker.addEventListener("plt:variant-change", listener);
    await choose(picker, 0, "Green");
    expect(listener.mock.calls[0][0].detail.variantId).toBe(gid(40007)); // Green / S
    expect(radios(picker, 1).find((r) => r.checked)!.value).toBe("S");
  });

  it("does not emit for consumer-driven property changes", async () => {
    const picker = await mount();
    const listener = vi.fn();
    picker.addEventListener("plt:variant-change", listener);
    picker.selectedVariantId = gid(40005);
    await picker.updateComplete;
    expect(listener).not.toHaveBeenCalled();
    expect(radios(picker, 0).find((r) => r.checked)!.value).toBe("Blue");
    expect(radios(picker, 1).find((r) => r.checked)!.value).toBe("M");
  });

  it("re-renders when the consumer replaces data (availability refresh)", async () => {
    const picker = await mount();
    expect(status(picker, 1, "L")).toBe("available");
    picker.variants = data.variants.map((variant) =>
      variant.id === gid(40003) ? { ...variant, available: false } : variant,
    );
    await picker.updateComplete;
    expect(status(picker, 1, "L")).toBe("sold-out");
    expect(picker.selectedVariantId).toBe(gid(40001));
  });

  it("falls back to the first available variant for an unknown id", async () => {
    const picker = await mount();
    picker.selectedVariantId = "gid://shopify/ProductVariant/0";
    await picker.updateComplete;
    expect(picker.selectedVariantId).toBe(gid(40001));
  });

  it("reads JSON attributes and ignores malformed ones", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const attr = (value: unknown) => JSON.stringify(value).replace(/"/g, "&quot;");
    const picker = await mount(
      `<plt-variant-picker selected-variant-id="${gid(40002)}" options="${attr(data.options)}"
        variants="${attr(data.variants)}" labels="${attr({ soldOut: "Agotado" })}"></plt-variant-picker>`,
      false,
    );
    expect(picker.selectedVariant?.title).toBe("Red / M");
    expect(picker.querySelector('[role="status"]')!.textContent).toBe("Red / M, Agotado");

    picker.setAttribute("variants", "{not json");
    await picker.updateComplete;
    expect(warn).toHaveBeenCalled();
    expect(picker.variants).toEqual([]);
    warn.mockRestore();
  });

  it("hides and disables the server-rendered fallback after upgrade", async () => {
    const picker = await mount(`<plt-variant-picker name="id">
      <div data-plt-fallback><select name="id"><option value="1">Red / S</option></select></div>
    </plt-variant-picker>`);
    const fallback = picker.querySelector<HTMLElement>("[data-plt-fallback]")!;
    expect(fallback.hidden).toBe(true);
    expect(fallback.querySelector("select")!.disabled).toBe(true);
    expect(new FormData(picker.closest("form")!).getAll("id")).toEqual([gid(40001)]);
  });

  it("disables every control when disabled", async () => {
    const picker = await mount();
    picker.disabled = true;
    await picker.updateComplete;
    expect([...picker.querySelectorAll("fieldset")].every((f) => f.disabled)).toBe(true);
    expect(picker.hasAttribute("disabled")).toBe(true);
  });

  it("announces the selection in a polite live region", async () => {
    const picker = await mount();
    const live = picker.querySelector('[role="status"]')!;
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.textContent).toBe("Red / S");
    await choose(picker, 1, "M");
    expect(live.textContent).toBe("Red / M, Sold out");
  });
});
