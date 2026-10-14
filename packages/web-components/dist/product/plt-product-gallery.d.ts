import { LitElement, type PropertyValues } from "lit";
export interface PltGalleryChangeDetail {
    index: number;
    src: string;
    /** `data-media-id` of the shown slide, when the markup carries one. */
    mediaId?: string;
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
 * Opt-in capabilities, each switched on by the markup that carries it, so
 * existing consumers are untouched:
 *
 * - **Slides** — `[data-plt-gallery-slide]` children (one per thumbnail, in
 *   order, any media: image, video, embed, 3D). The selected one is shown and
 *   the others get `hidden`; video in a slide that is hidden pauses (and
 *   resumes when it has `autoplay`). A slide's `data-media-id` lets the page
 *   call `selectMedia(id)` when a variant changes.
 * - **Hover zoom** — `[data-plt-gallery-zoom]` follows the pointer through
 *   `--plt-zoom-x` / `--plt-zoom-y`; the scale itself is CSS.
 * - **Lightbox** — `[data-plt-gallery-zoom-open]` (a link to the large image,
 *   or a button with `data-zoom-src`; optional `data-zoom-alt`) opens
 *   `dialog[data-plt-gallery-lightbox]` with `[data-plt-gallery-lightbox-image]`
 *   and `[data-plt-gallery-lightbox-close]`. It is a modal `<dialog>`: focus is
 *   trapped, Escape closes it and focus returns to the opener.
 * - **Thumbnail track** — `[data-plt-gallery-thumb-track]` scrolls the selected
 *   thumbnail into view; `[data-plt-gallery-thumbs-prev|next]` page it.
 *
 * @fires plt:gallery-change - when the shown media changes.
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
    /** Slides in document order (empty unless the markup opts in). */
    get slides(): HTMLElement[];
    /** Index the main image currently shows (the server markup shows the current thumb). */
    private _shownIndex;
    private _opener;
    connectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    /** Shows thumbnail `index` in the main image (or its slide). */
    select(index: number): void;
    /**
     * Shows the slide whose `data-media-id` is `id` (for example a variant's
     * featured media). Returns whether one matched.
     */
    selectMedia(id: string | number | null | undefined): boolean;
    private _markCurrent;
    private _apply;
    /** Slides mode: show one slide, quiet the one that was showing. */
    private _showSlide;
    /** Moves the thumbnail track (not the page) so the selected thumbnail is visible. */
    private _scrollThumbIntoView;
    private _pageThumbs;
    private _onPointerMove;
    private _resetZoom;
    private _openLightbox;
    private _closeLightbox;
    private _onClick;
    private _onKeydown;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-product-gallery": PltProductGallery;
    }
}
