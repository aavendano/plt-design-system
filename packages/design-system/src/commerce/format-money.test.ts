import { describe, expect, it } from "vitest";
import { formatMoney, formatPriceDisplay, formatPriceRange } from "./format-money.js";

describe("formatMoney", () => {
  it("formats with the supplied locale", () => {
    const money = { amount: "12.50", currencyCode: "USD" };
    expect(formatMoney(money, "en-US")).toBe("$12.50");
    expect(formatMoney(money, "fr-CA")).toMatch(/12,50/);
  });
});

describe("formatPriceDisplay", () => {
  it("shows compare-at when amounts differ", () => {
    const { display, compareDisplay } = formatPriceDisplay(
      "en-CA",
      { amount: "10.00", currencyCode: "CAD" },
      { compareAtPrice: { amount: "15.00", currencyCode: "CAD" } },
    );
    expect(display).toMatch(/10/);
    expect(compareDisplay).toMatch(/15/);
  });

  it("uses a range when min and max are provided", () => {
    const { display } = formatPriceDisplay(
      "en-US",
      { amount: "0", currencyCode: "USD" },
      {
        minPrice: { amount: "5.00", currencyCode: "USD" },
        maxPrice: { amount: "9.00", currencyCode: "USD" },
      },
    );
    expect(display).toContain("–");
    expect(formatPriceRange(
      { amount: "5.00", currencyCode: "USD" },
      { amount: "9.00", currencyCode: "USD" },
      "en-US",
    )).toBe(display);
  });
});
