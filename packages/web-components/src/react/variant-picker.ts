/**
 * Minimal React adapter for `<plt-variant-picker>` (React 18 and 19).
 *
 * It does not re-implement the picker: it renders the custom element, passes
 * array/object data as DOM properties, forwards `plt:variant-change` to a
 * callback and registers the element lazily on the client, so server rendering
 * never touches `customElements`.
 */
import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  PltProductOption,
  PltVariant,
  PltVariantChangeDetail,
  PltVariantPickerLabels,
} from "../variant-picker/types.js";
import { VARIANT_CHANGE_EVENT } from "../variant-picker/types.js";

export interface PltVariantPickerProps {
  options: PltProductOption[];
  variants: PltVariant[];
  selectedVariantId?: string | null;
  /** Form field name of the variant id (default `id`). */
  name?: string;
  labels?: PltVariantPickerLabels;
  disabled?: boolean;
  /** Label of the no-JavaScript `<select>` fallback. */
  fallbackLabel?: string;
  className?: string;
  onVariantChange?: (detail: PltVariantChangeDetail, event: CustomEvent<PltVariantChangeDetail>) => void;
  /** Replaces the default no-JavaScript fallback. Mark it `data-plt-fallback`. */
  children?: ReactNode;
}

type PickerElement = HTMLElement & {
  options: PltProductOption[];
  variants: PltVariant[];
  labels: PltVariantPickerLabels;
  selectedVariantId: string | null;
  disabled: boolean;
};

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

let registration: Promise<unknown> | null = null;
function ensureDefined() {
  registration ??= import("../variant-picker/define.js");
  return registration;
}

export function PltVariantPicker({
  options,
  variants,
  selectedVariantId = null,
  name = "id",
  labels,
  disabled = false,
  fallbackLabel = "Variant",
  className,
  onVariantChange,
  children,
}: PltVariantPickerProps) {
  const ref = useRef<PickerElement | null>(null);
  const callback = useRef(onVariantChange);
  callback.current = onVariantChange;

  // Complex data travels as properties, never as stringified attributes.
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
    const listener = (event: Event) => {
      const custom = event as CustomEvent<PltVariantChangeDetail>;
      callback.current?.(custom.detail, custom);
    };
    element.addEventListener(VARIANT_CHANGE_EVENT, listener);
    return () => element.removeEventListener(VARIANT_CHANGE_EVENT, listener);
  }, []);

  const fallback =
    children ??
    createElement(
      "div",
      { className: "plt-variant-picker__fallback", "data-plt-fallback": "" },
      createElement("label", { className: "theme-label-bold" },
        fallbackLabel,
        createElement(
          "select",
          { className: "d-select", name, defaultValue: selectedVariantId ?? undefined, disabled },
          variants.map((variant) =>
            createElement(
              "option",
              { key: variant.id, value: variant.id, disabled: !variant.available },
              variant.title ?? variant.options.join(" / "),
            ),
          ),
        ),
      ),
    );

  return createElement(
    "plt-variant-picker",
    {
      ref,
      name,
      // Attributes so the server-rendered HTML carries the initial state.
      "selected-variant-id": selectedVariantId ?? undefined,
      disabled: disabled || undefined,
      className,
      suppressHydrationWarning: true,
    },
    fallback,
  );
}
