import { LitElement } from "lit";
export interface PltNavbarToggleDetail {
    open: boolean;
}
export interface PltMegaMenuToggleDetail {
    id: string;
    open: boolean;
}
export declare const NAVBAR_TOGGLE_EVENT = "plt:navbar-toggle";
export declare const MEGAMENU_TOGGLE_EVENT = "plt:megamenu-toggle";
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
export declare class PltNavbar extends LitElement {
    private _openPanel;
    /** Set while Escape returns focus to a trigger, so that focus does not reopen it. */
    private _returningFocus;
    private _closeTimer;
    private readonly _onDocumentClick;
    constructor();
    protected createRenderRoot(): this;
    connectedCallback(): void;
    disconnectedCallback(): void;
    get toggle(): HTMLElement | null;
    get panel(): HTMLElement | null;
    isOpen(): boolean;
    open(): void;
    close(): void;
    private _setMobile;
    private _trigger;
    private _panelFor;
    private _triggerFor;
    /** Opens the mega menu panel with this id (closing any other). */
    openMegaMenu(id: string): void;
    /** Closes the open mega menu panel, if any. */
    closeMegaMenu(): void;
    private _show;
    private _scheduleClose;
    private _cancelClose;
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
