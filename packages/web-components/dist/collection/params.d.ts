/** Pure helpers for collection controls. */
import type { PltFilter } from "./types.js";
/** Selected value per filter (first `selected` option, else ""). */
export declare function selectedValues(filters: readonly PltFilter[]): Record<string, string>;
/** Values without empty entries, in filter order. */
export declare function nonEmptyValues(values: Record<string, string>): Record<string, string>;
/** Query string for the non-empty values (no leading `?`). */
export declare function toQuery(values: Record<string, string>): string;
export interface ActiveFilter {
    id: string;
    label: string;
    value: string;
    valueLabel: string;
}
/** Applied filters with display labels, for the active-filter chips. */
export declare function activeFilters(filters: readonly PltFilter[], values: Record<string, string>): ActiveFilter[];
