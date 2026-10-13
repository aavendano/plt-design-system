import { LitElement, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { emit, jsonConverter, lockScroll, nextId } from "../shared/element.js";
import {
  CART_DRAWER_CLOSE_EVENT,
  CART_DRAWER_OPEN_EVENT,
  DEFAULT_CART_LABELS
} from "./types.js";
class PltCartDrawer extends LitElement {
  constructor() {
    super();
    this._titleId = nextId("plt-cart-drawer-title");
    this._release = null;
    this._previousFocus = null;
    this.open = false;
    this.lines = [];
    this.subtotal = "";
    this.checkoutUrl = "";
    this.cartUrl = "";
    this.busy = false;
    this.labels = {};
  }
  createRenderRoot() {
    return this;
  }
  get dialog() {
    return this.querySelector(":scope > dialog");
  }
  /** Total quantity across lines. */
  get count() {
    return (this.lines ?? []).reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  }
  show() {
    this.open = true;
  }
  hide() {
    this.open = false;
  }
  toggle() {
    this.open = !this.open;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._release?.();
    this._release = null;
  }
  updated(changed) {
    if (!changed.has("open")) return;
    const dialog = this.dialog;
    if (!dialog || !this.isConnected) return;
    if (this.open && !dialog.open) {
      this._previousFocus = document.activeElement;
      this._release = lockScroll();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      emit(this, CART_DRAWER_OPEN_EVENT, {});
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }
  _onClose() {
    this._release?.();
    this._release = null;
    if (this.open) this.open = false;
    const previous = this._previousFocus;
    this._previousFocus = null;
    if (previous && typeof previous.focus === "function") previous.focus();
    emit(this, CART_DRAWER_CLOSE_EVENT, {});
  }
  _onDialogClick(event) {
    if (event.target === event.currentTarget) this.hide();
  }
  render() {
    const labels = { ...DEFAULT_CART_LABELS, ...this.labels ?? {} };
    const lines = this.lines ?? [];
    return html`<dialog
      class="plt-cart-drawer__dialog"
      aria-labelledby=${this._titleId}
      @close=${() => this._onClose()}
      @click=${(event) => this._onDialogClick(event)}
    >
      <div class="plt-cart-drawer__panel">
        <header class="plt-cart-drawer__header">
          <h2 id=${this._titleId} class="theme-headline-sm">${labels.title}</h2>
          <button type="button" class="d-btn d-btn-ghost d-btn-sm d-btn-square" aria-label=${labels.close} @click=${() => this.hide()}>
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="plt-cart-drawer__body" aria-busy=${this.busy ? "true" : "false"}>
          ${lines.length ? html`<ul class="plt-cart-lines">
                ${repeat(
      lines,
      (line) => line.id,
      (line) => html`<li><plt-cart-line .line=${line} .labels=${labels} ?busy=${this.busy}></plt-cart-line></li>`
    )}
              </ul>` : html`<div class="plt-cart-drawer__empty"><p class="theme-body-lg">${labels.empty}</p></div>`}
        </div>
        ${lines.length ? html`<footer class="plt-cart-drawer__footer">
              ${this.subtotal ? html`<div class="plt-cart-drawer__subtotal theme-label-bold">
                    <span>${labels.subtotal}</span><span>${this.subtotal}</span>
                  </div>` : nothing}
              ${this.checkoutUrl ? html`<a class="d-btn d-btn-primary d-btn-block theme-bordered theme-elevated theme-label-bold" href=${this.checkoutUrl} aria-disabled=${this.busy ? "true" : "false"}>${labels.checkout}</a>` : nothing}
              ${this.cartUrl ? html`<a class="d-btn d-btn-ghost d-btn-block theme-label-bold" href=${this.cartUrl}>${labels.viewCart}</a>` : nothing}
            </footer>` : nothing}
      </div>
    </dialog>`;
  }
}
PltCartDrawer.properties = {
  open: { type: Boolean, reflect: true },
  lines: { type: Array, converter: jsonConverter("plt-cart-drawer", () => []) },
  subtotal: { type: String },
  checkoutUrl: { type: String, attribute: "checkout-url" },
  cartUrl: { type: String, attribute: "cart-url" },
  busy: { type: Boolean, reflect: true },
  labels: { type: Object, converter: jsonConverter("plt-cart-drawer", () => ({})) }
};
export {
  PltCartDrawer
};
