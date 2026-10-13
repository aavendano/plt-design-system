import { LitElement } from "lit";
import { byId, emit } from "../shared/element.js";

export interface PltNavbarToggleDetail {
  open: boolean;
}

export interface PltMegaMenuToggleDetail {
  id: string;
  open: boolean;
}

export const NAVBAR_TOGGLE_EVENT = "plt:navbar-toggle";
export const MEGAMENU_TOGGLE_EVENT = "plt:megamenu-toggle";

const CLOSE_DELAY_MS = 150;
const TRIGGER = "[aria-controls][aria-haspopup], [data-plt-megamenu-trigger]";

/**
 * `<plt-navbar>` — behaviour for the Navbar and MegaMenu anatomy.
 *
 * Mobile menu (contract unchanged from the former vanilla element):
 * `[data-plt-navbar-toggle]` with `aria-controls` toggles the panel
 * (`aria-expanded`, `data-open`, `hidden`); Escape closes and returns focus;
 * a click outside closes.
 *
 * Mega menu (previously left to each platform): a trigger — the top-level
 * link with `aria-haspopup` + `aria-controls`, or `[data-plt-megamenu-trigger]`
 * — opens the `.plt-megamenu` panel it controls on hover or focus; ArrowDown
 * moves into the panel; leaving the trigger and the panel closes it after a
 * short delay; Escape closes it and returns focus to the trigger; one panel is
 * open at a time. The element renders nothing: it works on server markup from
 * any renderer, and listeners are delegated so re-rendered children keep working.
 *
 * @fires plt:navbar-toggle - `{ open }`
 * @fires plt:megamenu-toggle - `{ id, open }`
 */
export class PltNavbar extends LitElement {
  private _openPanel: HTMLElement | null = null;
  /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
  private _returningFocus = false;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _onDocumentClick = (event: MouseEvent) => {
    if (this.isOpen() && !this.contains(event.target as Node)) this.close();
  };

  constructor() {
    super();
    this.addEventListener("click", (event) => this._onClick(event));
    this.addEventListener("keydown", (event) => this._onKeydown(event));
    this.addEventListener("pointerover", (event) => this._onPointer(event, true));
    this.addEventListener("pointerout", (event) => this._onPointer(event, false));
    this.addEventListener("focusin", (event) => this._onFocusIn(event));
    this.addEventListener("focusout", (event) => this._onFocusOut(event));
  }

  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onDocumentClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onDocumentClick);
    this._cancelClose();
  }

  // --- Mobile menu (former vanilla contract) -------------------------------

  get toggle(): HTMLElement | null {
    return this.querySelector("[data-plt-navbar-toggle]");
  }

  get panel(): HTMLElement | null {
    return byId(this, this.toggle?.getAttribute("aria-controls"));
  }

  isOpen(): boolean {
    return this.toggle?.getAttribute("aria-expanded") === "true";
  }

  open() {
    this._setMobile(true);
  }

  close() {
    this._setMobile(false);
  }

  private _setMobile(open: boolean) {
    const toggle = this.toggle;
    const panel = this.panel;
    if (!toggle || !panel || this.isOpen() === open) return;
    toggle.setAttribute("aria-expanded", String(open));
    panel.dataset.open = String(open);
    panel.hidden = !open;
    emit<PltNavbarToggleDetail>(this, NAVBAR_TOGGLE_EVENT, { open });
  }

  // --- Mega menu ------------------------------------------------------------

  private _trigger(node: EventTarget | null): HTMLElement | null {
    const element = (node as Element | null)?.closest?.(TRIGGER) as HTMLElement | null;
    if (!element || !this.contains(element) || element.hasAttribute("data-plt-navbar-toggle")) return null;
    return this._panelFor(element) ? element : null;
  }

  private _panelFor(trigger: Element): HTMLElement | null {
    const panel = byId(this, trigger.getAttribute("aria-controls"));
    return panel?.classList.contains("plt-megamenu") ? panel : null;
  }

  private _triggerFor(panel: HTMLElement): HTMLElement | null {
    return [...this.querySelectorAll<HTMLElement>(TRIGGER)].find((t) => t.getAttribute("aria-controls") === panel.id) ?? null;
  }

  /** Opens the mega menu panel with this id (closing any other). */
  openMegaMenu(id: string) {
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
    emit<PltMegaMenuToggleDetail>(this, MEGAMENU_TOGGLE_EVENT, { id: panel.id, open: false });
  }

  private _show(panel: HTMLElement) {
    this._cancelClose();
    if (this._openPanel === panel) return;
    this.closeMegaMenu();
    this._openPanel = panel;
    panel.dataset.open = "true";
    this._triggerFor(panel)?.setAttribute("aria-expanded", "true");
    emit<PltMegaMenuToggleDetail>(this, MEGAMENU_TOGGLE_EVENT, { id: panel.id, open: true });
  }

  private _scheduleClose() {
    this._cancelClose();
    this._closeTimer = setTimeout(() => this.closeMegaMenu(), CLOSE_DELAY_MS);
  }

  private _cancelClose() {
    if (this._closeTimer) clearTimeout(this._closeTimer);
    this._closeTimer = null;
  }

  private _inMegaArea(node: EventTarget | null): boolean {
    const element = node as Element | null;
    if (!element?.closest) return false;
    return Boolean(this._trigger(element) || element.closest(".plt-megamenu"));
  }

  // --- Delegated listeners ----------------------------------------------------

  private _onClick(event: MouseEvent) {
    const target = event.target as Element | null;
    if (target?.closest?.("[data-plt-navbar-toggle]")) {
      this.isOpen() ? this.close() : this.open();
      return;
    }
    // Following a link inside a panel closes it (client-routed frontends stay on the page).
    if (target?.closest?.(".plt-megamenu a")) this.closeMegaMenu();
  }

  private _onKeydown(event: KeyboardEvent) {
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
      const first = panel?.querySelector<HTMLElement>("a, button");
      if (!panel || !first) return;
      event.preventDefault();
      this._show(panel);
      first.focus();
    }
  }

  private _onPointer(event: PointerEvent, entering: boolean) {
    if (event.pointerType === "touch") return;
    if (entering) {
      const trigger = this._trigger(event.target);
      const panel = trigger ? this._panelFor(trigger) : (event.target as Element | null)?.closest?.(".plt-megamenu");
      if (panel instanceof HTMLElement) {
        if (trigger) this._show(panel);
        else if (panel === this._openPanel) this._cancelClose();
      }
    } else if (this._openPanel && !this._inMegaArea(event.relatedTarget)) {
      this._scheduleClose();
    }
  }

  private _onFocusIn(event: FocusEvent) {
    if (this._returningFocus) return;
    const trigger = this._trigger(event.target);
    const panel = trigger && this._panelFor(trigger);
    if (panel) this._show(panel);
    else if (this._openPanel?.contains(event.target as Node)) this._cancelClose();
  }

  private _onFocusOut(event: FocusEvent) {
    if (!this._openPanel) return;
    const next = event.relatedTarget as Node | null;
    const panel = this._openPanel;
    const trigger = this._triggerFor(panel);
    if (next && (panel.contains(next) || trigger?.contains(next))) return;
    this.closeMegaMenu();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "plt-navbar": PltNavbar;
  }
}
