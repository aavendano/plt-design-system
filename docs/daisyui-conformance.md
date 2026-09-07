# daisyUI conformance

This repository treats daisyUI 5 as the component foundation. PLT does not maintain a parallel primitive library.

## Required mapping

| PLT need | daisyUI base |
| --- | --- |
| Button / CTA | `d-btn` |
| Card | `d-card`, `d-card-body`, `d-card-title`, `d-card-actions` |
| Badge | `d-badge` |
| Text input | `d-input` |
| Select | `d-select` |
| Textarea | `d-textarea` |
| Alert | `d-alert` |
| Divider | `d-divider` |
| Link | `d-link` |
| Tabs | `d-tabs`, `d-tab` |
| Hero | `d-hero`, `d-hero-content`, `d-hero-overlay` |
| Breadcrumbs | `d-breadcrumbs` |

## PLT-owned layers

PLT may own:

- `--plt-*` design tokens
- the daisyUI `brand` theme mapping
- `theme-*` typography, border and hard-shadow treatment
- `plt-*` composition classes only when there is no corresponding daisyUI component/part

Examples of valid PLT composition classes are `plt-media-card`, `plt-product-card`, `plt-split-cta`, `plt-promo-strip`, and `plt-newsletter`.

## Prohibited parallel APIs

The following class families must not return:

- `plt-button`
- `plt-card`
- `plt-badge`
- `plt-field`, `plt-input`, `plt-select`, `plt-textarea`
- `plt-alert`
- `plt-divider`
- `plt-nav-link`
- `plt-headline-*`, `plt-body-*`, `plt-meta`
- `plt-bordered`, `plt-elevated`, `plt-sidebar-shadow`

Typography and brand modifiers use `theme-*` instead.

## Automated guard

Run:

```bash
npm run check:conformance
```

The check scans source, renderers and the catalog for prohibited parallel classes, verifies the required daisyUI anatomy of every current renderer, and verifies the mandatory daisyUI theme configuration. GitHub Actions runs the same check for pull requests and pushes to `main`.
