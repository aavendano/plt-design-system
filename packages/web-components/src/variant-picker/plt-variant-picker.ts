import { LitElement, html, nothing, type PropertyValues } from "lit";
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
  valueStatus,
  type NormalizedOption,
} from "./resolve.js";
import {
  VARIANT_CHANGE_EVENT,
  type PltOptionValue,
  type PltProductOption,
  type PltValueStatus,
  type PltVariant,
  type PltVariantChangeDetail,
  type PltVariantPickerLabels,
} from "./types.js";

const DEFAULT_LABELS: Required<PltVariantPickerLabels> = {
  soldOut: "Sold out",
  unavailable: "Unavailable",
};

/** Parses JSON attributes; malformed JSON falls back instead of throwing. */
const jsonConverter = (fallback: () => unknown) => ({
  fromAttribute(value: string | null) {
    if (value === null || value === "") return fallback();
    try {
      return JSON.parse(value);
    } catch {
      console.warn("<plt-variant-picker>: ignoring malformed JSON attribute");
      return fallback();
    }
  },
  toAttribute(value: unknown) {
    return JSON.stringify(value);
  },
});

let instanceCount = 0;

/**
 * `<plt-variant-picker>` — option/variant selector shared by every PLT frontend.
 *
 * Renders into light DOM so the daisyUI (`d-`), `theme-*` and `--plt-*` styles
 * of the host page apply unchanged and the hidden variant input takes part in
 * the surrounding `<form>`. Server-rendered children marked `data-plt-fallback`
 * (a plain `<select>`) keep the form usable without JavaScript and are hidden
 * and disabled once the element upgrades.
 *
 * @fires plt:variant-change - after the shopper changes the selection.
 */
export class PltVariantPicker extends LitElement {
  static override properties = {
    options: { type: Array, converter: jsonConverter(() => []) },
    variants: { type: Array, converter: jsonConverter(() => []) },
    selectedVariantId: { type: String, attribute: "selected-variant-id", reflect: true },
    name: { type: String, reflect: true },
    labels: { type: Object, converter: jsonConverter(() => ({})) },
    disabled: { type: Boolean, reflect: true },
    _selection: { state: true },
  };

  /** Product options with their values (positional). */
  declare options: PltProductOption[];
  /** Every purchasable combination the consumer supplies. */
  declare variants: PltVariant[];
  /** Selected variant id; `null` when the selection matches no variant. */
  declare selectedVariantId: string | null;
  /** Form field name of the hidden variant-id input (Shopify forms use `id`). */
  declare name: string;
  declare labels: PltVariantPickerLabels;
  declare disabled: boolean;
  declare private _selection: string[];

  private _options: NormalizedOption[] = [];
  private _variants: PltVariant[] = [];
  private readonly _uid = ++instanceCount;

  constructor() {
    super();
    this.options = [];
    this.variants = [];
    this.selectedVariantId = null;
    this.name = "id";
    this.labels = {};
    this.disabled = false;
    this._selection = [];
  }

  /** Light DOM: the design-system styles of the page apply. */
  protected override createRenderRoot() {
    return this;
  }

  /** The currently resolved variant, or `null`. */
  get selectedVariant(): PltVariant | null {
    return findVariant(this._variants, this._selection);
  }

  /** Current selection as `{ name, value }` pairs. */
  get selectedOptions() {
    return toSelectedOptions(this._options, this._selection);
  }

  override connectedCallback() {
    super.connectedCallback();
    this._retireFallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    const dataChanged = changed.has("options") || changed.has("variants");
    if (dataChanged) {
      this._options = normalizeOptions(this.options);
      this._variants = normalizeVariants(this.variants);
    }
    if (!dataChanged && !changed.has("selectedVariantId")) return;

    const resolvedId = this.selectedVariant?.id ?? null;
    const requestedId = this.selectedVariantId ? String(this.selectedVariantId) : null;
    const keepSelection =
      requestedId === resolvedId && isSelectionValid(this._options, this._selection);
    if (!keepSelection) {
      this._selection = initialSelection(this._options, this._variants, requestedId);
    }
    // Normalize the reflected id to what the selection resolves to.
    const nextId = this.selectedVariant?.id ?? null;
    if (nextId !== this.selectedVariantId) this.selectedVariantId = nextId;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has("disabled")) this._retireFallback();
  }

  /** Hides and disables the no-JS fallback so it neither shows nor submits. */
  private _retireFallback() {
    for (const fallback of this.querySelectorAll<HTMLElement>(":scope > [data-plt-fallback]")) {
      fallback.hidden = true;
      for (const control of fallback.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "input, select, textarea, button",
      )) {
        control.disabled = true;
      }
    }
  }

  private _select(optionIndex: number, value: string) {
    if (this.disabled) return;
    const previousVariantId = this.selectedVariantId;
    this._selection = selectValue(this._variants, this._selection, optionIndex, value);
    const variant = this.selectedVariant;
    this.selectedVariantId = variant?.id ?? null;
    const detail: PltVariantChangeDetail = {
      variantId: variant?.id ?? null,
      variant,
      available: Boolean(variant?.available),
      selectedOptions: this.selectedOptions,
      previousVariantId,
    };
    this.dispatchEvent(
      new CustomEvent<PltVariantChangeDetail>(VARIANT_CHANGE_EVENT, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _labels(): Required<PltVariantPickerLabels> {
    return { ...DEFAULT_LABELS, ...(this.labels ?? {}) };
  }

  private _statusText(status: PltValueStatus): string {
    const labels = this._labels();
    if (status === "sold-out") return labels.soldOut;
    if (status === "unavailable") return labels.unavailable;
    return "";
  }

  private _announcement(): string {
    if (this._options.length === 0) return "";
    const summary = this._selection.filter(Boolean).join(" / ");
    const variant = this.selectedVariant;
    const status = !variant ? "unavailable" : variant.available ? "available" : "sold-out";
    const suffix = this._statusText(status);
    return suffix ? `${summary}, ${suffix}` : summary;
  }

  private _renderSwatch(value: PltOptionValue) {
    const swatch = value.swatch;
    if (!swatch?.color && !swatch?.image) return nothing;
    return html`<span
      class="plt-swatch plt-variant-picker__swatch"
      aria-hidden="true"
      style=${styleMap({ backgroundColor: swatch.color ?? undefined })}
      >${swatch.image ? html`<img src=${swatch.image} alt="" loading="lazy" />` : nothing}</span
    >`;
  }

  private _renderOption(option: NormalizedOption, optionIndex: number) {
    const groupName = `plt-variant-picker-${this._uid}-${optionIndex}`;
    const selected = this._selection[optionIndex] ?? "";
    const selectedLabel =
      option.values.find((value) => value.value === selected)?.label ?? selected;
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
              class="d-btn ${checked
                ? "d-btn-primary"
                : "d-btn-outline"} theme-bordered theme-label-bold plt-variant-picker__value"
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

  protected override render() {
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

declare global {
  interface HTMLElementTagNameMap {
    "plt-variant-picker": PltVariantPicker;
  }
  interface HTMLElementEventMap {
    "plt:variant-change": CustomEvent<PltVariantChangeDetail>;
  }
}
