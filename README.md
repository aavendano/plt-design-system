# PlayLoveToys Platform

Monorepo for the reusable visual, editorial and Astro integration layers used by PlayLoveToys projects.

## Packages

- `@playlovetoys/design-system` — the daisyUI 5 + Tailwind CSS 4 component layer, including tokens, primitives, patterns and cross-platform visual renderers.
- `@playlovetoys/editorial` — framework-neutral editorial contracts and schemas.
- `@playlovetoys/astro` — Astro block rendering and integration built on the other two packages.

Dependency direction:

```text
@playlovetoys/design-system ─┐
                             ├─> @playlovetoys/astro ─> site/project
@playlovetoys/editorial ─────┘
```

The editorial package does not depend on Astro. The design system does not depend on editorial content, CMS logic, Shopify business behavior, routing, cart state or application lifecycle.

## Design-system contract

Every component with a daisyUI equivalent uses the official `d-`-prefixed class as its base. Brand typography and treatment use `theme-*`; `plt-*` is reserved for compositions daisyUI does not provide. Parallel primitive APIs and obsolete daisyUI 5 modifiers are prohibited.

Shared visual contracts and their equivalent Liquid/Astro renderers live in `packages/design-system/contracts` and `packages/design-system/renderers`. Platform-specific code normalizes data before invoking a renderer.

See `packages/design-system/README.md` and `packages/design-system/DESIGN.md` for the complete design-system documentation.

## Verification

Install development dependencies and run the complete workspace check:

```bash
npm install
npm run check
```

The design-system checks reject contract drift, unsafe Liquid output, parallel PLT primitives, obsolete daisyUI modifiers and incomplete renderer anatomy. The demo build verifies the Tailwind/daisyUI integration. GitHub Actions runs the same workspace check on pull requests and pushes to `main`.

## Documentation site

The documentation site is authored with Zensical from Markdown sources in `docs/`.

```bash
python -m pip install -r requirements.txt
npm install
npm run docs:serve
npm run docs:build:all
```

`zensical.toml` writes the generated site to `site/`. `npm run docs:build:all` also builds the design-system demo catalog into `site/catalog/`.

### Cloudflare Pages

The site deploys to Cloudflare Pages from `main` via `.github/workflows/deploy-docs.yml`.

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN` — API token with Cloudflare Pages edit permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID

Create the Pages project once (if it does not exist yet):

```bash
npx wrangler pages project create plt-docs --production-branch=main
```

Manual deploy from a local build:

```bash
npm run docs:build:all
npx wrangler pages deploy site --project-name=plt-docs
```

Alternative: connect the repository in the Cloudflare dashboard and use this build configuration:

| Setting | Value |
| --- | --- |
| Build command | `python -m pip install -r requirements.txt && npm ci && npm run docs:build:all` |
| Build output directory | `site` |
| Python version | `3.12` |
| Node version | `20` |
