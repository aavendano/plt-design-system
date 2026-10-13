/**
 * React adapter for `<plt-variant-picker>` (React 18 and 19), built on the
 * generic `createComponent` bridge. It does not re-implement the picker.
 */
import { createElement as h, type ReactNode } from "react";
import { createComponent, type BaseProps } from "./create.js";
import type {
  PltProductOption,
  PltVariant,
  PltVariantChangeDetail,
  PltVariantPickerLabels,
} from "../variant-picker/types.js";

export interface PltVariantPickerProps extends BaseProps {
  options: PltProductOption[];
  variants: PltVariant[];
  selectedVariantId?: string | null;
  /** Form field name of the variant id (default `id`). */
  name?: string;
  labels?: PltVariantPickerLabels;
  disabled?: boolean;
  /** Label of the no-JavaScript `<select>` fallback. */
  fallbackLabel?: string;
  onVariantChange?: (detail: PltVariantChangeDetail, event: CustomEvent<PltVariantChangeDetail>) => void;
  /** Replaces the default no-JavaScript fallback. Mark it `data-plt-fallback`. */
  children?: ReactNode;
}

export const PltVariantPicker = createComponent<PltVariantPickerProps>({
  tag: "plt-variant-picker",
  load: () => import("../variant-picker/define.js"),
  properties: ["options", "variants", "labels", "selectedVariantId", "disabled", "name"],
  attributes: { name: "name", selectedVariantId: "selected-variant-id", disabled: "disabled" },
  events: { onVariantChange: "plt:variant-change" },
  fallback: ({ variants, selectedVariantId, name = "id", disabled, fallbackLabel = "Variant" }) =>
    h(
      "div",
      { className: "plt-variant-picker__fallback", "data-plt-fallback": "" },
      h(
        "label",
        { className: "theme-label-bold" },
        fallbackLabel,
        h(
          "select",
          { className: "d-select", name, defaultValue: selectedVariantId ?? undefined, disabled },
          variants.map((variant) =>
            h("option", { key: variant.id, value: variant.id, disabled: !variant.available }, variant.title ?? variant.options.join(" / ")),
          ),
        ),
      ),
    ),
});
