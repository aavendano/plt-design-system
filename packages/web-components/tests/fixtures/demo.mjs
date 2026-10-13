/**
 * Demo data for the store pages, in the contract shape (Astro, React) and in
 * Shopify Liquid's native shapes (the Liquid adapters map them). Both must
 * produce the same contract data: the browser tests check the three
 * frontends render identically.
 */
export const images = [
  { src: "images/red.svg", alt: "Play Tee in red", color: "Red" },
  { src: "images/blue.svg", alt: "Play Tee in blue", color: "Blue" },
  { src: "images/green.svg", alt: "Play Tee in green", color: "Green" },
];

export const navLinks = [
  {
    label: "Shop",
    url: "#shop",
    columns: [
      { title: "Clothing", url: "#clothing", children: [{ label: "Tees", url: "#tees" }, { label: "Hoodies", url: "#hoodies" }] },
      { title: "Toys", url: "#toys", children: [{ label: "Rings", url: "#rings" }, { label: "Wands", url: "#wands" }] },
    ],
  },
  { label: "Journal", url: "#journal" },
];

export const filters = [
  {
    id: "filter.v.option.color",
    label: "Color",
    options: [
      { label: "All", value: "", selected: true },
      { label: "Red", value: "Red", selected: false },
      { label: "Blue", value: "Blue", selected: false },
    ],
  },
  {
    id: "filter.v.option.size",
    label: "Size",
    options: [
      { label: "All", value: "", selected: true },
      { label: "S", value: "S", selected: false },
      { label: "M", value: "M", selected: false },
    ],
  },
];

/** collection.filters as Shopify Liquid exposes them. */
export const liquidFilters = filters.map((filter) => ({
  type: "list",
  param_name: filter.id,
  label: filter.label,
  values: filter.options.filter((option) => option.value).map((option) => ({ value: option.value, label: option.label, active: false })),
}));

export const sortOptions = [
  { label: "Featured", value: "manual", selected: true },
  { label: "Price, low to high", value: "price-ascending", selected: false },
];

export const liquidSortOptions = sortOptions.map((option) => ({ name: option.label, value: option.value }));

export const pages = [
  { label: "1", url: null, current: true, disabled: false },
  { label: "2", url: "?page=2", current: false, disabled: false },
  { label: "3", url: "?page=3", current: false, disabled: false },
];
export const nextUrl = "?page=2";

export const liquidPaginate = {
  current_page: 1,
  previous: { is_link: false },
  next: { is_link: true, url: nextUrl },
  parts: pages.map((page) => ({ title: page.label, url: page.url ?? "", is_link: Boolean(page.url) })),
};

/** One line already in the cart (Glow Ring, $19.00). */
export const cartLines = [
  { id: "line-ring", title: "Glow Ring", url: "#ring", imageUrl: null, imageAlt: "Glow Ring", variantTitle: null, quantity: 1, price: "$19.00", compareAtPrice: null },
];
export const unitPrices = { "line-ring": 1900 };

export const liquidCart = {
  total_price: 1900,
  items: [
    { key: "line-ring", quantity: 1, url: "#ring", image: null, final_line_price: 1900, original_line_price: 1900, product: { title: "Glow Ring", has_only_default_variant: true }, variant: { title: "Default Title" } },
  ],
};

export const money = (cents) => `$${(cents / 100).toFixed(2)}`;

export const cards = [
  { title: "Glow Ring", body: "Soft silicone ring with three vibration modes." },
  { title: "Play Wand", body: "Rechargeable wand with a flexible head." },
];

export const labels = { cart: "Cart", add: "Add to cart", soldOut: "Sold out", unavailable: "Unavailable" };

/** Consumer data for the demo pages (prices stay out of the components). */
export function demoData({ variants, initialVariantId, collectionMode }) {
  return {
    title: "Play Tee",
    images,
    variants: Object.fromEntries(variants.map((variant) => [variant.id, variant])),
    initialVariantId,
    unitPrices,
    cartLines,
    labels,
    collectionMode,
  };
}
