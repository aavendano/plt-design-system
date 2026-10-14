# Composition components inventory (Phase 4)

Surfaces that should share DS markup/CSS across storefronts. Category (d) in
`storefront-visual-parity.md`.

| Surface | DS renderer / CSS | Liquid | Astro | Hydrogen |
| --- | --- | --- | --- | --- |
| Product card | `renderers/*/ProductCard`, patterns | theme card snippets (migrate toward renderer) | prefer `renderers/astro/ProductCard.astro` | `app/components/plt/ProductCard.tsx` |
| Collection card | `CollectionCard` | snippets | Astro renderer | `CollectionCard.tsx` |
| Hero | `Hero` | sections | Astro renderer | `Hero.tsx` |
| Footer | `Footer` | layout/snippets | Astro renderer | layout + plt |
| Navbar | `Navbar` + `mega-menu.css` | `snippets/navbar.liquid` + mega-menu (CSS now in DS) | WC / Navbar | `MegaMenu.tsx` |
| Breadcrumbs | `Breadcrumbs` | snippets | Astro renderer | `Breadcrumbs.tsx` |
| Pagination | `Pagination` | snippets | Astro renderer | pagination in plt |

## Migrated in this unification wave

- Mega-menu / review stars / predictive search / bento / theme-group / marquee /
  blog / article **CSS** → `src/components/*.css` (Liquid `{% stylesheet %}`
  removed; markup stays in the theme).

## Not migrating (document as storefront-only)

- Liquid Alpine cart drawer chrome and `x-cloak`.
- Shopify section appearance settings (`section-appearance`, spacing-style).
- Hydrogen theme switcher (`THEME=playlovetoys|…`) beyond cheesecake.
- Astro account forms and Keystatic admin chrome.

## Adoption rule

When a storefront still owns markup for a row above, prefer wrapping or
replacing with the DS renderer and keep only Shopify/data adapters in the
application. Do not invent a third class vocabulary.
