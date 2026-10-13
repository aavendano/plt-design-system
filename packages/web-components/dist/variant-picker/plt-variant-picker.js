import { LitElement, html, nothing } from "lit";
import { live } from "lit/directives/live.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  findVariant,
  initialSelection,
  isSelectionValid,
  normalizeOptions,
  normalizeVariants,
  selectValue,
  toSelectedOptions,
  valueStatus
} from "./resolve.js";
import {
  VARIANT_CHANGE_EVENT
} from "./types.js";
import { emit, jsonConverter as sharedJsonConverter, retireFallback } from "../shared/element.js";
const jsonConverter = (fallback) => sharedJsonConverter("plt-variant-picker", fallback);
const DEFAULT_LABELS = {
  soldOut: "Sold out",
  unavailable: "Unavailable"
};
let instanceCount = 0;
class PltVariantPicker extends LitElement {
  constructor() {
    super();
    this._options = [];
    this._variants = [];
    this._uid = ++instanceCount;
    this.options = [];
    this.variants = [];
    this.selectedVariantId = null;
    this.name = "id";
    this.labels = {};
    this.disabled = false;
    this._selection = [];
  }
  /** Light DOM: the design-system styles of the page apply. */
  createRenderRoot() {
    return this;
  }
  /** The currently resolved variant, or `null`. */
  get selectedVariant() {
    return findVariant(this._variants, this._selection);
  }
  /** Current selection as `{ name, value }` pairs. */
  get selectedOptions() {
    return toSelectedOptions(this._options, this._selection);
  }
  connectedCallback() {
    super.connectedCallback();
    this._retireFallback();
  }
  willUpdate(changed) {
    const dataChanged = changed.has("options") || changed.has("variants");
    if (dataChanged) {
      this._options = normalizeOptions(this.options);
      this._variants = normalizeVariants(this.variants);
    }
    if (!dataChanged && !changed.has("selectedVariantId")) return;
    const resolvedId = this.selectedVariant?.id ?? null;
    const requestedId = this.selectedVariantId ? String(this.selectedVariantId) : null;
    const keepSelection = requestedId === resolvedId && isSelectionValid(this._options, this._selection);
    if (!keepSelection) {
      this._selection = initialSelection(this._options, this._variants, requestedId);
    }
    const nextId = this.selectedVariant?.id ?? null;
    if (nextId !== this.selectedVariantId) this.selectedVariantId = nextId;
  }
  updated(changed) {
    if (changed.has("disabled")) this._retireFallback();
  }
  /** Hides and disables the no-JS fallback so it neither shows nor submits. */
  _retireFallback() {
    retireFallback(this);
  }
  _select(optionIndex, value) {
    if (this.disabled) return;
    const previousVariantId = this.selectedVariantId;
    this._selection = selectValue(this._variants, this._selection, optionIndex, value);
    const variant = this.selectedVariant;
    this.selectedVariantId = variant?.id ?? null;
    const detail = {
      variantId: variant?.id ?? null,
      variant,
      available: Boolean(variant?.available),
      selectedOptions: this.selectedOptions,
      previousVariantId
    };
    emit(this, VARIANT_CHANGE_EVENT, detail);
  }
  _labels() {
    return { ...DEFAULT_LABELS, ...this.labels ?? {} };
  }
  _statusText(status) {
    const labels = this._labels();
    if (status === "sold-out") return labels.soldOut;
    if (status === "unavailable") return labels.unavailable;
    return "";
  }
  _announcement() {
    if (this._options.length === 0) return "";
    const summary = this._selection.filter(Boolean).join(" / ");
    const variant = this.selectedVariant;
    const status = !variant ? "unavailable" : variant.available ? "available" : "sold-out";
    const suffix = this._statusText(status);
    return suffix ? `${summary}, ${suffix}` : summary;
  }
  _renderSwatch(value) {
    const swatch = value.swatch;
    if (!swatch?.color && !swatch?.image) return nothing;
    return html`<span
      class="plt-swatch plt-variant-picker__swatch"
      aria-hidden="true"
      style=${styleMap({ backgroundColor: swatch.color ?? void 0 })}
      >${swatch.image ? html`<img src=${swatch.image} alt="" loading="lazy" />` : nothing}</span
    >`;
  }
  _renderOption(option, optionIndex) {
    const groupName = `plt-variant-picker-${this._uid}-${optionIndex}`;
    const selected = this._selection[optionIndex] ?? "";
    const selectedLabel = option.values.find((value) => value.value === selected)?.label ?? selected;
    return html`
      <fieldset class="plt-option-picker plt-variant-picker__option" ?disabled=${this.disabled}>
        <legend class="theme-label-bold plt-option-picker__label">
          ${option.name}<span class="plt-variant-picker__current">: ${selectedLabel}</span>
        </legend>
        <div class="plt-option-picker__options">
          ${option.values.map((value) => {
      const checked = value.value === selected;
      const status = valueStatus(this._variants, this._selection, optionIndex, value.value);
      const statusText = this._statusText(status);
      const label = value.label ?? value.value;
      return html`<label
              class="d-btn ${checked ? "d-btn-primary" : "d-btn-outline"} theme-bordered theme-label-bold plt-variant-picker__value"
              data-status=${status}
            >
              <input
                type="radio"
                class="plt-variant-picker__input"
                name=${groupName}
                .value=${value.value}
                .checked=${live(checked)}
                aria-label=${statusText ? `${label}, ${statusText}` : label}
                @change=${() => this._select(optionIndex, value.value)}
              />
              ${this._renderSwatch(value)}
              <span class="plt-variant-picker__label">${label}</span>
            </label>`;
    })}
        </div>
      </fieldset>
    `;
  }
  render() {
    return html`
      <div class="plt-variant-picker__options">
        ${this._options.map((option, index) => this._renderOption(option, index))}
      </div>
      <input
        type="hidden"
        name=${this.name}
        .value=${live(this.selectedVariantId ?? "")}
        ?disabled=${this.disabled}
      />
      <p class="plt-variant-picker__sr" role="status" aria-live="polite">${this._announcement()}</p>
    `;
  }
}
PltVariantPicker.properties = {
  options: { type: Array, converter: jsonConverter(() => []) },
  variants: { type: Array, converter: jsonConverter(() => []) },
  selectedVariantId: { type: String, attribute: "selected-variant-id", reflect: true },
  name: { type: String, reflect: true },
  labels: { type: Object, converter: jsonConverter(() => ({})) },
  disabled: { type: Boolean, reflect: true },
  _selection: { state: true }
};
export {
  PltVariantPicker
};
