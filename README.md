# PLT Design System

Portable visual foundations for Play, love & Toys, extracted from `aavendano/plt-frontend`.

## Scope of v0.1

This first layer contains only reusable visual foundations:

- design tokens
- typography
- geometry
- layout/utilities
- daisyUI 5 theme adapter
- design rules and the first universal primitive candidates

Shopify-specific behavior is intentionally excluded from the foundation package.

## Package entry points

```css
@import "@playlovetoys/design-system";
```

Individual foundations can also be imported:

```css
@import "@playlovetoys/design-system/tokens";
@import "@playlovetoys/design-system/typography";
@import "@playlovetoys/design-system/geometry";
@import "@playlovetoys/design-system/utilities";
```

For Tailwind 4 + daisyUI 5 projects:

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: brand --default;
  prefix: "d-";
}

@import "@playlovetoys/design-system";
@import "@playlovetoys/design-system/daisyui";
```

## Architecture

`--plt-*` tokens are the source of truth. Framework adapters consume those tokens rather than owning the design values.

```text
foundations
  tokens
  typography
  geometry
  utilities
      |
      +-- adapters/daisyUI
      +-- future adapters (Shopify, Astro, React, etc.)
      |
      +-- future universal primitives
```

See `DESIGN.md` for visual rules and the initial primitive shortlist.
