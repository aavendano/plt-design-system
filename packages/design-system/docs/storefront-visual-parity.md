# Storefront visual parity (Phase 0)

Measurement baseline for unifying Liquid (`plt-frontend-liquid`), Astro
(`plt-astro-storefront`) and Hydrogen (`tina-hydrogen-frontstore`) against the
design-system theme **`cheesecake`**, which must mirror Liquid’s daisyUI
`brand` theme.

Date: 2026-10-14. Method: **static CSS / markup analysis** (token files,
utility definitions, `{% stylesheet %}` inventory, class usage counts). Live
browser captures and computed-style dumps were **not** taken in this
environment (no equivalent Shopify store fixture running for all three
storefronts). Re-run the capture procedure below before claiming pixel parity.

## 1. Common fixture (how to obtain equivalent data)

| Page | Shared fixture intent | Liquid | Astro | Hydrogen |
| --- | --- | --- | --- | --- |
| Home | Same menu + hero + featured collection | `shopify theme dev` + published theme sections | `npm run dev` with Storefront API + Keystatic | `npm run dev` / Oxygen preview; `THEME=cheesecake` |
| Collection | Same handle (e.g. a known catalog collection) | `/collections/{handle}` | `/collections/{handle}` | `/collections/{handle}` |
| PDP | Same product handle | `/products/{handle}` | `/products/{handle}` | `/products/{handle}` |
| Cart | Same line items (do **not** create real orders) | Ajax cart drawer / cart page | `/cart` + drawer | cart routes |
| Search | Same query string | `/search?q=` | `/search?q=` | `/search?q=` |
| Article | Same blog + article handle | `/blogs/...` | blog routes | blog routes |
| Glossary | Same term slug | metaobject / page route | glossary route | glossary route |

**Rules:** read-only Storefront API / theme preview; never write customers,
orders or production metaobjects for this measurement. Prefer a staging shop
or recorded HTML fixtures.

Hydrogen already ships static style fixtures under
`tools/style-diff/fixtures/` (component-family HTML, not full pages). Prefer
those for regression; use live pages only for the gap table below.

### Capture procedure (local)

Widths: **390**, **768**, **1280** (CSS px).

1. Serve each storefront (or style-diff fixture build).
2. For each page × width: screenshot (store under a local
   `evidence/visual-parity/` directory — **do not** commit large binaries).
3. Dump computed styles for key nodes (`:root`, `.theme-elevated`,
   `.theme-bordered`, `.theme-headline-sm`, product card root, navbar, footer)
   using the same property set as Hydrogen `tools/style-diff/compare.mjs`.
4. Attach light JSON/Markdown diffs to PRs; keep screenshots out of git.

## 2. Token matrix (category a)

Reference: Liquid `styles/global.css` `@plugin "daisyui/theme"` name `brand`.
DS source: `src/tokens/colors.css`, `src/tokens/radius.css`,
`src/tokens/shadows.css` → daisyUI via `src/daisyui-theme.css` (theme name
`brand` inside cheesecake).

| Token | Liquid brand | Astro brand (inline) | DS cheesecake (`--plt-*` → `--color-*`) | Gap |
| --- | --- | --- | --- | --- |
| base-100 | `#FAF7F2` | `oklch(98% 0.002 247.839)` | `#FAF7F2` | Astro ≠ Liquid |
| primary / secondary / accent | `#533278` / `#F4436C` / `#0C7489` | same | same | OK |
| primary/secondary/accent-content | `#FAF7F2` | oklch creams / dark secondary-content | `#FAF7F2` | Astro ≠ Liquid |
| base-200…error pairs | Liquid values | same as Liquid | same as Liquid | OK |
| radius-* / size-* | `0.25rem` | `0.25rem` | `0.25rem` | OK |
| `--border` / `--plt-border-width` | **1.5px** | **1.5px** | **2px** | DS ≠ Liquid |
| `--shadow-offset` | **2px** | **2px** | **4px** (+ hover **8px**) | DS ≠ Liquid |
| fonts | Fjalla / Atkinson / Space Grotesk | same | same (cheesecake) | OK |

**Count:** 4 Astro color tokens diverge; 2 DS geometry tokens diverge
(border + shadow family). Colors Liquid↔DS already match.

`playlovetoys` theme is **out of scope** as reference (different secondary,
accent, fonts, radii).

## 3. Utility matrix (category b)

DS defines `.theme-*` in `src/primitives.css` and `src/typography.css`.
Liquid redefines 12 `@utility theme-*`. Astro defines 10 `theme-*` + 9
legacy `nb-*` aliases.

| Class | DS | Liquid | Astro | Notes |
| --- | --- | --- | --- | --- |
| theme-elevated | `--plt-shadow-*` 4/8/2 + active shadow | `--shadow-offset` 2 / ×2.5 / **none** | same as Liquid | Geometry + active differ |
| theme-bordered / border-y / divider | `--plt-section-border-width` (3px) | `calc(border*2)` (=3px if border 1.5) | bordered/divider only | Astro missing border-y |
| theme-sidebar-shadow | hover offset | ×2.5 shadow-offset | present | OK once tokens align |
| theme-headline-* / label-* / body / meta | tokenized type scale | Tailwind `@apply` sizes | same as Liquid + nb-* | Meta: DS `--plt-color-meta` vs `/60` |
| theme-headline-underline | in DS | in Liquid | **absent** | |
| theme-group | **absent** (layout in Liquid snippet CSS) | BEM in `snippets/group.liquid` | absent | Category c, not a utility |

