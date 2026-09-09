import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const scanRoots = ["src", "adapters", "renderers", "demo"];
const textExtensions = new Set([".css", ".astro", ".liquid", ".html"]);

const forbiddenClasses = [
  // Parallel PLT component APIs
  "plt-button",
  "plt-card",
  "plt-badge",
  "plt-field",
  "plt-input",
  "plt-select",
  "plt-textarea",
  "plt-alert",
  "plt-divider",
  "plt-nav-link",
  "plt-headline-lg",
  "plt-headline-sm",
  "plt-body-lg",
  "plt-meta",
  "plt-bordered",
  "plt-elevated",
  "plt-sidebar-shadow",
  // Removed/obsolete daisyUI v5 modifiers
  "d-input-bordered",
  "d-select-bordered",
  "d-textarea-bordered",
  "d-card-bordered",
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

const errors = [];
for (const scanRoot of scanRoots) {
  const files = await walk(join(root, scanRoot));
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const className of forbiddenClasses) {
      const escaped = escapeRegExp(className);
      const tokenUse = new RegExp(`(?:\\.${escaped}(?![\\w-])|["'\\s]${escaped}(?=["'\\s]))`);
      if (tokenUse.test(text)) {
        errors.push(`${relative(root, file)} uses forbidden or obsolete class ${className}`);
      }
    }
  }
}

