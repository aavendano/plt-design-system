/** Quantity rules shared by the quantity selector and the cart line. Pure. */
export interface QuantityBounds {
  min?: number;
  max?: number | null;
  step?: number;
}

/**
 * Parses and clamps a quantity: integers only, within `[min, max]`, snapped
 * down to the `step` grid that starts at `min`. Invalid input becomes `min`.
 */
export function clampQuantity(value: unknown, { min = 1, max = null, step = 1 }: QuantityBounds = {}): number {
  const floor = Number.isFinite(min) ? Math.trunc(min) : 1;
  const stride = Number.isFinite(step) && step > 0 ? Math.trunc(step) || 1 : 1;
  let n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return floor;
  n = Math.trunc(n);
  if (max !== null && max !== undefined && Number.isFinite(max)) n = Math.min(n, Math.trunc(max));
  n = Math.max(n, floor);
  return floor + Math.floor((n - floor) / stride) * stride;
}
