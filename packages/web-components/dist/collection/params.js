function selectedValues(filters) {
  return Object.fromEntries(
    filters.map((filter) => [filter.id, filter.options.find((option) => option.selected)?.value ?? ""])
  );
}
function nonEmptyValues(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value != null));
}
function toQuery(values) {
  return new URLSearchParams(nonEmptyValues(values)).toString();
}
function activeFilters(filters, values) {
  return filters.flatMap((filter) => {
    const value = values[filter.id] ?? "";
    if (!value) return [];
    const option = filter.options.find((candidate) => candidate.value === value);
    return [{ id: filter.id, label: filter.label, value, valueLabel: option?.label ?? value }];
  });
}
export {
  activeFilters,
  nonEmptyValues,
  selectedValues,
  toQuery
};
