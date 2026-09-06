# PLT Design System

Portable visual foundations and universal primitives for Play, love & Toys, extracted from `aavendano/plt-frontend`.

## Scope

The package contains:

- framework-agnostic `--plt-*` design tokens
- typography foundations
- geometry: borders, radii and hard offset shadows
- portable layout/style utilities
- 10 universal semantic HTML/CSS primitives
- daisyUI 5 theme adapter
- Shopify adapter
- Astro adapter
- a static primitive catalog for visual verification

Shopify runtime behavior and ecommerce-specific composite components remain outside the foundation package.

## Package entry points

Complete framework-agnostic core:

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
```

## Platform adapters

### Shopify

```css
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/shopify";
```

The Shopify adapter maps PLT tokens into theme-oriented aliases such as `--color-page-background` and `--token-section-gap-min`; it does not redefine design values.

### Astro

```css
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/astro";
```

Astro can consume the core directly. The adapter only provides a minimal `.astro-page-shell` convenience abstraction and page-width aliases.

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

Tailwind and daisyUI are optional peer dependencies and are only needed when this adapter is used.

## Primitive catalog

`demo/index.html` renders the package primitives directly from `src/index.css`. It is deliberately static and framework-free so visual regressions can be inspected without Shopify, Astro or JavaScript runtime dependencies.

The catalog covers buttons, cards/surfaces, badges, inputs, selects, textareas, dividers, containers, alerts/notices and navigation links/tabs.

## Architecture

`--plt-*` tokens are the source of truth. Framework and platform adapters consume those tokens rather than owning the design values.

```text
foundations
  tokens
  typography
  geometry
  utilities
  primitives
      |
      +-- adapters/daisyUI
      +-- adapters/Shopify
      +-- adapters/Astro
      |
      +-- future composite patterns
```

See `DESIGN.md` for visual rules and `docs/primitives.md` for primitive usage examples.
