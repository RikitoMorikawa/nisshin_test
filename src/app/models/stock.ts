/**
 * 在庫APIからのレスポンス
 */
export interface StockApiResponse {
  message: string;
  totalItems: number;
  data: Stock[];
}

/**
 * 在庫
 */
export interface Stock {
  id: number;
  product_id: number;
  product_name: string;
  store_id: number;
  store_name: string;
  quantity: number;
  created_at: string;
}
