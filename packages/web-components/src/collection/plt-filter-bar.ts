import { LitElement, html, nothing, type PropertyValues } from "lit";
import { live } from "lit/directives/live.js";
import { byId, emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { activeFilters, nonEmptyValues, selectedValues, toQuery } from "./params.js";
import {
  FILTER_CHANGE_EVENT,
  type PltFilter,
  type PltFilterBarLabels,
  type PltFilterChangeDetail,
} from "./types.js";

const DEFAULT_LABELS: Required<PltFilterBarLabels> = {
  apply: "Apply",
  active: "Active filters",
  clear: "Clear all",
  remove: "Remove filter",
};

/**
 * `<plt-filter-bar>` — FilterBar anatomy (a GET form of `d-select`s) plus
 * active-filter chips and "clear all".
 *
 * Every change emits a cancelable `plt:filter-change`. If nobody cancels it,
 * the form submits (a normal navigation with the filters as query
 * parameters, empty ones omitted). A frontend with client routing cancels the
 * event and navigates itself. `manual` shows an Apply button instead of
 * submitting on each change.
 *
 * @fires plt:filter-change - cancelable; `{ values, changed, query }`
 */
export class PltFilterBar extends LitElement {
  static override properties = {
    filters: { type: Array, converter: jsonConverter("plt-filter-bar", () => []) },
    action: { type: String },
    method: { type: String },
    manual: { type: Boolean, reflect: true },
    labels: { type: Object, converter: jsonConverter("plt-filter-bar", () => ({})) },
    _values: { state: true },
  };

  declare filters: PltFilter[];
  declare action: string;
  declare method: string;
  declare manual: boolean;
  declare labels: PltFilterBarLabels;
  declare private _values: Record<string, string>;

  private readonly _idPrefix = nextId("plt-filter");
  private _submitting = false;

  constructor() {
    super();
    this.filters = [];
    this.action = "";
    this.method = "get";
    this.manual = false;
    this.labels = {};
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
  get values(): Record<string, string> {
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

  private _clear() {
    this._values = Object.fromEntries(Object.keys(this._values).map((id) => [id, ""]));
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
      if (!this._values[filter.id]) event.formData.delete(filter.id);
    }
  }

  private async _removeChip(id: string) {
    this._set(id, "");
    await this.updateComplete;
    byId<HTMLSelectElement>(this, `${this._idPrefix}-${id}`)?.focus();
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
        ${filters.map(
          (filter) => html`<div class="plt-filter-bar__field">
            <label class="theme-label-bold" for=${`${this._idPrefix}-${filter.id}`}>${filter.label}</label>
            <select
              class="d-select"
              id=${`${this._idPrefix}-${filter.id}`}
              name=${filter.id}
              .value=${live(this._values[filter.id] ?? "")}
              @change=${(event: Event) => this._set(filter.id, (event.target as HTMLSelectElement).value)}
            >
              ${filter.options.map(
                (option) => html`<option value=${option.value} ?selected=${option.value === (this._values[filter.id] ?? "")}>${option.label}</option>`,
              )}
            </select>
          </div>`,
        )}
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
                    @click=${() => this._removeChip(item.id)}
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
