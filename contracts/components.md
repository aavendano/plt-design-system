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

## daisyUI rendering invariant

Contracts describe data only. They never replace component anatomy. Renderers must map these values into the daisyUI-first structures documented in `docs/daisyui-conformance.md`.
