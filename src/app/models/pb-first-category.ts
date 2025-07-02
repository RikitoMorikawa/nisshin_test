/**
 * 商品ブック第1分類APIからのレスポンス
 */
export interface PbFirstCategoryApiResponse {
  message: string;
  totalItems: number;
  data: PbFirstCategory[];
}

/**
 * 商品ブック第1分類
 */
export interface PbFirstCategory {
  id: number;
  name: string;
  furi: string;
  created_at: string;
  created_id: number | null;
  updated_at?: string;
  updated_id?: number | null;
  deleted_at?: string;
  deleted_id?: number | null;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
