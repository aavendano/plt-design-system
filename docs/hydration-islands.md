# Hydration islands

Hydration islands are the bridge between Zensical Markdown and the interactive store template.

They let a Markdown page declare:

- which component should appear
- where it should appear
- when it should hydrate
- what data seed the component receives

The storefront template owns the runtime work: data enrichment, framework mounting, Shopify integration and event handling.

## Contract

Every island follows this shape:

```ts
type HydrationIsland<TData extends Record<string, unknown> = Record<string, unknown>> = {
  component: HydratableComponent;
  id: string;
  hydrate: "load" | "idle" | "visible" | "interaction";
  data: TData;
};
```

The contract is exported by `@playlovetoys/editorial` and mirrored by `packages/editorial/schemas/hydration-island.schema.json`.

## HTML shape

```html
<div data-plt-island="Hero" data-plt-island-id="homepage-hero" data-plt-hydrate="load">
  <script type="application/json" data-plt-props>
    {
      "heading": "Play bold",
      "body": "Reusable storefront section rendered from Markdown-authored data.",
      "primaryLabel": "Shop now",
      "primaryUrl": "/collections/new"
    }
  </script>
</div>
```

The outer element is stable. The JSON payload is the component seed. The hydrated template may replace the inner content, progressively enhance it or attach behavior to pre-rendered markup.

## Supported components

| Component | Typical data source | Recommended hydration |
| --- | --- | --- |
| `Hero` | Markdown/front matter | `load` |
| `PromoStrip` | Markdown/front matter | `load` |
| `Newsletter` | Marketing config | `interaction` |
| `ProductGrid` | Shopify product handles | `visible` |
| `ProductCard` | Shopify product handle | `visible` |
| `CollectionCard` | Shopify collection handle | `visible` |
| `SearchField` | Storefront search config | `interaction` |
| `FilterBar` | Collection facets | `interaction` |
| `SortSelect` | Collection sort options | `interaction` |
| `Pagination` | Collection/blog pagination | `visible` |
| `EmptyState` | Template state | `load` |

## Storefront hydrator sketch

```ts
const islands = document.querySelectorAll<HTMLElement>("[data-plt-island]");

for (const island of islands) {
  const component = island.dataset.pltIsland;
  const hydrate = island.dataset.pltHydrate ?? "visible";
  const props = island.querySelector("[data-plt-props]")?.textContent ?? "{}";
  const data = JSON.parse(props);

  queueHydration({ island, component, hydrate, data });
}
```

The actual store template can implement `queueHydration` with Astro, React islands, Web Components or lightweight custom elements. The contract stays the same.
