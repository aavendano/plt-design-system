import { LitElement, type PropertyValues } from "lit";
import { type PltCartLabels, type PltCartLineData } from "./types.js";
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
export declare class PltCartDrawer extends LitElement {
    static properties: {
        open: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        lines: {
            type: ArrayConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        subtotal: {
            type: StringConstructor;
        };
        checkoutUrl: {
            type: StringConstructor;
            attribute: string;
        };
        cartUrl: {
            type: StringConstructor;
            attribute: string;
        };
        busy: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        error: {
            type: StringConstructor;
        };
        labels: {
            type: ObjectConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
    };
    open: boolean;
    lines: PltCartLineData[];
    subtotal: string;
    checkoutUrl: string;
    cartUrl: string;
    busy: boolean;
    error: string;
    labels: PltCartLabels;
    private readonly _titleId;
    private _release;
    private _previousFocus;
    constructor();
    protected createRenderRoot(): this;
    get dialog(): HTMLDialogElement | null;
    /** Total quantity across lines. */
    get count(): number;
    show(): void;
    hide(): void;
    toggle(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    private _onClose;
    private _onDialogClick;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-cart-drawer": PltCartDrawer;
    }
}
