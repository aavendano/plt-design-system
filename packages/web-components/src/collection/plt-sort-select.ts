import { LitElement, html, nothing, type PropertyValues } from "lit";
import { live } from "lit/directives/live.js";
import { emit, jsonConverter, nextId, retireFallback } from "../shared/element.js";
import { SORT_CHANGE_EVENT, type PltChoice, type PltSortChangeDetail } from "./types.js";

/**
 * `<plt-sort-select>` — SortSelect anatomy inside a GET form.
 *
 * A change emits a cancelable `plt:sort-change`; if nobody cancels it the form
 * submits (normal navigation with `?{name}={value}`). Client-routed frontends
 * cancel it and navigate themselves. `manual` adds a submit button instead.
 *
 * @fires plt:sort-change - cancelable; `{ name, value }`
 */
export class PltSortSelect extends LitElement {
  static override properties = {
    options: { type: Array, converter: jsonConverter("plt-sort-select", () => []) },
    name: { type: String },
    label: { type: String },
    action: { type: String },
    method: { type: String },
    manual: { type: Boolean, reflect: true },
    applyLabel: { type: String, attribute: "apply-label" },
    _value: { state: true },
  };

  declare options: PltChoice[];
  declare name: string;
  declare label: string;
  declare action: string;
  declare method: string;
  declare manual: boolean;
  declare applyLabel: string;
  declare private _value: string;

  private readonly _id = nextId("plt-sort");

  constructor() {
    super();
    this.options = [];
    this.name = "sort";
    this.label = "Sort by";
    this.action = "";
    this.method = "get";
    this.manual = false;
    this.applyLabel = "Apply";
    this._value = "";
  }

  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    retireFallback(this);
  }

  get value(): string {
    return this._value;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has("options")) {
      const options = this.options ?? [];
      this._value = (options.find((option) => option.selected) ?? options[0])?.value ?? "";
    }
  }

  protected override updated() {
    retireFallback(this);
  }

  private _change(value: string) {
    this._value = value;
    const proceed = emit<PltSortChangeDetail>(this, SORT_CHANGE_EVENT, { name: this.name, value }, true);
    if (proceed && !this.manual) this.querySelector<HTMLFormElement>(":scope > form:not([data-plt-fallback])")?.requestSubmit();
  }

  protected override render() {
    return html`<form class="plt-sort-select" action=${this.action} method=${this.method || "get"}>
      <label class="theme-label-bold" for=${this._id}>${this.label}</label>
      <select
        class="d-select"
        id=${this._id}
        name=${this.name}
        .value=${live(this._value)}
        @change=${(event: Event) => this._change((event.target as HTMLSelectElement).value)}
      >
        ${(this.options ?? []).map(
          (option) => html`<option value=${option.value} ?selected=${option.value === this._value}>${option.label}</option>`,
        )}
      </select>
      ${this.manual
        ? html`<button class="d-btn d-btn-outline theme-bordered theme-label-bold" type="submit">${this.applyLabel}</button>`
        : nothing}
    </form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "plt-sort-select": PltSortSelect;
  }
}
