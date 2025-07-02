/**
 * 商品ブック第3分類APIからのレスポンス
 */
export interface MainProductBookApiResponse {
  message: string;
  totalItems: number;
  data: MainProductBook[];
}

/**
 * 商品ブック第3分類
 */
export interface MainProductBook {
  id: number;
  product_book_second_category_id: number;
  book_cd?: string;
  store_id: number;
  name: string;
  furi: string;
  gyo: number;
  size_name?: string;
  product_id: number;
  barcode?: string;
  created_at: string;
  created_id: number | null;
  updated_at?: string;
  updated_id?: number | null;
  deleted_at?: string;
  deleted_id?: number | null;
  product_book_second_category_name?: string;
  store_name?: string;
  product_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
