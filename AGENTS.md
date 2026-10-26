# Agent directives — PLT Design System

This monorepo owns shared visuals, tokens, themes, Lit Web Components and
cross-renderer contracts for PlayLoveToys.

## Read first

1. **[Upstream UI policy](packages/design-system/docs/upstream-ui-policy.md)** —
   where UI fixes belong and how consumers pin/sync.
2. **[Component contracts](packages/design-system/contracts/components.md)** —
   props, slots and `plt:*` events.
3. **`packages/web-components`** — Lit implementations shipped to storefronts.

## Functional and visual testing skill

This repository consumes only the pinned `functional-visual-testing` Agent-OS
skill at [`.agents/skills/functional-visual-testing/SKILL.md`](.agents/skills/functional-visual-testing/SKILL.md).
The source commit, allowlisted files and SHA-256 digests are declared in
[`.agents/skill-dependencies.json`](.agents/skill-dependencies.json).

For UI changes, map functional acceptance criteria to the plan contract, then
run the existing Vitest/Playwright test suite and capture visual evidence.
Use `npm run check:skills` to validate the skill import and the
[`variant-picker` pilot plan](tests/visual/variant-picker.plan.json).
Update approved baselines only after human review. Never add `agents-os` to
npm dependencies or import its Django runtime.

## Ownership

- Fix shared UI, interaction and accessibility **here**.
- Consumers (Liquid, Astro, Hydrogen, Keystatic, CMS workbench) only integrate
  data, glue and a pinned commit/package version.
- When changing a Web Component, update the contract and consider Liquid/Astro
  adapters in this monorepo.

## Do not

- Invent parallel primitives that daisyUI already covers (`plt-button`, etc.).
- Ship storefront-specific forks that belong in a shared contract.