const required = {
  "renderers/astro/ProductCard.astro": ["d-card", "d-card-body", "d-card-title", "d-card-actions", "d-badge", "d-btn"],
  "renderers/liquid/product-card.liquid": ["d-card", "d-card-body", "d-card-title", "d-card-actions", "d-badge", "d-btn"],
  "renderers/astro/CollectionCard.astro": ["d-card", "d-card-body", "d-card-title"],
  "renderers/liquid/collection-card.liquid": ["d-card", "d-card-body", "d-card-title"],
  "renderers/astro/Hero.astro": ["d-hero", "d-hero-content", "d-hero-overlay", "d-btn"],
  "renderers/liquid/hero.liquid": ["d-hero", "d-hero-content", "d-hero-overlay", "d-btn"],
  "renderers/astro/Newsletter.astro": ["d-card", "d-card-body", "d-card-title", "d-input", "d-btn"],
  "renderers/liquid/newsletter.liquid": ["d-card", "d-card-body", "d-card-title", "d-input", "d-btn"],
  "renderers/astro/PromoStrip.astro": ["d-btn"],
  "renderers/liquid/promo-strip.liquid": ["d-btn"],
  "renderers/astro/SectionHeader.astro": ["d-badge", "theme-headline-lg", "plt-section-header"],
  "renderers/liquid/section-header.liquid": ["d-badge", "theme-headline-lg", "plt-section-header"],
  "renderers/astro/EditorialCard.astro": ["d-card", "d-card-body", "d-card-title", "d-card-actions", "d-btn"],
  "renderers/liquid/editorial-card.liquid": ["d-card", "d-card-body", "d-card-title", "d-card-actions", "d-btn"],
  "renderers/astro/SplitCta.astro": ["d-btn", "d-badge", "plt-split-cta"],
  "renderers/liquid/split-cta.liquid": ["d-btn", "d-badge", "plt-split-cta"],
  "renderers/astro/Breadcrumbs.astro": ["d-breadcrumbs", "plt-breadcrumbs"],
  "renderers/liquid/breadcrumbs.liquid": ["d-breadcrumbs", "plt-breadcrumbs"],
  "renderers/astro/Navbar.astro": ["d-navbar", "d-menu", "d-btn", "plt-navbar"],
  "renderers/liquid/navbar.liquid": ["d-navbar", "d-menu", "d-btn", "plt-navbar"],
  "renderers/astro/Footer.astro": ["d-footer", "d-menu", "d-btn", "plt-footer"],
  "renderers/liquid/footer.liquid": ["d-footer", "d-menu", "d-btn", "plt-footer"],
  "renderers/astro/CartDrawer.astro": ["d-drawer", "d-drawer-toggle", "d-drawer-side", "d-btn", "plt-cart-drawer"],
  "renderers/liquid/cart-drawer.liquid": ["d-drawer", "d-drawer-toggle", "d-drawer-side", "d-btn", "plt-cart-drawer"],
  "renderers/astro/CartLine.astro": ["plt-cart-line", "theme-headline-sm"],
  "renderers/liquid/cart-line.liquid": ["plt-cart-line", "theme-headline-sm"],
  "renderers/astro/ProductGrid.astro": ["plt-product-grid"],
  "renderers/liquid/product-grid.liquid": ["plt-product-grid"],
  "renderers/astro/ProductDetail.astro": ["plt-product-detail", "d-badge", "theme-headline-lg"],
  "renderers/liquid/product-detail.liquid": ["plt-product-detail", "d-badge", "theme-headline-lg"],
  "renderers/astro/OptionPicker.astro": ["d-btn", "plt-option-picker"],
  "renderers/liquid/option-picker.liquid": ["d-btn", "plt-option-picker"],
  "renderers/astro/QuantitySelector.astro": ["d-join", "d-btn", "d-input", "plt-quantity-selector"],
  "renderers/liquid/quantity-selector.liquid": ["d-join", "d-btn", "d-input", "plt-quantity-selector"],
  "renderers/astro/CartSummary.astro": ["d-card", "d-card-body", "d-card-title", "d-card-actions", "d-btn"],
  "renderers/liquid/cart-summary.liquid": ["d-card", "d-card-body", "d-card-title", "d-card-actions", "d-btn"],
  "renderers/astro/FilterBar.astro": ["d-select", "d-btn", "plt-filter-bar"],
  "renderers/liquid/filter-bar.liquid": ["d-select", "d-btn", "plt-filter-bar"],
  "renderers/astro/SortSelect.astro": ["d-select", "plt-sort-select"],
  "renderers/liquid/sort-select.liquid": ["d-select", "plt-sort-select"],
  "renderers/astro/SearchField.astro": ["d-input", "d-btn", "plt-search-field"],
  "renderers/liquid/search-field.liquid": ["d-input", "d-btn", "plt-search-field"],
  "renderers/astro/Pagination.astro": ["d-join", "d-btn", "plt-pagination"],
  "renderers/liquid/pagination.liquid": ["d-join", "d-btn", "plt-pagination"],
  "renderers/astro/EmptyState.astro": ["d-alert", "d-btn", "plt-empty-state"],
  "renderers/liquid/empty-state.liquid": ["d-alert", "d-btn", "plt-empty-state"],
  "demo/index.html": [
    "d-btn",
    "d-card",
    "d-card-body",
    "d-card-title",
    "d-card-actions",
    "d-badge",
    "d-input",
    "d-select",
    "d-textarea",
    "d-divider",
    "d-alert",
    "d-link",
    "d-tabs",
    "d-tab",
    "d-navbar",
    "d-breadcrumbs",
    "d-drawer",
    "d-footer",
    "plt-product-card",
    "plt-hero",
    "plt-section-header",
  ],
};

for (const [path, classes] of Object.entries(required)) {
  const text = await readFile(join(root, path), "utf8");
  for (const className of classes) {
    if (!text.includes(className)) errors.push(`${path} is missing required daisyUI class ${className}`);
  }
}

const theme = await readFile(join(root, "src/daisyui-theme.css"), "utf8");
for (const expected of [
  'prefix: "d-"',
  "themes: brand --default",
  "--radius-selector",
  "--radius-field",
  "--radius-box",
  "--size-selector",
  "--size-field",
  "--border",
  "--depth",
  "--noise",
]) {
  if (!theme.includes(expected)) errors.push(`src/daisyui-theme.css is missing ${expected}`);
}

if (errors.length) {
  console.error("daisyUI conformance check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("daisyUI conformance check passed.");
