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
  remove: "Remove filter",
  min: "Min",
  max: "Max"
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
    this.hideChips = false;
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
  /** Sets one bound of a `range` filter; an empty or non-numeric entry clears it. */
  _setBound(name, raw) {
    const value = raw.trim();
    this._values = { ...this._values, [name]: value !== "" && Number.isFinite(Number(value)) ? value : "" };
    this._commit(name);
  }
  _clear() {
    this._values = Object.fromEntries(
      Object.entries(this._values).map(([name, value]) => [name, Array.isArray(value) ? [] : ""])
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
      if (filter.range) {
        for (const bound of [filter.range.min, filter.range.max]) {
          if (!this._values[bound.name]) event.formData.delete(bound.name);
        }
      } else if (!filter.multiple && !this._values[filter.id]) event.formData.delete(filter.id);
    }
  }
  async _removeChip(id, value) {
    const filters = this.filters ?? [];
    const filter = filters.find((candidate) => candidate.id === id);
    const isBound = filters.some((candidate) => candidate.range && [candidate.range.min.name, candidate.range.max.name].includes(id));
    if (isBound) this._setBound(id, "");
    else if (filter?.multiple) this._toggle(id, value, false);
    else this._set(id, "");
    await this.updateComplete;
    const scope = this.form ?? this;
    const control = isBound ? [...scope.querySelectorAll("input[type=number]")].find((input) => input.name === id) : filter?.multiple ? [...scope.querySelectorAll("input[type=checkbox]")].find((input) => input.name === id && input.value === value) : byId(scope, `${this._idPrefix}-${id}`);
    control?.focus();
  }
  _hasValue(filter) {
    const names = filter.range ? [filter.range.min.name, filter.range.max.name] : [filter.id];
    return names.some((name) => {
      const value = this._values[name];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });
  }
  _renderField(filter) {
    const field = this._renderControl(filter);
    if (!filter.collapsible) return field;
    return html`<details class="plt-filter-bar__details" ?open=${filter.open ?? this._hasValue(filter)}>
      <summary class="theme-label-bold">${filter.label}</summary>
      ${field}
    </details>`;
  }
  _renderRange(filter, labels) {
    const range = filter.range;
    const bound = (item, fallback) => html`<input
      class="d-input d-input-sm"
      type="number"
      inputmode="decimal"
      min="0"
      step="any"
      name=${item.name}
      placeholder=${item.placeholder ?? ""}
      aria-label=${item.label ?? `${filter.label} ${fallback}`}
      .value=${live(this._values[item.name] ?? "")}
      @change=${(event) => this._setBound(item.name, event.target.value)}
    />`;
    return html`<fieldset class="plt-filter-bar__field plt-filter-bar__range" aria-label=${filter.collapsible ? filter.label : nothing}>
      ${filter.collapsible ? nothing : html`<legend class="theme-label-bold">${filter.label}</legend>`}
      <div class="plt-filter-bar__bounds">${bound(range.min, labels.min)} ${bound(range.max, labels.max)}</div>
    </fieldset>`;
  }
  _renderControl(filter) {
    if (filter.range) return this._renderRange(filter, { ...DEFAULT_LABELS, ...this.labels ?? {} });
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
    return html`<fieldset class="plt-filter-bar__field plt-filter-bar__group" aria-label=${filter.collapsible ? filter.label : nothing}>
      ${filter.collapsible ? nothing : html`<legend class="theme-label-bold">${filter.label}</legend>`}
      <ul class="plt-filter-bar__options">
        ${filter.options.filter((option) => option.value !== "").map(
      (option) => html`<li>
              <label class="plt-filter-bar__option">
                <input
                  type="checkbox"
                  class="d-checkbox d-checkbox-primary"
                  name=${filter.id}
                  value=${option.value}
                  ?disabled=${option.disabled && !selected.includes(option.value)}
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
    const active = this.hideChips ? [] : activeFilters(filters, this._values, { min: labels.min, max: labels.max });
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
  hideChips: { type: Boolean, attribute: "hide-chips", reflect: true },
  labels: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
  preserve: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
  _values: { state: true }
};
export {
  PltFilterBar
};
