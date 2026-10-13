/** Collection-control contracts (FilterBar, SortSelect, Pagination). */
export interface PltChoice {
    label: string;
    value: string;
    selected?: boolean;
}
export interface PltFilter {
    /** Form field name, e.g. `filter.v.option.color` on Shopify. */
    id: string;
    label: string;
    /** Include an option with value "" for "any". */
    options: PltChoice[];
}
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
    /** Non-empty values by filter id. */
    values: Record<string, string>;
    /** Filter that changed; `null` for "clear all" and manual submits. */
    changed: string | null;
    /** The values as a query string (no leading `?`). */
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
