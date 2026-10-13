import { defineOnce } from "../shared/element.js";
import { PltVariantPicker } from "./plt-variant-picker.js";
const PLT_VARIANT_PICKER_TAG = "plt-variant-picker";
function definePltVariantPicker(registry = globalThis.customElements) {
  return defineOnce(PLT_VARIANT_PICKER_TAG, PltVariantPicker, registry);
}
definePltVariantPicker();
export {
  PLT_VARIANT_PICKER_TAG,
  PltVariantPicker,
  definePltVariantPicker
};
