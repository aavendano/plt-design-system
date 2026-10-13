import { LitElement } from "lit";
import { byId, emit } from "../shared/element.js";
const NAVBAR_TOGGLE_EVENT = "plt:navbar-toggle";
const MEGAMENU_TOGGLE_EVENT = "plt:megamenu-toggle";
const CLOSE_DELAY_MS = 150;
const TRIGGER = "[aria-controls][aria-haspopup], [data-plt-megamenu-trigger]";
class PltNavbar extends LitElement {
  constructor() {
    super();
    this._openPanel = null;
    /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
    this._returningFocus = false;
    this._closeTimer = null;
    this._onDocumentClick = (event) => {
      if (this.isOpen() && !this.contains(event.target)) this.close();
    };
    this.addEventListener("click", (event) => this._onClick(event));
    this.addEventListener("keydown", (event) => this._onKeydown(event));
    this.addEventListener("pointerover", (event) => this._onPointer(event, true));
    this.addEventListener("pointerout", (event) => this._onPointer(event, false));
    this.addEventListener("focusin", (event) => this._onFocusIn(event));
    this.addEventListener("focusout", (event) => this._onFocusOut(event));
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onDocumentClick);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onDocumentClick);
    this._cancelClose();
  }
  // --- Mobile menu (former vanilla contract) -------------------------------
  get toggle() {
    return this.querySelector("[data-plt-navbar-toggle]");
  }
  get panel() {
    return byId(this, this.toggle?.getAttribute("aria-controls"));
  }
  isOpen() {
    return this.toggle?.getAttribute("aria-expanded") === "true";
  }
  open() {
    this._setMobile(true);
  }
  close() {
    this._setMobile(false);
  }
  _setMobile(open) {
    const toggle = this.toggle;
    const panel = this.panel;
    if (!toggle || !panel || this.isOpen() === open) return;
    toggle.setAttribute("aria-expanded", String(open));
    panel.dataset.open = String(open);
    panel.hidden = !open;
    emit(this, NAVBAR_TOGGLE_EVENT, { open });
  }
  // --- Mega menu ------------------------------------------------------------
  _trigger(node) {
    const element = node?.closest?.(TRIGGER);
    if (!element || !this.contains(element) || element.hasAttribute("data-plt-navbar-toggle")) return null;
    return this._panelFor(element) ? element : null;
  }
  _panelFor(trigger) {
    const panel = byId(this, trigger.getAttribute("aria-controls"));
    return panel?.classList.contains("plt-megamenu") ? panel : null;
  }
  _triggerFor(panel) {
    return [...this.querySelectorAll(TRIGGER)].find((t) => t.getAttribute("aria-controls") === panel.id) ?? null;
  }
  /** Opens the mega menu panel with this id (closing any other). */
  openMegaMenu(id) {
    const panel = byId(this, id);
    if (panel?.classList.contains("plt-megamenu")) this._show(panel);
  }
  /** Closes the open mega menu panel, if any. */
  closeMegaMenu() {
    this._cancelClose();
    const panel = this._openPanel;
    if (!panel) return;
    this._openPanel = null;
    panel.dataset.open = "false";
    this._triggerFor(panel)?.setAttribute("aria-expanded", "false");
    emit(this, MEGAMENU_TOGGLE_EVENT, { id: panel.id, open: false });
  }
  _show(panel) {
    this._cancelClose();
    if (this._openPanel === panel) return;
    this.closeMegaMenu();
    this._openPanel = panel;
    panel.dataset.open = "true";
    this._triggerFor(panel)?.setAttribute("aria-expanded", "true");
    emit(this, MEGAMENU_TOGGLE_EVENT, { id: panel.id, open: true });
  }
  _scheduleClose() {
    this._cancelClose();
    this._closeTimer = setTimeout(() => this.closeMegaMenu(), CLOSE_DELAY_MS);
  }
  _cancelClose() {
    if (this._closeTimer) clearTimeout(this._closeTimer);
    this._closeTimer = null;
  }
  _inMegaArea(node) {
    const element = node;
    if (!element?.closest) return false;
    return Boolean(this._trigger(element) || element.closest(".plt-megamenu"));
  }
  // --- Delegated listeners ----------------------------------------------------
  _onClick(event) {
    const target = event.target;
    if (target?.closest?.("[data-plt-navbar-toggle]")) {
      this.isOpen() ? this.close() : this.open();
      return;
    }
    if (target?.closest?.(".plt-megamenu a")) this.closeMegaMenu();
  }
  _onKeydown(event) {
    if (event.key === "Escape") {
      if (this._openPanel) {
        const panel = this._openPanel;
        const trigger = this._triggerFor(panel);
        const focusWasInside = panel.contains(document.activeElement);
        this.closeMegaMenu();
        if (focusWasInside && trigger) {
          this._returningFocus = true;
          trigger.focus();
          this._returningFocus = false;
        }
        return;
      }
      if (this.isOpen()) {
        this.close();
        this.toggle?.focus();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      const trigger = this._trigger(event.target);
      const panel = trigger && this._panelFor(trigger);
      const first = panel?.querySelector("a, button");
      if (!panel || !first) return;
      event.preventDefault();
      this._show(panel);
      first.focus();
    }
  }
  _onPointer(event, entering) {
    if (event.pointerType === "touch") return;
    if (entering) {
      const trigger = this._trigger(event.target);
      const panel = trigger ? this._panelFor(trigger) : event.target?.closest?.(".plt-megamenu");
      if (panel instanceof HTMLElement) {
        if (trigger) this._show(panel);
        else if (panel === this._openPanel) this._cancelClose();
      }
    } else if (this._openPanel && !this._inMegaArea(event.relatedTarget)) {
      this._scheduleClose();
    }
  }
  _onFocusIn(event) {
    if (this._returningFocus) return;
    const trigger = this._trigger(event.target);
    const panel = trigger && this._panelFor(trigger);
    if (panel) this._show(panel);
    else if (this._openPanel?.contains(event.target)) this._cancelClose();
  }
  _onFocusOut(event) {
    if (!this._openPanel) return;
    const next = event.relatedTarget;
    const panel = this._openPanel;
    const trigger = this._triggerFor(panel);
    if (next && (panel.contains(next) || trigger?.contains(next))) return;
    this.closeMegaMenu();
  }
}
export {
  MEGAMENU_TOGGLE_EVENT,
  NAVBAR_TOGGLE_EVENT,
  PltNavbar
};
