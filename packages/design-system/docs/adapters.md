# Platform adapters

Adapters connect the framework-agnostic PLT design system to platform conventions without becoming the source of truth for design values.

## Rule

Canonical values live in `--plt-*` tokens. Adapters may alias or expose them, but must not duplicate colors, typography, geometry, spacing or shadows.

## Shopify

Import:

```css
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/shopify";
```

The Shopify adapter exposes theme-friendly aliases and section spacing hooks. Runtime ecommerce behavior, Liquid settings, cart state and product state remain outside the core design package.

## Astro

Import:

```css
@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/astro";
```

Astro requires no runtime adapter for the primitive layer. The adapter only provides page-shell conveniences and aliases for layout composition.

## Verification

`demo/index.html` is the zero-runtime catalog. A primitive should render there without Shopify, Astro, React, Liquid or JavaScript.
