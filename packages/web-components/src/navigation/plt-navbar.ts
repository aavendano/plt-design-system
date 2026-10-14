import { LitElement, type PropertyValues } from "lit";
import { byId, emit } from "../shared/element.js";

export interface PltNavbarToggleDetail {
  open: boolean;
}

export interface PltMegaMenuToggleDetail {
  id: string;
  open: boolean;
}

export interface PltNavbarOverflowDetail {
  /** Ids (`data-plt-navbar-item` values) of the links that left the bar, in order. */
  hidden: string[];
}

export const NAVBAR_TOGGLE_EVENT = "plt:navbar-toggle";
export const MEGAMENU_TOGGLE_EVENT = "plt:megamenu-toggle";
export const NAVBAR_OVERFLOW_EVENT = "plt:navbar-overflow";

const CLOSE_DELAY_MS = 150;
const IDLE_TIMEOUT_MS = 2000;
const TRIGGER = "[aria-controls][aria-haspopup], [data-plt-megamenu-trigger]";
/** A mega menu panel: the ProductDetail-era class, or the attribute for markup that keeps its own classes. */
const PANEL = ".plt-megamenu, [data-plt-megamenu]";
const DEFERRED = "[data-plt-navbar-deferred]";
const HEIGHT_PROPERTY = "--plt-navbar-height";
const OVERFLOW = "[data-plt-navbar-overflow]";
const ITEM = "[data-plt-navbar-item]";
const MORE = "[data-plt-navbar-more]";
const MORE_TOGGLE = "[data-plt-navbar-more-toggle]";
const MORE_LIST = "[data-plt-navbar-more-list]";
const MORE_ENTRY = "[data-plt-navbar-more-for]";

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
 * - Overflow ("More"): the links in `[data-plt-navbar-overflow]` that do not fit
 *   leave the bar, last first, so the order is kept, and the `[data-plt-navbar-more]`
 *   item appears with an entry for each of them (`[data-plt-navbar-more-for]`),
 *   plain links as well as links that open a panel. `overflow-min="2"` keeps at
 *   least that many in the bar. The container's width must not depend on its
 *   items (a flex child with `min-width: 0`, say). Without JavaScript nothing is
 *   hidden; let the bar scroll instead.
 *
 * @fires plt:navbar-toggle - `{ open }`
 * @fires plt:megamenu-toggle - `{ id, open }`
 * @fires plt:navbar-overflow - `{ hidden }`, when the set of links in "More" changes
 */
export class PltNavbar extends LitElement {
  static override properties = {
    hoverDelay: { type: Number, attribute: "hover-delay" },
    publishHeight: { type: String, attribute: "publish-height" },
    overflowMin: { type: Number, attribute: "overflow-min" },
  };

  /** Milliseconds a hover must last before a panel opens; 0 opens at once. */
  declare hoverDelay: number;
  /** Present: publish the height on this element; `"root"`: on `<html>`. */
  declare publishHeight: string | null;
  /** Links that always stay in the bar, however narrow it is. */
  declare overflowMin: number;

