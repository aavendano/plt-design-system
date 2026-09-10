# @playlovetoys/editorial

Framework-neutral editorial vocabulary for PlayLoveToys.

The package defines page/block contracts and machine-readable schemas. It must not depend on Astro, Shopify, React, Liquid or CMS-specific objects.

Initial block vocabulary: `hero`, `rich_text`, `product_grid`, `promo_strip`, and `newsletter`.

## Hydration islands

Zensical-authored Markdown can emit static placeholders that the storefront template hydrates with data. The shared contract is `HydrationIsland`, exported from this package and mirrored in `schemas/hydration-island.schema.json`.

The contract keeps authoring, rendering and runtime behavior separate:

- Markdown owns placement and editorial intent.
- Zensical turns Markdown into static HTML.
- The storefront template resolves data, renders the matching PLT component and hydrates it according to the selected mode.
