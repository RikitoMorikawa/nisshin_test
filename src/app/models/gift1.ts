/**
 * APIレスポンス
 */
export interface Gift1ApiResponse {
  message: string;
  totalItems: number;
  data: Gift1[];
}

/**
 * 現金外内訳／ギフト１
 */
export interface Gift1 {
  id: number;
  name: string;
  furi?: string | null;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at?: string | null;
  deleted_id?: number | null;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;

  employee_created_fullName?: string | null;
  employee_updated_fullName?: string | null;
}
