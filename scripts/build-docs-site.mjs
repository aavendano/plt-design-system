import { cpSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command) {
  execSync(command, { cwd: root, stdio: "inherit" });
}

run("zensical build");
run("npm run build:demo --workspace=@playlovetoys/design-system");

const catalogDir = join(root, "site", "catalog");
mkdirSync(catalogDir, { recursive: true });

const demoDir = join(root, "packages", "design-system", "demo");
for (const file of ["index.html", "dist.css"]) {
  const source = join(demoDir, file);
  if (!existsSync(source)) {
    throw new Error(`Missing demo asset: ${source}`);
  }
  cpSync(source, join(catalogDir, file));
}

const headersSource = join(root, "static", "_headers");
if (existsSync(headersSource)) {
  cpSync(headersSource, join(root, "site", "_headers"));
}
