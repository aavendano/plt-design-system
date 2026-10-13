import { defineOnce } from "../shared/element.js";
import { PltProductGallery } from "./plt-product-gallery.js";
import { PltQuickView } from "./plt-quick-view.js";

export function definePltProduct(registry?: CustomElementRegistry): boolean {
  const target = registry ?? globalThis.customElements;
  return defineOnce("plt-product-gallery", PltProductGallery, target) && defineOnce("plt-quick-view", PltQuickView, target);
}

definePltProduct();

export { PltProductGallery, PltQuickView };
