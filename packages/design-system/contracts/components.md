# PLT component contracts

These contracts define platform-neutral inputs for the visual renderers. They intentionally exclude Shopify objects, Astro content collections and runtime state.

Liquid renderers use snake_case names; Astro renderers expose the same conceptual inputs in camelCase.

## ProductCard

Required: `title`, `url`, `price`.

Optional: `image_url`, `image_alt`, `vendor`, `compare_at_price`, `badge`, `action_label`, `action_url`.

The renderer receives already formatted price strings. Secondary-image selection, variants, money formatting, reviews, swatches and quick-add behavior stay outside the contract because they are platform/application behavior.

Style hooks the stylesheet owns (an application can add them to its markup; the Astro and Liquid renderers do not need them):

- `plt-product-card__hover-media`: a second image layered over the photo, shown on hover and focus on devices that can hover.
- `plt-media-card__actions`: the price/action row; it wraps under a long price, and the button takes the full width when the card is narrow (14rem or less). `plt-product-card` is an inline-size container (`plt-product-card`), so this follows the card's own width, not the viewport; give the card a width from its parent (a grid cell or a column).
- `plt-product-card--row`: row layout on phones (photo left, details right) inside a `plt-product-grid`, which then goes to one column.

## Cart

Style hooks only (the cart itself is application behavior): `plt-cart-lines` (the list of lines), `plt-cart-line` with `plt-cart-line__controls` (forms inside it add no box), `plt-cart-line-children` (lines nested under a parent line) and `plt-free-shipping` with `plt-free-shipping__message` (a message above a `d-progress` bar). Page-level layout, such as a two-column cart with a sticky summary, stays in the application.

## Search results

Style hooks only (no renderer): a `plt-result-list` (`ul` or `div`) of `plt-result-item` rows, each with a link `a` that may hold a 3.5rem product `img`. The photo sits on `--plt-media-background` and follows `--plt-media-fit`.

## CollectionCard

Required: `title`, `url`.

Optional: `image_url`, `image_alt`, `description`.

Collection lookup, deferred menu-image loading and CMS resolution stay outside the contract.

## Hero

Required: `heading`.

Optional: `eyebrow`, `body`, `image_url`, `image_alt`, `primary_label`, `primary_url`, `secondary_label`, `secondary_url`.

The presence of `image_url` selects the media presentation. Media acquisition, video lifecycle and CMS schema stay outside the contract.

## PromoStrip

Required: `heading`.

Optional: `body`, `action_label`, `action_url`, `tone` (`primary|warning`).

Promotions, eligibility and localization stay outside the contract.

## Newsletter

Required: `heading`.

Optional: `body`, `form_action`, `method`, `input_name`, `input_placeholder`, `action_label`.

Submission handling, customer tagging, validation services and persistence stay outside the contract.

## SectionHeader

Required: `title`.

Optional: `eyebrow`, `description`, `as` (`h1|h2|h3`, default `h1`).

## EditorialCard

Required: `title`, `url`.

Optional: `image_url`, `image_alt`, `meta`, `excerpt`, `action_label`.

## SplitCta

Required: `heading`.

Optional: `eyebrow`, `body`, `image_url`, `image_alt`, `action_label`, `action_url`, `media_left` (boolean).

## Breadcrumbs

Required: `items` — array of `{ label, url? }`. The last item is the current page.

Optional: `aria_label`.

Route construction stays outside the contract.

## Navbar

Required: `site_name`, `links` — array of `{ label, url, current? }`.

Optional: `logo_url`, `logo_alt`, `home_url`.

Interactive slots (search, cart, mobile toggle) stay outside the contract; platforms inject them via named slots / render blocks.

## Footer

Required: `site_name`.

Optional: `logo_url`, `logo_alt`, `home_url`, `tagline`, `columns` — array of `{ title, links: [{ label, url }] }`, `social` — array of `{ label, url }`.

Newsletter form markup is injected by the platform via a slot / render block.

## CartDrawer

Required: `title`.

Optional: `subtotal`, `checkout_url`, `cart_url`, `checkout_label`, `view_cart_label`, `empty_label`, `close_label`.

