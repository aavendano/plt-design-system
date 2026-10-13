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
    selectedOptions?: Array<{
        name: string;
        value: string;
    }> | null;
}
interface StorefrontOptionValueLike {
    name: string;
    swatch?: {
        color?: string | null;
        image?: {
            previewImage?: {
                url?: string | null;
            } | null;
        } | null;
    } | null;
    firstSelectableVariant?: StorefrontVariantLike | null;
}
export interface StorefrontProductLike {
    options?: Array<{
        name: string;
        optionValues?: StorefrontOptionValueLike[] | null;
    }> | null;
    variants?: {
        nodes?: StorefrontVariantLike[] | null;
    } | StorefrontVariantLike[] | null;
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
export declare function fromStorefrontProduct(product: StorefrontProductLike): VariantPickerData;
export {};
