# Component foundation

PLT components remain DaisyUI-first. Zensical documentation should show the reusable component contracts without creating a parallel component API.

## Layering

```text
DaisyUI anatomy
PLT design tokens
PLT theme utilities
PLT storefront composition
Hydration island contract
```

## Visual rules

| Token | Current value |
| --- | --- |
| Base component border | `2px` |
| Emphasis border | `3px` |
| Default hard shadow | `4px` |
| Hover hard shadow | `8px` |
| Active hard shadow | `2px` |
| Radius | `0.25rem` |

Colors are owned by `packages/design-system/src/tokens.css` and remain unchanged.

## DaisyUI invariant

Use official `d-`-prefixed DaisyUI classes for primitives:

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">
  Shop now
</button>

<article class="d-card bg-base-100 theme-bordered theme-elevated">
  <div class="d-card-body">
    <h2 class="d-card-title theme-headline-sm">Product title</h2>
  </div>
</article>
```

Use `plt-*` only for compositions that DaisyUI does not provide, such as media-card layout, product-grid shell or cart-line composition.

## Reusable storefront base

The store template should start from these reusable units:

| Unit | Role |
| --- | --- |
| `Hero` | First-screen editorial and campaign section. |
| `PromoStrip` | Campaign strip, shipping message or compliance note. |
| `ProductGrid` | Handle-based product section. |
| `ProductCard` | Product summary renderer. |
| `CollectionCard` | Collection summary renderer. |
| `SearchField` | Store search entry point. |
| `FilterBar` | Collection filtering shell. |
| `SortSelect` | Collection sort shell. |
| `Newsletter` | Marketing signup shell. |
| `EmptyState` | No-results and fallback states. |
