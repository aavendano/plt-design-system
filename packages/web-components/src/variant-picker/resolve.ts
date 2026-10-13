/**
 * Variant resolution: the single implementation of variant-selection logic.
 *
 * Pure functions, no DOM, no Lit, no platform imports. The Lit element and
 * every adapter rely on these; no adapter re-implements them.
 */
import type {
  PltOptionValue,
  PltProductOption,
  PltSelectedOption,
  PltValueStatus,
  PltVariant,
} from "./types.js";

export interface NormalizedOption {
  name: string;
  values: PltOptionValue[];
}

const asString = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

/** Accepts loosely typed platform data and returns well-formed options. */
export function normalizeOptions(raw: unknown): NormalizedOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((option): option is PltProductOption => Boolean(option) && typeof option === "object")
    .map((option) => ({
      name: asString(option.name),
      values: (Array.isArray(option.values) ? option.values : [])
        .map((value): PltOptionValue =>
          typeof value === "object" && value !== null
            ? {
                value: asString(value.value),
                label: value.label === undefined ? undefined : asString(value.label),
                swatch: value.swatch ?? null,
              }
            : { value: asString(value) },
        )
        .filter((value) => value.value !== ""),
    }));
}

/** Accepts loosely typed platform data and returns well-formed variants. */
export function normalizeVariants(raw: unknown): PltVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((variant): variant is PltVariant => Boolean(variant) && typeof variant === "object")
    .map((variant) => ({
      id: asString(variant.id),
      options: (Array.isArray(variant.options) ? variant.options : []).map(asString),
      available: variant.available === true,
      title: variant.title === undefined ? undefined : asString(variant.title),
    }))
    .filter((variant) => variant.id !== "");
}

function matches(variant: PltVariant, selection: readonly string[]): boolean {
  return selection.every((value, index) => asString(variant.options[index]) === value);
}

/** Exact match of a full selection, or `null`. */
export function findVariant(
  variants: readonly PltVariant[],
  selection: readonly string[],
): PltVariant | null {
  if (selection.length === 0) return null;
  return variants.find((variant) => matches(variant, selection)) ?? null;
}

export function findVariantById(
  variants: readonly PltVariant[],
  id: string | null | undefined,
): PltVariant | null {
  if (id === null || id === undefined || id === "") return null;
  const wanted = asString(id);
  return variants.find((variant) => variant.id === wanted) ?? null;
}

/**
 * Selection to show for a given variant id. Falls back to the first available
 * variant, then the first variant, then the first value of every option.
 */
export function initialSelection(
  options: readonly NormalizedOption[],
  variants: readonly PltVariant[],
  selectedVariantId?: string | null,
): string[] {
  const variant =
    findVariantById(variants, selectedVariantId) ??
    variants.find((candidate) => candidate.available) ??
    variants[0] ??
    null;
  return options.map((option, index) =>
    variant ? asString(variant.options[index]) : (option.values[0]?.value ?? ""),
  );
}

/** Status of `value` in option `optionIndex`, keeping the other selected values. */
export function valueStatus(
  variants: readonly PltVariant[],
  selection: readonly string[],
  optionIndex: number,
  value: string,
): PltValueStatus {
  const probe = [...selection];
  probe[optionIndex] = value;
  const variant = findVariant(variants, probe);
  if (!variant) return "unavailable";
  return variant.available ? "available" : "sold-out";
}

/**
 * Selection after the shopper picks `value` in option `optionIndex`.
 *
 * When the exact combination does not exist, the picked value is kept and the
 * other options move to the closest existing variant (most options in common,
 * available variants first). This lets shoppers reach every value instead of
 * disabling combinations they cannot see.
 */
export function selectValue(
  variants: readonly PltVariant[],
  selection: readonly string[],
  optionIndex: number,
  value: string,
): string[] {
  const probe = [...selection];
  probe[optionIndex] = value;
  if (findVariant(variants, probe)) return probe;

  let best: PltVariant | null = null;
  let bestScore = -1;
  for (const variant of variants) {
    if (asString(variant.options[optionIndex]) !== value) continue;
    let score = variant.available ? 1 : 0;
    selection.forEach((selected, index) => {
      if (index !== optionIndex && asString(variant.options[index]) === selected) score += 2;
    });
    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }
  return best ? probe.map((_, index) => asString(best!.options[index])) : probe;
}

export function toSelectedOptions(
  options: readonly NormalizedOption[],
  selection: readonly string[],
): PltSelectedOption[] {
  return options.map((option, index) => ({ name: option.name, value: selection[index] ?? "" }));
}

/** True when every selected value is one of the option's values. */
export function isSelectionValid(
  options: readonly NormalizedOption[],
  selection: readonly string[],
): boolean {
  return (
    selection.length === options.length &&
    options.every((option, index) => option.values.some((value) => value.value === selection[index]))
  );
}
