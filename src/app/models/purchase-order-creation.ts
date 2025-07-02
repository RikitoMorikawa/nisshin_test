/**
 * 発注書APIからのレスポンス
 */
export interface PurchaseOrderCreationApiResponse {
  message: string;
  totalItems: number;
  data: PurchaseOrderCreation[];
}

/**
 * 発注書
 */
export interface PurchaseOrderCreation {
  from_date_of_sale: string;
  to_date_of_sale: string;
}
