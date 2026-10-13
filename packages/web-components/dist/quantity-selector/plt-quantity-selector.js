import { LitElement, html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { clampQuantity } from "./quantity.js";
import {
  QUANTITY_CHANGE_EVENT
} from "./types.js";
const DEFAULT_LABELS = {
  decrease: "Decrease quantity",
  increase: "Increase quantity",
  quantity: "Quantity"
};
class PltQuantitySelector extends LitElement {
  constructor() {
    super();
    this._inputId = nextId("plt-quantity");
    this.value = 1;
    this.min = 1;
    this.max = null;
    this.step = 1;
    this.name = "quantity";
    this.disabled = false;
    this.labels = {};
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    retireFallback(this);
  }
  willUpdate(changed) {
    if (changed.has("value") || changed.has("min") || changed.has("max") || changed.has("step")) {
      this.value = clampQuantity(this.value, this._bounds());
    }
  }
  updated() {
    retireFallback(this);
  }
  _bounds() {
    return { min: this.min, max: this.max ?? null, step: this.step };
  }
  /** Sets the value as if the shopper had, clamping it and emitting the event. */
  setValue(raw) {
    const next = clampQuantity(raw, this._bounds());
    const previousValue = this.value;
    if (next === previousValue) {
      this.requestUpdate();
      return;
    }
    this.value = next;
    emit(this, QUANTITY_CHANGE_EVENT, { value: next, previousValue });
  }
  _step(direction) {
    if (this.disabled || this._atBound(direction)) return;
    this.setValue(this.value + direction * (this.step || 1));
  }
  _atBound(direction) {
    if (direction < 0) return this.value <= this.min;
    return this.max !== null && this.max !== void 0 && this.value >= this.max;
  }
  render() {
    const labels = { ...DEFAULT_LABELS, ...this.labels ?? {} };
    const button = (direction, label, glyph) => {
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
      ${button(-1, labels.decrease, "\u2212")}
      <input
        id=${this._inputId}
        class="d-input d-join-item"
        type="number"
        inputmode="numeric"
        name=${ifDefined(this.name || void 0)}
        aria-label=${labels.quantity}
        min=${this.min}
        max=${ifDefined(this.max ?? void 0)}
        step=${this.step}
        .value=${live(String(this.value))}
        ?disabled=${this.disabled}
        @change=${(event) => this.setValue(event.target.value)}
      />
      ${button(1, labels.increase, "+")}
    </div>`;
  }
}
PltQuantitySelector.properties = {
  value: { type: Number, reflect: true },
  min: { type: Number },
  max: { type: Number },
  step: { type: Number },
  name: { type: String },
  disabled: { type: Boolean, reflect: true },
  labels: { type: Object, converter: jsonConverter("plt-quantity-selector", () => ({})) }
};
export {
  PltQuantitySelector
};
