/**
 * 発注APIからのレスポンス
 */
export interface OrderApiResponse {
  message: string;
  totalItems: number;
  data: Order[];
}

/**
 * 発注
 */
export interface Order {
  id: number;
  purchase_order_id: number;
  product_id: number;
  order_quantity: number;
  cost_price: number | '';
  receiving_date: string;
  receiving_quantity: number;
  receiving_employee_id: number;
  order_status_division_id: number | '';
  remarks?: string;
  product_name_alias?: string;
  supplier_name?: string;
  shelf_value?: string;
  shelf_col_value?: string;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  product_name?: string;
  order_status_code?: number;
  order_status_name?: string;
  order_status_value?: string;
  product_division_name?: number;
  product_division_code?: string;
  product_division_value?: string;
  product_minimum_order_quantity?: string;
  employee_receiving_last_name?: string;
  employee_receiving_first_name?: string;
  employee_cancel_last_name?: string;
  employee_cancel_first_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
