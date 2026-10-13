import { defineOnce } from "../shared/element.js";
import { PltQuantitySelector } from "./plt-quantity-selector.js";
const PLT_QUANTITY_SELECTOR_TAG = "plt-quantity-selector";
function definePltQuantitySelector(registry) {
  return defineOnce(PLT_QUANTITY_SELECTOR_TAG, PltQuantitySelector, registry ?? globalThis.customElements);
}
definePltQuantitySelector();
export {
  PLT_QUANTITY_SELECTOR_TAG,
  PltQuantitySelector,
  definePltQuantitySelector
};
