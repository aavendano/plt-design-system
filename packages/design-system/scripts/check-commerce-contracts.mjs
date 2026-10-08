import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

const pricePath = join(root, "renderers/astro/commerce/Price.astro");
const stockPath = join(root, "renderers/astro/commerce/Stock.astro");
const contractsPath = join(root, "contracts/components.md");

const priceSource = await readFile(pricePath, "utf8");
const stockSource = await readFile(stockPath, "utf8");
const contracts = await readFile(contractsPath, "utf8");

if (/en-US/.test(priceSource)) {
  errors.push("Price.astro must not hardcode en-US; locale comes from props");
}

if (!priceSource.includes("locale")) {
  errors.push("Price.astro must accept a locale prop");
}

if (!stockSource.includes("data-stock-state")) {
  errors.push("Stock.astro must expose data-stock-state for the normalized state");
}

for (const heading of ["## Price", "## Stock"]) {
  if (!contracts.includes(heading)) {
    errors.push(`contracts/components.md is missing ${heading}`);
  }
}

if (errors.length) {
  console.error("commerce contract check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("commerce contract check passed.");
