function fromStorefrontProduct(product) {
  const options = (product.options ?? []).map((option) => ({
    name: option.name,
    values: (option.optionValues ?? []).map((value) => ({
      value: value.name,
      swatch: value.swatch?.color || value.swatch?.image?.previewImage?.url ? {
        color: value.swatch?.color ?? null,
        image: value.swatch?.image?.previewImage?.url ?? null
      } : null
    }))
  }));
  const listed = Array.isArray(product.variants) ? product.variants : product.variants?.nodes ?? [];
  const candidates = [
    ...listed,
    ...product.adjacentVariants ?? [],
    ...product.selectedOrFirstAvailableVariant ? [product.selectedOrFirstAvailableVariant] : [],
    ...(product.options ?? []).flatMap(
      (option) => (option.optionValues ?? []).flatMap(
        (value) => value.firstSelectableVariant ? [value.firstSelectableVariant] : []
      )
    )
  ];
  const variants = /* @__PURE__ */ new Map();
  for (const candidate of candidates) {
    if (!candidate?.id || variants.has(candidate.id)) continue;
    const byName = new Map((candidate.selectedOptions ?? []).map((o) => [o.name, o.value]));
    variants.set(candidate.id, {
      id: candidate.id,
      title: candidate.title ?? void 0,
      available: candidate.availableForSale === true,
      options: options.map((option) => byName.get(option.name) ?? "")
    });
  }
  return {
    options,
    variants: [...variants.values()],
    selectedVariantId: product.selectedOrFirstAvailableVariant?.id ?? null
  };
}
export {
  fromStorefrontProduct
};
