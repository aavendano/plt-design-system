import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef
} from "react";
import { VARIANT_CHANGE_EVENT } from "../variant-picker/types.js";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
let registration = null;
function ensureDefined() {
  registration ??= import("../variant-picker/define.js");
  return registration;
}
function PltVariantPicker({
  options,
  variants,
  selectedVariantId = null,
  name = "id",
  labels,
  disabled = false,
  fallbackLabel = "Variant",
  className,
  onVariantChange,
  children
}) {
  const ref = useRef(null);
  const callback = useRef(onVariantChange);
  callback.current = onVariantChange;
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.options = options;
    element.variants = variants;
    element.labels = labels ?? {};
  }, [options, variants, labels]);
  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.selectedVariantId = selectedVariantId;
    ref.current.disabled = disabled;
  }, [selectedVariantId, disabled]);
  useEffect(() => {
    void ensureDefined();
    const element = ref.current;
    if (!element) return;
    const listener = (event) => {
      const custom = event;
      callback.current?.(custom.detail, custom);
    };
    element.addEventListener(VARIANT_CHANGE_EVENT, listener);
    return () => element.removeEventListener(VARIANT_CHANGE_EVENT, listener);
  }, []);
  const fallback = children ?? createElement(
    "div",
    { className: "plt-variant-picker__fallback", "data-plt-fallback": "" },
    createElement(
      "label",
      { className: "theme-label-bold" },
      fallbackLabel,
      createElement(
        "select",
        { className: "d-select", name, defaultValue: selectedVariantId ?? void 0, disabled },
        variants.map(
          (variant) => createElement(
            "option",
            { key: variant.id, value: variant.id, disabled: !variant.available },
            variant.title ?? variant.options.join(" / ")
          )
        )
      )
    )
  );
  return createElement(
    "plt-variant-picker",
    {
      ref,
      name,
      // Attributes so the server-rendered HTML carries the initial state.
      "selected-variant-id": selectedVariantId ?? void 0,
      disabled: disabled || void 0,
      className,
      suppressHydrationWarning: true
    },
    fallback
  );
}
export {
  PltVariantPicker
};
