# Extracted theme patterns

This layer was derived from recurring visual structures in `aavendano/plt-frontend`. It intentionally keeps Shopify objects, Liquid branching, Alpine behavior and ecommerce state outside the design-system package.

## Extracted components

### Section Header

Source pattern: `snippets/blog-header.liquid` and repeated page/collection/search headers.

```html
<header class="plt-section-header">
  <span class="plt-badge plt-section-header__eyebrow">Journal</span>
  <h1 class="plt-headline-lg plt-section-header__title">Open conversations</h1>
  <p class="plt-body-lg plt-section-header__description">Editorial introduction.</p>
</header>
```

### Product Card

Source pattern: `snippets/product-card.liquid`, `product-card-gallery.liquid`, and `price.liquid`.

The design system owns only visual slots. Product lookup, variants, quick-add, review stars, swatches and money formatting remain platform responsibilities.

```html
<article class="plt-media-card plt-product-card">
  <a class="plt-media-card__media" href="#"><img src="product.jpg" alt="Product"></a>
  <div class="plt-media-card__body">
    <h3 class="plt-headline-sm plt-media-card__title"><a href="#">Product title</a></h3>
    <p class="plt-meta plt-media-card__meta">Vendor</p>
    <div class="plt-media-card__actions">
      <span class="plt-product-card__price">$49.00</span>
      <a class="plt-button plt-button--secondary" href="#">View</a>
    </div>
  </div>
</article>
```

### Collection Card

Source pattern: `snippets/collection-card.liquid`. Uses the same media-card skeleton but keeps contained square artwork.

```html
<a class="plt-media-card plt-collection-card" href="#">
  <span class="plt-media-card__media plt-collection-card__media"><img src="collection.jpg" alt="Collection"></span>
  <span class="plt-media-card__body">
    <span class="plt-headline-sm plt-media-card__title">Collection title</span>
    <span class="plt-meta">Short description.</span>
  </span>
</a>
```

### Editorial Card

Source pattern: `snippets/blog-post-card.liquid`. Uses 16:9 media and the common media-card body/action anatomy.

```html
<article class="plt-media-card plt-editorial-card">
  <a class="plt-media-card__media" href="#"><img src="article.jpg" alt="Article"></a>
  <div class="plt-media-card__body">
    <h2 class="plt-headline-sm plt-media-card__title"><a href="#">Article title</a></h2>
    <p class="plt-meta">Date · Author</p>
    <p class="plt-body-lg">Excerpt.</p>
    <div class="plt-media-card__actions"><a class="plt-button plt-button--ghost" href="#">Read more</a></div>
  </div>
</article>
```

### Hero

Source pattern: `sections/hero.liquid`. Covers both simple warning-background hero and media-overlay hero.

```html
<section class="plt-hero plt-hero--media">
  <div class="plt-hero__media"><img src="hero.jpg" alt=""></div>
  <div class="plt-hero__overlay"></div>
  <div class="plt-hero__content">
    <div class="plt-hero__copy">
      <h1 class="plt-headline-lg">Shop bold.</h1>
      <p class="plt-body-lg">Hero supporting copy.</p>
      <div class="plt-hero__actions"><a class="plt-button plt-button--primary" href="#">Shop now</a></div>
    </div>
  </div>
</section>
```

### Split CTA

Source pattern: the `split_cta` block in `sections/hero.liquid`.

```html
<section class="plt-split-cta">
  <div class="plt-split-cta__content">
    <span class="plt-badge">New</span>
    <h2 class="plt-headline-lg">Editorial callout</h2>
    <p class="plt-body-lg">Supporting copy.</p>
    <div><a class="plt-button plt-button--primary" href="#">Learn more</a></div>
  </div>
  <div class="plt-split-cta__media"><img src="feature.jpg" alt=""></div>
</section>
```

Use `plt-split-cta--media-left` when the media should appear first on desktop.

### Promo Strip

Source patterns: `sections/promo-strip.liquid` and `blocks/editorial-promo-strip.liquid`.

```html
<section class="plt-promo-strip">
  <div class="plt-promo-strip__inner">
    <div class="plt-promo-strip__copy">
      <h2 class="plt-headline-sm">Free shipping over $75</h2>
      <p>Worldwide delivery.</p>
    </div>
    <a class="plt-button plt-button--secondary" href="#">Claim offer</a>
  </div>
</section>
```

Use `plt-promo-strip--warning` for editorial warning-yellow callouts.

### Newsletter

Source pattern: `sections/newsletter.liquid`.

```html
<section class="plt-newsletter">
  <div class="plt-card plt-newsletter__card">
    <div class="plt-newsletter__content">
      <h2 class="plt-headline-lg">Join the underground</h2>
      <p>Get updates directly to your inbox.</p>
      <form class="plt-newsletter__form">
        <input class="plt-field" type="email" placeholder="EMAIL@STORE.COM">
        <button class="plt-button" type="submit">Subscribe</button>
      </form>
    </div>
  </div>
</section>
```

Form submission remains platform-specific.

### Breadcrumbs

Source pattern: `snippets/breadcrumb.liquid`. Route construction remains outside the component; only the semantic visual shell is extracted.

```html
<nav class="plt-breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/collections">Collections</a></li>
    <li><span aria-current="page">Current page</span></li>
  </ol>
</nav>
```

## Deliberately not extracted into the visual core

- product swatches and variant availability
- quick-add state and product form behavior
- product-card second-image data selection
- carousel scrolling behavior and Alpine directives
- cart drawer and cart-line state
- Shopify route and translation resolution
- CMS/metaobject lookup

Those should be supplied by Shopify/Astro/application adapters while reusing these visual pattern classes.
