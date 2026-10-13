import { LitElement } from "lit";
import { emit } from "../shared/element.js";
const GALLERY_CHANGE_EVENT = "plt:gallery-change";
const THUMB = ".plt-product-detail__thumb";
const MAIN_IMAGE = ".plt-product-detail__gallery-main img";
class PltProductGallery extends LitElement {
  constructor() {
    super();
    /** Index the main image currently shows (the server markup shows the current thumb). */
    this._shownIndex = -1;
    this.selectedIndex = -1;
    this.addEventListener("click", (event) => this._onClick(event));
    this.addEventListener("keydown", (event) => this._onKeydown(event));
  }
  createRenderRoot() {
    return this;
  }
  /** Thumbnails in document order. */
  get thumbs() {
    return [...this.querySelectorAll(THUMB)];
  }
  connectedCallback() {
    super.connectedCallback();
    const thumbs = this.thumbs;
    const current = thumbs.findIndex((thumb) => thumb.getAttribute("aria-current") === "true");
    this._shownIndex = current >= 0 ? current : thumbs.length ? 0 : -1;
    if (this.selectedIndex < 0) this.selectedIndex = this._shownIndex;
    this._markCurrent();
  }
  updated(changed) {
    if (changed.has("selectedIndex") && this.selectedIndex !== this._shownIndex) this._apply();
  }
  /** Shows thumbnail `index` in the main image. */
  select(index) {
    const thumbs = this.thumbs;
    if (index < 0 || index >= thumbs.length || index === this.selectedIndex) return;
    this.selectedIndex = index;
    this._apply();
    const src = thumbs[index].querySelector("img")?.getAttribute("src") ?? "";
    emit(this, GALLERY_CHANGE_EVENT, { index, src });
  }
  _markCurrent() {
    this.thumbs.forEach((thumb, i) => thumb.setAttribute("aria-current", i === this.selectedIndex ? "true" : "false"));
  }
  _apply() {
    this._shownIndex = this.selectedIndex;
    this._markCurrent();
    const thumb = this.thumbs[this.selectedIndex];
    const source = thumb?.querySelector("img");
    const main = this.querySelector(MAIN_IMAGE);
    if (!source || !main) return;
    for (const attribute of ["srcset", "sizes"]) {
      const value = source.getAttribute(attribute);
      if (value) main.setAttribute(attribute, value);
      else main.removeAttribute(attribute);
    }
    main.src = source.src;
    main.alt = source.alt || thumb.getAttribute("aria-label") || "";
  }
  _onClick(event) {
    if (!this.isConnected) return;
    const thumb = event.target?.closest?.(THUMB);
    if (!thumb || !this.contains(thumb)) return;
    this.select(this.thumbs.indexOf(thumb));
  }
  _onKeydown(event) {
    if (!this.isConnected) return;
    const thumbs = this.thumbs;
    const from = thumbs.indexOf(event.target?.closest?.(THUMB));
    if (from < 0) return;
    const last = thumbs.length - 1;
    const to = event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(from + 1, last) : event.key === "ArrowLeft" || event.key === "ArrowUp" ? Math.max(from - 1, 0) : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (to < 0) return;
    event.preventDefault();
    thumbs[to].focus();
    this.select(to);
  }
}
PltProductGallery.properties = {
  selectedIndex: { type: Number, attribute: "selected-index", reflect: true }
};
export {
  GALLERY_CHANGE_EVENT,
  PltProductGallery
};
