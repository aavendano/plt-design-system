/**
 * React adapters for every PLT Web Component, built on `createComponent`.
 * Each is configuration only: which props are DOM properties, which are
 * mirrored as attributes for server HTML, which callbacks map to DOM events,
 * and the no-JS fallback.
 */
import { createElement as h, type ReactNode } from "react";
import { createComponent, type BaseProps } from "./create.js";
import type { PltQuantityChangeDetail, PltQuantitySelectorLabels } from "../quantity-selector/types.js";
import type {
  PltCartLabels,
  PltCartLineChangeDetail,
  PltCartLineData,
  PltCartLineRemoveDetail,
} from "../cart/types.js";
import type {
  PltChoice,
  PltFilter,
  PltFilterBarLabels,
  PltFilterChangeDetail,
  PltPage,
  PltPageChangeDetail,
  PltPaginationLabels,
  PltSortChangeDetail,
} from "../collection/types.js";
import type { PltGalleryChangeDetail } from "../product/plt-product-gallery.js";
import type { PltMegaMenuToggleDetail, PltNavbarToggleDetail } from "../navigation/plt-navbar.js";

type Handler<D> = (detail: D, event: CustomEvent<D>) => void;

// --- Product ----------------------------------------------------------------

export interface PltQuantitySelectorProps extends BaseProps {
  value?: number;
  min?: number;
  max?: number | null;
  step?: number;
  name?: string;
  disabled?: boolean;
  labels?: PltQuantitySelectorLabels;
  onQuantityChange?: Handler<PltQuantityChangeDetail>;
}

export const PltQuantitySelector = createComponent<PltQuantitySelectorProps>({
  tag: "plt-quantity-selector",
  load: () => import("../quantity-selector/define.js"),
  properties: ["value", "min", "max", "step", "name", "disabled", "labels"],
  attributes: { value: "value", min: "min", max: "max", step: "step", name: "name", disabled: "disabled" },
  events: { onQuantityChange: "plt:quantity-change" },
  fallback: ({ value = 1, min = 1, max, name = "quantity", labels }) =>
    h("input", {
      "data-plt-fallback": "",
      className: "d-input",
      type: "number",
      name: name || undefined,
      defaultValue: value,
      min,
      max: max ?? undefined,
      "aria-label": labels?.quantity ?? "Quantity",
    }),
});

export interface PltProductGalleryProps extends BaseProps {
  /** ProductDetail gallery markup (main image + `.plt-product-detail__thumb` buttons). */
  children: ReactNode;
  selectedIndex?: number;
  onGalleryChange?: Handler<PltGalleryChangeDetail>;
}

export const PltProductGallery = createComponent<PltProductGalleryProps>({
  tag: "plt-product-gallery",
  load: () => import("../product/define.js"),
  properties: ["selectedIndex"],
  attributes: { selectedIndex: "selected-index" },
  events: { onGalleryChange: "plt:gallery-change" },
});

export interface PltQuickViewProps extends BaseProps {
  /** ProductQuickView markup: `[data-quick-view-open]`, `<dialog>`, `[data-quick-view-close]`. */
  children: ReactNode;
  open?: boolean;
  onOpen?: Handler<Record<string, never>>;
  onClose?: Handler<Record<string, never>>;
}

export const PltQuickView = createComponent<PltQuickViewProps>({
  tag: "plt-quick-view",
  load: () => import("../product/define.js"),
  properties: ["open"],
  events: { onOpen: "plt:quick-view-open", onClose: "plt:quick-view-close" },
});

// --- Cart -------------------------------------------------------------------

export interface PltCartLineProps extends BaseProps {
  line: PltCartLineData;
  labels?: PltCartLabels;
  busy?: boolean;
  onLineChange?: Handler<PltCartLineChangeDetail>;
  onLineRemove?: Handler<PltCartLineRemoveDetail>;
}

export const PltCartLine = createComponent<PltCartLineProps>({
  tag: "plt-cart-line",
  load: () => import("../cart/define.js"),
  properties: ["line", "labels", "busy"],
  attributes: { busy: "busy" },
  events: { onLineChange: "plt:cart-line-change", onLineRemove: "plt:cart-line-remove" },
});

export interface PltCartDrawerProps extends BaseProps {
  open?: boolean;
  lines: PltCartLineData[];
  subtotal?: string;
  checkoutUrl?: string;
  cartUrl?: string;
  busy?: boolean;
  labels?: PltCartLabels;
  onOpen?: Handler<Record<string, never>>;
  onClose?: Handler<Record<string, never>>;
  onLineChange?: Handler<PltCartLineChangeDetail>;
  onLineRemove?: Handler<PltCartLineRemoveDetail>;
}

export const PltCartDrawer = createComponent<PltCartDrawerProps>({
  tag: "plt-cart-drawer",
  load: () => import("../cart/define.js"),
  properties: ["open", "lines", "subtotal", "checkoutUrl", "cartUrl", "busy", "labels"],
  attributes: { checkoutUrl: "checkout-url", cartUrl: "cart-url", busy: "busy" },
  events: {
    onOpen: "plt:cart-drawer-open",
    onClose: "plt:cart-drawer-close",
    onLineChange: "plt:cart-line-change",
    onLineRemove: "plt:cart-line-remove",
  },
});

