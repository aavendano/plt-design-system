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
<input class="d-input d-input-bordered">
```

Do not create a parallel component implementation for something daisyUI already provides.

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
- Labels are uppercase and use the accent family.

### Geometry
- Field/box radius: `0.25rem`
- Base border: `1.5px`
- Section border: `3px`
- Hard shadow offset: `2px`
- Avoid glassmorphism, soft gradients and pill-shaped UI as the default visual language.

## Source of truth

The `--plt-*` custom properties are authoritative for PLT brand decisions. `src/daisyui-theme.css` maps them into the official daisyUI theme variables. Application/platform behavior must remain outside this repository.

## Component mapping

- Button → `d-btn`
- Card / Surface → `d-card`
- Badge → `d-badge`
- Text input → `d-input`
- Select → `d-select`
- Textarea → `d-textarea`
- Divider → `d-divider`
- Alert / Notice → `d-alert`
- Tabs → `d-tabs` + `d-tab`
- Hero → `d-hero`
- Breadcrumbs → `d-breadcrumbs`

PLT-specific composite patterns may use `plt-*` classes for composition, but any daisyUI primitive inside them must retain its daisyUI base class.

## Repository boundary

This repository is only the reusable component/design layer. Editorial schemas, CMS concerns, Shopify business logic, application routing, cart state, product resolution and framework lifecycle belong elsewhere.
