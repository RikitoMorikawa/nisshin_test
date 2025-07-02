/**
 * 精算項目APIからのレスポンス
 */
export interface LiquidationApiResponse {
  message: string;
  totalItems: number;
  data: Liquidation[];
}

/**
 * 精算項目
 */
export interface Liquidation {
  id: number;
  name: string;
  abbreviation_name: string;
  display_division_id: number;
  field_name: string;
  liquidation_division_id: number;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at: string;
  deleted_id: number;
  division_display_name: string;
  division_display_code: string;
  division_display_value: string;
  division_liquidation_name: string;
  division_liquidation_code: string;
  division_liquidation_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
