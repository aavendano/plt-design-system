// Guardrail for the theme files (themes/*.css).
//
// Theme rules are unlayered, so they beat daisyUI's layered rules at equal
// specificity. A theme that sets layout on a shared class (`.d-*`, `.theme-*`)
// therefore changes every component that uses it: `position: relative` on
// `.theme-elevated` once turned `.d-dropdown-content` submenus from absolute to
// relative in playdoh. Themes may style shared classes with colour, border,
// shadow, radius, spacing and type; layout belongs to the base styles.
//
// Allowed: any property on pseudo-elements (::before, ::after), and layout on
// single-use `.plt-*` classes (for example `.plt-hero`).
import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'themes');
// `transform` is left out on purpose: themes use it for hover and press shifts.
const LAYOUT = new Set(['position', 'z-index', 'display', 'overflow', 'float', 'inset']);
const SHARED = /\.(?:d|theme)-[a-z0-9_-]+/;
const PSEUDO_ELEMENT = /::[a-z-]+\s*$/;

let problems = 0;
for (const file of readdirSync(root).filter((f) => f.endsWith('.css')).sort()) {
  const css = readFileSync(join(root, file), 'utf8');
  postcss.parse(css, {from: file}).walkRules((rule) => {
    const selectors = rule.selectors.filter((s) => SHARED.test(s) && !PSEUDO_ELEMENT.test(s.trim()));
    if (selectors.length === 0) return;
    rule.walkDecls((decl) => {
      if (!LAYOUT.has(decl.prop)) return;
      if (decl.parent !== rule) return;
      const prev = decl.prev();
      if (prev?.type === 'comment' && prev.text.includes('theme-rules-ok')) return;
      problems += 1;
      process.stderr.write(
        `${file}:${decl.source.start.line} \`${decl.prop}\` on a shared class (${selectors.join(', ')}). ` +
          'Theme rules beat daisyUI, so this changes every component using the class; ' +
          'move it to a single-use .plt-* class, or add /* theme-rules-ok: reason */ above it.\n',
      );
    });
  });
}

if (problems > 0) {
  process.stderr.write(`\n${problems} theme layout declaration(s) on shared classes.\n`);
  process.exit(1);
}
process.stdout.write('theme rules: ok\n');
