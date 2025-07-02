/**
 * 中分類APIからのレスポンス
 */
export interface MediumCategoryApiResponse {
  message: string;
  totalItems: number;
  data: MediumCategory[];
}

/**
 * 中分類
 */
export interface MediumCategory {
  id: number;
  large_category_id?: number;
  name: string;
  short_name: string;
  created_at: string;
  created_id: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  large_category_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  has_children?: boolean;
}
