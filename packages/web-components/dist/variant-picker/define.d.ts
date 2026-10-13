import { PltVariantPicker } from "./plt-variant-picker.js";
export declare const PLT_VARIANT_PICKER_TAG = "plt-variant-picker";
/**
 * Registers `<plt-variant-picker>` once. Safe to call from several bundles and
 * on the server: it is a no-op without a `customElements` registry, and it
 * never redefines a tag another bundle already registered.
 */
export declare function definePltVariantPicker(registry?: CustomElementRegistry | undefined): boolean;
export { PltVariantPicker };
