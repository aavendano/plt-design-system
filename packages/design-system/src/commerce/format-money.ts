export interface Money {
  amount: string;
  currencyCode: string;
}

export function formatMoney(money: Money, locale: string): string {
  const amount = Number.parseFloat(money.amount);
  if (!Number.isFinite(amount)) {
    return money.amount;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(amount);
}

export function formatPriceRange(min: Money, max: Money, locale: string): string {
  return `${formatMoney(min, locale)} – ${formatMoney(max, locale)}`;
}

export function formatPriceDisplay(
  locale: string,
  price: Money,
  options?: {
    compareAtPrice?: Money | null;
    minPrice?: Money;
    maxPrice?: Money;
  },
): { display: string; compareDisplay: string | null } {
  let display = formatMoney(price, locale);
  if (options?.minPrice && options?.maxPrice) {
    display = formatPriceRange(options.minPrice, options.maxPrice, locale);
  }

  const compareAt = options?.compareAtPrice;
  const compareDisplay =
    compareAt && compareAt.amount !== price.amount ? formatMoney(compareAt, locale) : null;

  return { display, compareDisplay };
}
