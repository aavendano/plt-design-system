import { LitElement } from "lit";
import { byId, emit } from "../shared/element.js";
const NAVBAR_TOGGLE_EVENT = "plt:navbar-toggle";
const MEGAMENU_TOGGLE_EVENT = "plt:megamenu-toggle";
const NAVBAR_OVERFLOW_EVENT = "plt:navbar-overflow";
const CLOSE_DELAY_MS = 150;
const IDLE_TIMEOUT_MS = 2e3;
const TRIGGER = "[aria-controls][aria-haspopup], [data-plt-megamenu-trigger]";
const PANEL = ".plt-megamenu, [data-plt-megamenu]";
const DEFERRED = "[data-plt-navbar-deferred]";
const HEIGHT_PROPERTY = "--plt-navbar-height";
const OVERFLOW = "[data-plt-navbar-overflow]";
const ITEM = "[data-plt-navbar-item]";
const MORE = "[data-plt-navbar-more]";
const MORE_TOGGLE = "[data-plt-navbar-more-toggle]";
const MORE_LIST = "[data-plt-navbar-more-list]";
const MORE_ENTRY = "[data-plt-navbar-more-for]";
class PltNavbar extends LitElement {
  constructor() {
    super();
    this._openPanel = null;
    /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
    this._returningFocus = false;
    this._closeTimer = null;
    this._openTimer = null;
    this._pendingTrigger = null;
    this._idleHandle = null;
    this._resizeObserver = null;
    this._publishedOn = null;
    this._overflowObserver = null;
    this._reflowFrame = null;
    this._lastOverflowWidth = -1;
    this._hiddenKey = "";
    this._moreCloseTimer = null;
    this._onDocumentClick = (event) => {
      const target = event.target;
      if (this.isOpen() && !this.contains(target)) this.close();
      if (this.moreOpen && !target?.closest?.(MORE) && !this._openPanel?.contains(target)) this.closeMore();
    };
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
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onDocumentClick);
    this._startPublishingHeight();
    if (this.querySelector(DEFERRED)) this._scheduleDeferred();
    this._startOverflow();
  }
  disconnectedCallback() {
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
  updated(changed) {
    if (changed.has("publishHeight") && this.isConnected) {
      this._stopPublishingHeight();
      this._startPublishingHeight();
    }
    if (changed.has("overflowMin") && this.isConnected && changed.get("overflowMin") !== void 0) this.reflow();
  }
  // --- Opt-in: overflow ("More") ------------------------------------------------
  _startOverflow() {
    const container = this.querySelector(OVERFLOW);
    if (!container) return;
    this.reflow();
    if (typeof ResizeObserver === "function") {
      this._overflowObserver = new ResizeObserver(() => {
        if (container.clientWidth !== this._lastOverflowWidth) this._scheduleReflow();
      });
      this._overflowObserver.observe(container);
    }
    void document.fonts?.ready?.then(() => this.isConnected && this._scheduleReflow());
  }
  _stopOverflow() {
    this._overflowObserver?.disconnect();
    this._overflowObserver = null;
    if (this._reflowFrame !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this._reflowFrame);
    this._reflowFrame = null;
  }
  _scheduleReflow() {
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
    const container = this.querySelector(OVERFLOW);
    const more = container?.querySelector(MORE);
    if (!container || !more) return;
    const items = [...container.querySelectorAll(ITEM)];
    this._lastOverflowWidth = container.clientWidth;
    if (!items.length) return;
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
      visible = 0;
      for (const rect of rects) {
        if (rect.right - origin + reserve > available) break;
        visible += 1;
      }
      visible = Math.min(items.length, Math.max(visible, Math.max(1, Math.floor(this.overflowMin) || 1)));
    }
    const hidden = [];
    items.forEach((item, index) => {
      const hide = index >= visible;
      item.hidden = hide;
      if (hide) hidden.push(item.dataset.pltNavbarItem || String(index));
    });
    more.hidden = hidden.length === 0;
    for (const entry of more.querySelectorAll(MORE_ENTRY)) {
      entry.hidden = !hidden.includes(entry.dataset.pltNavbarMoreFor ?? "");
    }
    if (!hidden.length) this.closeMore();
    else if (this._openPanel && !this._visibleTrigger(this._openPanel)) this.closeMegaMenu();
    const key = hidden.join(",");
    if (key !== this._hiddenKey) {
      this._hiddenKey = key;
      emit(this, NAVBAR_OVERFLOW_EVENT, { hidden });
    }
  }
  // --- "More" menu ---------------------------------------------------------------
  /** Whether the "More" list is open. */
  get moreOpen() {
    return this.querySelector(MORE_TOGGLE)?.getAttribute("aria-expanded") === "true";
  }
  openMore() {
    const toggle = this.querySelector(MORE_TOGGLE);
    const list = this.querySelector(MORE_LIST);
    const more = this.querySelector(MORE);
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
    const toggle = this.querySelector(MORE_TOGGLE);
    const list = this.querySelector(MORE_LIST);
    const more = this.querySelector(MORE);
    if (!toggle || !list || !more || !this.moreOpen) return;
    if (this._openPanel && this._visibleTrigger(this._openPanel)?.closest(MORE_LIST)) this.closeMegaMenu();
    list.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    more.dataset.open = "false";
  }
  _scheduleMoreClose() {
    if (this._moreCloseTimer) clearTimeout(this._moreCloseTimer);
    this._moreCloseTimer = setTimeout(() => this.closeMore(), CLOSE_DELAY_MS);
  }
  _moreEntries() {
    return [...this.querySelectorAll(`${MORE_ENTRY}:not([hidden])`)].map((entry) => entry.querySelector("a, button")).filter((element) => Boolean(element));
  }
  /** Keys inside "More"; returns whether it handled the event. */
  _onMoreKeydown(event) {
    const target = event.target;
    if (!target?.closest?.(MORE)) return false;
    const toggle = this.querySelector(MORE_TOGGLE);
    if (event.key === "Escape") {
      if (this._openPanel || !this.moreOpen) return false;
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
    const to = event.key === "ArrowDown" ? (current + 1) % entries.length : event.key === "ArrowUp" ? (current - 1 + entries.length) % entries.length : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (to >= 0) {
      event.preventDefault();
      entries[to].focus();
      return true;
    }
    if (event.key === "ArrowRight") {
      const trigger = this._trigger(entries[current]);
      const panel = trigger && this._panelFor(trigger);
      const first = panel?.querySelector("a, button");
      if (!panel || !first) return false;
      event.preventDefault();
      this._show(panel);
      first.focus();
      return true;
    }
    return false;
  }
  // --- Opt-in: published height ---------------------------------------------
  _startPublishingHeight() {
    if (this.publishHeight === null || this.publishHeight === void 0) return;
    this._publishedOn = this.publishHeight === "root" ? document.documentElement : this;
    const publish = () => this._publishedOn?.style.setProperty(HEIGHT_PROPERTY, `${this.getBoundingClientRect().height}px`);
    publish();
    if (typeof ResizeObserver === "function") {
      this._resizeObserver = new ResizeObserver(publish);
      this._resizeObserver.observe(this);
    }
  }
  _stopPublishingHeight() {
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
    for (const element of this.querySelectorAll(DEFERRED)) {
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
  _scheduleDeferred() {
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
    if (open) this.activateDeferred();
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
    return panel?.matches(PANEL) ? panel : null;
  }
  _triggersFor(panel) {
    return [...this.querySelectorAll(TRIGGER)].filter((t) => t.getAttribute("aria-controls") === panel.id);
  }
  /** A trigger for the panel that is on screen (a link in the bar or its entry in "More"), if any. */
  _visibleTrigger(panel) {
    return this._triggersFor(panel).find((t) => !t.closest("[hidden]")) ?? null;
  }
  _triggerFor(panel) {
    return this._visibleTrigger(panel) ?? this._triggersFor(panel)[0] ?? null;
  }
  _setExpanded(panel, expanded) {
    for (const trigger of this._triggersFor(panel)) trigger.setAttribute("aria-expanded", String(expanded));
  }
  /** Opens the mega menu panel with this id (closing any other). */
  openMegaMenu(id) {
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
    emit(this, MEGAMENU_TOGGLE_EVENT, { id: panel.id, open: false });
  }
  _show(panel) {
    this._cancelClose();
    this._cancelOpen();
    this.activateDeferred();
    if (this._openPanel === panel) return;
    this.closeMegaMenu();
    this._openPanel = panel;
    panel.dataset.open = "true";
    this._setExpanded(panel, true);
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
  _cancelOpen() {
    if (this._openTimer) clearTimeout(this._openTimer);
    this._openTimer = null;
    this._pendingTrigger = null;
  }
  _inMegaArea(node) {
    const element = node;
    if (!element?.closest) return false;
    return Boolean(this._trigger(element) || element.closest(PANEL));
  }
  // --- Delegated listeners ----------------------------------------------------
  _onClick(event) {
    const target = event.target;
    if (target?.closest?.("[data-plt-navbar-toggle]")) {
      this.isOpen() ? this.close() : this.open();
      return;
    }
    if (target?.closest?.(MORE_TOGGLE)) {
      this.moreOpen ? this.closeMore() : this.openMore();
      return;
    }
    if (target?.closest?.(".plt-megamenu a, [data-plt-megamenu] a")) {
      this.closeMegaMenu();
      this.closeMore();
    } else if (target?.closest?.(`${MORE_LIST} a`)) {
      this.closeMore();
    }
  }
  _onKeydown(event) {
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
      const panel = trigger ? this._panelFor(trigger) : event.target?.closest?.(PANEL);
      if (this._moreCloseTimer && (event.target?.closest?.(MORE) || panel === this._openPanel)) {
        clearTimeout(this._moreCloseTimer);
        this._moreCloseTimer = null;
      }
      if (!(panel instanceof HTMLElement)) return;
      if (!trigger) {
        if (panel === this._openPanel) this._cancelClose();
        return;
      }
      this.activateDeferred();
      if (this.hoverDelay > 0 && this._openPanel !== panel) {
        if (this._openTimer && this._pendingTrigger === trigger) return;
        this._cancelOpen();
        this._pendingTrigger = trigger;
        this._openTimer = setTimeout(() => this._show(panel), this.hoverDelay);
      } else {
        this._show(panel);
      }
    } else {
      if (this._openTimer && !this._pendingTrigger?.contains(event.relatedTarget)) this._cancelOpen();
      const related = event.relatedTarget;
      if (this.moreOpen && !related?.closest?.(MORE) && !this._openPanel?.contains(related)) this._scheduleMoreClose();
      if (this._openPanel && !this._inMegaArea(event.relatedTarget)) this._scheduleClose();
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
    const next = event.relatedTarget;
    if (this.moreOpen && next && !this.querySelector(MORE)?.contains(next) && !this._openPanel?.contains(next)) this.closeMore();
    if (!this._openPanel) return;
    const panel = this._openPanel;
    const trigger = this._triggerFor(panel);
    if (next && (panel.contains(next) || trigger?.contains(next))) return;
    this.closeMegaMenu();
  }
}
PltNavbar.properties = {
  hoverDelay: { type: Number, attribute: "hover-delay" },
  publishHeight: { type: String, attribute: "publish-height" },
  overflowMin: { type: Number, attribute: "overflow-min" }
};
export {
  MEGAMENU_TOGGLE_EVENT,
  NAVBAR_OVERFLOW_EVENT,
  NAVBAR_TOGGLE_EVENT,
  PltNavbar
};
