function selectedOptions(filter) {
  return filter.options.filter((option) => option.selected && option.value !== "").map((option) => option.value);
}
function selectedValues(filters) {
  return Object.fromEntries(
    filters.map((filter) => [
      filter.id,
      filter.multiple ? selectedOptions(filter) : filter.options.find((option) => option.selected)?.value ?? ""
    ])
  );
}
const isEmpty = (value) => value == null || value === "" || Array.isArray(value) && value.length === 0;
function nonEmptyValues(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => !isEmpty(value)));
}
function toEntries(values) {
  return Object.entries(values).flatMap(
    ([name, value]) => (Array.isArray(value) ? value : [value]).filter((item) => item !== "" && item != null).map((item) => [name, item])
  );
}
function toQuery(values) {
  return new URLSearchParams(toEntries(values)).toString();
}
function activeFilters(filters, values) {
  return filters.flatMap((filter) => {
    const raw = values[filter.id];
    const list = (Array.isArray(raw) ? raw : [raw ?? ""]).filter((value) => value !== "");
    return list.map((value) => {
      const option = filter.options.find((candidate) => candidate.value === value);
      return { id: filter.id, label: filter.label, value, valueLabel: option?.label ?? value };
    });
  });
}
function preservedEntries(preserved) {
  return toEntries(preserved ?? {});
}
export {
  activeFilters,
  nonEmptyValues,
  preservedEntries,
  selectedValues,
  toEntries,
  toQuery
};
