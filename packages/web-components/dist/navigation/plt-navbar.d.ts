import { LitElement, type PropertyValues } from "lit";
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
export declare const NAVBAR_TOGGLE_EVENT = "plt:navbar-toggle";
export declare const MEGAMENU_TOGGLE_EVENT = "plt:megamenu-toggle";
export declare const NAVBAR_OVERFLOW_EVENT = "plt:navbar-overflow";
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
export declare class PltNavbar extends LitElement {
    static properties: {
        hoverDelay: {
            type: NumberConstructor;
            attribute: string;
        };
        publishHeight: {
            type: StringConstructor;
            attribute: string;
        };
        overflowMin: {
            type: NumberConstructor;
            attribute: string;
        };
    };
    /** Milliseconds a hover must last before a panel opens; 0 opens at once. */
    hoverDelay: number;
    /** Present: publish the height on this element; `"root"`: on `<html>`. */
    publishHeight: string | null;
    /** Links that always stay in the bar, however narrow it is. */
    overflowMin: number;
    private _openPanel;
    /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
    private _returningFocus;
    private _closeTimer;
    private _openTimer;
    private _pendingTrigger;
    private _idleHandle;
    private _resizeObserver;
    private _publishedOn;
    private _overflowObserver;
    private _reflowFrame;
    private _lastOverflowWidth;
    private _hiddenKey;
    private _moreCloseTimer;
    private readonly _onDocumentClick;
    constructor();
    protected createRenderRoot(): this;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    private _startOverflow;
    private _stopOverflow;
    private _scheduleReflow;
    /**
     * Measures the bar and moves the links that do not fit into "More". Called on
     * connect, when the container resizes and when fonts load; call it after
     * changing the links yourself.
     */
    reflow(): void;
    /** Whether the "More" list is open. */
    get moreOpen(): boolean;
    openMore(): void;
    closeMore(): void;
    private _scheduleMoreClose;
    private _moreEntries;
    /** Keys inside "More"; returns whether it handled the event. */
    private _onMoreKeydown;
    private _startPublishingHeight;
    private _stopPublishingHeight;
    /** Applies the deferred `src`, `srcset` and `sizes` now. Safe to call repeatedly. */
    activateDeferred(): void;
    private _scheduleDeferred;
    get toggle(): HTMLElement | null;
    get panel(): HTMLElement | null;
    isOpen(): boolean;
    open(): void;
    close(): void;
    private _setMobile;
    private _trigger;
    private _panelFor;
    private _triggersFor;
    /** A trigger for the panel that is on screen (a link in the bar or its entry in "More"), if any. */
    private _visibleTrigger;
    private _triggerFor;
    private _setExpanded;
    /** Opens the mega menu panel with this id (closing any other). */
    openMegaMenu(id: string): void;
    /** Closes the open mega menu panel, if any. */
    closeMegaMenu(): void;
    private _show;
    private _scheduleClose;
    private _cancelClose;
    private _cancelOpen;
    private _inMegaArea;
    private _onClick;
    private _onKeydown;
    private _onPointer;
    private _onFocusIn;
    private _onFocusOut;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-navbar": PltNavbar;
    }
}
