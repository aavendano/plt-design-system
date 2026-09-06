# Universal primitives

The primitive layer is framework-agnostic. Use semantic HTML first and add `plt-*` classes for PLT visual treatment.

## Button

```html
<button class="plt-button plt-button--primary" type="button">Add to cart</button>
<a class="plt-button plt-button--secondary" href="/collections/new">Shop new</a>
```

Variants: `--primary`, `--secondary`, `--accent`, `--ghost`.

## Card / surface

```html
<article class="plt-card">
  <div class="plt-card__body">
    <h2 class="plt-headline-sm">Title</h2>
    <p>Card content.</p>
  </div>
</article>
```

Use `.plt-surface` when the element is not semantically a card but needs the bordered/elevated treatment.

## Badge

```html
<span class="plt-badge">New</span>
```

## Input

```html
<label class="plt-field-label">
  Email
  <input class="plt-field" type="email" autocomplete="email">
  <span class="plt-field-hint">We only use this for order updates.</span>
</label>
```

## Select

```html
<label class="plt-field-label">
  Market
  <select class="plt-field" name="market">
    <option>Canada</option>
    <option>United States</option>
  </select>
</label>
```

## Textarea

```html
<label class="plt-field-label">
  Message
  <textarea class="plt-field" name="message"></textarea>
</label>
```

## Divider

```html
<hr class="plt-divider">
```

## Container / section

```html
<section class="plt-section">
  <div class="plt-container">
    ...
  </div>
</section>
```

## Alert / notice

```html
<div class="plt-alert" role="status">Informational message.</div>
<div class="plt-alert plt-alert--success" role="status">Success message.</div>
<div class="plt-alert plt-alert--warning" role="status">Warning message.</div>
<div class="plt-alert plt-alert--error" role="alert">Error message.</div>
```

## Navigation link / tab

```html
<nav aria-label="Primary">
  <a class="plt-nav-link" aria-current="page" href="/">Home</a>
  <a class="plt-nav-link" href="/collections">Collections</a>
</nav>
```

For tab semantics, keep the correct ARIA roles/state and use `aria-selected="true"` for the active tab.

## Boundary

These primitives contain visual behavior only. They do not own ecommerce data, cart state, navigation state, modal behavior, Shopify settings, or framework lifecycle.
