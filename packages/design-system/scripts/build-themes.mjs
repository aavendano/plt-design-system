import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { basename, join } from "node:path";

// Compiles the demo catalog once per theme (demo/dist-<theme>.css). A theme that
// fails to compile, or whose output lacks the daisyUI theme, fails the check.
const root = fileURLToPath(new URL("..", import.meta.url));
const tmp = join(root, "demo", ".themes");
const themes = (await readdir(join(root, "themes")))
  .filter((file) => file.endsWith(".css"))
  .map((file) => basename(file, ".css"));

if (themes.length === 0) {
  throw new Error("No themes found in themes/");
}

await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });

for (const theme of themes) {
  const input = join(tmp, `${theme}.css`);
  const output = join(root, "demo", `dist-${theme}.css`);
  await writeFile(
    input,
    [
      '@import "tailwindcss";',
      '@source "../index.html";',
      '@source "../../renderers/**/*.{astro,liquid}";',
      `@import "../../themes/${theme}.css";`,
      "",
    ].join("\n"),
  );
  execFileSync(
    "npx",
    ["tailwindcss", "-i", input, "-o", output, "--minify"],
    { cwd: root, stdio: "pipe" },
  );
  const css = (await import("node:fs")).readFileSync(output, "utf8");
  if (!css.includes("--color-primary") || !css.includes("--plt-color-primary")) {
    throw new Error(`Theme "${theme}" compiled without the daisyUI theme or tokens.`);
  }
  process.stdout.write(`theme ${theme}: ${css.length} bytes\n`);
}

await rm(tmp, { recursive: true, force: true });
