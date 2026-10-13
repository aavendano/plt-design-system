/**
 * Minimal React adapter for `<plt-variant-picker>` (React 18 and 19).
 *
 * It does not re-implement the picker: it renders the custom element, passes
 * array/object data as DOM properties, forwards `plt:variant-change` to a
 * callback and registers the element lazily on the client, so server rendering
 * never touches `customElements`.
 */
import { type ReactNode } from "react";
import type { PltProductOption, PltVariant, PltVariantChangeDetail, PltVariantPickerLabels } from "../variant-picker/types.js";
export interface PltVariantPickerProps {
    options: PltProductOption[];
    variants: PltVariant[];
    selectedVariantId?: string | null;
    /** Form field name of the variant id (default `id`). */
    name?: string;
    labels?: PltVariantPickerLabels;
    disabled?: boolean;
    /** Label of the no-JavaScript `<select>` fallback. */
    fallbackLabel?: string;
    className?: string;
    onVariantChange?: (detail: PltVariantChangeDetail, event: CustomEvent<PltVariantChangeDetail>) => void;
    /** Replaces the default no-JavaScript fallback. Mark it `data-plt-fallback`. */
    children?: ReactNode;
}
type PickerElement = HTMLElement & {
    options: PltProductOption[];
    variants: PltVariant[];
    labels: PltVariantPickerLabels;
    selectedVariantId: string | null;
    disabled: boolean;
};
export declare function PltVariantPicker({ options, variants, selectedVariantId, name, labels, disabled, fallbackLabel, className, onVariantChange, children, }: PltVariantPickerProps): import("react").ReactElement<{
    ref: import("react").RefObject<PickerElement | null>;
    name: string;
    "selected-variant-id": string | undefined;
    disabled: true | undefined;
    className: string | undefined;
    suppressHydrationWarning: boolean;
}, string | import("react").JSXElementConstructor<any>>;
export {};
