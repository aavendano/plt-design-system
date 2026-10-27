---
name: functional-visual-testing
description: >-
  Plan and verify functional UI changes with executable assertions and visual
  evidence across frameworks. Use for UI-affecting issues, component changes,
  E2E acceptance tests, responsive visual parity, and regression reviews.
---

# Functional and visual verification

Turn an approved functional change into reproducible UI scenarios and evidence.
This skill defines the verification process; the consuming repository owns its
test runner, fixtures, components, baselines and CI configuration.

## Boundaries

- Read the consuming project's `AGENTS.md`, test commands, UI contracts and
  authorization rules first. Local restrictions override generic examples.
- Never add a dependency on Agent-OS's Django application, database or runtime.
- A passing screenshot does not prove functional correctness. Require observable
  assertions for behavior and state, plus a separate visual checkpoint.
- A screenshot difference is evidence for review, not permission to update a
  baseline. Human approval is required for intentional visual changes.
- Do not perform destructive, production or human-gate actions as part of
  testing without specific authorization. Use disposable test fixtures.
- Mark missing test environments, credentials, fixtures, comparison references
  or tooling `BLOCKED`; never turn an unexecuted scenario into `PASS`.
- Keep evidence free of credentials, tokens, personal data and private content.

## Workflow

1. **Discover.** Read the issue/PR, criteria of acceptance, changed UI surfaces,
   component contracts, existing tests and any prior visual reference.
2. **Plan.** Write a versioned JSON plan using
   [the contract](references/plan-contract.md). For every scenario, specify the
   source criterion, setup, permitted actions, functional assertions, visual
   checkpoints, executor and evidence requirements.
3. **Validate.** Run `node scripts/validate-plan.mjs <plan.json>` from this
   skill directory (or pass the absolute plan path). Resolve any structural
   errors before browser execution.
4. **Prepare.** Use the consumer's canonical fixtures and isolated environment;
   stabilize fonts, viewport, animation, clock, locale and dynamic content.
   Capture an approved reference or identify a deterministic peer comparator.
5. **Execute.** Run the consumer's test suite (for example Vitest + Playwright)
   and assert functionality *before* taking a state-specific screenshot. Use
   accessible roles or stable test IDs, not transient CSS selectors.
6. **Compare.** Evaluate baselines or cross-renderer parity. A difference needs
   actual/expected/diff images or a clearly documented equivalent. Do not
   auto-accept or overwrite references.
7. **Report.** Map each criterion to `PASS | FAIL | BLOCKED | SKIPPED`, attach
   test output, screenshots and trace-on-failure, explain environments and
   intentional drift, and identify the human review gate.

## Executor selection

- **Browser automation:** Use the test runner already owned by the consumer.
  Playwright is appropriate when installed, but not a required runtime
  dependency of this skill.
- **Computer-use-only workflow:** Follow the consumer's approved browser path,
  video-review requirements and data oracle. Do not introduce Playwright when
  explicitly prohibited.
- **Backend oracle:** When available, compare UI observations with read-only
  database/API assertions before and after. A browser-only check cannot prove
  an invisible business-state transition.

## Completion contract

For each scenario, preserve criterion ID, executor, fixture/environment,
functional result, visual result, comparator/baseline version, evidence paths,
permitted mutations and final review status. A PR with visual change remains
pending until the designated human reviews its reference change.

The schema is deliberately framework-neutral. Keep Django-specific instructions
in `product-ui-testing` and Playwright test code in the consuming repository.
