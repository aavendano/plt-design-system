import { LitElement, html, nothing, type PropertyValues } from "lit";
import { live } from "lit/directives/live.js";
import { byId, emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { activeFilters, nonEmptyValues, preservedEntries, selectedValues, toQuery } from "./params.js";
import {
  FILTER_CHANGE_EVENT,
  type PltFilter,
  type PltFilterBarLabels,
  type PltFilterChangeDetail,
  type PltFilterValue,
  type PltPreserved,
} from "./types.js";

const DEFAULT_LABELS: Required<PltFilterBarLabels> = {
  apply: "Apply",
  active: "Active filters",
  clear: "Clear all",
  remove: "Remove filter",
};

/**
 * `<plt-filter-bar>` — FilterBar anatomy (a GET form of `d-select`s) plus
 * active-filter chips and "clear all". A filter marked `multiple` renders a
 * checkbox group (with optional per-option counts) and may send several
 * values under its name.
 *
 * Every change emits a cancelable `plt:filter-change`. If nobody cancels it,
 * the form submits (a normal navigation with the filters as query
 * parameters, empty ones omitted). A frontend with client routing cancels the
 * event and navigates itself. `manual` shows an Apply button instead of
 * submitting on each change. `preserve` carries query parameters that another
 * control owns (the sort order, say) as hidden inputs, so a native submit
 * keeps them; `orientation="vertical"` stacks the controls for a sidebar.
 *
 * @fires plt:filter-change - cancelable; `{ values, changed, query }`
 */
export class PltFilterBar extends LitElement {
  static override properties = {
    filters: { type: Array, converter: jsonConverter("plt-filter-bar", () => []) },
    action: { type: String },
    method: { type: String },
    manual: { type: Boolean, reflect: true },
    orientation: { type: String, reflect: true },
    labels: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
    preserve: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
    _values: { state: true },
  };

  declare filters: PltFilter[];
  declare action: string;
  declare method: string;
  declare manual: boolean;
  declare orientation: "horizontal" | "vertical";
  declare labels: PltFilterBarLabels;
  declare preserve: PltPreserved;
  declare private _values: Record<string, PltFilterValue>;

  private readonly _idPrefix = nextId("plt-filter");
  private _submitting = false;

  constructor() {
    super();
    this.filters = [];
    this.action = "";
    this.method = "get";
    this.manual = false;
    this.orientation = "horizontal";
    this.labels = {};
    this.preserve = {};
    this._values = {};
  }

  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    retireFallback(this);
  }

  /** Current non-empty values by filter id. */
  get values(): Record<string, PltFilterValue> {
    return nonEmptyValues(this._values);
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has("filters")) this._values = selectedValues(this.filters ?? []);
  }

  protected override updated() {
    retireFallback(this);
  }

  get form(): HTMLFormElement | null {
    return this.querySelector(":scope > form.plt-filter-bar:not([data-plt-fallback])");
  }

  private _set(id: string, value: string) {
    this._values = { ...this._values, [id]: value };
    this._commit(id);
  }

  /** Checks or unchecks one value of a `multiple` filter. */
  private _toggle(id: string, value: string, on: boolean) {
    const current = this._list(id).filter((item) => item !== value);
    this._values = { ...this._values, [id]: on ? [...current, value] : current };
    this._commit(id);
  }

  private _list(id: string): string[] {
    const value = this._values[id];
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  private _clear() {
    this._values = Object.fromEntries(
      (this.filters ?? []).map((filter) => [filter.id, filter.multiple ? [] : ""]),
    );
    this._commit(null);
  }

  /** Emits the change; submits the form unless cancelled or in manual mode. */
  private _commit(changed: string | null) {
    const proceed = this._emit(changed);
    if (proceed && !this.manual) {
      this._submitting = true;
      try {
        this.form?.requestSubmit();
      } finally {
        this._submitting = false;
      }
    }
  }

  private _emit(changed: string | null): boolean {
    return emit<PltFilterChangeDetail>(
      this,
      FILTER_CHANGE_EVENT,
      { values: this.values, changed, query: toQuery(this._values) },
      true,
    );
  }

  private _onSubmit(event: SubmitEvent) {
    if (this._submitting) return; // already announced by _commit
    if (!this._emit(null)) event.preventDefault();
  }

  private _onFormData(event: FormDataEvent) {
    // Omit "any" values so URLs stay clean (?color=red, not ?color=red&size=).
    for (const filter of this.filters ?? []) {
      if (!filter.multiple && !this._values[filter.id]) event.formData.delete(filter.id);
    }
  }

  private async _removeChip(id: string, value: string) {
    const filter = (this.filters ?? []).find((candidate) => candidate.id === id);
    if (filter?.multiple) this._toggle(id, value, false);
    else this._set(id, "");
    await this.updateComplete;
    // Return focus to the control the chip stood for.
    const control = filter?.multiple
      ? [...this.querySelectorAll<HTMLInputElement>("input[type=checkbox]")].find((input) => input.name === id && input.value === value)
      : byId<HTMLSelectElement>(this, `${this._idPrefix}-${id}`);
    control?.focus();
  }

  private _renderField(filter: PltFilter) {
    if (!filter.multiple) {
      return html`<div class="plt-filter-bar__field">
        <label class="theme-label-bold" for=${`${this._idPrefix}-${filter.id}`}>${filter.label}</label>
        <select
          class="d-select"
          id=${`${this._idPrefix}-${filter.id}`}
          name=${filter.id}
          .value=${live((this._values[filter.id] as string) ?? "")}
          @change=${(event: Event) => this._set(filter.id, (event.target as HTMLSelectElement).value)}
        >
          ${filter.options.map(
            (option) => html`<option value=${option.value} ?selected=${option.value === ((this._values[filter.id] as string) ?? "")}>${option.label}</option>`,
          )}
        </select>
      </div>`;
    }
    const selected = this._list(filter.id);
    return html`<fieldset class="plt-filter-bar__field plt-filter-bar__group">
      <legend class="theme-label-bold">${filter.label}</legend>
      <ul class="plt-filter-bar__options">
        ${filter.options
          .filter((option) => option.value !== "")
          .map(
            (option) => html`<li>
              <label class="plt-filter-bar__option">
                <input
                  type="checkbox"
                  class="d-checkbox d-checkbox-primary"
                  name=${filter.id}
                  value=${option.value}
                  .checked=${live(selected.includes(option.value))}
                  @change=${(event: Event) => this._toggle(filter.id, option.value, (event.target as HTMLInputElement).checked)}
                />
                <span class="theme-label-bold">${option.label}${option.count != null ? html` <span class="theme-meta">(${option.count})</span>` : nothing}</span>
              </label>
            </li>`,
          )}
      </ul>
    </fieldset>`;
  }

  protected override render() {
    const labels = { ...DEFAULT_LABELS, ...(this.labels ?? {}) };
    const filters = this.filters ?? [];
    const active = activeFilters(filters, this._values);
    return html`<form
        class="plt-filter-bar"
        action=${this.action}
        method=${this.method || "get"}
        @submit=${(event: SubmitEvent) => this._onSubmit(event)}
        @formdata=${(event: FormDataEvent) => this._onFormData(event)}
      >
        ${preservedEntries(this.preserve).map(([name, value]) => html`<input type="hidden" name=${name} value=${value} />`)}
        ${filters.map((filter) => this._renderField(filter))}
        ${this.manual
          ? html`<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" type="submit">${labels.apply}</button>`
          : nothing}
      </form>
      ${active.length
        ? html`<div class="plt-filter-bar__active" role="group" aria-label=${labels.active}>
            <ul class="plt-filter-bar__chips">
              ${active.map(
                (item) => html`<li>
                  <button
                    type="button"
                    class="d-btn d-btn-sm d-btn-outline theme-bordered theme-label-bold"
                    aria-label=${`${labels.remove}: ${item.label} ${item.valueLabel}`}
                    @click=${() => this._removeChip(item.id, item.value)}
                  >${item.label}: ${item.valueLabel} <span aria-hidden="true">×</span></button>
                </li>`,
              )}
            </ul>
            <button type="button" class="d-btn d-btn-sm d-btn-ghost theme-label-bold" @click=${() => this._clear()}>${labels.clear}</button>
          </div>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "plt-filter-bar": PltFilterBar;
  }
}
