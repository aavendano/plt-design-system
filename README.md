# PLT Design System

Portable visual foundations, primitives and composite patterns for Play, love & Toys, extracted from `aavendano/plt-frontend`.

## Scope

The package contains framework-agnostic `--plt-*` tokens, typography, geometry, utilities, 10 semantic primitives, extracted composite visual patterns, daisyUI/Shopify/Astro adapters, and a static verification catalog.

Runtime Shopify behavior remains outside the visual core.

## Package entry points

```css
@import "@playlovetoys/design-system";
```

Individual layers:

```css
@import "@playlovetoys/design-system/tokens";
@import "@playlovetoys/design-system/typography";
@import "@playlovetoys/design-system/geometry";
@import "@playlovetoys/design-system/utilities";
@import "@playlovetoys/design-system/primitives";
@import "@playlovetoys/design-system/patterns";
```

## Extracted theme patterns

The reusable visual structures identified in the Shopify theme are:

- Section Header
- Product Card
- Collection Card
- Editorial / Blog Card
- Hero
- Split CTA
- Promo Strip
- Newsletter
- Breadcrumbs

They live in `src/patterns.css` and compose the primitive/token layers. Product lookup, variants, quick-add, swatches, money formatting, route construction, translations, CMS lookups and carousel behavior stay in platform/application code.

See `docs/patterns.md` for semantic HTML examples and the extraction boundary.

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
  tokens
  typography
  geometry
  utilities
  primitives
  patterns
      |
      +-- adapters/daisyUI
      +-- adapters/Shopify
      +-- adapters/Astro
      |
      +-- platform behavior (outside package)
```

See `DESIGN.md`, `docs/primitives.md`, `docs/patterns.md`, and `docs/adapters.md`.
