# PLT Design System

Component design layer for Play, love & Toys, extracted from `aavendano/plt-frontend` and built explicitly on daisyUI 5 + Tailwind CSS 4.

## Scope

This package owns only the visual/component layer:

- PLT design tokens (`--plt-*`)
- typography and geometry
- daisyUI `brand` theme
- PLT visual extensions such as `theme-bordered`, `theme-elevated` and label typography
- PLT-specific composite patterns
- normalized Liquid/Astro renderers for those visual components

It does not own editorial schemas, CMS logic, Shopify business behavior, routing, cart state or application lifecycle.

## daisyUI-first invariant

Every component with a daisyUI equivalent must use the official prefixed class as its base.

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">Shop now</button>

<article class="d-card bg-base-100 theme-bordered theme-elevated">
  <div class="d-card-body">
    <h2 class="d-card-title theme-headline-sm">Title</h2>
    <div class="d-card-actions">...</div>
  </div>
</article>

<span class="d-badge d-badge-secondary theme-label-bold">New</span>
<input class="d-input" type="email">
```

The package uses the same daisyUI prefix as `plt-frontend`: `d-`.

Parallel primitive APIs such as `plt-button`, `plt-card`, `plt-badge`, `plt-input`, `plt-select`, `plt-textarea`, `plt-alert`, `plt-divider` and `plt-nav-link` are prohibited. Brand typography and treatment use `theme-*`; `plt-*` is reserved for compositions that daisyUI does not provide.

Obsolete daisyUI modifiers removed in current v5 releases, including `d-input-bordered`, `d-select-bordered`, `d-textarea-bordered` and `d-card-bordered`, are also prohibited.

## Installation / import

```css
@import "tailwindcss";
@import "@playlovetoys/design-system";
```

The package configures daisyUI with the PLT `brand` theme and `d-` prefix. The supported daisyUI range starts at `5.7.8` because later 5.7 releases include prefix-related fixes used by this package; Tailwind CSS 4 is required.

## Component contracts and renderers

Shared visual contracts currently cover ProductCard, CollectionCard, Hero, PromoStrip, Newsletter, SectionHeader, EditorialCard, SplitCta, Breadcrumbs, Navbar, Footer, CartDrawer, CartLine, ProductGrid, ProductDetail, OptionPicker, QuantitySelector, CartSummary, FilterBar, SortSelect, SearchField, Pagination and EmptyState. Canonical inputs are documented in `contracts/components.md`.

Equivalent platform renderers live in:

```text
renderers/liquid/
renderers/astro/
```

Both renderer sets emit equivalent daisyUI anatomy plus the same PLT theme/composition classes. Platform-specific code must normalize data before invoking a renderer.

```text
Shopify product -> presenter -> ProductCard contract -> Liquid renderer
API/content     -> presenter -> ProductCard contract -> Astro renderer
```

## Design layering

```text
daisyUI 5 component anatomy
        +
PLT brand theme / tokens
        +
PLT theme-* extensions
        +
PLT-specific compositions
```

`--plt-*` values are the source of truth for PLT brand decisions. daisyUI consumes those values through the `brand` theme.

## Verification

From the repository root, install development dependencies and run the complete workspace check:

```bash
npm install
npm run check
```

`check:conformance` rejects parallel PLT primitives, obsolete daisyUI modifiers and incomplete renderer anatomy. `check:renderers` verifies renderer escaping and Tailwind source registration. `build:demo` compiles the Tailwind/daisyUI catalog and catches invalid plugin/theme integration.

See `DESIGN.md`, `docs/daisyui-conformance.md`, `docs/primitives.md`, `docs/patterns.md`, `docs/renderers.md`, and `docs/adapters.md`.
