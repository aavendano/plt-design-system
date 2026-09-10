# Homepage example

This page shows how a Zensical-authored Markdown page can declare reusable PLT storefront components.

## Hero

<div data-plt-island="Hero" data-plt-island-id="homepage-hero" data-plt-hydrate="load">
  <script type="application/json" data-plt-props>
    {
      "heading": "Play bold",
      "body": "A reusable storefront hero declared in Markdown and hydrated by the PLT store template.",
      "primaryLabel": "Shop new arrivals",
      "primaryUrl": "/collections/new",
      "secondaryLabel": "Read the guide",
      "secondaryUrl": "/blogs/guides"
    }
  </script>
</div>

## Featured products

<div data-plt-island="ProductGrid" data-plt-island-id="homepage-featured-products" data-plt-hydrate="visible">
  <script type="application/json" data-plt-props>
    {
      "title": "Featured products",
      "products": [
        "product-handle-1",
        "product-handle-2",
        "product-handle-3"
      ]
    }
  </script>
</div>

## Newsletter

<div data-plt-island="Newsletter" data-plt-island-id="homepage-newsletter" data-plt-hydrate="interaction">
  <script type="application/json" data-plt-props>
    {
      "heading": "Join the list",
      "body": "Get product education, buying guides and launch notes.",
      "placeholder": "EMAIL@EXAMPLE.COM",
      "buttonLabel": "Subscribe"
    }
  </script>
</div>
