export interface PltQuantitySelectorLabels {
  decrease?: string;
  increase?: string;
  quantity?: string;
}

export interface PltQuantityChangeDetail {
  value: number;
  previousValue: number;
}

export const QUANTITY_CHANGE_EVENT = "plt:quantity-change";
