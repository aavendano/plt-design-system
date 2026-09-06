# PLT Design System

Portable visual foundations and framework-agnostic primitives for Play, love & Toys, extracted from `aavendano/plt-frontend`.

## Scope

The package currently contains:

- design tokens
- typography
- geometry
- layout/utilities
- 10 universal CSS primitives
- daisyUI 5 theme adapter
- design rules and usage documentation

Shopify-specific behavior is intentionally excluded from the core package.

## Install / consume

Import the full framework-agnostic system:

```css
@import "@playlovetoys/design-system";
```

Or consume individual layers:

```css
@import "@playlovetoys/design-system/tokens";
@import "@playlovetoys/design-system/typography";
@import "@playlovetoys/design-system/geometry";
@import "@playlovetoys/design-system/utilities";
@import "@playlovetoys/design-system/primitives";
```

Example:

```html
<section class="plt-section">
  <div class="plt-container">
    <article class="plt-card">
      <div class="plt-card__body">
        <span class="plt-badge">New</span>
        <h2 class="plt-headline-sm">Product title</h2>
        <button class="plt-button plt-button--primary" type="button">Add to cart</button>
      </div>
    </article>
  </div>
</section>
```

See `docs/primitives.md` for the complete primitive API.

## daisyUI adapter

Tailwind and daisyUI are optional. Projects that use them can add the adapter explicitly:

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

`--plt-*` tokens are the source of truth. Framework adapters consume those values rather than owning the design.

```text
PLT design system
  foundations
    tokens
    typography
    geometry
    utilities
  primitives
    button
    card / surface
    badge
    input
    select
    textarea
    divider
    container / section
    alert / notice
    navigation link / tab
  adapters
    daisyUI
    future: Shopify / Astro / React / others
```

Primitives own presentation, interaction states and accessible visual affordances. They do not own ecommerce data, cart state, modal behavior, Shopify settings or framework lifecycle.

See `DESIGN.md` for the visual rules and `docs/primitives.md` for semantic HTML examples.
