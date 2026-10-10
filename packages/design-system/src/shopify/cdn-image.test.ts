import { describe, expect, it } from "vitest";
import {
  isShopifyCdnUrl,
  shopifyCdnSrcSet,
  shopifyCdnUrl,
} from "./cdn-image.js";

const sample =
  "https://cdn.shopify.com/s/files/1/0000/0001/products/sample.jpg?v=1";

describe("shopifyCdnUrl", () => {
  it("adds width to Shopify CDN URLs", () => {
    expect(shopifyCdnUrl(sample, { width: 400 })).toContain("width=400");
  });

  it("passes through non-CDN URLs", () => {
    expect(shopifyCdnUrl("https://example.com/a.jpg", { width: 400 })).toBe(
      "https://example.com/a.jpg",
    );
  });
});

describe("shopifyCdnSrcSet", () => {
  it("builds srcset descriptors", () => {
    const srcset = shopifyCdnSrcSet(sample, [200, 400]);
    expect(srcset).toContain("200w");
    expect(srcset).toContain("400w");
  });
});

describe("isShopifyCdnUrl", () => {
  it("detects cdn.shopify.com", () => {
    expect(isShopifyCdnUrl(sample)).toBe(true);
    expect(isShopifyCdnUrl("https://example.com/x")).toBe(false);
  });
});
