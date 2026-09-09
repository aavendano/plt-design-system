# Extracted theme patterns

This layer was derived from recurring visual structures in `aavendano/plt-frontend`. Shopify objects, Liquid branching, Alpine behavior and ecommerce state remain outside the design-system package.

Every pattern that contains a daisyUI component keeps the daisyUI `d-*` class and its part classes. PLT `plt-*` classes only describe composition that daisyUI does not provide; `theme-*` classes carry brand typography and visual treatment.

## Section Header

```html
<header class="plt-section-header">
  <span class="d-badge d-badge-secondary theme-label-bold plt-section-header__eyebrow">Journal</span>
  <h1 class="theme-headline-lg plt-section-header__title">Open conversations</h1>
  <p class="theme-body-lg plt-section-header__description">Editorial introduction.</p>
</header>
```

## Product Card

```html
<article class="d-card bg-base-100 theme-bordered theme-elevated plt-media-card plt-product-card">
  <a class="plt-media-card__media" href="#"><img src="product.jpg" alt="Product"></a>
  <div class="d-card-body plt-media-card__body">
    <span class="d-badge d-badge-secondary theme-label-bold">New</span>
    <h3 class="d-card-title theme-headline-sm plt-media-card__title"><a href="#">Product title</a></h3>
    <p class="theme-meta plt-media-card__meta">Vendor</p>
    <div class="d-card-actions plt-media-card__actions">
      <span class="plt-product-card__price">$49.00</span>
      <a class="d-btn d-btn-secondary d-btn-sm theme-bordered theme-elevated theme-label-bold" href="#">View</a>
    </div>
  </div>
</article>
```

Product lookup, variants, quick-add, reviews, swatches and money formatting remain platform responsibilities.

## Collection Card

```html
<a class="d-card bg-base-100 theme-bordered theme-elevated plt-media-card plt-collection-card" href="#">
  <figure class="plt-media-card__media plt-collection-card__media"><img src="collection.jpg" alt="Collection"></figure>
  <div class="d-card-body plt-media-card__body">
    <h2 class="d-card-title theme-headline-sm plt-media-card__title">Collection title</h2>
    <p class="theme-meta">Short description.</p>
  </div>
</a>
```

## Editorial Card

```html
<article class="d-card bg-base-100 theme-bordered theme-elevated plt-media-card plt-editorial-card">
  <a class="plt-media-card__media" href="#"><img src="article.jpg" alt="Article"></a>
  <div class="d-card-body plt-media-card__body">
    <h2 class="d-card-title theme-headline-sm plt-media-card__title"><a href="#">Article title</a></h2>
    <p class="theme-meta">Date · Author</p>
    <p class="theme-body-lg">Excerpt.</p>
    <div class="d-card-actions plt-media-card__actions"><a class="d-btn d-btn-ghost theme-label-bold" href="#">Read more</a></div>
  </div>
</article>
```

## Hero

```html
<section class="d-hero plt-hero plt-hero--media">
  <div class="plt-hero__media"><img src="hero.jpg" alt=""></div>
  <div class="d-hero-overlay plt-hero__overlay"></div>
  <div class="d-hero-content plt-hero__content">
    <div class="plt-hero__copy">
      <h1 class="theme-headline-lg">Shop bold.</h1>
      <p class="theme-body-lg">Hero supporting copy.</p>
      <div class="plt-hero__actions">
        <a class="d-btn d-btn-primary d-btn-lg theme-bordered theme-elevated theme-label-bold" href="#">Shop now</a>
      </div>
    </div>
  </div>
</section>
```

## Split CTA

Split CTA has no direct daisyUI component equivalent, so its outer composition remains PLT-specific while its contained primitives remain daisyUI.

```html
<section class="plt-split-cta">
  <div class="plt-split-cta__content">
    <span class="d-badge d-badge-secondary theme-label-bold">New</span>
    <h2 class="theme-headline-lg">Editorial callout</h2>
    <p class="theme-body-lg">Supporting copy.</p>
    <div><a class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" href="#">Learn more</a></div>
  </div>
  <div class="plt-split-cta__media"><img src="feature.jpg" alt=""></div>
</section>
```

Use `plt-split-cta--media-left` when the media should appear first on desktop.

## Promo Strip

Promo Strip is also a PLT-specific composition.

```html
<section class="plt-promo-strip">
  <div class="plt-promo-strip__inner">
    <div class="plt-promo-strip__copy">
      <h2 class="theme-headline-sm">Free shipping over $75</h2>
      <p class="theme-body-lg">Worldwide delivery.</p>
    </div>
    <a class="d-btn d-btn-secondary theme-bordered theme-elevated theme-label-bold" href="#">Claim offer</a>
  </div>
</section>
```

Use `plt-promo-strip--warning` for editorial warning-yellow callouts.

## Newsletter

```html
<section class="plt-newsletter">
  <div class="d-card bg-base-100 theme-bordered theme-elevated plt-newsletter__card">
    <div class="d-card-body plt-newsletter__content">
      <h2 class="d-card-title theme-headline-lg">Join the underground</h2>
      <p class="theme-body-lg">Get updates directly to your inbox.</p>
      <form class="plt-newsletter__form">
        <input class="d-input" type="email" placeholder="EMAIL@STORE.COM">
        <button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" type="submit">Subscribe</button>
      </form>
    </div>
  </div>
</section>
```

Form submission remains platform-specific.

## Breadcrumbs

```html
<nav class="d-breadcrumbs plt-breadcrumbs" aria-label="Breadcrumb">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/collections">Collections</a></li>
    <li><span aria-current="page">Current page</span></li>
  </ul>
</nav>
```

Route construction remains outside the component.

## Deliberately outside the visual core

- product swatches and variant availability resolution
- quick-add state and product form behavior
- product-card second-image data selection
- carousel scrolling behavior and Alpine directives
- cart **state** (open/close, line mutations, money math)
- Shopify route and translation resolution
- CMS/metaobject lookup

Cart drawer / cart line **UI** is now part of the design system; only runtime state stays in the application. Those platform concerns reuse the daisyUI + PLT visual layer.
