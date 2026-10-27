# Functional–visual test plan v1

A plan is a reviewable JSON artifact owned by the consuming repository. It maps
requirements to existing or newly developed executable tests; writing the plan
does not itself generate or execute code.

## Required shape

```json
{
  "schemaVersion": 1,
  "id": "component-variant-picker",
  "source": "packages/design-system/contracts/components.md",
  "runner": {
    "kind": "vitest-playwright",
    "command": "npm run test:browser -w @playlovetoys/web-components",
    "testFile": "packages/web-components/tests/browser/frontends.test.ts"
  },
  "fixtures": ["liquid", "astro", "react"],
  "policy": {
    "mutations": "fixture-only",
    "baselineUpdates": "human-approval"
  },
  "scenarios": [
    {
      "id": "variant-selection",
      "criterion": "Selecting a variant updates selected ID, price and sold-out state",
      "setup": "Built three-renderer demo; same product fixture",
      "actions": ["Open product demo", "Select Blue", "Select Size L"],
      "assertions": ["Variant ID and price update", "Sold-out action is disabled"],
      "visual": {
        "checkpoint": "sold-out",
        "comparison": "peer",
        "reference": "liquid",
        "viewports": [{"width": 640, "height": 900}]
      },
      "evidence": ["test-output", "screenshot", "trace-on-failure"]
    }
  ]
}
```

## Semantics

- `source` is the requirement/contract path or issue link. Do not invent a
  criterion after viewing a screenshot.
- `runner.kind` names the executor available in the consumer. `command`
  and `testFile` must resolve there; the generic skill cannot execute them.
- `policy.mutations`: `read-only` or `fixture-only`; production mutation is
  intentionally unsupported by this plan format.
- `policy.baselineUpdates` must equal `human-approval`.
- `assertions` are observable business or DOM outcomes; not pixel statements.
- `visual.comparison`: `baseline`, `peer` or `observation`.
  `baseline` requires an approved reference and stable environment;
  `peer` requires a deterministic named peer (e.g. Liquid vs Astro);
  `observation` requires human assessment and cannot claim pixel regression
  coverage.
- `visual.viewports` are positive integer CSS pixel dimensions.
- `evidence` declares required artifacts, but the report records actual paths
  and results separately. Never mark a scenario passing from intent alone.
- A scenario may contain more than one state checkpoint in a future contract
  version. Version 1 models one explicit checkpoint per scenario.

Run `scripts/validate-plan.mjs` to reject missing fields, duplicate IDs,
unsupported policies and malformed viewports. The validator checks structure,
not the truth of assertions or the availability of fixtures.
