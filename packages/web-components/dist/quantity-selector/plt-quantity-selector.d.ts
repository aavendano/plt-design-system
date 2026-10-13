import { LitElement, type PropertyValues } from "lit";
import { type PltQuantitySelectorLabels } from "./types.js";
/**
 * `<plt-quantity-selector>` — − / number / + control (daisyUI `d-join`).
 *
 * The number input carries `name`, so the value submits with the surrounding
 * form. Buttons at a bound stay focusable (`aria-disabled`) so keyboard focus
 * is never lost. Children marked `data-plt-fallback` are the no-JS input.
 *
 * @fires plt:quantity-change - when the shopper changes the value.
 */
export declare class PltQuantitySelector extends LitElement {
    static properties: {
        value: {
            type: NumberConstructor;
            reflect: boolean;
        };
        min: {
            type: NumberConstructor;
        };
        max: {
            type: NumberConstructor;
        };
        step: {
            type: NumberConstructor;
        };
        name: {
            type: StringConstructor;
        };
        disabled: {
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
    };
    value: number;
    min: number;
    max: number | null;
    step: number;
    /** Form field name (`quantity`); empty string means no form field. */
    name: string;
    disabled: boolean;
    labels: PltQuantitySelectorLabels;
    private readonly _inputId;
    constructor();
    protected createRenderRoot(): this;
    connectedCallback(): void;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(): void;
    private _bounds;
    /** Sets the value as if the shopper had, clamping it and emitting the event. */
    setValue(raw: unknown): void;
    private _step;
    private _atBound;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-quantity-selector": PltQuantitySelector;
    }
}
