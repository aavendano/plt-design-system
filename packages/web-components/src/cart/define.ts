import { defineOnce } from "../shared/element.js";
import "../quantity-selector/define.js";
import { PltCartLine } from "./plt-cart-line.js";
import { PltCartDrawer } from "./plt-cart-drawer.js";

export function definePltCart(registry?: CustomElementRegistry): boolean {
  const target = registry ?? globalThis.customElements;
  return defineOnce("plt-cart-line", PltCartLine, target) && defineOnce("plt-cart-drawer", PltCartDrawer, target);
}

definePltCart();

export { PltCartDrawer, PltCartLine };
