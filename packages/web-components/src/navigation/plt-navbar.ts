import { LitElement, type PropertyValues } from "lit";
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
const IDLE_TIMEOUT_MS = 2000;
const TRIGGER = "[aria-controls][aria-haspopup], [data-plt-megamenu-trigger]";
/** A mega menu panel: the ProductDetail-era class, or the attribute for markup that keeps its own classes. */
const PANEL = ".plt-megamenu, [data-plt-megamenu]";
const DEFERRED = "[data-plt-navbar-deferred]";
const HEIGHT_PROPERTY = "--plt-navbar-height";

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
 * Opt-in capabilities, each switched on by an attribute or by the markup that
 * carries it, so existing consumers are untouched:
 *
 * - `hover-delay="150"`: a hovering pointer opens a panel after this many ms
 *   (and only if it is still on the trigger), so crossing the bar does not
 *   flicker panels. Focus and ArrowDown still open at once.
 * - `[data-plt-megamenu]`: marks a panel the same way `.plt-megamenu` does, for
 *   markup that keeps its own classes. Panels toggle `data-open`.
 * - `publish-height` (or `publish-height="root"`): keeps `--plt-navbar-height`
 *   equal to this element's height, on the element or on `<html>`. The element
 *   must be a block box (a wrapper that is `display: inline` has no height).
 * - `[data-plt-navbar-deferred]`: images carrying `data-deferred-src`,
 *   `data-deferred-srcset` and `data-deferred-sizes` get those attributes
 *   applied on idle (at most 2 s after connect) or at the first hover intent,
 *   focus, panel or mobile menu open, whichever comes first.
 *
 * @fires plt:navbar-toggle - `{ open }`
 * @fires plt:megamenu-toggle - `{ id, open }`
 */
export class PltNavbar extends LitElement {
  static override properties = {
    hoverDelay: { type: Number, attribute: "hover-delay" },
    publishHeight: { type: String, attribute: "publish-height" },
  };

  /** Milliseconds a hover must last before a panel opens; 0 opens at once. */
  declare hoverDelay: number;
  /** Present: publish the height on this element; `"root"`: on `<html>`. */
  declare publishHeight: string | null;

  private _openPanel: HTMLElement | null = null;
  /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
  private _returningFocus = false;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private _openTimer: ReturnType<typeof setTimeout> | null = null;
  private _pendingTrigger: HTMLElement | null = null;
  private _idleHandle: { cancel: () => void } | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _publishedOn: HTMLElement | null = null;
  private readonly _onDocumentClick = (event: MouseEvent) => {
    if (this.isOpen() && !this.contains(event.target as Node)) this.close();
  };

  constructor() {
    super();
    this.hoverDelay = 0;
    this.publishHeight = null;
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
    this._startPublishingHeight();
    if (this.querySelector(DEFERRED)) this._scheduleDeferred();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onDocumentClick);
    this._cancelClose();
    this._cancelOpen();
    this._idleHandle?.cancel();
    this._idleHandle = null;
    this._stopPublishingHeight();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has("publishHeight") && this.isConnected) {
      this._stopPublishingHeight();
      this._startPublishingHeight();
    }
  }

  // --- Opt-in: published height ---------------------------------------------

  private _startPublishingHeight() {
    if (this.publishHeight === null || this.publishHeight === undefined) return;
    this._publishedOn = this.publishHeight === "root" ? document.documentElement : this;
    const publish = () => this._publishedOn?.style.setProperty(HEIGHT_PROPERTY, `${this.getBoundingClientRect().height}px`);
    publish();
    if (typeof ResizeObserver === "function") {
      this._resizeObserver = new ResizeObserver(publish);
      this._resizeObserver.observe(this);
    }
  }

  private _stopPublishingHeight() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._publishedOn?.style.removeProperty(HEIGHT_PROPERTY);
    this._publishedOn = null;
  }

  // --- Opt-in: deferred images -----------------------------------------------

  /** Applies the deferred `src`, `srcset` and `sizes` now. Safe to call repeatedly. */
  activateDeferred() {
    this._idleHandle?.cancel();
    this._idleHandle = null;
    for (const element of this.querySelectorAll<HTMLElement>(DEFERRED)) {
      const { deferredSrc, deferredSrcset, deferredSizes } = element.dataset;
      if (deferredSrcset) element.setAttribute("srcset", deferredSrcset);
      if (deferredSizes) element.setAttribute("sizes", deferredSizes);
      if (deferredSrc) element.setAttribute("src", deferredSrc);
      delete element.dataset.deferredSrc;
      delete element.dataset.deferredSrcset;
      delete element.dataset.deferredSizes;
      element.removeAttribute("data-plt-navbar-deferred");
    }
  }

  private _scheduleDeferred() {
    if (this._idleHandle) return;
    const run = () => {
      this._idleHandle = null;
      this.activateDeferred();
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
      this._idleHandle = { cancel: () => cancelIdleCallback(id) };
    } else {
      const id = setTimeout(run, 200);
      this._idleHandle = { cancel: () => clearTimeout(id) };
    }
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
    if (open) this.activateDeferred();
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
    return panel?.matches(PANEL) ? panel : null;
  }

  private _triggerFor(panel: HTMLElement): HTMLElement | null {
    return [...this.querySelectorAll<HTMLElement>(TRIGGER)].find((t) => t.getAttribute("aria-controls") === panel.id) ?? null;
  }

  /** Opens the mega menu panel with this id (closing any other). */
  openMegaMenu(id: string) {
    const panel = byId(this, id);
    if (panel?.matches(PANEL)) this._show(panel);
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
    this._cancelOpen();
    this.activateDeferred();
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

  private _cancelOpen() {
    if (this._openTimer) clearTimeout(this._openTimer);
    this._openTimer = null;
    this._pendingTrigger = null;
  }

  private _inMegaArea(node: EventTarget | null): boolean {
    const element = node as Element | null;
    if (!element?.closest) return false;
    return Boolean(this._trigger(element) || element.closest(PANEL));
  }

  // --- Delegated listeners ----------------------------------------------------

  private _onClick(event: MouseEvent) {
    const target = event.target as Element | null;
    if (target?.closest?.("[data-plt-navbar-toggle]")) {
      this.isOpen() ? this.close() : this.open();
      return;
    }
    // Following a link inside a panel closes it (client-routed frontends stay on the page).
    if (target?.closest?.(".plt-megamenu a, [data-plt-megamenu] a")) this.closeMegaMenu();
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
      const panel = trigger ? this._panelFor(trigger) : (event.target as Element | null)?.closest?.(PANEL);
      if (!(panel instanceof HTMLElement)) return;
      if (!trigger) {
        if (panel === this._openPanel) this._cancelClose();
        return;
      }
      // Wanting a panel is enough to load its images, even when the panel itself waits.
      this.activateDeferred();
      if (this.hoverDelay > 0 && this._openPanel !== panel) {
        // Moving between the trigger's own children must not restart the wait.
        if (this._openTimer && this._pendingTrigger === trigger) return;
        this._cancelOpen();
        this._pendingTrigger = trigger;
        this._openTimer = setTimeout(() => this._show(panel), this.hoverDelay);
      } else {
        this._show(panel);
      }
    } else {
      // A pending open belongs to one trigger: leaving it (not just moving inside it) drops the open.
      if (this._openTimer && !this._pendingTrigger?.contains(event.relatedTarget as Node | null)) this._cancelOpen();
      if (this._openPanel && !this._inMegaArea(event.relatedTarget)) this._scheduleClose();
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
