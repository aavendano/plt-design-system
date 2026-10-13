import { defineOnce } from "../shared/element.js";
import { PltQuantitySelector } from "./plt-quantity-selector.js";

export const PLT_QUANTITY_SELECTOR_TAG = "plt-quantity-selector";

export function definePltQuantitySelector(registry?: CustomElementRegistry): boolean {
  return defineOnce(PLT_QUANTITY_SELECTOR_TAG, PltQuantitySelector, registry ?? globalThis.customElements);
}

definePltQuantitySelector();

export { PltQuantitySelector };
