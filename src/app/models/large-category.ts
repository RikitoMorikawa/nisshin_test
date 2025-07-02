/**
 * 大分類APIからのレスポンス
 */
export interface LargeCategoryApiResponse {
  message: string;
  totalItems: number;
  data: LargeCategory[];
}

/**
 * 大分類
 */
export interface LargeCategory {
  id: number;
  name: string;
  short_name: string;
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
  has_children?: boolean;
}
