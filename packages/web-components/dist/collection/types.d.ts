/** Collection-control contracts (FilterBar, SortSelect, Pagination). */
export interface PltChoice {
    label: string;
    value: string;
    selected?: boolean;
    /** Result count, shown next to the option of a `multiple` filter. */
    count?: number | null;
}
export interface PltFilter {
    /** Form field name, e.g. `filter.v.option.color` on Shopify. */
    id: string;
    label: string;
    /**
     * Single-value filters render a select: include an option with value "" for
     * "any". With `multiple` the filter renders a checkbox group instead: every
     * checked option is sent under the same `id`, and options with value ""
     * are ignored.
     */
    options: PltChoice[];
    multiple?: boolean;
}
/** One value per single filter, an array of values per `multiple` filter. */
export type PltFilterValue = string | string[];
/**
 * Query parameters owned by another control (the sort order next to the
 * filters, say). They are carried as hidden inputs so a native GET submit
 * keeps them; an array repeats the name.
 */
export type PltPreserved = Record<string, string | string[]>;
export interface PltPage {
    label: string;
    url?: string | null;
    current?: boolean;
    disabled?: boolean;
}
export interface PltFilterBarLabels {
    apply?: string;
    active?: string;
    clear?: string;
    remove?: string;
}
export interface PltPaginationLabels {
    nav?: string;
    previous?: string;
    next?: string;
}
export interface PltFilterChangeDetail {
    /** Non-empty values by filter id; an array for `multiple` filters. */
    values: Record<string, PltFilterValue>;
    /** Filter that changed; `null` for "clear all" and manual submits. */
    changed: string | null;
    /** The filter values as a query string (no leading `?`); arrays repeat the name. */
    query: string;
}
export interface PltSortChangeDetail {
    name: string;
    value: string;
}
export interface PltPageChangeDetail {
    url: string;
    label: string;
}
export declare const FILTER_CHANGE_EVENT = "plt:filter-change";
export declare const SORT_CHANGE_EVENT = "plt:sort-change";
export declare const PAGE_CHANGE_EVENT = "plt:page-change";
