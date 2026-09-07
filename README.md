# PlayLoveToys Platform

Monorepo for the reusable visual, editorial and Astro integration layers used by PlayLoveToys projects.

## Packages

- `@playlovetoys/design-system` — tokens, primitives, patterns and cross-platform visual renderers.
- `@playlovetoys/editorial` — framework-neutral editorial contracts and schemas.
- `@playlovetoys/astro` — Astro block rendering and integration layer built on the other two packages.

Dependency direction:

```text
@playlovetoys/design-system ─┐
                             ├─> @playlovetoys/astro ─> site/project
@playlovetoys/editorial ─────┘
```

The editorial package does not depend on Astro. The design system does not depend on editorial content or application behavior.
