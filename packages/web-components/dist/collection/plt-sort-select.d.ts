import { LitElement, type PropertyValues } from "lit";
import { type PltChoice, type PltPreserved } from "./types.js";
/**
 * `<plt-sort-select>` — SortSelect anatomy inside a GET form.
 *
 * A change emits a cancelable `plt:sort-change`; if nobody cancels it the form
 * submits (normal navigation with `?{name}={value}`). Client-routed frontends
 * cancel it and navigate themselves. `manual` adds a submit button instead.
 * `preserve` carries query parameters that another control owns (the active
 * filters, say) as hidden inputs, so a native submit keeps them.
 *
 * @fires plt:sort-change - cancelable; `{ name, value }`
 */
export declare class PltSortSelect extends LitElement {
    static properties: {
        options: {
            type: ArrayConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        name: {
            type: StringConstructor;
        };
        label: {
            type: StringConstructor;
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
        applyLabel: {
            type: StringConstructor;
            attribute: string;
        };
        preserve: {
            type: ObjectConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        _value: {
            state: boolean;
        };
    };
    options: PltChoice[];
    name: string;
    label: string;
    action: string;
    method: string;
    manual: boolean;
    applyLabel: string;
    preserve: PltPreserved;
    private _value;
    private readonly _id;
    constructor();
    protected createRenderRoot(): this;
    connectedCallback(): void;
    get value(): string;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(): void;
    private _change;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-sort-select": PltSortSelect;
    }
}
