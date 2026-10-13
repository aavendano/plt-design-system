const CART_LINE_CHANGE_EVENT = "plt:cart-line-change";
const CART_LINE_REMOVE_EVENT = "plt:cart-line-remove";
const CART_DRAWER_OPEN_EVENT = "plt:cart-drawer-open";
const CART_DRAWER_CLOSE_EVENT = "plt:cart-drawer-close";
const DEFAULT_CART_LABELS = {
  title: "Cart",
  close: "Close cart",
  checkout: "Checkout",
  viewCart: "View cart",
  empty: "Your cart is empty.",
  subtotal: "Subtotal",
  remove: "Remove",
  decrease: "Decrease quantity",
  increase: "Increase quantity",
  quantity: "Quantity"
};
export {
  CART_DRAWER_CLOSE_EVENT,
  CART_DRAWER_OPEN_EVENT,
  CART_LINE_CHANGE_EVENT,
  CART_LINE_REMOVE_EVENT,
  DEFAULT_CART_LABELS
};
