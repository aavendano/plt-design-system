import { LitElement, html, nothing } from "lit";
import { live } from "lit/directives/live.js";
import { byId, emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { activeFilters, nonEmptyValues, preservedEntries, selectedValues, toQuery } from "./params.js";
import {
  FILTER_CHANGE_EVENT
} from "./types.js";
const DEFAULT_LABELS = {
  apply: "Apply",
  active: "Active filters",
  clear: "Clear all",
  remove: "Remove filter"
};
class PltFilterBar extends LitElement {
  constructor() {
    super();
    this._idPrefix = nextId("plt-filter");
    this._submitting = false;
    this.filters = [];
    this.action = "";
    this.method = "get";
    this.manual = false;
    this.orientation = "horizontal";
    this.labels = {};
    this.preserve = {};
    this._values = {};
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    retireFallback(this);
  }
  /** Current non-empty values by filter id. */
  get values() {
    return nonEmptyValues(this._values);
  }
  willUpdate(changed) {
    if (changed.has("filters")) this._values = selectedValues(this.filters ?? []);
  }
  updated() {
    retireFallback(this);
  }
  get form() {
    return this.querySelector(":scope > form.plt-filter-bar:not([data-plt-fallback])");
  }
  _set(id, value) {
    this._values = { ...this._values, [id]: value };
    this._commit(id);
  }
  /** Checks or unchecks one value of a `multiple` filter. */
  _toggle(id, value, on) {
    const current = this._list(id).filter((item) => item !== value);
    this._values = { ...this._values, [id]: on ? [...current, value] : current };
    this._commit(id);
  }
  _list(id) {
    const value = this._values[id];
    return Array.isArray(value) ? value : value ? [value] : [];
  }
  _clear() {
    this._values = Object.fromEntries(
      (this.filters ?? []).map((filter) => [filter.id, filter.multiple ? [] : ""])
    );
    this._commit(null);
  }
  /**
   * Emits the change; submits the form unless cancelled or in manual mode. The
   * submit waits for the render so the form holds the new state: a chip or
   * "clear all" changes `_values`, and the controls follow on the next update.
   */
  async _commit(changed) {
    const proceed = this._emit(changed);
    if (!proceed || this.manual) return;
    await this.updateComplete;
    this._submitting = true;
    try {
      this.form?.requestSubmit();
    } finally {
      this._submitting = false;
    }
  }
  _emit(changed) {
    return emit(
      this,
      FILTER_CHANGE_EVENT,
      { values: this.values, changed, query: toQuery(this._values) },
      true
    );
  }
  _onSubmit(event) {
    if (this._submitting) return;
    if (!this._emit(null)) event.preventDefault();
  }
  _onFormData(event) {
    for (const filter of this.filters ?? []) {
      if (!filter.multiple && !this._values[filter.id]) event.formData.delete(filter.id);
    }
  }
  async _removeChip(id, value) {
    const filter = (this.filters ?? []).find((candidate) => candidate.id === id);
    if (filter?.multiple) this._toggle(id, value, false);
    else this._set(id, "");
    await this.updateComplete;
    const control = filter?.multiple ? [...this.querySelectorAll("input[type=checkbox]")].find((input) => input.name === id && input.value === value) : byId(this, `${this._idPrefix}-${id}`);
    control?.focus();
  }
  _renderField(filter) {
    if (!filter.multiple) {
      return html`<div class="plt-filter-bar__field">
        <label class="theme-label-bold" for=${`${this._idPrefix}-${filter.id}`}>${filter.label}</label>
        <select
          class="d-select"
          id=${`${this._idPrefix}-${filter.id}`}
          name=${filter.id}
          .value=${live(this._values[filter.id] ?? "")}
          @change=${(event) => this._set(filter.id, event.target.value)}
        >
          ${filter.options.map(
        (option) => html`<option value=${option.value} ?selected=${option.value === (this._values[filter.id] ?? "")}>${option.label}</option>`
      )}
        </select>
      </div>`;
    }
    const selected = this._list(filter.id);
    return html`<fieldset class="plt-filter-bar__field plt-filter-bar__group">
      <legend class="theme-label-bold">${filter.label}</legend>
      <ul class="plt-filter-bar__options">
        ${filter.options.filter((option) => option.value !== "").map(
      (option) => html`<li>
              <label class="plt-filter-bar__option">
                <input
                  type="checkbox"
                  class="d-checkbox d-checkbox-primary"
                  name=${filter.id}
                  value=${option.value}
                  .checked=${live(selected.includes(option.value))}
                  @change=${(event) => this._toggle(filter.id, option.value, event.target.checked)}
                />
                <span class="theme-label-bold">${option.label}${option.count != null ? html` <span class="theme-meta">(${option.count})</span>` : nothing}</span>
              </label>
            </li>`
    )}
      </ul>
    </fieldset>`;
  }
  render() {
    const labels = { ...DEFAULT_LABELS, ...this.labels ?? {} };
    const filters = this.filters ?? [];
    const active = activeFilters(filters, this._values);
    return html`<form
        class="plt-filter-bar"
        action=${this.action}
        method=${this.method || "get"}
        @submit=${(event) => this._onSubmit(event)}
        @formdata=${(event) => this._onFormData(event)}
      >
        ${preservedEntries(this.preserve).map(([name, value]) => html`<input type="hidden" name=${name} value=${value} />`)}
        ${filters.map((filter) => this._renderField(filter))}
        ${this.manual ? html`<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" type="submit">${labels.apply}</button>` : nothing}
      </form>
      ${active.length ? html`<div class="plt-filter-bar__active" role="group" aria-label=${labels.active}>
            <ul class="plt-filter-bar__chips">
              ${active.map(
      (item) => html`<li>
                  <button
                    type="button"
                    class="d-btn d-btn-sm d-btn-outline theme-bordered theme-label-bold"
                    aria-label=${`${labels.remove}: ${item.label} ${item.valueLabel}`}
                    @click=${() => this._removeChip(item.id, item.value)}
                  >${item.label}: ${item.valueLabel} <span aria-hidden="true">×</span></button>
                </li>`
    )}
            </ul>
            <button type="button" class="d-btn d-btn-sm d-btn-ghost theme-label-bold" @click=${() => this._clear()}>${labels.clear}</button>
          </div>` : nothing}`;
  }
}
PltFilterBar.properties = {
  filters: { type: Array, converter: jsonConverter("plt-filter-bar", () => []) },
  action: { type: String },
  method: { type: String },
  manual: { type: Boolean, reflect: true },
  orientation: { type: String, reflect: true },
  labels: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
  preserve: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
  _values: { state: true }
};
export {
  PltFilterBar
};
