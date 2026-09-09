# @playlovetoys/astro

Astro integration package for PlayLoveToys editorial sites.

It consumes `@playlovetoys/editorial` contracts and renders them with `@playlovetoys/design-system` components. Shopify/API/CMS data resolution belongs in presenters or loaders outside the visual design system.

`BlockRenderer.astro` is the first entry point and intentionally keeps the editorial vocabulary separate from Astro page routing and commerce behavior.
