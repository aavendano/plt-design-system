import { LitElement, html, nothing, type PropertyValues } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { emit, jsonConverter, lockScroll, nextId } from "../shared/element.js";
import {
  CART_DRAWER_CLOSE_EVENT,
  CART_DRAWER_OPEN_EVENT,
  DEFAULT_CART_LABELS,
  type PltCartLabels,
  type PltCartLineData,
} from "./types.js";

/**
 * `<plt-cart-drawer>` — side-sheet cart built on a modal `<dialog>`
 * (focus moves in and is contained, Escape closes, focus returns, page
 * scroll is locked). Renders one `<plt-cart-line>` per line; their events
 * bubble through it unchanged.
 *
 * The consumer owns the cart: it sets `lines`, `subtotal` and the URLs, and
 * updates them after each mutation (setting `busy` while one is in flight).
 * When a mutation fails it sets `error` to the message to show (already
 * translated); the message sits in a live region, so assistive technology
 * announces it, and clearing `error` removes it.
 *
 * @fires plt:cart-drawer-open
 * @fires plt:cart-drawer-close
 */
export class PltCartDrawer extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
    lines: { type: Array, converter: jsonConverter("plt-cart-drawer", () => []) },
    subtotal: { type: String },
    checkoutUrl: { type: String, attribute: "checkout-url" },
    cartUrl: { type: String, attribute: "cart-url" },
    busy: { type: Boolean, reflect: true },
    error: { type: String },
    labels: { type: Object, converter: jsonConverter("plt-cart-drawer", () => ({})) },
  };

  declare open: boolean;
  declare lines: PltCartLineData[];
  declare subtotal: string;
  declare checkoutUrl: string;
  declare cartUrl: string;
  declare busy: boolean;
  declare error: string;
  declare labels: PltCartLabels;

  private readonly _titleId = nextId("plt-cart-drawer-title");
  private _release: (() => void) | null = null;
  private _previousFocus: Element | null = null;

  constructor() {
    super();
    this.open = false;
    this.lines = [];
    this.subtotal = "";
    this.checkoutUrl = "";
    this.cartUrl = "";
    this.busy = false;
    this.error = "";
    this.labels = {};
  }

  protected override createRenderRoot() {
    return this;
  }

  get dialog(): HTMLDialogElement | null {
    return this.querySelector(":scope > dialog");
  }

  /** Total quantity across lines. */
  get count(): number {
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

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._release?.();
    this._release = null;
  }

  protected override updated(changed: PropertyValues<this>) {
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

  private _onClose() {
    this._release?.();
    this._release = null;
    if (this.open) this.open = false;
    const previous = this._previousFocus as HTMLElement | null;
    this._previousFocus = null;
    if (previous && typeof previous.focus === "function") previous.focus();
    emit(this, CART_DRAWER_CLOSE_EVENT, {});
  }

  private _onDialogClick(event: MouseEvent) {
    // A click on the dialog element itself is a click on its backdrop.
    if (event.target === event.currentTarget) this.hide();
  }

  protected override render() {
    const labels = { ...DEFAULT_CART_LABELS, ...(this.labels ?? {}) };
    const lines = this.lines ?? [];
    return html`<dialog
      class="plt-cart-drawer__dialog"
      aria-labelledby=${this._titleId}
      @close=${() => this._onClose()}
      @click=${(event: MouseEvent) => this._onDialogClick(event)}
    >
      <div class="plt-cart-drawer__panel">
        <header class="plt-cart-drawer__header">
          <h2 id=${this._titleId} class="theme-headline-sm">${labels.title}</h2>
          <button type="button" class="d-btn d-btn-ghost d-btn-sm d-btn-square" aria-label=${labels.close} @click=${() => this.hide()}>
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="plt-cart-drawer__error theme-label-bold" role="alert" ?data-empty=${!this.error}>${this.error}</div>
        <div class="plt-cart-drawer__body" aria-busy=${this.busy ? "true" : "false"}>
          ${lines.length
            ? html`<ul class="plt-cart-lines">
                ${repeat(
                  lines,
                  (line) => line.id,
                  (line) => html`<li><plt-cart-line .line=${line} .labels=${labels} ?busy=${this.busy}></plt-cart-line></li>`,
                )}
              </ul>`
            : html`<div class="plt-cart-drawer__empty"><p class="theme-body-lg">${labels.empty}</p></div>`}
        </div>
        ${lines.length
          ? html`<footer class="plt-cart-drawer__footer">
              ${this.subtotal
                ? html`<div class="plt-cart-drawer__subtotal theme-label-bold">
                    <span>${labels.subtotal}</span><span>${this.subtotal}</span>
                  </div>`
                : nothing}
              ${this.checkoutUrl
                ? html`<a class="d-btn d-btn-primary d-btn-block theme-bordered theme-elevated theme-label-bold" href=${this.checkoutUrl} aria-disabled=${this.busy ? "true" : "false"}>${labels.checkout}</a>`
                : nothing}
              ${this.cartUrl
                ? html`<a class="d-btn d-btn-ghost d-btn-block theme-label-bold" href=${this.cartUrl}>${labels.viewCart}</a>`
                : nothing}
            </footer>`
          : nothing}
      </div>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "plt-cart-drawer": PltCartDrawer;
  }
}
