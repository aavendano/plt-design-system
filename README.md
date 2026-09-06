# PLT Design System

Portable visual foundations, primitives, composite patterns and cross-platform renderers for Play, love & Toys, extracted from `aavendano/plt-frontend`.

## Scope

The package contains framework-agnostic `--plt-*` tokens, typography, geometry, utilities, 10 semantic primitives, extracted composite visual patterns, platform adapters, normalized component contracts, Liquid/Astro renderers and a static verification catalog.

Runtime Shopify behavior remains outside the visual core.

## Package entry points

```css
@import "@playlovetoys/design-system";
```

Individual CSS layers:

```css
@import "@playlovetoys/design-system/tokens";
@import "@playlovetoys/design-system/typography";
@import "@playlovetoys/design-system/geometry";
@import "@playlovetoys/design-system/utilities";
@import "@playlovetoys/design-system/primitives";
@import "@playlovetoys/design-system/patterns";
```

## Component contracts and renderers

The first shared component contracts are:

- ProductCard
- CollectionCard
- Hero
- PromoStrip
- Newsletter

Canonical inputs are documented in `contracts/components.md`.

Equivalent platform renderers live in:

```text
renderers/liquid/
renderers/astro/
```

Liquid and Astro use the same `plt-*` anatomy and pattern CSS. Platform-specific code normalizes its data before invoking a renderer.

Example flow:

```text
Shopify product -> Shopify presenter -> ProductCard contract -> Liquid renderer
API/content     -> Astro presenter   -> ProductCard contract -> Astro renderer
                                                |
                                         shared patterns.css
```

Excluded from the renderer contract: Shopify product objects, variant selection, swatches, quick-add, cart state, money formatting, translations, CMS lookup and application lifecycle.

See `docs/renderers.md`.

## Extracted theme patterns

The reusable visual structures identified in the Shopify theme are Section Header, Product Card, Collection Card, Editorial / Blog Card, Hero, Split CTA, Promo Strip, Newsletter and Breadcrumbs. They live in `src/patterns.css`.

## Platform adapters

### Shopify

```css
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/shopify";
```

### Astro

```css
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/astro";
```

### Tailwind 4 + daisyUI 5

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: brand --default;
  prefix: "d-";
}
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/daisyui";
```

Tailwind and daisyUI are optional peer dependencies.

## Architecture

`--plt-*` tokens are authoritative.

```text
foundations
  -> primitives
  -> patterns
  -> contracts
  -> renderers
       +-- Liquid
       +-- Astro
  -> platform presenters/behavior
```

See `DESIGN.md`, `docs/primitives.md`, `docs/patterns.md`, `docs/renderers.md`, and `docs/adapters.md`.
