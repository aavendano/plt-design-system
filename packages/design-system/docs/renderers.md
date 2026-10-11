# Component renderers

The renderer layer maps normalized component contracts to platform syntax while preserving the same daisyUI anatomy and PLT visual extensions.

## Included

### Marketing / editorial
- ProductCard
- CollectionCard
- Hero
- PromoStrip
- Newsletter
- SectionHeader
- EditorialCard
- SplitCta
- Breadcrumbs

### Docs / editorial shell (Astro-only)
- PageOutline — in-page heading outline (`plt-docs-toc*`); optional slot for secondary nav
- NavTree — grouped doc navigation (`d-menu` + `plt-docs-nav-tree`)
- EditorialShell — content-region grid with sticky aside/rail (`plt-editorial-shell`)

These three have Astro renderers only until a Liquid consumer exists. Do not add Liquid stubs for parity alone. The consuming docs app owns manifests, sync, Content Layer, and presenters; the design system owns chrome markup, tokens, and CSS.

### Shell
- Navbar
- Footer
- CartDrawer
- CartLine

### Commerce layouts
- ProductGrid
- ProductDetail
- OptionPicker
- QuantitySelector
- CartSummary
- FilterBar
- SortSelect
- SearchField
- Pagination
- EmptyState

Most storefront components have a Liquid renderer under `renderers/liquid/` and an Astro renderer under `renderers/astro/`. Docs/editorial shell units (`PageOutline`, `NavTree`, `EditorialShell`) are Astro-only until a Liquid consumer exists.

Units the website still needs, and units that must stay in the application, are listed in the repository doc `docs/storefront-component-inventory.md`. Do not add a renderer until that inventory marks the unit as missing.

## Boundary

Renderers accept normalized values. They do not own Shopify product objects, money formatting, variants, swatches, quick-add, cart state, translations, CMS lookups or Astro content collection resolution.

```text
Shopify product -> presenter -> ProductCard contract -> Liquid renderer
API/content     -> presenter -> ProductCard contract -> Astro renderer
```

Shell and cart renderers expose slots / render blocks for interactive controls. Cart **state** stays in the application; cart **UI** is standardized here.

## daisyUI anatomy

Liquid and Astro may differ syntactically, but equivalent renderers must emit the same daisyUI parts:

- ProductCard: `d-card`, `d-card-body`, `d-card-title`, `d-card-actions`, `d-badge`, `d-btn`
- CollectionCard: `d-card`, `d-card-body`, `d-card-title`
- EditorialCard: `d-card`, `d-card-body`, `d-card-title`, `d-card-actions`, `d-btn`
- Hero: `d-hero`, `d-hero-content`, `d-hero-overlay`, `d-btn`; eyebrow uses `d-badge`
- Newsletter: `d-card`, `d-card-body`, `d-card-title`, `d-input`, `d-btn`
- PromoStrip / SplitCta: PLT composition containing `d-btn` / `d-badge`
- Breadcrumbs: `d-breadcrumbs`
- Navbar: `d-navbar`, `d-menu`, `d-btn`
- Footer: `d-footer`, `d-menu`, `d-btn`
- CartDrawer: `d-drawer`, `d-drawer-toggle`, `d-drawer-side`, `d-btn`
- CartSummary: `d-card`, `d-card-body`, `d-card-title`, `d-card-actions`, `d-btn`
- OptionPicker / QuantitySelector / Pagination: `d-btn`, `d-join`, `d-input` as applicable
- FilterBar / SortSelect / SearchField: `d-select` / `d-input` / `d-btn`
- EmptyState: `d-alert`, `d-btn`
- PageOutline: `plt-docs-toc` (details/chevron are `plt-docs-toc*` extensions; no daisyUI TOC part)
- NavTree: `d-menu`, `plt-docs-nav-tree`
- EditorialShell: `plt-editorial-shell` (layout composition; no daisyUI page-shell part)

PLT `theme-*` classes apply brand treatment. `plt-*` classes may extend composition where daisyUI has no corresponding component part, but may not replace a daisyUI component class.

## Verification

`npm run check:conformance` verifies renderer anatomy and rejects the old parallel primitive class families. `npm run check` additionally compiles the catalog with Tailwind CSS 4 and daisyUI 5.

See `docs/daisyui-conformance.md` for the complete mapping.
