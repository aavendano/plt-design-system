import { PltVariantPicker } from "./plt-variant-picker.js";
const PLT_VARIANT_PICKER_TAG = "plt-variant-picker";
function definePltVariantPicker(registry = globalThis.customElements) {
  if (!registry) return false;
  if (!registry.get(PLT_VARIANT_PICKER_TAG)) {
    registry.define(PLT_VARIANT_PICKER_TAG, PltVariantPicker);
  }
  return true;
}
definePltVariantPicker();
export {
  PLT_VARIANT_PICKER_TAG,
  PltVariantPicker,
  definePltVariantPicker
};
