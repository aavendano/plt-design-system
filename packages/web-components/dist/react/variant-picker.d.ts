/**
 * React adapter for `<plt-variant-picker>` (React 18 and 19), built on the
 * generic `createComponent` bridge. It does not re-implement the picker.
 */
import { type ReactNode } from "react";
import { type BaseProps } from "./create.js";
import type { PltProductOption, PltVariant, PltVariantChangeDetail, PltVariantPickerLabels } from "../variant-picker/types.js";
export interface PltVariantPickerProps extends BaseProps {
    options: PltProductOption[];
    variants: PltVariant[];
    selectedVariantId?: string | null;
    /** Form field name of the variant id (default `id`). */
    name?: string;
    labels?: PltVariantPickerLabels;
    disabled?: boolean;
    /** Label of the no-JavaScript `<select>` fallback. */
    fallbackLabel?: string;
    onVariantChange?: (detail: PltVariantChangeDetail, event: CustomEvent<PltVariantChangeDetail>) => void;
    /** Replaces the default no-JavaScript fallback. Mark it `data-plt-fallback`. */
    children?: ReactNode;
}
export declare const PltVariantPicker: import("react").ForwardRefExoticComponent<PltVariantPickerProps & import("react").RefAttributes<HTMLElement>>;
