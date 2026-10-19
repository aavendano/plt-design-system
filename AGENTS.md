# Agent directives — PLT Design System

This monorepo owns shared visuals, tokens, themes, Lit Web Components and
cross-renderer contracts for PlayLoveToys.

## Read first

1. **[Upstream UI policy](packages/design-system/docs/upstream-ui-policy.md)** —
   where UI fixes belong and how consumers pin/sync.
2. **[Component contracts](packages/design-system/contracts/components.md)** —
   props, slots and `plt:*` events.
3. **`packages/web-components`** — Lit implementations shipped to storefronts.

## Ownership

- Fix shared UI, interaction and accessibility **here**.
- Consumers (Liquid, Astro, Hydrogen, Keystatic, CMS workbench) only integrate
  data, glue and a pinned commit/package version.
- When changing a Web Component, update the contract and consider Liquid/Astro
  adapters in this monorepo.

## Do not

- Invent parallel primitives that daisyUI already covers (`plt-button`, etc.).
- Ship storefront-specific forks that belong in a shared contract.
