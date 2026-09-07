# Component renderers

The renderer layer maps normalized component contracts to platform syntax while preserving the same daisyUI anatomy and PLT visual extensions.

## Included

- ProductCard
- CollectionCard
- Hero
- PromoStrip
- Newsletter

Each component has a Liquid renderer under `renderers/liquid/` and an Astro renderer under `renderers/astro/`.

## Boundary

Renderers accept normalized values. They do not own Shopify product objects, money formatting, variants, swatches, quick-add, cart state, translations, CMS lookups or Astro content collection resolution.

A Shopify integration should normalize first, then render:

```text
Shopify product
  -> Shopify adapter / presenter
  -> ProductCard contract
  -> renderers/liquid/product-card.liquid
  -> daisyUI component classes + PLT pattern CSS
```

Astro follows the same shape:

```text
API / content entry
  -> Astro presenter
  -> ProductCard props
  -> renderers/astro/ProductCard.astro
  -> daisyUI component classes + PLT pattern CSS
```

## Design invariant

Liquid and Astro may differ syntactically, but they must emit equivalent component anatomy:

- `d-card` / `d-card-body` for cards
- `d-btn` plus daisyUI variants for buttons
- `d-badge` plus daisyUI variants for badges
- `d-input`, `d-select`, `d-textarea` for fields
- `d-hero` / `d-hero-content` for heroes

PLT `theme-*` and composition classes may extend this anatomy, but may not replace the daisyUI component class. Visual changes belong in the shared design-system CSS, not duplicated independently in Liquid and Astro.
