# Platform adapters

Adapters connect the PLT component/design layer to platform conventions without becoming the source of truth for design values.

## Rule

Canonical values live in `--plt-*` tokens. Adapters may alias or expose them, but must not duplicate colors, typography, geometry, spacing or shadows. daisyUI remains the component foundation in every consuming platform.

## Shopify

```css
@import "tailwindcss";
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/shopify";
```

The Shopify adapter exposes theme-friendly aliases and section-spacing hooks. Runtime ecommerce behavior, Liquid settings, cart state and product state remain outside the design package.

## Astro

```css
@import "tailwindcss";
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/astro";
```

The Astro adapter only provides page-shell conveniences and aliases for layout composition. Astro renderers still emit the same prefixed daisyUI classes as Liquid renderers.

## Catalog verification

`demo/index.html` is a no-JavaScript visual catalog, but its stylesheet must be compiled because Tailwind CSS and daisyUI use build-time directives.

```bash
npm install
npm run build:demo
```

For the complete validation suite run `npm run check`.