  private _openPanel: HTMLElement | null = null;
  /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
  private _returningFocus = false;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private _openTimer: ReturnType<typeof setTimeout> | null = null;
  private _pendingTrigger: HTMLElement | null = null;
  private _idleHandle: { cancel: () => void } | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _publishedOn: HTMLElement | null = null;
  private _overflowObserver: ResizeObserver | null = null;
  private _reflowFrame: number | null = null;
  private _lastOverflowWidth = -1;
  private _hiddenKey = "";
  private _moreCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _onDocumentClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (this.isOpen() && !this.contains(target as Node)) this.close();
    if (this.moreOpen && !target?.closest?.(MORE) && !this._openPanel?.contains(target as Node)) this.closeMore();
  };

  constructor() {
    super();
    this.hoverDelay = 0;
    this.publishHeight = null;
    this.overflowMin = 1;
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
    this._startOverflow();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onDocumentClick);
    this._cancelClose();
    this._cancelOpen();
    this._idleHandle?.cancel();
    this._idleHandle = null;
    this._stopPublishingHeight();
    this._stopOverflow();
    if (this._moreCloseTimer) clearTimeout(this._moreCloseTimer);
    this._moreCloseTimer = null;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has("publishHeight") && this.isConnected) {
      this._stopPublishingHeight();
      this._startPublishingHeight();
    }
    if (changed.has("overflowMin") && this.isConnected && changed.get("overflowMin") !== undefined) this.reflow();
  }

  // --- Opt-in: overflow ("More") ------------------------------------------------

  private _startOverflow() {
    const container = this.querySelector<HTMLElement>(OVERFLOW);
    if (!container) return;
    this.reflow();
    if (typeof ResizeObserver === "function") {
      this._overflowObserver = new ResizeObserver(() => {
        if (container.clientWidth !== this._lastOverflowWidth) this._scheduleReflow();
      });
      this._overflowObserver.observe(container);
    }
    // Web fonts change link widths after first paint.
    void document.fonts?.ready?.then(() => this.isConnected && this._scheduleReflow());
  }

  private _stopOverflow() {
    this._overflowObserver?.disconnect();
    this._overflowObserver = null;
    if (this._reflowFrame !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this._reflowFrame);
    this._reflowFrame = null;
  }

  private _scheduleReflow() {
    if (this._reflowFrame !== null) return;
    if (typeof requestAnimationFrame !== "function") return this.reflow();
    this._reflowFrame = requestAnimationFrame(() => {
      this._reflowFrame = null;
      this.reflow();
    });
  }

  /**
   * Measures the bar and moves the links that do not fit into "More". Called on
   * connect, when the container resizes and when fonts load; call it after
   * changing the links yourself.
   */
  reflow() {
    const container = this.querySelector<HTMLElement>(OVERFLOW);
    const more = container?.querySelector<HTMLElement>(MORE);
    if (!container || !more) return;
    const items = [...container.querySelectorAll<HTMLElement>(ITEM)];
    this._lastOverflowWidth = container.clientWidth;
    if (!items.length) return;

    // Measure with every link in the bar and the "More" item present.
    for (const item of items) item.hidden = false;
    more.hidden = false;
    const style = getComputedStyle(container);
    const available = container.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    const rects = items.map((item) => item.getBoundingClientRect());
    const origin = rects[0].left;
    const gap = rects.length > 1 ? Math.max(0, rects[1].left - rects[0].right) : 0;
    const reserve = more.getBoundingClientRect().width + gap;

    let visible = items.length;
    if (rects[rects.length - 1].right - origin > available) {
      // Hide from the end: the links that stay are the first ones, in order.
      visible = 0;
      for (const rect of rects) {
        if (rect.right - origin + reserve > available) break;
        visible += 1;
      }
      visible = Math.min(items.length, Math.max(visible, Math.max(1, Math.floor(this.overflowMin) || 1)));
    }

    const hidden: string[] = [];
    items.forEach((item, index) => {
      const hide = index >= visible;
      item.hidden = hide;
      if (hide) hidden.push(item.dataset.pltNavbarItem || String(index));
    });
    more.hidden = hidden.length === 0;
    for (const entry of more.querySelectorAll<HTMLElement>(MORE_ENTRY)) {
      entry.hidden = !hidden.includes(entry.dataset.pltNavbarMoreFor ?? "");
    }
    if (!hidden.length) this.closeMore();
    else if (this._openPanel && !this._visibleTrigger(this._openPanel)) this.closeMegaMenu();

    const key = hidden.join(",");
    if (key !== this._hiddenKey) {
      this._hiddenKey = key;
      emit<PltNavbarOverflowDetail>(this, NAVBAR_OVERFLOW_EVENT, { hidden });
    }
  }

  // --- "More" menu ---------------------------------------------------------------

  /** Whether the "More" list is open. */
  get moreOpen(): boolean {
    return this.querySelector(MORE_TOGGLE)?.getAttribute("aria-expanded") === "true";
  }

  openMore() {
    const toggle = this.querySelector<HTMLElement>(MORE_TOGGLE);
    const list = this.querySelector<HTMLElement>(MORE_LIST);
    const more = this.querySelector<HTMLElement>(MORE);
    if (!toggle || !list || !more || this.moreOpen) return;
    this.closeMegaMenu();
    this.activateDeferred();
    list.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    more.dataset.open = "true";
  }

  closeMore() {
    if (this._moreCloseTimer) clearTimeout(this._moreCloseTimer);
    this._moreCloseTimer = null;
    const toggle = this.querySelector<HTMLElement>(MORE_TOGGLE);
    const list = this.querySelector<HTMLElement>(MORE_LIST);
    const more = this.querySelector<HTMLElement>(MORE);
    if (!toggle || !list || !more || !this.moreOpen) return;
    // A panel opened from an entry goes with the list.
    if (this._openPanel && this._visibleTrigger(this._openPanel)?.closest(MORE_LIST)) this.closeMegaMenu();
    list.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    more.dataset.open = "false";
  }

  private _scheduleMoreClose() {
    if (this._moreCloseTimer) clearTimeout(this._moreCloseTimer);
    this._moreCloseTimer = setTimeout(() => this.closeMore(), CLOSE_DELAY_MS);
  }

  private _moreEntries(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>(`${MORE_ENTRY}:not([hidden])`)]
      .map((entry) => entry.querySelector<HTMLElement>("a, button"))
      .filter((element): element is HTMLElement => Boolean(element));
  }

  /** Keys inside "More"; returns whether it handled the event. */
  private _onMoreKeydown(event: KeyboardEvent): boolean {
    const target = event.target as Element | null;
    if (!target?.closest?.(MORE)) return false;
    const toggle = this.querySelector<HTMLElement>(MORE_TOGGLE);
    if (event.key === "Escape") {
      if (this._openPanel || !this.moreOpen) return false; // the generic handler closes the panel first
      this.closeMore();
      toggle?.focus();
      return true;
    }
    const entries = this._moreEntries();
    if (!entries.length) return false;
    if (target.closest(MORE_TOGGLE)) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return false;
      event.preventDefault();
      this.openMore();
      entries[event.key === "ArrowDown" ? 0 : entries.length - 1].focus();
      return true;
    }
    const current = entries.findIndex((entry) => entry === target.closest("a, button"));
    if (current < 0) return false;
    const last = entries.length - 1;
    const to =
      event.key === "ArrowDown" ? (current + 1) % entries.length
      : event.key === "ArrowUp" ? (current - 1 + entries.length) % entries.length
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (to >= 0) {
      event.preventDefault();
      entries[to].focus();
      return true;
    }
    if (event.key === "ArrowRight") {
      const trigger = this._trigger(entries[current]);
      const panel = trigger && this._panelFor(trigger);
      const first = panel?.querySelector<HTMLElement>("a, button");
      if (!panel || !first) return false;
      event.preventDefault();
      this._show(panel);
      first.focus();
      return true;
    }
    return false;
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

  private _triggersFor(panel: HTMLElement): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>(TRIGGER)].filter((t) => t.getAttribute("aria-controls") === panel.id);
  }

  /** A trigger for the panel that is on screen (a link in the bar or its entry in "More"), if any. */
  private _visibleTrigger(panel: HTMLElement): HTMLElement | null {
    return this._triggersFor(panel).find((t) => !t.closest("[hidden]")) ?? null;
  }

  private _triggerFor(panel: HTMLElement): HTMLElement | null {
    return this._visibleTrigger(panel) ?? this._triggersFor(panel)[0] ?? null;
  }

  private _setExpanded(panel: HTMLElement, expanded: boolean) {
    for (const trigger of this._triggersFor(panel)) trigger.setAttribute("aria-expanded", String(expanded));
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
    this._setExpanded(panel, false);
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
    this._setExpanded(panel, true);
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
    if (target?.closest?.(MORE_TOGGLE)) {
      this.moreOpen ? this.closeMore() : this.openMore();
      return;
    }
    // Following a link inside a panel closes it (client-routed frontends stay on the page).
    if (target?.closest?.(".plt-megamenu a, [data-plt-megamenu] a")) {
      this.closeMegaMenu();
      this.closeMore();
    } else if (target?.closest?.(`${MORE_LIST} a`)) {
      this.closeMore();
    }
  }

  private _onKeydown(event: KeyboardEvent) {
    if (this._onMoreKeydown(event)) return;
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
      if (this._moreCloseTimer && ((event.target as Element | null)?.closest?.(MORE) || panel === this._openPanel)) {
        clearTimeout(this._moreCloseTimer);
        this._moreCloseTimer = null;
      }
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
      const related = event.relatedTarget as Element | null;
      if (this.moreOpen && !related?.closest?.(MORE) && !this._openPanel?.contains(related)) this._scheduleMoreClose();
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
    const next = event.relatedTarget as Node | null;
    if (this.moreOpen && next && !this.querySelector(MORE)?.contains(next) && !this._openPanel?.contains(next)) this.closeMore();
    if (!this._openPanel) return;
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
