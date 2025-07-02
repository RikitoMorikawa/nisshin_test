/**
 * 小分類APIからのレスポンス
 */
export interface SmallCategoryApiResponse {
  message: string;
  totalItems: number;
  data: SmallCategory[];
}

/**
 * 小分類
 */
export interface SmallCategory {
  id: number;
  medium_category_id?: number;
  name: string;
  short_name: string;
  created_at: string;
  created_id: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  medium_category_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  has_children?: boolean;
}
