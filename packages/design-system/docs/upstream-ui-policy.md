# Upstream UI policy

Shared UI, interaction and accessibility live in **`plt-design-system`**.
Storefronts and admin UIs only integrate data, platform glue and a pinned package
version. Fixes discovered in any consumer feed this repo so the design system
matures once for Liquid, Astro, Hydrogen and CMS workbenches.

## Principle

| Belongs here (design system) | Belongs in the consumer |
| --- | --- |
| Shared controls, focus, a11y, Lit Web Components | Shopify cart / Section Rendering / Admin API |
| Tokens, themes, daisyUI compositions | Routes, locales, merchant section appearance |
| Neutral contracts and `plt:*` events | Mappers, view-models, prices, inventory |
| Cross-renderer markup (Liquid / Astro / React adapters in this monorepo) | Theme-only UX documented as not yet migrated |

## Layers in this monorepo

| Layer | Package / path | Role |
| --- | --- | --- |
| Lit Web Components | `@playlovetoys/web-components` | Interactive storefront controls (`plt-variant-picker`, `plt-cart-drawer`, …) |
| Design tokens & themes | `@playlovetoys/design-system` | `--plt-*`, daisyUI themes, neutral CSS |
| Contracts | `packages/design-system/contracts/components.md` | Props, slots, events |
| Platform adapters | Liquid / Astro / React under this monorepo | Shape data into shared components |

## Forbidden in consumers

- Hand-edit vendored Liquid artifacts: `assets/plt-web-components.bundle.js`,
  `snippets/plt-*.liquid`, `styles/plt/*.css`.
- Patch `node_modules/@playlovetoys/*` or ship a “temporary” fork of the same
  control in Alpine, React or ad-hoc markup when a shared component already
  exists.
- Close a UI bug only in one storefront when the same pattern is used elsewhere.

## Fix flow

1. Confirm ownership with the decision table below and the consumer inventory
   (e.g. Liquid `docs/web-components-migration.md`).
2. Implement in this repo (Web Component and/or tokens/contracts). Update
   `contracts/components.md` when props, slots or `plt:*` events change.
3. Merge to the pin branch consumers use.
4. In each consumer: bump the commit SHA (or package pin), install, sync if
   required (`npm run sync:plt` + `check:plt` + `build:css` on Liquid), and verify.
5. Open or link an issue in `aavendano/plt-design-system` from the discovering
   repo so feedback stays visible.

## Quick decision table

| Question | Where |
| --- | --- |
| Same control/modal/gallery in two or more storefronts? | Design system |
| Only Shopify data, price, stock, URLs? | Consumer |
| Only merchant section padding/colors? | Theme + tokens settings |
| Shared WC missing a capability (e.g. navbar overflow)? | Extend the contract here; do not fork in the theme |
| Admin/workbench chrome (React)? | Design-system package markup/tokens; editorial state stays in CMS |

## Documented exceptions

- **Liquid navbar:** theme keeps a richer header than `plt-navbar` until the
  shared contract covers overflow, featured cards and accordion drawer. See
  `plt-frontend-liquid` `docs/web-components-migration.md`.
- **Theme-only glue:** consumers may cancel `plt:*` events and drive Section
  Rendering / Ajax Cart without reimplementing the control itself.

## Admin / editorial workbench

`shopify-django-md-cms` `content/frontend` uses React +
`@playlovetoys/design-system` (themes via `THEME`). Visual look and reusable
markup belong in this design system. Document state, REST and Django auth stay
in the CMS. Do not treat Lit Web Components as required for admin UI; prefer the
design-system package API used by that frontend.

## Consumer pin cheat sheet

| Consumer | Dependency | Update steps |
| --- | --- | --- |
| `plt-frontend-liquid` | `@playlovetoys/platform` (commit SHA) | Bump SHA → `npm install` → `npm run sync:plt` → `check:plt` → `build:css` |
| `plt-astro-storefront` | `@playlovetoys/platform` (commit SHA) | Bump SHA → install → use packages from `node_modules` |
| `tina-hydrogen-frontstore` | `@playlovetoys/platform` (commit SHA) | Bump SHA → install; UI under `app/components/plt/` |
| `keystatic-astro-shopify-hydrogen` | `@playlovetoys/design-system` pin | Bump pin → install; follow `docs/design-system/agent-guidelines.md` |
| `shopify-django-md-cms` / workbench | `@playlovetoys/design-system` | Bump pin → rebuild `content/frontend` with `THEME` |

## References

- Contracts: [`contracts/components.md`](../contracts/components.md)
- Cursor rule in this repo: `.cursor/rules/upstream-ui.mdc`
- Liquid migration inventory: sibling `plt-frontend-liquid` / `docs/web-components-migration.md`
