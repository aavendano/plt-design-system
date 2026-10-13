import { LitElement, type PropertyValues } from "lit";
import { type PltFilter, type PltFilterBarLabels } from "./types.js";
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
export declare class PltFilterBar extends LitElement {
    static properties: {
        filters: {
            type: ArrayConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        action: {
            type: StringConstructor;
        };
        method: {
            type: StringConstructor;
        };
        manual: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        labels: {
            type: ObjectConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        _values: {
            state: boolean;
        };
    };
    filters: PltFilter[];
    action: string;
    method: string;
    manual: boolean;
    labels: PltFilterBarLabels;
    private _values;
    private readonly _idPrefix;
    private _submitting;
    constructor();
    protected createRenderRoot(): this;
    connectedCallback(): void;
    /** Current non-empty values by filter id. */
    get values(): Record<string, string>;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(): void;
    get form(): HTMLFormElement | null;
    private _set;
    private _clear;
    /** Emits the change; submits the form unless cancelled or in manual mode. */
    private _commit;
    private _emit;
    private _onSubmit;
    private _onFormData;
    private _removeChip;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-filter-bar": PltFilterBar;
    }
}
