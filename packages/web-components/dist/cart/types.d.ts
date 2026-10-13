/**
 * Cart contracts. Prices are display strings formatted by the consumer: the
 * components never compute money, and the consumer owns every cart mutation.
 */
export interface PltCartLineData {
    /** Cart line id (Shopify line GID or Liquid `item.key`). */
    id: string;
    title: string;
    url?: string | null;
    imageUrl?: string | null;
    imageAlt?: string | null;
    /** Variant title; omit for default variants. */
    variantTitle?: string | null;
    quantity: number;
    /** Formatted line price, e.g. "$38.00". */
    price: string;
    /** Formatted compare-at line price, shown struck through when set. */
    compareAtPrice?: string | null;
    /** Upper bound for the quantity control (inventory or a purchase limit). */
    maxQuantity?: number | null;
}
export interface PltCartLabels {
    title?: string;
    close?: string;
    checkout?: string;
    viewCart?: string;
    empty?: string;
    subtotal?: string;
    remove?: string;
    decrease?: string;
    increase?: string;
    quantity?: string;
}
export interface PltCartLineChangeDetail {
    lineId: string;
    quantity: number;
    previousQuantity: number;
}
export interface PltCartLineRemoveDetail {
    lineId: string;
}
export declare const CART_LINE_CHANGE_EVENT = "plt:cart-line-change";
export declare const CART_LINE_REMOVE_EVENT = "plt:cart-line-remove";
export declare const CART_DRAWER_OPEN_EVENT = "plt:cart-drawer-open";
export declare const CART_DRAWER_CLOSE_EVENT = "plt:cart-drawer-close";
export declare const DEFAULT_CART_LABELS: Required<PltCartLabels>;
