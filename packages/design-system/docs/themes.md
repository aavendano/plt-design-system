# Themes

A theme is a file in `themes/` that sets the `--plt-*` token values and adds the few rules tokens cannot express. The structure (typography hooks, utilities, primitives, patterns) is shared and lives in `src/base.css`; it reads tokens and carries the PLT values only as defaults.

| Theme | File | Look |
| --- | --- | --- |
| `plt` | `themes/plt.css` | The original PlayLoveToys look: bold borders, hard shadows, display type in capitals. Same output as `src/index.css`. |
| `neutral` | `themes/neutral.css` | Stock daisyUI `light` values: thin borders, soft shadows, system fonts, no capitals. |
| `nocturne` | `themes/nocturne.css` | Dark, compact, one accent (`#9184d9`), 8px radii, Inter at medium weight, outlined primary buttons. From the Nocturne kit. |
| `capricho` | `themes/capricho.css` | Quiet editorial luxury (Lunar Caprice): cream ground, charcoal ink, matte gold, marble-dark hero, Bodoni Moda display with Jost, square corners, hairline borders, soft shadows. |
| `broadsheet` | `themes/broadsheet.css` | Printed-newspaper register: cool newsprint ground, near-black ink, Source Serif 4 throughout, cyan accent and magenta second ink, no dark bands or section dividers, small radii, soft ink shadows. |
| `konstrukt` | `themes/konstrukt.css` | Bauhaus/Swiss on paper: riso red, blue and ochre, flat blocks, 2px charcoal borders, no shadows, square corners, uppercase Source Serif 4 headlines with Jost and IBM Plex Mono. |
| `unconventionals` | `themes/unconventionals.css` | Neobrutalist editorial: 3px ink borders, hard offset shadows, PLAYROOM palette (magenta, coral, amber, teal, indigo), Lexend Mega display with Public Sans and Proza Libre. |
| `workbench` | `themes/workbench.css` | Production tool as printed matter: warm paper, coral, slate, mustard and olive inks, 1px rules, flat minimal shadows, IBM Plex Serif, Sans and Mono. |

## Using one

Import exactly one theme after Tailwind; each declares its own daisyUI plugin configuration, so do not combine two themes or a theme with `src/index.css`.

```css
@import "tailwindcss";
@import "@playlovetoys/design-system/themes/neutral";
```

An application can pick the theme at build time (for example from a `THEME` environment variable resolved in its bundler config). Fonts are not bundled: a theme names the family (`--plt-font-*`) and the application loads the files.

## Tokens a theme sets

- Colors: `--plt-color-{base-100,base-200,base-300,base-content,primary,secondary,accent,neutral,info,success,warning,error}` and their `-content` pairs.
- Shape: `--plt-radius-{selector,field,box}`, `--plt-size-{selector,field}`, `--plt-border-width`, `--plt-section-border-width`, `--plt-border-color`.
- Elevation: `--plt-shadow-color`, `--plt-shadow-offset`, `--plt-shadow-hover-offset`, `--plt-shadow-active-offset` (set the offsets to `0px` to remove hard shadows).
- Type: `--plt-font-{display,body,accent}`, `--plt-heading-{weight,tracking,transform}`, `--plt-label-{weight,tracking,transform}`, `--plt-price-tracking`.
- Layout: `--plt-page-width`, `--plt-page-margin`, `--plt-section-gap-min`.

Unset tokens fall back to the PLT defaults in `src/tokens.css`, `src/geometry.css` and `src/typography.css`.

## Adding a theme

1. Copy `themes/neutral.css` to `themes/<name>.css`.
2. Override the tokens above under `:root`; add rules only for what tokens cannot express (for example outlined buttons or the focus ring).
3. Run `npm run build:themes`; it compiles the demo once per theme and fails if a theme does not compile.

Brand values belong in the token overrides, never in new selectors that duplicate the patterns.
