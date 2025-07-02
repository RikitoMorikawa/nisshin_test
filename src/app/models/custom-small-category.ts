/**
 * カスタム小分類APIからのレスポンス
 */
export interface CustomSmallCategoryApiResponse {
  message: string;
  totalItems: number;
  data: CustomSmallCategory[];
}

/**
 * カスタム小分類
 */
export interface CustomSmallCategory {
  id: number;
  custom_medium_category_id?: number;
  name: string;
  created_at: string;
  created_id: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  custom_medium_category_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
