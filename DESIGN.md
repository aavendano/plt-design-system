# Play, love & Toys — Design System

## Visual direction

Editorial commerce with a soft neo-brutalist language: clean, bold, playful and high-contrast. Use near-white surfaces, uppercase display typography, visible 1.5–3px borders and hard offset shadows without blur.

## Foundations

### Color
- Primary: `#533278`
- Secondary: `#F4436C`
- Accent: `#0C7489`
- Base surface: `#FAF7F2`
- Base content: `oklch(37% 0.044 257.287)`
- Semantic info/success/warning/error colors are defined in `src/tokens.css`.

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

## Portability rule

The `--plt-*` custom properties are authoritative. Framework adapters map their own variables to these tokens. Product or platform behavior must not be embedded in the foundation layer.

## Universal primitive candidates

The first component layer should stay domain-light and portable. Initial candidates:

1. Button
2. Card / Surface
3. Badge
4. Text input
5. Select
6. Textarea
7. Divider
8. Container / Section shell
9. Alert / Notice
10. Navigation link / tab

These primitives should depend only on design-system tokens and semantic states. Ecommerce-specific patterns such as product cards, cart drawers, variant swatches, product galleries and collection filters belong in a later `patterns` or platform-adapter layer.

## Component principles

- Prefer semantic tokens over raw colors.
- Preserve visible border and hard-shadow language across primitives.
- Do not require React or another component runtime for the visual foundation.
- Keep interaction behavior separate from visual styling where possible.
- Ensure primitives can be represented in plain HTML/CSS before adding framework bindings.
