import { defineConfig } from "vitest/config";

// Real Chromium (Playwright) against the built Liquid, Astro and React demos.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/browser/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
