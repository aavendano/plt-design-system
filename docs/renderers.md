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

```text
Shopify product -> presenter -> ProductCard contract -> Liquid renderer
API/content     -> presenter -> ProductCard contract -> Astro renderer
```

## daisyUI anatomy

Liquid and Astro may differ syntactically, but equivalent renderers must emit the same daisyUI parts:

- ProductCard: `d-card`, `d-card-body`, `d-card-title`, `d-card-actions`, `d-badge`, `d-btn`
- CollectionCard: `d-card`, `d-card-body`, `d-card-title`
- Hero: `d-hero`, `d-hero-content`, `d-hero-overlay`, `d-btn`; eyebrow uses `d-badge`
- Newsletter: `d-card`, `d-card-body`, `d-card-title`, `d-input`, `d-btn`
- PromoStrip: PLT-specific composition containing `d-btn` when an action exists

PLT `theme-*` classes apply brand treatment. `plt-*` classes may extend composition where daisyUI has no corresponding component part, but may not replace a daisyUI component class.

## Verification

`npm run check:conformance` verifies renderer anatomy and rejects the old parallel primitive class families. `npm run check` additionally compiles the catalog with Tailwind CSS 4 and daisyUI 5.

See `docs/daisyui-conformance.md` for the complete mapping.
