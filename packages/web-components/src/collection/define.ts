import { defineOnce } from "../shared/element.js";
import { PltFilterBar } from "./plt-filter-bar.js";
import { PltPagination } from "./plt-pagination.js";
import { PltSortSelect } from "./plt-sort-select.js";

export function definePltCollection(registry?: CustomElementRegistry): boolean {
  const target = registry ?? globalThis.customElements;
  return (
    defineOnce("plt-filter-bar", PltFilterBar, target) &&
    defineOnce("plt-sort-select", PltSortSelect, target) &&
    defineOnce("plt-pagination", PltPagination, target)
  );
}

definePltCollection();

export { PltFilterBar, PltPagination, PltSortSelect };
