import { LitElement, html, nothing } from "lit";
import { live } from "lit/directives/live.js";
import { emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { SORT_CHANGE_EVENT } from "./types.js";
class PltSortSelect extends LitElement {
  constructor() {
    super();
    this._id = nextId("plt-sort");
    this.options = [];
    this.name = "sort";
    this.label = "Sort by";
    this.action = "";
    this.method = "get";
    this.manual = false;
    this.applyLabel = "Apply";
    this._value = "";
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    retireFallback(this);
  }
  get value() {
    return this._value;
  }
  willUpdate(changed) {
    if (changed.has("options")) {
      const options = this.options ?? [];
      this._value = (options.find((option) => option.selected) ?? options[0])?.value ?? "";
    }
  }
  updated() {
    retireFallback(this);
  }
  _change(value) {
    this._value = value;
    const proceed = emit(this, SORT_CHANGE_EVENT, { name: this.name, value }, true);
    if (proceed && !this.manual) this.querySelector(":scope > form:not([data-plt-fallback])")?.requestSubmit();
  }
  render() {
    return html`<form class="plt-sort-select" action=${this.action} method=${this.method || "get"}>
      <label class="theme-label-bold" for=${this._id}>${this.label}</label>
      <select
        class="d-select"
        id=${this._id}
        name=${this.name}
        .value=${live(this._value)}
        @change=${(event) => this._change(event.target.value)}
      >
        ${(this.options ?? []).map(
      (option) => html`<option value=${option.value} ?selected=${option.value === this._value}>${option.label}</option>`
    )}
      </select>
      ${this.manual ? html`<button class="d-btn d-btn-outline theme-bordered theme-label-bold" type="submit">${this.applyLabel}</button>` : nothing}
    </form>`;
  }
}
PltSortSelect.properties = {
  options: { type: Array, converter: jsonConverter("plt-sort-select", () => []) },
  name: { type: String },
  label: { type: String },
  action: { type: String },
  method: { type: String },
  manual: { type: Boolean, reflect: true },
  applyLabel: { type: String, attribute: "apply-label" },
  _value: { state: true }
};
export {
  PltSortSelect
};
