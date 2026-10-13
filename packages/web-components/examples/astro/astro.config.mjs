import { defineConfig } from "astro/config";

// Static demo of the Astro adapter. Real storefronts keep their own config.
export default defineConfig({
  output: "static",
  outDir: "../.out/astro",
  build: { format: "file" },
  base: "/astro/",
  trailingSlash: "ignore",
});
