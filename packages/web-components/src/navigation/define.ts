import { defineOnce } from "../shared/element.js";
import { PltNavbar } from "./plt-navbar.js";

export function definePltNavbar(registry?: CustomElementRegistry): boolean {
  return defineOnce("plt-navbar", PltNavbar, registry ?? globalThis.customElements);
}

definePltNavbar();

export { PltNavbar };
