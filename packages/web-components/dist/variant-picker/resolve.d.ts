/**
 * Variant resolution: the single implementation of variant-selection logic.
 *
 * Pure functions, no DOM, no Lit, no platform imports. The Lit element and
 * every adapter rely on these; no adapter re-implements them.
 */
import type { PltOptionValue, PltSelectedOption, PltValueStatus, PltVariant } from "./types.js";
export interface NormalizedOption {
    name: string;
    values: PltOptionValue[];
}
/** Accepts loosely typed platform data and returns well-formed options. */
export declare function normalizeOptions(raw: unknown): NormalizedOption[];
/** Accepts loosely typed platform data and returns well-formed variants. */
export declare function normalizeVariants(raw: unknown): PltVariant[];
/** Exact match of a full selection, or `null`. */
export declare function findVariant(variants: readonly PltVariant[], selection: readonly string[]): PltVariant | null;
export declare function findVariantById(variants: readonly PltVariant[], id: string | null | undefined): PltVariant | null;
/**
 * Selection to show for a given variant id. Falls back to the first available
 * variant, then the first variant, then the first value of every option.
 */
export declare function initialSelection(options: readonly NormalizedOption[], variants: readonly PltVariant[], selectedVariantId?: string | null): string[];
/** Status of `value` in option `optionIndex`, keeping the other selected values. */
export declare function valueStatus(variants: readonly PltVariant[], selection: readonly string[], optionIndex: number, value: string): PltValueStatus;
/**
 * Selection after the shopper picks `value` in option `optionIndex`.
 *
 * When the exact combination does not exist, the picked value is kept and the
 * other options move to the closest existing variant (most options in common,
 * available variants first). This lets shoppers reach every value instead of
 * disabling combinations they cannot see.
 */
export declare function selectValue(variants: readonly PltVariant[], selection: readonly string[], optionIndex: number, value: string): string[];
export declare function toSelectedOptions(options: readonly NormalizedOption[], selection: readonly string[]): PltSelectedOption[];
/** True when every selected value is one of the option's values. */
export declare function isSelectionValid(options: readonly NormalizedOption[], selection: readonly string[]): boolean;
