/**
 * カスタム中分類APIからのレスポンス
 */
export interface CustomMediumCategoryApiResponse {
  message: string;
  totalItems: number;
  data: CustomMediumCategory[];
}

/**
 * カスタム中分類
 */
export interface CustomMediumCategory {
  id: number;
  custom_large_category_id?: number;
  name: string;
  created_at: string;
  created_id: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  custom_large_category_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
