import { Liquid } from "liquidjs";

/**
 * liquidjs with the Shopify-only tags and filters the adapter uses stubbed.
 * liquidjs implements standard Liquid; `json`, `escape`, `default` and
 * `join` behave as on Shopify for the data used here.
 */
export function shopifyLiquid(root) {
  const engine = new Liquid({ root, extname: ".liquid", strictFilters: true });
  engine.registerTag("doc", {
    parse(_token, remaining) {
      while (remaining.length) {
        if (remaining.shift().name === "enddoc") return;
      }
    },
    *render() {},
  });
  engine.registerFilter("asset_url", (file) => `./assets/${file}`);
  engine.registerFilter("image_url", (image) => String(image));
  engine.registerFilter("money", (cents) => `$${(Number(cents) / 100).toFixed(2)}`);
  return engine;
}
