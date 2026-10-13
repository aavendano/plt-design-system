import { describe, expect, it } from "vitest";
import {
  findVariant,
  initialSelection,
  normalizeOptions,
  normalizeVariants,
  selectValue,
  valueStatus,
} from "../../src/variant-picker/resolve";
import { fromStorefrontProduct } from "../../src/variant-picker/storefront";
import { storefrontProduct } from "../fixtures/product.mjs";

const { options: rawOptions, variants: rawVariants } = fromStorefrontProduct(storefrontProduct());
const options = normalizeOptions(rawOptions);
const variants = normalizeVariants(rawVariants);
const id = (color: string, size: string) => findVariant(variants, [color, size])?.id;

describe("normalization", () => {
  it("accepts plain-string values and numeric ids", () => {
    expect(normalizeOptions([{ name: "Size", values: ["S", { value: "M", label: "Medium" }] }])).toEqual([
      { name: "Size", values: [{ value: "S" }, { value: "M", label: "Medium", swatch: null }] },
    ]);
    expect(normalizeVariants([{ id: 42, options: ["S"], available: true }])).toEqual([
      { id: "42", options: ["S"], available: true, title: undefined },
    ]);
  });

  it("drops malformed entries instead of throwing", () => {
    expect(normalizeOptions("nope")).toEqual([]);
    expect(normalizeVariants([null, { options: ["S"] }, 3])).toEqual([]);
  });
});

describe("resolution", () => {
  it("finds the exact combination", () => {
    expect(findVariant(variants, ["Blue", "M"])?.title).toBe("Blue / M");
    expect(findVariant(variants, ["Green", "L"])).toBeNull();
  });

  it("starts from the requested variant, else the first available one", () => {
    expect(initialSelection(options, variants, id("Blue", "S"))).toEqual(["Blue", "S"]);
    const allSoldOutFirst = [{ ...variants[0], available: false }, ...variants.slice(1)];
    expect(initialSelection(options, allSoldOutFirst, "missing")).toEqual(["Red", "L"]);
    expect(initialSelection(options, [], null)).toEqual(["Red", "S"]);
  });

  it("classifies values as available, sold out or unavailable", () => {
    expect(valueStatus(variants, ["Red", "S"], 1, "M")).toBe("sold-out");
    expect(valueStatus(variants, ["Red", "S"], 1, "L")).toBe("available");
    expect(valueStatus(variants, ["Green", "S"], 1, "L")).toBe("unavailable");
  });

  it("keeps the picked value and moves to the closest existing variant", () => {
    expect(selectValue(variants, ["Red", "L"], 0, "Blue")).toEqual(["Blue", "L"]);
    // Green/L does not exist: keep Green, fall back to Green/S.
    expect(selectValue(variants, ["Red", "L"], 0, "Green")).toEqual(["Green", "S"]);
    // A value that no variant has stays selected and resolves to nothing.
    const probe = selectValue(variants, ["Red", "S"], 1, "XL");
    expect(probe).toEqual(["Red", "XL"]);
    expect(findVariant(variants, probe)).toBeNull();
  });

  it("prefers available variants when several are equally close", () => {
    const tie = normalizeVariants([
      { id: "a", options: ["Red", "S", "Cotton"], available: false },
      { id: "b", options: ["Blue", "M", "Silk"], available: false },
      { id: "c", options: ["Blue", "L", "Silk"], available: true },
    ]);
    // From Red/S/Silk, picking Blue: b and c both share Silk; c is available.
    expect(selectValue(tie, ["Red", "S", "Silk"], 0, "Blue")).toEqual(["Blue", "L", "Silk"]);
  });
});

describe("fromStorefrontProduct", () => {
  it("maps Storefront API data without prices", () => {
    const data = fromStorefrontProduct(storefrontProduct());
    expect(data.selectedVariantId).toBe("gid://shopify/ProductVariant/40001");
    expect(data.options[0].values[0]).toEqual({ value: "Red", swatch: { color: "#c0392b", image: null } });
    expect(data.variants).toHaveLength(7);
    expect(JSON.stringify(data)).not.toMatch(/amount|price/i);
  });

  it("collects variants from Hydrogen's adjacent and firstSelectable fields", () => {
    const product = storefrontProduct();
    const [first, second, third] = product.variants.nodes;
    const hydrogenShaped = {
      options: product.options.map((option, index) => ({
        ...option,
        optionValues: option.optionValues.map((value, i) => ({
          ...value,
          firstSelectableVariant: index === 0 && i === 1 ? third : null,
        })),
      })),
      adjacentVariants: [second],
      selectedOrFirstAvailableVariant: first,
    };
    const data = fromStorefrontProduct(hydrogenShaped);
    expect(data.variants.map((variant) => variant.title)).toEqual(["Red / M", "Red / S", "Red / L"]);
  });
});
