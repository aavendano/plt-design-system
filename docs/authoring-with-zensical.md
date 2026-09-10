# Authoring with Zensical

PLT documentation and template examples are authored as Markdown. Zensical turns those Markdown files into static HTML, which makes it a good foundation for content-first storefront work.

## Authoring rule

Markdown should describe content and component intent. It should not contain Shopify objects, cart state, fetch logic or framework lifecycle code.

Use Markdown for:

- page structure
- editorial sections
- reusable component placement
- examples of component data
- store-template contracts

Do not use Markdown for:

- product resolution
- price formatting
- cart mutation
- customer/session state
- analytics wiring

## Component placeholders

When a page needs a hydrated component, authors use a static island placeholder. The placeholder can live directly in Markdown as HTML:

```html
<div data-plt-island="ProductGrid" data-plt-island-id="homepage-featured" data-plt-hydrate="visible">
  <script type="application/json" data-plt-props>
    {
      "title": "Featured products",
      "products": ["product-handle-1", "product-handle-2"]
    }
  </script>
</div>
```

Zensical returns this as static HTML. The storefront template later scans for `data-plt-island`, validates the data against the shared contract and hydrates the matching PLT component.

## Hydration modes

| Mode | Use when |
| --- | --- |
| `load` | The component is critical for the first screen. |
| `idle` | The component is useful but not urgent. |
| `visible` | The component should hydrate when it enters the viewport. |
| `interaction` | The component can wait until the user clicks, focuses or opens it. |

## Naming

Island IDs must be stable and lowercase:

```text
homepage-hero
homepage-featured-products
collection-filter-bar
```

Stable IDs let analytics, QA screenshots and template tests target the same section over time.
