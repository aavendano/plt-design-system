import { LitElement, type PropertyValues } from "lit";
export interface PltGalleryChangeDetail {
    index: number;
    src: string;
}
export declare const GALLERY_CHANGE_EVENT = "plt:gallery-change";
/**
 * `<plt-product-gallery>` — enhances the ProductDetail gallery markup.
 *
 * Contract (unchanged from the former vanilla element): `.plt-product-detail__thumb`
 * buttons swap `.plt-product-detail__gallery-main img` and carry
 * `aria-current`. The element renders nothing itself; listeners are
 * delegated, so thumbnails added later by any framework keep working.
 * Adds: `srcset`/`sizes` follow the thumbnail, arrow keys / Home / End move
 * between thumbnails, `selectedIndex`, `select(index)` and an event.
 *
 * @fires plt:gallery-change - when the main image changes.
 */
export declare class PltProductGallery extends LitElement {
    static properties: {
        selectedIndex: {
            type: NumberConstructor;
            attribute: string;
            reflect: boolean;
        };
    };
    selectedIndex: number;
    constructor();
    protected createRenderRoot(): this;
    /** Thumbnails in document order. */
    get thumbs(): HTMLElement[];
    /** Index the main image currently shows (the server markup shows the current thumb). */
    private _shownIndex;
    connectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    /** Shows thumbnail `index` in the main image. */
    select(index: number): void;
    private _markCurrent;
    private _apply;
    private _onClick;
    private _onKeydown;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-product-gallery": PltProductGallery;
    }
}
