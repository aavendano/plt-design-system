import { LitElement, type PropertyValues } from "lit";
import { type PltProductOption, type PltVariant, type PltVariantChangeDetail, type PltVariantPickerLabels } from "./types.js";
/**
 * `<plt-variant-picker>` — option/variant selector shared by every PLT frontend.
 *
 * Renders into light DOM so the daisyUI (`d-`), `theme-*` and `--plt-*` styles
 * of the host page apply unchanged and the hidden variant input takes part in
 * the surrounding `<form>`. Server-rendered children marked `data-plt-fallback`
 * (a plain `<select>`) keep the form usable without JavaScript and are hidden
 * and disabled once the element upgrades.
 *
 * @fires plt:variant-change - after the shopper changes the selection.
 */
export declare class PltVariantPicker extends LitElement {
    static properties: {
        options: {
            type: ArrayConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        variants: {
            type: ArrayConstructor;
            converter: {
                fromAttribute(value: string | null): any;
                toAttribute(value: unknown): string;
            };
        };
        selectedVariantId: {
            type: StringConstructor;
            attribute: string;
            reflect: boolean;
        };
        name: {
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
        disabled: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        _selection: {
            state: boolean;
        };
    };
    /** Product options with their values (positional). */
    options: PltProductOption[];
    /** Every purchasable combination the consumer supplies. */
    variants: PltVariant[];
    /** Selected variant id; `null` when the selection matches no variant. */
    selectedVariantId: string | null;
    /** Form field name of the hidden variant-id input (Shopify forms use `id`). */
    name: string;
    labels: PltVariantPickerLabels;
    disabled: boolean;
    private _selection;
    private _options;
    private _variants;
    private readonly _uid;
    constructor();
    /** Light DOM: the design-system styles of the page apply. */
    protected createRenderRoot(): this;
    /** The currently resolved variant, or `null`. */
    get selectedVariant(): PltVariant | null;
    /** Current selection as `{ name, value }` pairs. */
    get selectedOptions(): import("./types.js").PltSelectedOption[];
    connectedCallback(): void;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(changed: PropertyValues<this>): void;
    /** Hides and disables the no-JS fallback so it neither shows nor submits. */
    private _retireFallback;
    private _select;
    private _labels;
    private _statusText;
    private _announcement;
    private _renderSwatch;
    private _renderOption;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "plt-variant-picker": PltVariantPicker;
    }
    interface HTMLElementEventMap {
        "plt:variant-change": CustomEvent<PltVariantChangeDetail>;
    }
}
