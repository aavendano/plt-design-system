# Multi-storefront style comparison (local)

CI does not reliably cover visual parity across Liquid, Astro and Hydrogen.
Run this locally before opening a styles PR.

## Hydrogen (existing)

```bash
cd tina-hydrogen-frontstore
npm run style:diff
# optional: STYLE_DIFF_STRICT=1 npm run style:diff
npm run check:themes   # after theme or THEME wiring changes
```

See `tools/style-diff/README.md`. Default theme under test should include
`cheesecake`.

## Astro

1. Build CSS / start preview with the same `@playlovetoys/platform` pin as the
   PR.
2. Open fixture pages (home, collection, PDP) at 390 / 768 / 1280.
3. Dump computed styles for `:root` and `.theme-elevated` / `.theme-bordered`
   (DevTools or a small Playwright script mirroring Hydrogen `compare.mjs`).
4. Diff against the Phase 0 baseline JSON (local `evidence/`; do not commit
   large screenshots).

## Liquid

1. `npm run build:css` then `shopify theme dev` (or a static HTML dump of
   sections).
2. Same widths and selectors as Astro.
3. After moving a `{% stylesheet %}` into the design system, style-diff the
   same nodes before/after; expect **0** differences for that component.

## Design-system demos

```bash
cd packages/web-components
npm run test:browser   # frontends.test.ts — Liquid / Astro / React demos
```

Pixel threshold for cross-frontend screenshots is documented in
`tests/browser/frontends.test.ts` (variant picker and additional shared
surfaces). Raise the threshold only with a written reason in the PR.
