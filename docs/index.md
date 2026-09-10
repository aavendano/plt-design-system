# PLT documentation system

This documentation site is authored with Zensical and Markdown. It defines the reusable storefront foundations for PlayLoveToys: visual tokens, component contracts, editorial blocks and hydrated component islands.

Zensical is used here as the documentation and authoring layer. The storefront template remains responsible for Shopify data, runtime behavior, cart state and client-side hydration.

## Scope

- Document the PLT design-system rules.
- Define Markdown authoring patterns for reusable storefront sections.
- Define hydrated component islands that can be emitted from Markdown and resolved by the store template.
- Keep colors, typography, borders and shadows aligned with `@playlovetoys/design-system`.

## Packages

| Package | Responsibility |
| --- | --- |
| `@playlovetoys/design-system` | DaisyUI-first visual tokens, primitives, patterns and renderers. |
| `@playlovetoys/editorial` | Framework-neutral page, block and hydration contracts. |
| `@playlovetoys/astro` | Astro rendering adapter for editorial blocks. |

## Local commands

```bash
npm run docs:serve
npm run docs:build
```

Zensical reads `zensical.toml`, uses `docs/` as the source directory and writes the generated site to `site/`.

## Design system catalog

Browse the interactive component catalog at [/catalog/](/catalog/) after building or deploying the site.

## Key documents

- [Authoring with Zensical](authoring-with-zensical.md)
- [Hydration islands](hydration-islands.md)
- [Component foundation](component-foundation.md)
- [Store template contract](store-template-contract.md)
- [Homepage example](examples/home-page.md)
