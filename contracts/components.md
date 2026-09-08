# PLT component contracts

These contracts define platform-neutral inputs for the visual renderers. They intentionally exclude Shopify objects, Astro content collections and runtime state.

Liquid renderers use snake_case names; Astro renderers expose the same conceptual inputs in camelCase.

## ProductCard

Required: `title`, `url`, `price`.

Optional: `image_url`, `image_alt`, `vendor`, `compare_at_price`, `badge`, `action_label`, `action_url`.

The renderer receives already formatted price strings. Secondary-image selection, variants, money formatting, reviews, swatches and quick-add behavior stay outside the contract because they are platform/application behavior.

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

## ProductDetail

Required: `title`, `price`.

Optional: `vendor`, `compare_at_price`, `badge`, `description`, `images` — array of `{ url, alt? }`.

Gallery override, option pickers and add-to-cart actions are injected via slots / render blocks.

## OptionPicker

Required: `name`, `options` — array of `{ label, value, selected?, disabled? }`.

Variant resolution and form wiring stay outside the contract.

## QuantitySelector

Optional: `value` (default `1`), `min`, `max`, `input_name`, `decrease_label`, `increase_label`.

Click handlers stay outside the contract.

## CartSummary

Required: `subtotal`.

Optional: `heading`, `checkout_url`, `checkout_label`, `note`.

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

## daisyUI rendering invariant

Contracts describe data only. They never replace component anatomy. Renderers must map these values into the daisyUI-first structures documented in `docs/daisyui-conformance.md`.
