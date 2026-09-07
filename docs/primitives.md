# daisyUI-first primitives

PLT does not reimplement daisyUI components. Component anatomy, variants and component states come from daisyUI 5 with the project prefix `d-`. PLT adds the `brand` theme plus narrowly scoped `theme-*` extensions.

## Invariant

Use the daisyUI component class first, then daisyUI modifiers, then PLT theme extensions when the brand treatment requires them.

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" type="button">
  Add to cart
</button>
```

Parallel component APIs such as `plt-button`, `plt-card`, `plt-badge`, `plt-input`, `plt-select`, `plt-textarea`, `plt-alert`, `plt-divider`, or `plt-nav-link` are prohibited.

## Button

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">Primary</button>
<a class="d-btn d-btn-secondary theme-bordered theme-elevated theme-label-bold" href="/collections/new">Shop new</a>
<button class="d-btn d-btn-outline theme-bordered theme-elevated theme-label-bold">Outline</button>
```

## Card

Use daisyUI card parts rather than recreating card internals.

```html
<article class="d-card bg-base-100 theme-bordered theme-elevated">
  <div class="d-card-body">
    <h2 class="d-card-title theme-headline-sm">Title</h2>
    <p>Card content.</p>
    <div class="d-card-actions">
      <a class="d-btn d-btn-primary">Action</a>
    </div>
  </div>
</article>
```

## Badge

```html
<span class="d-badge d-badge-secondary theme-label-bold">New</span>
```

## Forms

Current daisyUI 5 inputs, selects and textareas have borders by default; the old `*-bordered` modifiers are not used.

```html
<input class="d-input" type="email">
<select class="d-select"><option>Canada</option></select>
<textarea class="d-textarea"></textarea>
```

Use the corresponding `*-ghost` modifier only when the border should be removed.

## Divider

```html
<div class="d-divider"></div>
```

`theme-divider` remains available only as the PLT thick-line visual utility where a semantic daisyUI divider is not the desired composition.

## Alert

```html
<div class="d-alert d-alert-info" role="status">Informational message.</div>
<div class="d-alert d-alert-success" role="status">Success message.</div>
<div class="d-alert d-alert-warning" role="status">Warning message.</div>
<div class="d-alert d-alert-error" role="alert">Error message.</div>
```

## Links, tabs, hero and breadcrumbs

```html
<a class="d-link d-link-hover theme-label-bold" href="/collections">Collections</a>

<div role="tablist" class="d-tabs d-tabs-border">
  <button role="tab" class="d-tab d-tab-active">Featured</button>
</div>

<section class="d-hero plt-hero">
  <div class="d-hero-overlay plt-hero__overlay"></div>
  <div class="d-hero-content plt-hero__content">...</div>
</section>

<nav class="d-breadcrumbs plt-breadcrumbs" aria-label="Breadcrumb">...</nav>
```

`plt-*` classes are reserved for PLT-specific composition where daisyUI has no equivalent. Brand typography and visual modifiers use `theme-*` names.

## Boundary

This repository owns only the component/design layer. It does not own editorial schemas, CMS behavior, Shopify data, cart state, framework lifecycle or application routing.