Line items and quantity/remove controls are injected via a slot / render block. Cart state stays outside the contract.

## CartLine

Required: `title`, `price`.

Optional: `url`, `image_url`, `image_alt`, `variant_label`, `quantity` (display string or number).

Quantity/remove controls are injected via a slot / render block.

## ProductGrid

No required data props. Optional: `columns` hint (`2|3|4`). Children / render block supply ProductCard (or CollectionCard) instances.

`columns` is the maximum on wide screens; narrow viewports step down so cards never overflow:

| `columns` | < 40rem | 40–64rem | ≥ 64rem |
| --- | --- | --- | --- |
| _(none)_ | 2 | 3 | 4 |
| `2` | 2 | 2 | 2 |
| `3` | 1 | 3 | 3 |
| `4` | 2 | 3 | 4 |

## ProductDetail

Required: `title`, `price`.

Optional: `vendor`, `compare_at_price`, `badge`, `description`, `images` — array of `{ url, alt? }`.

Gallery override, option pickers and add-to-cart actions are injected via slots / render blocks.

Style hooks: `plt-buy-bar` (sticky add-to-cart; set `data-visible="true"` to show it, children are the price and the add-to-cart `form`). It is `position: fixed`, so the page must put its parent stacking context at `z-index: 30` or later positioned content paints over it, and leave bottom padding so it never covers the footer. Hidden from 64rem up.

## Swatch, Faq and rich text

Style hooks only. `plt-swatch` is a colour chip (set `background-color`, or put an `<img>` inside). `plt-faq` wraps stacked daisyUI `d-collapse` blocks. `plt-prose` styles Shopify/Tina rich text (headings, links, lists, images, blockquotes); themes may override its typography.

## OptionPicker

Required: `name`, `options` — array of `{ label, value, selected?, disabled? }`.

Variant resolution and form wiring stay outside the contract.

## QuantitySelector

Optional: `value` (default `1`), `min`, `max`, `input_name`, `decrease_label`, `increase_label`.

Click handlers stay outside the contract.

## CartSummary

Required: `subtotal`.

Optional: `heading`, `checkout_url`, `checkout_label`, `note`.

## Collection filters, Marquee and CollapsibleText

Style hooks only. `plt-collection-filters` wraps a `d-collapse` panel (`plt-collection-filters__panel`, collapsed on small screens, always open from 64rem), a `plt-filter-bar`, a `plt-sort-select` and an active-filter list (`plt-collection-filters__active`). `plt-marquee` is a scrolling band (`__track`, `__group`, `__item`, `__separator`; `--plt-marquee-speed` and `--plt-marquee-direction` set the motion; it stands still under reduced motion). `plt-collapsible` clamps `__text` to `--plt-collapsible-lines` lines on small screens (unless `data-expanded`) and hides `__toggle` from 40.0625rem.

## FilterBar

Required: `filters` — array of `{ id, label, options: [{ label, value, selected? }] }`.

Optional: `action`, `method`, `submit_label`.

Facet data resolution stays outside the contract.

## SortSelect

Required: `options` — array of `{ label, value, selected? }`.

Optional: `name`, `label`, `action`, `method`.

## SearchField

Optional: `action`, `method`, `input_name`, `placeholder`, `value`, `submit_label`.

## Pagination

Required: `pages` — array of `{ label, url?, current?, disabled? }`.

Optional: `aria_label`, `prev_url`, `next_url`, `prev_label`, `next_label`.

## EmptyState

Required: `heading`.

Optional: `body`, `tone` (`info|warning|error`), `action_label`, `action_url`.

## Pending storefront units

Contracts above are the implemented set. Units the website still needs (`MegaMenu`, `Price`, `Faq`, and the rest) are listed in the repository doc `docs/storefront-component-inventory.md`. Do not add a contract here until that unit is requested.

## daisyUI rendering invariant

Contracts describe data only. They never replace component anatomy. Renderers must map these values into the daisyUI-first structures documented in `docs/daisyui-conformance.md`.
