# PLT Design System

Component design layer for Play, love & Toys, extracted from `aavendano/plt-frontend` and built explicitly on daisyUI 5 + Tailwind CSS 4.

## Scope

This repository owns only the visual/component layer:

- PLT design tokens (`--plt-*`)
- typography and geometry
- daisyUI `brand` theme
- PLT visual extensions such as `theme-bordered`, `theme-elevated` and label typography
- PLT-specific composite patterns
- normalized Liquid/Astro renderers for those visual components

It does not own editorial schemas, CMS logic, Shopify business behavior, routing, cart state, or application lifecycle.

## daisyUI-first invariant

PLT does not recreate daisyUI primitives. Every component with a daisyUI equivalent must use the official prefixed class as its base.

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">Shop now</button>

<article class="d-card bg-base-100 theme-bordered theme-elevated">
  <div class="d-card-body">...</div>
</article>

<span class="d-badge d-badge-secondary theme-label-bold">New</span>
<input class="d-input d-input-bordered" type="email">
```

The project uses the same daisyUI prefix as `plt-frontend`: `d-`.

Parallel primitive APIs such as `plt-button`, `plt-card`, `plt-badge`, `plt-input`, `plt-select`, `plt-textarea`, and `plt-alert` are prohibited.

## Installation / import

The root import includes the PLT tokens, daisyUI configuration/theme and PLT visual layers:

```css
@import "tailwindcss";
@import "@playlovetoys/design-system";
```

The design-system daisyUI configuration sets:

```css
@plugin "daisyui" {
  themes: brand --default;
  logs: false;
  prefix: "d-";
}
```

`daisyui >=5 <6` and `tailwindcss >=4 <5` are required peer dependencies.

## Component contracts and renderers

Shared visual contracts currently cover ProductCard, CollectionCard, Hero, PromoStrip and Newsletter. Canonical inputs are documented in `contracts/components.md`.

Equivalent platform renderers live in:

```text
renderers/liquid/
renderers/astro/
```

Both renderer sets emit the same daisyUI component anatomy (`d-card`, `d-btn`, `d-badge`, `d-input`, `d-hero`) plus the same PLT `theme-*` and composition classes.

Platform-specific code must normalize data before invoking a renderer.

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

`--plt-*` values remain the source of truth for PLT brand decisions. daisyUI consumes those values through the `brand` theme.

See `DESIGN.md`, `docs/primitives.md`, `docs/patterns.md`, `docs/renderers.md`, and `docs/adapters.md`.
