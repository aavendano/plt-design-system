/**
 * Normalizes Shopify Storefront API product data (as fetched by Hydrogen or the
 * Astro storefront) into the `<plt-variant-picker>` contract.
 *
 * Plain data mapping: no Shopify client, no network, no prices. Structural
 * types keep it free of `@shopify/*` imports.
 */
import type { PltProductOption, PltVariant } from "./types.js";

interface StorefrontVariantLike {
  id: string;
  title?: string | null;
  availableForSale?: boolean | null;
  selectedOptions?: Array<{ name: string; value: string }> | null;
}

interface StorefrontOptionValueLike {
  name: string;
  swatch?: {
    color?: string | null;
    image?: { previewImage?: { url?: string | null } | null } | null;
  } | null;
  firstSelectableVariant?: StorefrontVariantLike | null;
}

export interface StorefrontProductLike {
  options?: Array<{ name: string; optionValues?: StorefrontOptionValueLike[] | null }> | null;
  variants?: { nodes?: StorefrontVariantLike[] | null } | StorefrontVariantLike[] | null;
  adjacentVariants?: StorefrontVariantLike[] | null;
  selectedOrFirstAvailableVariant?: StorefrontVariantLike | null;
}

export interface VariantPickerData {
  options: PltProductOption[];
  variants: PltVariant[];
  selectedVariantId: string | null;
}

/**
 * Builds picker data from a Storefront API product. Variants are collected
 * from `variants`, `adjacentVariants`, `selectedOrFirstAvailableVariant` and
 * each option value's `firstSelectableVariant`, so Hydrogen's default product
 * query (which does not list every variant) is enough.
 */
export function fromStorefrontProduct(product: StorefrontProductLike): VariantPickerData {
  const options = (product.options ?? []).map((option) => ({
    name: option.name,
    values: (option.optionValues ?? []).map((value) => ({
      value: value.name,
      swatch:
        value.swatch?.color || value.swatch?.image?.previewImage?.url
          ? {
              color: value.swatch?.color ?? null,
              image: value.swatch?.image?.previewImage?.url ?? null,
            }
          : null,
    })),
  }));

  const listed = Array.isArray(product.variants)
    ? product.variants
    : (product.variants?.nodes ?? []);
  const candidates: StorefrontVariantLike[] = [
    ...listed,
    ...(product.adjacentVariants ?? []),
    ...(product.selectedOrFirstAvailableVariant ? [product.selectedOrFirstAvailableVariant] : []),
    ...(product.options ?? []).flatMap((option) =>
      (option.optionValues ?? []).flatMap((value) =>
        value.firstSelectableVariant ? [value.firstSelectableVariant] : [],
      ),
    ),
  ];

  const variants = new Map<string, PltVariant>();
  for (const candidate of candidates) {
    if (!candidate?.id || variants.has(candidate.id)) continue;
    const byName = new Map((candidate.selectedOptions ?? []).map((o) => [o.name, o.value]));
    variants.set(candidate.id, {
      id: candidate.id,
      title: candidate.title ?? undefined,
      available: candidate.availableForSale === true,
      options: options.map((option) => byName.get(option.name) ?? ""),
    });
  }

  return {
    options,
    variants: [...variants.values()],
    selectedVariantId: product.selectedOrFirstAvailableVariant?.id ?? null,
  };
}
