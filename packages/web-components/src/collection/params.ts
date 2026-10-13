/** Pure helpers for collection controls. */
import type { PltFilter } from "./types.js";

/** Selected value per filter (first `selected` option, else ""). */
export function selectedValues(filters: readonly PltFilter[]): Record<string, string> {
  return Object.fromEntries(
    filters.map((filter) => [filter.id, filter.options.find((option) => option.selected)?.value ?? ""]),
  );
}

/** Values without empty entries, in filter order. */
export function nonEmptyValues(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value != null));
}

/** Query string for the non-empty values (no leading `?`). */
export function toQuery(values: Record<string, string>): string {
  return new URLSearchParams(nonEmptyValues(values)).toString();
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  valueLabel: string;
}

/** Applied filters with display labels, for the active-filter chips. */
export function activeFilters(filters: readonly PltFilter[], values: Record<string, string>): ActiveFilter[] {
  return filters.flatMap((filter) => {
    const value = values[filter.id] ?? "";
    if (!value) return [];
    const option = filter.options.find((candidate) => candidate.value === value);
    return [{ id: filter.id, label: filter.label, value, valueLabel: option?.label ?? value }];
  });
}
