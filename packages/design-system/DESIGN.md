# Play, love & Toys — Design System

## Visual direction

Editorial commerce with a soft neo-brutalist language: clean, bold, playful and high-contrast. Use near-white surfaces, uppercase display typography, visible 1.5–3px borders and hard offset shadows without blur.

## Component foundation

This design system is daisyUI-first.

- daisyUI 5 owns component anatomy, states and variants.
- Tailwind CSS 4 owns layout utilities.
- PLT owns brand tokens, typography, geometry and narrow visual extensions.
- daisyUI component classes use the `d-` prefix, matching `plt-frontend`.

Examples:

```html
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">Primary</button>
<article class="d-card bg-base-100 theme-bordered theme-elevated">...</article>
<span class="d-badge d-badge-secondary theme-label-bold">New</span>
<input class="d-input">
```

Do not create a parallel component implementation for something daisyUI already provides. Do not carry forward removed daisyUI modifiers such as `d-input-bordered`, `d-select-bordered`, `d-textarea-bordered`, or the old `d-card-bordered` spelling.

## Foundations

### Color
- Primary: `#533278`
- Secondary: `#F4436C`
- Accent: `#0C7489`
- Base surface: `#FAF7F2`
- Base content: `oklch(37% 0.044 257.287)`
- Semantic info/success/warning/error colors are defined in `src/tokens.css` and mapped into the daisyUI `brand` theme.

### Typography
- Display: Fjalla One
- Body: Atkinson Hyperlegible
- Accent/labels: Space Grotesk
- Display headlines are uppercase, bold and tightly tracked.
- Brand typography utilities use the `theme-*` namespace.

### Geometry
- Field/box radius: `0.25rem`
- Base component border: `1.5px`
- PLT section/emphasis border: `3px`
- Hard shadow offset: `2px`
- Avoid glassmorphism, soft gradients and pill-shaped UI as the default visual language.

## Source of truth

The `--plt-*` custom properties are authoritative for PLT brand decisions. `src/daisyui-theme.css` maps them into the daisyUI theme variables. Application/platform behavior must remain outside this repository.

## Component mapping

- Button → `d-btn`
- Card / Surface → `d-card`, with `d-card-body`, `d-card-title`, `d-card-actions` as applicable
- Badge → `d-badge`
- Text input → `d-input`
- Select → `d-select`
- Textarea → `d-textarea`
- Divider → `d-divider`
- Alert / Notice → `d-alert`
- Links → `d-link`
- Tabs → `d-tabs` + `d-tab`
- Hero → `d-hero` + `d-hero-content` + `d-hero-overlay`
- Breadcrumbs → `d-breadcrumbs`

PLT-specific composite patterns may use `plt-*` classes for composition, but any daisyUI primitive inside them must retain its daisyUI base/part classes.

## Supported baseline

The package targets daisyUI `>=5.7.8 <6` and Tailwind CSS `>=4 <5`. The daisyUI minimum avoids known prefix issues fixed during the 5.7 series and uses the current v5 form-control model where input/select/textarea borders are default.

## Repository boundary

This repository is only the reusable component/design layer. Editorial schemas, CMS concerns, Shopify business logic, application routing, cart state, product resolution and framework lifecycle belong elsewhere.
