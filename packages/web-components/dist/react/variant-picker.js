import { createElement as h } from "react";
import { createComponent } from "./create.js";
const PltVariantPicker = createComponent({
  tag: "plt-variant-picker",
  load: () => import("../variant-picker/define.js"),
  properties: ["options", "variants", "labels", "selectedVariantId", "disabled", "name"],
  attributes: { name: "name", selectedVariantId: "selected-variant-id", disabled: "disabled" },
  events: { onVariantChange: "plt:variant-change" },
  fallback: ({ variants, selectedVariantId, name = "id", disabled, fallbackLabel = "Variant" }) => h(
    "div",
    { className: "plt-variant-picker__fallback", "data-plt-fallback": "" },
    h(
      "label",
      { className: "theme-label-bold" },
      fallbackLabel,
      h(
        "select",
        { className: "d-select", name, defaultValue: selectedVariantId ?? void 0, disabled },
        variants.map(
          (variant) => h("option", { key: variant.id, value: variant.id, disabled: !variant.available }, variant.title ?? variant.options.join(" / "))
        )
      )
    )
  )
});
export {
  PltVariantPicker
};
