# @playlovetoys/web-components

Framework-neutral PLT Web Components built with [Lit](https://lit.dev). One
implementation per component, consumed by the Shopify Liquid theme, the Astro
storefront and the Hydrogen React storefront through thin adapters.

This package is separate from `@playlovetoys/design-system` so CSS-only
consumers never install or download Lit. Styles still come from the design
system: components render into light DOM with the existing `d-` daisyUI classes,
`theme-*` treatments and `--plt-*` tokens.

Status: **pilot** (`<plt-variant-picker>` only). See
[`docs/architecture/lit-adoption.md`](../../docs/architecture/lit-adoption.md).

## `<plt-variant-picker>`

Option/variant selector. It resolves the shopper's option choices against the
variants it is given and reports the result. It does **not** fetch products,
show prices, touch the cart, change routes or persist anything — the consuming
frontend owns all of that.

### Properties and attributes

| Property | Attribute | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `options` | `options` (JSON) | `PltProductOption[]` | `[]` | `{ name, values: (string \| { value, label?, swatch?: { color?, image? } })[] }` |
| `variants` | `variants` (JSON) | `PltVariant[]` | `[]` | `{ id, options: string[], available, title? }`; `options` are positional and aligned with `options`. |
| `selectedVariantId` | `selected-variant-id` | `string \| null` | `null` | Reflected. Unknown ids fall back to the first available variant. `null` when the selection matches no variant. |
| `name` | `name` | `string` | `"id"` | Name of the hidden input carrying the variant id (Shopify `/cart/add` uses `id`; the Astro storefront uses `merchandiseId`). |
| `labels` | `labels` (JSON) | `{ soldOut?, unavailable? }` | English | Localized status strings. |
| `disabled` | `disabled` | `boolean` | `false` | Disables every control. |

Read-only getters: `selectedVariant` (`PltVariant | null`), `selectedOptions`
(`{ name, value }[]`).

Malformed JSON attributes are ignored (with a console warning) instead of
throwing. Ids are compared as strings, so numeric Liquid ids and Storefront API
GIDs both work.

### Event

`plt:variant-change` — `CustomEvent<PltVariantChangeDetail>`, `bubbles: true`,
`composed: true`, dispatched when the **shopper** changes the selection (not when
the consumer sets properties, like native `change`).

```ts
interface PltVariantChangeDetail {
  variantId: string | null;      // null: no variant has this combination
  variant: PltVariant | null;
  available: boolean;            // variant exists and is available
  selectedOptions: { name: string; value: string }[];
  previousVariantId: string | null;
}
```

### Behaviour

- One native radio group per option inside a `<fieldset>`/`<legend>`; arrow keys,
  Tab and Space work as for any radio group. The radio is visually hidden, not
  `display: none`, so it stays focusable; the focused value gets an outline.
- Each value is marked `data-status="available" | "sold-out" | "unavailable"`
  relative to the other selected values; the status is part of the radio's
  accessible name (`"M, Sold out"`). A polite live region announces the result.
- Choosing a value whose combination does not exist keeps that value and moves
  the other options to the closest existing variant (available first).
- A hidden `<input name="{name}">` carries the variant id, so the element works
  inside any `<form>` without form-associated custom element APIs.
- Children marked `data-plt-fallback` (server-rendered `<select>`) are hidden
  and disabled on upgrade: without JavaScript the form still submits a variant.

### Styling

Uses `d-btn`, `d-btn-primary`, `d-btn-outline`, `d-select`, `theme-*` and
`.plt-option-picker*`, plus the `.plt-variant-picker*` rules in
`@playlovetoys/design-system/variant-picker`
(`packages/design-system/src/components/variant-picker.css`, included by the
full design-system stylesheet). Tailwind consumers should add
`@source` for this package's `dist/` (and the adapter they use) so the classes
are generated.

## Entry points

| Import | Contents |
| --- | --- |
| `@playlovetoys/web-components/variant-picker` | Class, types and resolver. Does not register the tag. |
| `@playlovetoys/web-components/variant-picker/define` | Registers `<plt-variant-picker>` once (no-op on the server or when already defined). |
| `@playlovetoys/web-components/variant-picker/resolve` | Pure resolution functions (no DOM, no Lit). |
| `@playlovetoys/web-components/variant-picker/storefront` | `fromStorefrontProduct()` — Storefront API product → picker data. Plain mapping, no client. |
| `@playlovetoys/web-components/variant-picker/bundle` | `dist/plt-variant-picker.bundle.js`: self-contained (Lit included) for Shopify themes. |
| `@playlovetoys/web-components/react/variant-picker` | `<PltVariantPicker>` React 18/19 adapter. |
| `@playlovetoys/web-components/adapters/liquid/plt-variant-picker.liquid` | Liquid snippet. |
| `@playlovetoys/web-components/adapters/astro/VariantPicker.astro` | Astro component. |

`dist/` is committed (and verified by `npm run check:dist`) because consumers
install the design system as a git dependency and Shopify themes copy the
bundle into `assets/`.

## Installing in a frontend

With npm, the design system is a git dependency of the whole repository
(npm cannot install a sub-directory), so paths include `packages/…`:

```jsonc
// package.json
"@playlovetoys/platform": "github:aavendano/plt-design-system#<commit>",
"lit": "^3.3.1"
```

```js
import VariantPicker from "@playlovetoys/platform/packages/web-components/adapters/astro/VariantPicker.astro";
import { fromStorefrontProduct } from "@playlovetoys/platform/packages/web-components/dist/variant-picker/storefront.js";
```

`lit` must be a dependency of the frontend: git dependencies do not install
the workspace's own dependencies. Frontends that do not import the whole
design-system stylesheet add the picker styles on their own (they fall back
to daisyUI 5 theme variables when `--plt-*` tokens are absent) and register
the classes with Tailwind:

```css
@import "@playlovetoys/platform/packages/design-system/src/components/variant-picker.css";
@source "../../node_modules/@playlovetoys/platform/packages/web-components/dist";
@source "../../node_modules/@playlovetoys/platform/packages/web-components/adapters/astro";
```

With pnpm, `github:aavendano/plt-design-system#<commit>&path:/packages/web-components`
installs the package under its own name and the `exports` below apply.

## Platform adapters

### Shopify Liquid

Copy `dist/plt-variant-picker.bundle.js` to the theme's `assets/` and
`adapters/liquid/plt-variant-picker.liquid` to `snippets/`, then inside the
product form:

```liquid
{%- assign sold_out_label = 'products.product.sold_out' | t -%}
{%- assign unavailable_label = 'products.product.unavailable' | t -%}
{% render 'plt-variant-picker',
  product: product,
  sold_out_label: sold_out_label,
  unavailable_label: unavailable_label
%}
```

The theme keeps price, button state and URL updates by listening to
`plt:variant-change`. No React, Astro or Alpine is required.

### Astro

```astro
---
import VariantPicker from "@playlovetoys/web-components/adapters/astro/VariantPicker.astro";
import { fromStorefrontProduct } from "@playlovetoys/web-components/variant-picker/storefront";
const picker = fromStorefrontProduct(product); // product from the Storefront API
---
<form method="post" action="/api/cart">
  <VariantPicker {...picker} name="merchandiseId" labels={{ soldOut: t("soldOut") }} />
</form>
```

The component renders on the server as plain HTML plus the no-JS fallback; the
client `<script>` only registers the element.

### Hydrogen React

```tsx
import { PltVariantPicker } from "@playlovetoys/web-components/react/variant-picker";
import { fromStorefrontProduct } from "@playlovetoys/web-components/variant-picker/storefront";

const picker = useMemo(() => fromStorefrontProduct(product), [product]);
<PltVariantPicker
  {...picker}
  name="merchandiseId"
  onVariantChange={({ selectedOptions }) =>
    navigate(`?${new URLSearchParams(selectedOptions.map((o) => [o.name, o.value]))}`, { replace: true })
  }
/>;
```

The adapter passes arrays as DOM properties, forwards the DOM event and imports
the element definition lazily in an effect, so server rendering never touches
`customElements` and hydration sees the same markup the server produced.
Memoize `options`/`variants`/`labels` to avoid resetting properties on every
render.

## Development

```bash
npm run build -w @playlovetoys/web-components        # dist/
npm run test -w @playlovetoys/web-components         # unit + SSR (jsdom / node)
npm run test:browser -w @playlovetoys/web-components # Liquid, Astro, React demos in Chromium
npm run size -w @playlovetoys/web-components         # bundle sizes
```

`test:browser` builds `examples/.out/{liquid,astro,react}` (Liquid rendered with
liquidjs, a real `astro build`, React SSR + hydration) and drives them with
Playwright: pointer and keyboard selection, events, sold-out/unavailable states,
property updates, axe-core, no-JS fallback, pixel parity across the three
frontends. Screenshots land in `examples/.out/screenshots/`. It needs Chromium
(`npx playwright install chromium`).
