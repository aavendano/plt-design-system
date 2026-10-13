const asString = (value) => value === null || value === void 0 ? "" : String(value);
function normalizeOptions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((option) => Boolean(option) && typeof option === "object").map((option) => ({
    name: asString(option.name),
    values: (Array.isArray(option.values) ? option.values : []).map(
      (value) => typeof value === "object" && value !== null ? {
        value: asString(value.value),
        label: value.label === void 0 ? void 0 : asString(value.label),
        swatch: value.swatch ?? null
      } : { value: asString(value) }
    ).filter((value) => value.value !== "")
  }));
}
function normalizeVariants(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((variant) => Boolean(variant) && typeof variant === "object").map((variant) => ({
    id: asString(variant.id),
    options: (Array.isArray(variant.options) ? variant.options : []).map(asString),
    available: variant.available === true,
    title: variant.title === void 0 ? void 0 : asString(variant.title)
  })).filter((variant) => variant.id !== "");
}
function matches(variant, selection) {
  return selection.every((value, index) => asString(variant.options[index]) === value);
}
function findVariant(variants, selection) {
  if (selection.length === 0) return null;
  return variants.find((variant) => matches(variant, selection)) ?? null;
}
function findVariantById(variants, id) {
  if (id === null || id === void 0 || id === "") return null;
  const wanted = asString(id);
  return variants.find((variant) => variant.id === wanted) ?? null;
}
function initialSelection(options, variants, selectedVariantId) {
  const variant = findVariantById(variants, selectedVariantId) ?? variants.find((candidate) => candidate.available) ?? variants[0] ?? null;
  return options.map(
    (option, index) => variant ? asString(variant.options[index]) : option.values[0]?.value ?? ""
  );
}
function valueStatus(variants, selection, optionIndex, value) {
  const probe = [...selection];
  probe[optionIndex] = value;
  const variant = findVariant(variants, probe);
  if (!variant) return "unavailable";
  return variant.available ? "available" : "sold-out";
}
function selectValue(variants, selection, optionIndex, value) {
  const probe = [...selection];
  probe[optionIndex] = value;
  if (findVariant(variants, probe)) return probe;
  let best = null;
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
  return best ? probe.map((_, index) => asString(best.options[index])) : probe;
}
function toSelectedOptions(options, selection) {
  return options.map((option, index) => ({ name: option.name, value: selection[index] ?? "" }));
}
function isSelectionValid(options, selection) {
  return selection.length === options.length && options.every((option, index) => option.values.some((value) => value.value === selection[index]));
}
export {
  findVariant,
  findVariantById,
  initialSelection,
  isSelectionValid,
  normalizeOptions,
  normalizeVariants,
  selectValue,
  toSelectedOptions,
  valueStatus
};
