import { LitElement, type PropertyValues } from "lit";
import { type PltFilter, type PltFilterBarLabels, type PltFilterValue, type PltPreserved } from "./types.js";
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
        orientation: {
            type: StringConstructor;
            reflect: boolean;
        };
        labels: {
            type: ObjectConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        preserve: {
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
    orientation: "horizontal" | "vertical";
    labels: PltFilterBarLabels;
    preserve: PltPreserved;
    private _values;
    private readonly _idPrefix;
    private _submitting;
    constructor();
    protected createRenderRoot(): this;
    connectedCallback(): void;
    /** Current non-empty values by filter id. */
    get values(): Record<string, PltFilterValue>;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(): void;
    get form(): HTMLFormElement | null;
    private _set;
    /** Checks or unchecks one value of a `multiple` filter. */
    private _toggle;
    private _list;
    private _clear;
    /**
     * Emits the change; submits the form unless cancelled or in manual mode. The
     * submit waits for the render so the form holds the new state: a chip or
     * "clear all" changes `_values`, and the controls follow on the next update.
     */
    private _commit;
    private _emit;
    private _onSubmit;
    private _onFormData;
    private _removeChip;
    private _renderField;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-filter-bar": PltFilterBar;
    }
}
