import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// .theme-meta is 14px secondary text: it must reach WCAG AA (4.5:1) on
// base-100 and base-200 in every theme. --plt-color-meta is base content mixed
// with transparent, so the rendered colour is base content alpha-composited
// over the background.

const themesDir = resolve(process.cwd(), "themes");
const defaults = readFileSync(resolve(process.cwd(), "src/tokens/colors.css"), "utf8");

type Rgb = [number, number, number];

function token(css: string, name: string): string | undefined {
  return css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
}

function oklch(l: number, c: number, h: number): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((v) => v ** 3);
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
  return linear.map((v) => {
    const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, encoded));
  }) as Rgb;
}

function parse(value: string): Rgb {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255) as Rgb;
  const lch = value.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/);
  if (lch) return oklch(Number(lch[1]) / 100, Number(lch[2]), Number(lch[3]));
  throw new Error(`Unsupported colour: ${value}`);
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function metaMix(css: string): number {
  const meta = token(css, "plt-color-meta") ?? token(defaults, "plt-color-meta")!;
  const mix = meta.match(/var\(--plt-color-base-content\)\s+([\d.]+)%,\s*transparent/);
  if (!mix) throw new Error(`Unsupported --plt-color-meta: ${meta}`);
  return Number(mix[1]) / 100;
}

const themes = readdirSync(themesDir).filter((file) => file.endsWith(".css")).sort();

describe(".theme-meta contrast", () => {
  it.each(themes)("%s meets WCAG AA on base-100 and base-200", (file) => {
    const css = readFileSync(resolve(themesDir, file), "utf8");
    const color = (name: string) => parse(token(css, name) ?? token(defaults, name)!);
    const content = color("plt-color-base-content");
    const alpha = metaMix(css);
    for (const name of ["plt-color-base-100", "plt-color-base-200"]) {
      const background = color(name);
      const meta = content.map((v, i) => alpha * v + (1 - alpha) * background[i]) as Rgb;
      expect(contrast(meta, background), `${file} on ${name}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
