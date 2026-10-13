/**
 * One demo product expressed in each platform's native shape, so every
 * adapter is tested against the data it really receives.
 *
 * Colour × Size, with gaps and sold-out combinations:
 * - Green exists only in S;
 * - Blue / L and Red / M are sold out.
 */
const colors = [
  { name: "Red", hex: "#c0392b", rgb: "192 57 43" },
  { name: "Blue", hex: "#2e5bba", rgb: "46 91 186" },
  { name: "Green", hex: "#2f8f4e", rgb: "47 143 78" },
];
const sizes = ["S", "M", "L"];
const soldOut = new Set(["Blue/L", "Red/M"]);
const missing = new Set(["Green/M", "Green/L"]);

export const combos = [];
let n = 0;
for (const color of colors) {
  for (const size of sizes) {
    n += 1;
    if (missing.has(`${color.name}/${size}`)) continue;
    combos.push({
      numericId: 40000 + n,
      gid: `gid://shopify/ProductVariant/${40000 + n}`,
      color: color.name,
      size,
      available: !soldOut.has(`${color.name}/${size}`),
      price: (19 + sizes.indexOf(size) * 2).toFixed(2),
    });
  }
}

/** Shopify Liquid product drop (subset used by the adapter). */
export function liquidProduct() {
  const variants = combos.map((c) => ({
    id: c.numericId,
    title: `${c.color} / ${c.size}`,
    available: c.available,
    options: [c.color, c.size],
    price: Math.round(Number(c.price) * 100),
  }));
  return {
    id: 7001,
    title: "Play Tee",
    handle: "play-tee",
    options: ["Color", "Size"],
    options_with_values: [
      {
        name: "Color",
        position: 1,
        values: colors.map((c) => ({ name: c.name, swatch: { color: { rgb: c.rgb }, image: null } })),
      },
      { name: "Size", position: 2, values: sizes.map((s) => ({ name: s, swatch: {} })) },
    ],
    variants,
    selected_or_first_available_variant: variants[0],
  };
}

/** Shopify Storefront API product (as queried by Hydrogen / Astro storefront). */
export function storefrontProduct() {
  const nodes = combos.map((c) => ({
    id: c.gid,
    title: `${c.color} / ${c.size}`,
    availableForSale: c.available,
    selectedOptions: [
      { name: "Color", value: c.color },
      { name: "Size", value: c.size },
    ],
    price: { amount: c.price, currencyCode: "CAD" },
  }));
  return {
    id: "gid://shopify/Product/7001",
    handle: "play-tee",
    title: "Play Tee",
    options: [
      {
        name: "Color",
        optionValues: colors.map((c) => ({ name: c.name, swatch: { color: c.hex, image: null } })),
      },
      { name: "Size", optionValues: sizes.map((s) => ({ name: s, swatch: null })) },
    ],
    variants: { nodes },
    selectedOrFirstAvailableVariant: nodes[0],
  };
}