// --- Collection ---------------------------------------------------------------

export interface PltFilterBarProps extends BaseProps {
  filters: PltFilter[];
  action?: string;
  method?: string;
  manual?: boolean;
  labels?: PltFilterBarLabels;
  /** Cancel the event (`event.preventDefault()`) to navigate client-side. */
  onFilterChange?: Handler<PltFilterChangeDetail>;
}

export const PltFilterBar = createComponent<PltFilterBarProps>({
  tag: "plt-filter-bar",
  load: () => import("../collection/define.js"),
  properties: ["filters", "action", "method", "manual", "labels"],
  attributes: { action: "action", method: "method", manual: "manual" },
  events: { onFilterChange: "plt:filter-change" },
  fallback: ({ filters, action = "", method = "get", labels }) =>
    h(
      "form",
      { "data-plt-fallback": "", className: "plt-filter-bar", action, method },
      ...filters.map((filter) =>
        h(
          "label",
          { key: filter.id, className: "plt-filter-bar__field theme-label-bold" },
          filter.label,
          h(
            "select",
            { className: "d-select", name: filter.id, defaultValue: filter.options.find((o) => o.selected)?.value },
            ...filter.options.map((option) => h("option", { key: option.value, value: option.value }, option.label)),
          ),
        ),
      ),
      h("button", { type: "submit", className: "d-btn d-btn-primary theme-label-bold" }, labels?.apply ?? "Apply"),
    ),
});

export interface PltSortSelectProps extends BaseProps {
  options: PltChoice[];
  name?: string;
  label?: string;
  action?: string;
  method?: string;
  manual?: boolean;
  applyLabel?: string;
  /** Cancel the event (`event.preventDefault()`) to navigate client-side. */
  onSortChange?: Handler<PltSortChangeDetail>;
}

export const PltSortSelect = createComponent<PltSortSelectProps>({
  tag: "plt-sort-select",
  load: () => import("../collection/define.js"),
  properties: ["options", "name", "label", "action", "method", "manual", "applyLabel"],
  attributes: { name: "name", label: "label", action: "action", method: "method", manual: "manual" },
  events: { onSortChange: "plt:sort-change" },
  fallback: ({ options, name = "sort", label = "Sort by", action = "", method = "get", applyLabel = "Apply" }) =>
    h(
      "form",
      { "data-plt-fallback": "", className: "plt-sort-select", action, method },
      h(
        "label",
        { className: "theme-label-bold" },
        label,
        h(
          "select",
          { className: "d-select", name, defaultValue: options.find((o) => o.selected)?.value },
          ...options.map((option) => h("option", { key: option.value, value: option.value }, option.label)),
        ),
      ),
      h("button", { type: "submit", className: "d-btn d-btn-outline theme-label-bold" }, applyLabel),
    ),
});

export interface PltPaginationProps extends BaseProps {
  pages: PltPage[];
  previousUrl?: string;
  nextUrl?: string;
  labels?: PltPaginationLabels;
  /** Cancel the event (`event.preventDefault()`) to navigate client-side. */
  onPageChange?: Handler<PltPageChangeDetail>;
}

export const PltPagination = createComponent<PltPaginationProps>({
  tag: "plt-pagination",
  load: () => import("../collection/define.js"),
  properties: ["pages", "previousUrl", "nextUrl", "labels"],
  attributes: { previousUrl: "previous-url", nextUrl: "next-url" },
  events: { onPageChange: "plt:page-change" },
  fallback: ({ pages, previousUrl, nextUrl, labels }) =>
    h(
      "nav",
      { "data-plt-fallback": "", "aria-label": labels?.nav ?? "Pagination" },
      previousUrl ? h("a", { href: previousUrl }, labels?.previous ?? "Previous") : null,
      ...pages.map((page) =>
        page.url && !page.current
          ? h("a", { key: page.label, href: page.url }, page.label)
          : h("span", { key: page.label, "aria-current": page.current ? "page" : undefined }, page.label),
      ),
      nextUrl ? h("a", { href: nextUrl }, labels?.next ?? "Next") : null,
    ),
});

// --- Navigation ---------------------------------------------------------------

export interface PltNavbarProps extends BaseProps {
  /** Navbar markup (toggle, mobile panel, mega menu triggers and panels). */
  children: ReactNode;
  onToggle?: Handler<PltNavbarToggleDetail>;
  onMegaMenuToggle?: Handler<PltMegaMenuToggleDetail>;
}

export const PltNavbar = createComponent<PltNavbarProps>({
  tag: "plt-navbar",
  load: () => import("../navigation/define.js"),
  events: { onToggle: "plt:navbar-toggle", onMegaMenuToggle: "plt:megamenu-toggle" },
});
