/**
 * APIレスポンス
 */
export interface Gift4ApiResponse {
  message: string;
  totalItems: number;
  data: Gift4[];
}

/**
 * 現金外内訳／GIFT4
 */
export interface Gift4 {
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
