import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

const index = await readFile(join(root, "src/index.css"), "utf8");
if (!index.includes('@source "../renderers"')) {
  errors.push("src/index.css must register packaged renderers with Tailwind @source");
}

const requiredEscapes = {
  "renderers/liquid/product-card.liquid": [
    "{{ url | escape }}",
    "{{ image_url | escape }}",
    "{{ title | escape }}",
    "{{ badge | escape }}",
    "{{ vendor | escape }}",
    "{{ price | escape }}",
    "{{ compare_at_price | escape }}",
    "{{ action_label | escape }}",
  ],
  "renderers/liquid/collection-card.liquid": [
    "{{ url | escape }}",
    "{{ image_url | escape }}",
    "{{ title | escape }}",
    "{{ description | escape }}",
  ],
  "renderers/liquid/hero.liquid": [
    "{{ image_url | escape }}",
    "{{ eyebrow | escape }}",
    "{{ heading | escape }}",
    "{{ body | escape }}",
    "{{ primary_url | escape }}",
    "{{ primary_label | escape }}",
    "{{ secondary_url | escape }}",
    "{{ secondary_label | escape }}",
  ],
  "renderers/liquid/promo-strip.liquid": [
    "{{ heading | escape }}",
    "{{ body | escape }}",
    "{{ action_url | escape }}",
    "{{ action_label | escape }}",
  ],
  "renderers/liquid/newsletter.liquid": [
    "{{ heading | escape }}",
    "{{ body | escape }}",
  ],
};

for (const [path, snippets] of Object.entries(requiredEscapes)) {
  const text = await readFile(join(root, path), "utf8");
  for (const snippet of snippets) {
    if (!text.includes(snippet)) errors.push(`${path} is missing escaped output ${snippet}`);
  }
}

if (errors.length) {
  console.error("renderer safety check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("renderer safety check passed.");
