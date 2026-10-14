/** Pure helpers for collection controls. */
import type { PltFilter, PltFilterValue, PltPreserved } from "./types.js";

/** Non-empty option values selected in a filter, in option order. */
function selectedOptions(filter: PltFilter): string[] {
  return filter.options.filter((option) => option.selected && option.value !== "").map((option) => option.value);
}

/** Selected value per filter: the first `selected` option, "" for none; an array for `multiple` filters. */
export function selectedValues(filters: readonly PltFilter[]): Record<string, PltFilterValue> {
  return Object.fromEntries(
    filters.map((filter) => [
      filter.id,
      filter.multiple
        ? selectedOptions(filter)
        : (filter.options.find((option) => option.selected)?.value ?? ""),
    ]),
  );
}

const isEmpty = (value: PltFilterValue | null | undefined) =>
  value == null || value === "" || (Array.isArray(value) && value.length === 0);

/** Values without empty entries (empty strings, empty arrays), in filter order. */
export function nonEmptyValues(values: Record<string, PltFilterValue>): Record<string, PltFilterValue> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => !isEmpty(value)));
}

/** `[name, value]` pairs for values and preserved params; arrays repeat the name. */
export function toEntries(values: Record<string, PltFilterValue>): Array<[string, string]> {
  return Object.entries(values).flatMap(([name, value]) =>
    (Array.isArray(value) ? value : [value]).filter((item) => item !== "" && item != null).map((item): [string, string] => [name, item]),
  );
}

/** Query string for the non-empty values (no leading `?`). */
export function toQuery(values: Record<string, PltFilterValue>): string {
  return new URLSearchParams(toEntries(values)).toString();
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  valueLabel: string;
}

/** Applied filters with display labels, one per value, for the active-filter chips. */
export function activeFilters(filters: readonly PltFilter[], values: Record<string, PltFilterValue>): ActiveFilter[] {
  return filters.flatMap((filter) => {
    const raw = values[filter.id];
    const list = (Array.isArray(raw) ? raw : [raw ?? ""]).filter((value) => value !== "");
    return list.map((value) => {
      const option = filter.options.find((candidate) => candidate.value === value);
      return { id: filter.id, label: filter.label, value, valueLabel: option?.label ?? value };
    });
  });
}

/** Hidden-input entries for preserved params. */
export function preservedEntries(preserved: PltPreserved | null | undefined): Array<[string, string]> {
  return toEntries(preserved ?? {});
}
