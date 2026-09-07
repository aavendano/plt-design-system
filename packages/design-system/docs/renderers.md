# Component renderers

The renderer layer maps normalized component contracts to platform syntax while preserving the same PLT anatomy and CSS classes.

## Included

- ProductCard
- CollectionCard
- Hero
- PromoStrip
- Newsletter

Each component has a Liquid renderer under `renderers/liquid/` and an Astro renderer under `renderers/astro/`.

## Boundary

Renderers accept normalized values. They do not own Shopify product objects, money formatting, variants, swatches, quick-add, cart state, translations, CMS lookups or Astro content collection resolution.

A Shopify integration should therefore normalize first, then render:

```text
Shopify product
  -> Shopify adapter / presenter
  -> ProductCard contract
  -> renderers/liquid/product-card.liquid
  -> shared PLT pattern CSS
```

Astro follows the same shape:

```text
API / content entry
  -> Astro presenter
  -> ProductCard props
  -> renderers/astro/ProductCard.astro
  -> shared PLT pattern CSS
```

## Design invariant

Liquid and Astro may differ syntactically, but their semantic anatomy and `plt-*` class names must remain equivalent. Visual changes belong in `src/patterns.css`, not duplicated in each renderer.
