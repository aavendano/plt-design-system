/**
 * Public contract of `<plt-variant-picker>`.
 *
 * The contract is platform-neutral: Liquid, Astro and React adapters normalize
 * their own product data into these shapes. Prices, inventory quantities and
 * cart state are deliberately absent — the consumer owns them.
 */

export interface PltOptionSwatch {
  /** Any CSS colour (`#ff0000`, `rgb(255 0 0)`, …). */
  color?: string | null;
  /** Absolute URL of a small swatch image. */
  image?: string | null;
}

export interface PltOptionValue {
  /** Raw value used for matching variants (e.g. `"M"`). */
  value: string;
  /** Visible label. Defaults to `value`. */
  label?: string;
  swatch?: PltOptionSwatch | null;
}

export interface PltProductOption {
  name: string;
  /** Plain strings are accepted and normalized to `{ value }`. */
  values: Array<PltOptionValue | string>;
}

export interface PltVariant {
  /** Stable identifier (Shopify GID or numeric id); compared as a string. */
  id: string;
  /** Option values, positional and aligned with `options`. */
  options: string[];
  /** Whether the variant can be purchased right now (snapshot). */
  available: boolean;
  title?: string;
}

export interface PltSelectedOption {
  name: string;
  value: string;
}

/**
 * Status of one option value, given the values selected in the other options.
 * - `available`: the combination exists and can be purchased.
 * - `sold-out`: the combination exists but is not available.
 * - `unavailable`: no variant has that combination.
 */
export type PltValueStatus = "available" | "sold-out" | "unavailable";

/** Localized strings. Every key is optional; English defaults apply. */
export interface PltVariantPickerLabels {
  soldOut?: string;
  unavailable?: string;
}

export interface PltVariantChangeDetail {
  /** Resolved variant id, or `null` when the combination does not exist. */
  variantId: string | null;
  variant: PltVariant | null;
  /** `true` only when a variant was resolved and it is available. */
  available: boolean;
  selectedOptions: PltSelectedOption[];
  previousVariantId: string | null;
}

export type PltVariantChangeEvent = CustomEvent<PltVariantChangeDetail>;

export const VARIANT_CHANGE_EVENT = "plt:variant-change";