**nb-* → theme-* (Astro):**

| nb-* | theme-* |
| --- | --- |
| nb-brutal-shadow | theme-elevated |
| nb-brutal-border | theme-bordered |
| nb-headline-lg / sm | theme-headline-lg / sm |
| nb-label-bold / sm | theme-label-bold / sm |
| nb-body-lg | theme-body-lg |
| nb-meta | theme-meta |
| nb-divider | theme-divider |

Usage (Astro file hits, approx.): nb-brutal-shadow 7, nb-brutal-border 7,
nb-headline-sm 9, nb-label-bold 6, nb-headline-lg 10, nb-label-sm 3,
nb-body-lg 5, nb-meta 3, nb-divider 3.

## 4. Liquid local CSS (category c)

Excluding `.todos/` reference trees: **23** `{% stylesheet %}` blocks.

Largest (lines inside block):

| Lines | File |
| --- | --- |
| 162 | `snippets/mega-menu-list.liquid` |
| 59 | `sections/bento-grid.liquid` |
| 56 | `snippets/group.liquid` |
| 55 | `snippets/product-review-stars.liquid` |
| 53 | `snippets/marquee.liquid` |
| 42 | `sections/blog.liquid` |
| 41 | `sections/article.liquid` |
| 35 | `sections/predictive-search.liquid` |

Astro/Hydrogen do not mirror these stylesheet blocks; shared look must come
from DS component CSS or web components.

## 5. Markup / data (categories d / e)

| Surface | Liquid | Astro | Hydrogen | DS renderer? |
| --- | --- | --- | --- | --- |
| Product card | theme sections/snippets | Astro components | `app/components/plt/ProductCard.tsx` | yes (liquid + astro) |
| Collection card | snippets | components | `CollectionCard.tsx` | yes |
| Hero | sections | components | `Hero.tsx` | yes |
| Footer / navbar | snippets (+ mega-menu CSS) | components / WC | MegaMenu + layout | yes (navbar/footer) |
| Breadcrumbs / pagination | snippets | components | `Breadcrumbs.tsx` + pagination | yes |
| Data/content | Shopify theme + metaobjects | Shopify + Keystatic | Shopify + Tina fallback | N/A |

Category **e** (content) will dominate live screenshot diffs until fixtures use
identical handles and copy — treat as intentional until fixtures are locked.

## 6. Quantified gap weight (static estimate)

| Category | Share of *structural* visual drift | Phase |
| --- | --- | --- |
| (a) Tokens | ~15% (Astro colors + DS border/shadow) | 1 |
| (b) Utilities | ~35% (elevated/meta/type scale + nb-* dual path) | 2 |
| (c) Liquid local CSS | ~30% (mega-menu, bento, group, …) | 3 |
| (d) Markup | ~15% (own cards/nav before renderer adoption) | 4 |
| (e) Data | ~5% structural / high on live pages | fixtures |

## 7. Recommended order

Confirmed: **Phase 1 tokens (`cheesecake` = Liquid brand) → Phase 2
utilities → Phase 3 Liquid CSS → Phase 4 markup → Phase 5 safety net.**
Hydrogen enters from Phase 1 (`THEME=cheesecake` default).

## 8. Intentional differences (gate for humans)

Propose as **intentional until overruled**:

1. Shopify-only chrome (theme editor wrappers, `.shopify-section` gaps,
   Alpine `x-cloak` in Liquid only).
2. Cart drawer motion / dialog implementation differences if progressive
   enhancement is preserved.
3. Theme `playlovetoys` and other H2 opt-in themes remaining available.
4. Content/copy/image differences when fixtures are not locked (category e).

Everything else in (a)–(d) for the surfaces listed above is **in scope** to
drive to zero.

## 9. What was verified / not verified

| Verified | Not verified |
| --- | --- |
| Token literals in Liquid, Astro, DS source files | Computed `:root` in a real browser |
| Utility / `nb-*` definitions and DS class presence | Pixel screenshots at 390/768/1280 |
| Liquid `{% stylesheet %}` inventory (23) | Live multi-storefront style-diff run |
| H2 `tools/style-diff` and DS `frontends.test.ts` exist | Production Shopify theme publish |

## 10. Import criterion (for Phase 1)

Per `docs/themes.md`: after `@import "tailwindcss"`, import **one** theme
(`themes/cheesecake.css`). Do not also ship a local `@plugin "daisyui/theme"`
block with literal brand values.

Liquid and Astro pipelines pin `@playlovetoys/platform` (git) and import:

`@playlovetoys/platform/packages/design-system/themes/cheesecake.css`

## 11. Implementation status (2026-10-14)

| Phase | Status | Evidence |
| --- | --- | --- |
| 0 Measure | Done (static) | This doc |
| 1 Tokens | Done | `tokens/radius.css`, `tokens/shadows.css`; storefronts import cheesecake |
| 2 Utilities | Done | Local `@utility theme-*` / `nb-*` removed; DS primitives are source |
| 3 Liquid CSS | Done | `src/components/{mega-menu,product-review-stars,…}.css` |
| 4 Markup | Inventory done | `storefront-composition-inventory.md` — renderer adoption remains iterative |
| 5 Safety | Done | `storefront-style-diff.md`, contracts theme-ownership, extended `frontends.test.ts` |

PRs (do not merge until reviewed): DS #46, Liquid #18, Astro #11, Hydrogen #147.
