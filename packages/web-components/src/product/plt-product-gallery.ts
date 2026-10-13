import { LitElement, type PropertyValues } from "lit";
import { emit } from "../shared/element.js";

export interface PltGalleryChangeDetail {
  index: number;
  src: string;
}

export const GALLERY_CHANGE_EVENT = "plt:gallery-change";

const THUMB = ".plt-product-detail__thumb";
const MAIN_IMAGE = ".plt-product-detail__gallery-main img";

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
export class PltProductGallery extends LitElement {
  static override properties = {
    selectedIndex: { type: Number, attribute: "selected-index", reflect: true },
  };

  declare selectedIndex: number;

  constructor() {
    super();
    this.selectedIndex = -1;
    this.addEventListener("click", (event) => this._onClick(event));
    this.addEventListener("keydown", (event) => this._onKeydown(event));
  }

  protected override createRenderRoot() {
    return this;
  }

  /** Thumbnails in document order. */
  get thumbs(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>(THUMB)];
  }

  /** Index the main image currently shows (the server markup shows the current thumb). */
  private _shownIndex = -1;

  override connectedCallback() {
    super.connectedCallback();
    const thumbs = this.thumbs;
    const current = thumbs.findIndex((thumb) => thumb.getAttribute("aria-current") === "true");
    this._shownIndex = current >= 0 ? current : thumbs.length ? 0 : -1;
    if (this.selectedIndex < 0) this.selectedIndex = this._shownIndex;
    // Synchronously, as the former vanilla element did, so markup is right on upgrade.
    this._markCurrent();
  }

  protected override updated(changed: PropertyValues<this>) {
    // Only a consumer-set index swaps the image; the initial one is already shown.
    if (changed.has("selectedIndex") && this.selectedIndex !== this._shownIndex) this._apply();
  }

  /** Shows thumbnail `index` in the main image. */
  select(index: number) {
    const thumbs = this.thumbs;
    if (index < 0 || index >= thumbs.length || index === this.selectedIndex) return;
    this.selectedIndex = index;
    this._apply();
    const src = thumbs[index].querySelector("img")?.getAttribute("src") ?? "";
    emit<PltGalleryChangeDetail>(this, GALLERY_CHANGE_EVENT, { index, src });
  }

  private _markCurrent() {
    this.thumbs.forEach((thumb, i) => thumb.setAttribute("aria-current", i === this.selectedIndex ? "true" : "false"));
  }

  private _apply() {
    this._shownIndex = this.selectedIndex;
    this._markCurrent();
    const thumb = this.thumbs[this.selectedIndex];
    const source = thumb?.querySelector("img");
    const main = this.querySelector<HTMLImageElement>(MAIN_IMAGE);
    if (!source || !main) return;
    // Copy the responsive candidates too, or the browser keeps showing the old srcset.
    for (const attribute of ["srcset", "sizes"] as const) {
      const value = source.getAttribute(attribute);
      if (value) main.setAttribute(attribute, value);
      else main.removeAttribute(attribute);
    }
    main.src = source.src;
    main.alt = source.alt || thumb.getAttribute("aria-label") || "";
  }

  private _onClick(event: Event) {
    if (!this.isConnected) return;
    const thumb = (event.target as Element | null)?.closest?.(THUMB);
    if (!thumb || !this.contains(thumb)) return;
    this.select(this.thumbs.indexOf(thumb as HTMLElement));
  }

  private _onKeydown(event: KeyboardEvent) {
    if (!this.isConnected) return;
    const thumbs = this.thumbs;
    const from = thumbs.indexOf((event.target as Element | null)?.closest?.(THUMB) as HTMLElement);
    if (from < 0) return;
    const last = thumbs.length - 1;
    const to =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(from + 1, last)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? Math.max(from - 1, 0)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (to < 0) return;
    event.preventDefault();
    thumbs[to].focus();
    this.select(to);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "plt-product-gallery": PltProductGallery;
  }
}
