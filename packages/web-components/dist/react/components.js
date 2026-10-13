import { createElement as h } from "react";
import { createComponent } from "./create.js";
const PltQuantitySelector = createComponent({
  tag: "plt-quantity-selector",
  load: () => import("../quantity-selector/define.js"),
  properties: ["value", "min", "max", "step", "name", "disabled", "labels"],
  attributes: { value: "value", min: "min", max: "max", step: "step", name: "name", disabled: "disabled" },
  events: { onQuantityChange: "plt:quantity-change" },
  fallback: ({ value = 1, min = 1, max, name = "quantity", labels }) => h("input", {
    "data-plt-fallback": "",
    className: "d-input",
    type: "number",
    name: name || void 0,
    defaultValue: value,
    min,
    max: max ?? void 0,
    "aria-label": labels?.quantity ?? "Quantity"
  })
});
const PltProductGallery = createComponent({
  tag: "plt-product-gallery",
  load: () => import("../product/define.js"),
  properties: ["selectedIndex"],
  attributes: { selectedIndex: "selected-index" },
  events: { onGalleryChange: "plt:gallery-change" }
});
const PltQuickView = createComponent({
  tag: "plt-quick-view",
  load: () => import("../product/define.js"),
  properties: ["open"],
  events: { onOpen: "plt:quick-view-open", onClose: "plt:quick-view-close" }
});
const PltCartLine = createComponent({
  tag: "plt-cart-line",
  load: () => import("../cart/define.js"),
  properties: ["line", "labels", "busy"],
  attributes: { busy: "busy" },
  events: { onLineChange: "plt:cart-line-change", onLineRemove: "plt:cart-line-remove" }
});
const PltCartDrawer = createComponent({
  tag: "plt-cart-drawer",
  load: () => import("../cart/define.js"),
  properties: ["open", "lines", "subtotal", "checkoutUrl", "cartUrl", "busy", "labels"],
  attributes: { checkoutUrl: "checkout-url", cartUrl: "cart-url", busy: "busy" },
  events: {
    onOpen: "plt:cart-drawer-open",
    onClose: "plt:cart-drawer-close",
    onLineChange: "plt:cart-line-change",
    onLineRemove: "plt:cart-line-remove"
  }
});
const PltFilterBar = createComponent({
  tag: "plt-filter-bar",
  load: () => import("../collection/define.js"),
  properties: ["filters", "action", "method", "manual", "labels"],
  attributes: { action: "action", method: "method", manual: "manual" },
  events: { onFilterChange: "plt:filter-change" },
  fallback: ({ filters, action = "", method = "get", labels }) => h(
    "form",
    { "data-plt-fallback": "", className: "plt-filter-bar", action, method },
    ...filters.map(
      (filter) => h(
        "label",
        { key: filter.id, className: "plt-filter-bar__field theme-label-bold" },
        filter.label,
        h(
          "select",
          { className: "d-select", name: filter.id, defaultValue: filter.options.find((o) => o.selected)?.value },
          ...filter.options.map((option) => h("option", { key: option.value, value: option.value }, option.label))
        )
      )
    ),
    h("button", { type: "submit", className: "d-btn d-btn-primary theme-label-bold" }, labels?.apply ?? "Apply")
  )
});
const PltSortSelect = createComponent({
  tag: "plt-sort-select",
  load: () => import("../collection/define.js"),
  properties: ["options", "name", "label", "action", "method", "manual", "applyLabel"],
  attributes: { name: "name", label: "label", action: "action", method: "method", manual: "manual" },
  events: { onSortChange: "plt:sort-change" },
  fallback: ({ options, name = "sort", label = "Sort by", action = "", method = "get", applyLabel = "Apply" }) => h(
    "form",
    { "data-plt-fallback": "", className: "plt-sort-select", action, method },
    h(
      "label",
      { className: "theme-label-bold" },
      label,
      h(
        "select",
        { className: "d-select", name, defaultValue: options.find((o) => o.selected)?.value },
        ...options.map((option) => h("option", { key: option.value, value: option.value }, option.label))
      )
    ),
    h("button", { type: "submit", className: "d-btn d-btn-outline theme-label-bold" }, applyLabel)
  )
});
const PltPagination = createComponent({
  tag: "plt-pagination",
  load: () => import("../collection/define.js"),
  properties: ["pages", "previousUrl", "nextUrl", "labels"],
  attributes: { previousUrl: "previous-url", nextUrl: "next-url" },
  events: { onPageChange: "plt:page-change" },
  fallback: ({ pages, previousUrl, nextUrl, labels }) => h(
    "nav",
    { "data-plt-fallback": "", "aria-label": labels?.nav ?? "Pagination" },
    previousUrl ? h("a", { href: previousUrl }, labels?.previous ?? "Previous") : null,
    ...pages.map(
      (page) => page.url && !page.current ? h("a", { key: page.label, href: page.url }, page.label) : h("span", { key: page.label, "aria-current": page.current ? "page" : void 0 }, page.label)
    ),
    nextUrl ? h("a", { href: nextUrl }, labels?.next ?? "Next") : null
  )
});
const PltNavbar = createComponent({
  tag: "plt-navbar",
  load: () => import("../navigation/define.js"),
  events: { onToggle: "plt:navbar-toggle", onMegaMenuToggle: "plt:megamenu-toggle" }
});
export {
  PltCartDrawer,
  PltCartLine,
  PltFilterBar,
  PltNavbar,
  PltPagination,
  PltProductGallery,
  PltQuantitySelector,
  PltQuickView,
  PltSortSelect
};
