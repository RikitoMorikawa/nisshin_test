/**
 * 商品ブック第2分類APIからのレスポンス
 */
export interface PbSecondCategoryApiResponse {
  message: string;
  totalItems: number;
  data: PbSecondCategory[];
}

/**
 * 商品ブック第2分類
 */
export interface PbSecondCategory {
  id: number;
  product_book_first_category_id: number;
  book_cd?: string;
  store_id: number;
  name: string;
  furi: string;
  created_at: string;
  created_id: number | null;
  updated_at?: string;
  updated_id?: number | null;
  deleted_at?: string;
  deleted_id?: number | null;
  product_book_first_category_name?: string;
  store_name?: string;
  image_path?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
