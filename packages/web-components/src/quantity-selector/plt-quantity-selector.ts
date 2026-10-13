import { LitElement, html, type PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { clampQuantity } from "./quantity.js";
import {
  QUANTITY_CHANGE_EVENT,
  type PltQuantityChangeDetail,
  type PltQuantitySelectorLabels,
} from "./types.js";

const DEFAULT_LABELS: Required<PltQuantitySelectorLabels> = {
  decrease: "Decrease quantity",
  increase: "Increase quantity",
  quantity: "Quantity",
};

/**
 * `<plt-quantity-selector>` — − / number / + control (daisyUI `d-join`).
 *
 * The number input carries `name`, so the value submits with the surrounding
 * form. Buttons at a bound stay focusable (`aria-disabled`) so keyboard focus
 * is never lost. Children marked `data-plt-fallback` are the no-JS input.
 *
 * @fires plt:quantity-change - when the shopper changes the value.
 */
export class PltQuantitySelector extends LitElement {
  static override properties = {
    value: { type: Number, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
    labels: { type: Object, converter: jsonConverter("plt-quantity-selector", () => ({})) },
  };

  declare value: number;
  declare min: number;
  declare max: number | null;
  declare step: number;
  /** Form field name (`quantity`); empty string means no form field. */
  declare name: string;
  declare disabled: boolean;
  declare labels: PltQuantitySelectorLabels;

  private readonly _inputId = nextId("plt-quantity");

  constructor() {
    super();
    this.value = 1;
    this.min = 1;
    this.max = null;
    this.step = 1;
    this.name = "quantity";
    this.disabled = false;
    this.labels = {};
  }

  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    retireFallback(this);
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has("value") || changed.has("min") || changed.has("max") || changed.has("step")) {
      this.value = clampQuantity(this.value, this._bounds());
    }
  }

  protected override updated() {
    retireFallback(this);
  }

  private _bounds() {
    return { min: this.min, max: this.max ?? null, step: this.step };
  }

  /** Sets the value as if the shopper had, clamping it and emitting the event. */
  setValue(raw: unknown) {
    const next = clampQuantity(raw, this._bounds());
    const previousValue = this.value;
    if (next === previousValue) {
      this.requestUpdate(); // re-render to normalize what the shopper typed
      return;
    }
    this.value = next;
    emit<PltQuantityChangeDetail>(this, QUANTITY_CHANGE_EVENT, { value: next, previousValue });
  }

  private _step(direction: 1 | -1) {
    if (this.disabled || this._atBound(direction)) return;
    this.setValue(this.value + direction * (this.step || 1));
  }

  private _atBound(direction: 1 | -1) {
    if (direction < 0) return this.value <= this.min;
    return this.max !== null && this.max !== undefined && this.value >= this.max;
  }

  protected override render() {
    const labels = { ...DEFAULT_LABELS, ...(this.labels ?? {}) };
    const button = (direction: 1 | -1, label: string, glyph: string) => {
      const blocked = this.disabled || this._atBound(direction);
      return html`<button
        type="button"
        class="d-btn d-btn-outline d-join-item theme-bordered ${blocked ? "d-btn-disabled" : ""}"
        aria-label=${label}
        aria-controls=${this._inputId}
        aria-disabled=${blocked ? "true" : "false"}
        @click=${() => this._step(direction)}
      >
        <span aria-hidden="true">${glyph}</span>
      </button>`;
    };
    return html`<div class="d-join plt-quantity-selector">
      ${button(-1, labels.decrease, "−")}
      <input
        id=${this._inputId}
        class="d-input d-join-item"
        type="number"
        inputmode="numeric"
        name=${ifDefined(this.name || undefined)}
        aria-label=${labels.quantity}
        min=${this.min}
        max=${ifDefined(this.max ?? undefined)}
        step=${this.step}
        .value=${live(String(this.value))}
        ?disabled=${this.disabled}
        @change=${(event: Event) => this.setValue((event.target as HTMLInputElement).value)}
      />
      ${button(1, labels.increase, "+")}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "plt-quantity-selector": PltQuantitySelector;
  }
}
