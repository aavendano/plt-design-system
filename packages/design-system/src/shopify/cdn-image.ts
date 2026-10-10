/** Width presets for responsive Shopify CDN images. */
export const SHOPIFY_CDN_WIDTHS = {
  card: [200, 400, 600, 800],
  collection: [300, 600, 900],
  gallery: [400, 800, 1200, 1600],
} as const;

export type ShopifyCdnLayout = keyof typeof SHOPIFY_CDN_WIDTHS;

export const SHOPIFY_CDN_SIZES: Record<ShopifyCdnLayout, string> = {
  card: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  collection: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  gallery: "(min-width: 1024px) 50vw, 100vw",
};

export function isShopifyCdnUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host === "cdn.shopify.com" || host.endsWith(".cdn.shopify.com");
  } catch {
    return false;
  }
}

export function shopifyCdnUrl(
  url: string,
  options: { width: number; height?: number },
): string {
  if (!isShopifyCdnUrl(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("width", String(options.width));
    if (options.height) {
      parsed.searchParams.set("height", String(options.height));
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function shopifyCdnSrcSet(url: string, widths: readonly number[]): string {
  if (!isShopifyCdnUrl(url) || widths.length === 0) return "";
  return widths.map((w) => `${shopifyCdnUrl(url, { width: w })} ${w}w`).join(", ");
}
