# PLT component contracts

These contracts define platform-neutral inputs for renderers. They intentionally exclude Shopify objects, Astro content collections and runtime state.

## ProductCard

Required: `title`, `url`, `price`.

Optional: `image_url`, `image_alt`, `secondary_image_url`, `secondary_image_alt`, `vendor`, `compare_at_price`, `badge`, `action_label`, `action_url`.

The renderer receives already formatted price strings. Variant selection, money formatting, reviews, swatches and quick-add behavior stay outside the contract.

## CollectionCard

Required: `title`, `url`.

Optional: `image_url`, `image_alt`, `description`.

Collection lookup, deferred menu-image loading and CMS resolution stay outside the contract.

## Hero

Required: `heading`.

Optional: `eyebrow`, `body`, `image_url`, `image_alt`, `primary_label`, `primary_url`, `secondary_label`, `secondary_url`, `media` (`true|false`).

Media acquisition, video lifecycle and CMS schema stay outside the contract.

## PromoStrip

Required: `heading`.

Optional: `body`, `action_label`, `action_url`, `tone` (`primary|warning`).

Promotions, eligibility and localization stay outside the contract.

## Newsletter

Required: `heading`.

Optional: `body`, `form_action`, `method`, `input_name`, `input_placeholder`, `action_label`.

Submission handling, customer tagging, validation services and persistence stay outside the contract.
