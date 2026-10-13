import { defineOnce } from "../shared/element.js";
import { PltVariantPicker } from "./plt-variant-picker.js";

export const PLT_VARIANT_PICKER_TAG = "plt-variant-picker";

/**
 * Registers `<plt-variant-picker>` once. Safe to call from several bundles and
 * on the server: it is a no-op without a `customElements` registry, and it
 * never redefines a tag another bundle already registered.
 */
export function definePltVariantPicker(
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): boolean {
  return defineOnce(PLT_VARIANT_PICKER_TAG, PltVariantPicker, registry);
}

definePltVariantPicker();

export { PltVariantPicker };
