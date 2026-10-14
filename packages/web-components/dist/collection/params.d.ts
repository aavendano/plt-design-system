/** Pure helpers for collection controls. */
import type { PltFilter, PltFilterValue, PltPreserved } from "./types.js";
/** Selected value per filter: the first `selected` option, "" for none; an array for `multiple` filters. */
export declare function selectedValues(filters: readonly PltFilter[]): Record<string, PltFilterValue>;
/** Values without empty entries (empty strings, empty arrays), in filter order. */
export declare function nonEmptyValues(values: Record<string, PltFilterValue>): Record<string, PltFilterValue>;
/** `[name, value]` pairs for values and preserved params; arrays repeat the name. */
export declare function toEntries(values: Record<string, PltFilterValue>): Array<[string, string]>;
/** Query string for the non-empty values (no leading `?`). */
export declare function toQuery(values: Record<string, PltFilterValue>): string;
export interface ActiveFilter {
    id: string;
    label: string;
    value: string;
    valueLabel: string;
}
/** Applied filters with display labels, one per value, for the active-filter chips. */
export declare function activeFilters(filters: readonly PltFilter[], values: Record<string, PltFilterValue>, rangeLabels?: {
    min: string;
    max: string;
}): ActiveFilter[];
/** Hidden-input entries for preserved params. */
export declare function preservedEntries(preserved: PltPreserved | null | undefined): Array<[string, string]>;
