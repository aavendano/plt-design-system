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
export declare function clampQuantity(value: unknown, { min, max, step }?: QuantityBounds): number;
