function clampQuantity(value, { min = 1, max = null, step = 1 } = {}) {
  const floor = Number.isFinite(min) ? Math.trunc(min) : 1;
  const stride = Number.isFinite(step) && step > 0 ? Math.trunc(step) || 1 : 1;
  let n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return floor;
  n = Math.trunc(n);
  if (max !== null && max !== void 0 && Number.isFinite(max)) n = Math.min(n, Math.trunc(max));
  n = Math.max(n, floor);
  return floor + Math.floor((n - floor) / stride) * stride;
}
export {
  clampQuantity
};
