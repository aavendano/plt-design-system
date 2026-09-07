# daisyUI-first primitives

PLT does not reimplement daisyUI components. Component anatomy and behavior come from daisyUI 5 with the project prefix `d-`. PLT adds brand theme variables and narrowly scoped `theme-*` visual extensions.

## Rule

Use the daisyUI component class first, then its daisyUI variant classes, then PLT theme extensions when needed.

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" type="button">
  Add to cart
</button>
```

Do not create parallel classes such as `plt-button`, `plt-card`, `plt-badge`, `plt-input`, `plt-select`, `plt-textarea`, or `plt-alert`.

## Button

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">Primary</button>
<a class="d-btn d-btn-secondary theme-bordered theme-elevated theme-label-bold" href="/collections/new">Shop new</a>
<button class="d-btn d-btn-outline theme-bordered theme-label-bold">Outline</button>
```

## Card

```html
<article class="d-card bg-base-100 theme-bordered theme-elevated">
  <div class="d-card-body">
    <h2 class="plt-headline-sm">Title</h2>
    <p>Card content.</p>
  </div>
</article>
```

## Badge

```html
<span class="d-badge d-badge-secondary theme-label-bold">New</span>
```

## Inputs

```html
<input class="d-input d-input-bordered" type="email">
<select class="d-select d-select-bordered"><option>Canada</option></select>
<textarea class="d-textarea d-textarea-bordered"></textarea>
```

## Divider

```html
<div class="d-divider theme-divider"></div>
```

## Alert

```html
<div class="d-alert d-alert-info" role="status">Informational message.</div>
<div class="d-alert d-alert-success" role="status">Success message.</div>
<div class="d-alert d-alert-warning" role="status">Warning message.</div>
<div class="d-alert d-alert-error" role="alert">Error message.</div>
```

## Hero and breadcrumbs

```html
<section class="d-hero plt-hero">...</section>
<div class="d-breadcrumbs plt-breadcrumbs">...</div>
```

`plt-*` classes are reserved for PLT-specific compositions or typography where daisyUI has no equivalent, not for replacing daisyUI primitives.

## Boundary

This repository is only the component/design layer. It does not own editorial schemas, CMS behavior, Shopify data, cart state, framework lifecycle, or application routing.
