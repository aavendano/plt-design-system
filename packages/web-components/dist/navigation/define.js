import { defineOnce } from "../shared/element.js";
import { PltNavbar } from "./plt-navbar.js";
function definePltNavbar(registry) {
  return defineOnce("plt-navbar", PltNavbar, registry ?? globalThis.customElements);
}
definePltNavbar();
export {
  PltNavbar,
  definePltNavbar
};
