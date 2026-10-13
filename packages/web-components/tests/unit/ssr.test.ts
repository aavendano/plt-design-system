// @vitest-environment node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { shopifyLiquid } from "../fixtures/liquid.mjs";
import { PltVariantPicker as ReactPicker } from "../../src/react/variant-picker";
import { fromStorefrontProduct } from "../../src/variant-picker/storefront";
import { liquidProduct, storefrontProduct } from "../fixtures/product.mjs";

const adapter = fileURLToPath(new URL("../../adapters/liquid/plt-variant-picker.liquid", import.meta.url));

describe("server rendering", () => {
  it("imports every entry point without a DOM", async () => {
    expect(typeof document).toBe("undefined");
    const index = await import("../../dist/variant-picker/index.js");
    const define = await import("../../dist/variant-picker/define.js");
    expect(typeof index.PltVariantPicker).toBe("function");
    expect(() => define.definePltVariantPicker()).not.toThrow();
    await import("../../dist/variant-picker/storefront.js");
    await import("../../dist/react/variant-picker.js");
  });

  it("React adapter renders the element and a no-JS fallback", () => {
    const data = fromStorefrontProduct(storefrontProduct());
    const markup = renderToString(
      createElement(ReactPicker, { ...data, name: "merchandiseId", fallbackLabel: "Variant" }),
    );
    expect(markup).toMatch(/^<plt-variant-picker name="merchandiseId" selected-variant-id="gid:\/\/shopify\/ProductVariant\/40001"/);
    expect(markup).toContain("data-plt-fallback");
    expect(markup).toContain('<select class="d-select" name="merchandiseId">');
    expect(markup).toMatch(/<option value="gid:\/\/shopify\/ProductVariant\/40002" disabled="">Red \/ M<\/option>/);
    // Complex data is never serialized into attributes by the React adapter.
    expect(markup).not.toContain("options=");
  });

  it("Liquid adapter serializes the product into escaped JSON attributes", async () => {
    const engine = shopifyLiquid();
    const product = liquidProduct();
    product.variants[0].title = 'Red / S "quoted" </plt-variant-picker><script>x</script>';
    const html = await engine.parseAndRender(await readFile(adapter, "utf8"), {
      product,
      sold_out_label: "Épuisé",
    });

    expect(html).toContain('<plt-variant-picker\n  name="id"\n  selected-variant-id="40001"');
    expect(html).toContain('<script type="module" src="./assets/plt-web-components.bundle.js"></script>');
    expect(html).not.toContain("<script>x</script>");

    const attribute = (name: string) => {
      const raw = html.match(new RegExp(`\\s${name}="([^"]*)"`))![1];
      const decoded = raw
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      return JSON.parse(decoded);
    };
    expect(attribute("options")).toEqual([
      {
        name: "Color",
        values: [
          { value: "Red", swatch: { color: "rgb(192 57 43)", image: null } },
          { value: "Blue", swatch: { color: "rgb(46 91 186)", image: null } },
          { value: "Green", swatch: { color: "rgb(47 143 78)", image: null } },
        ],
      },
      { name: "Size", values: [{ value: "S" }, { value: "M" }, { value: "L" }] },
    ]);
    const variants = attribute("variants");
    expect(variants).toHaveLength(7);
    expect(variants[0]).toEqual({
      id: 40001,
      title: product.variants[0].title,
      available: true,
      options: ["Red", "S"],
    });
    expect(attribute("labels")).toEqual({ soldOut: "Épuisé", unavailable: "Unavailable" });
    // No prices travel to the component.
    expect(html).not.toMatch(/price/i);
    expect(html).toMatch(/<option value="40002" disabled>Red \/ M<\/option>/);
  });

  it("Liquid adapter can skip the script tag", async () => {
    const html = await shopifyLiquid().parseAndRender(await readFile(adapter, "utf8"), {
      product: liquidProduct(),
      script_url: "none",
    });
    expect(html).not.toContain("<script");
  });
});
