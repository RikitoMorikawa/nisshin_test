/**
 * APIレスポンス
 */
export interface CustomerOrderApiResponse {
  message: string;
  totalItems: number;
  data: CustomerOrder[];
}

/**
 * 客注
 */
export interface CustomerOrder {
  id: number;
  customer_order_reception_slip_id: number;
  product_id: number;
  supplier_id: number;
  product_name: string;
  supplier_name: string;
  quantity: number;
  unit: string;
  tax_included_unit_price: number;
  tax_included_amount: number;
  status_division_id: number | '';
  delivery_division_id: number;
  settle_status_division_id: number;
  remarks: string;
  cost_price: number | '';
  total_cost_price: number | '';
  receiving_quantity: number;
  receiving_date: string;
  receiving_employee_id: number | '';
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  division_customer_order_status_name?: string;
  division_customer_order_status_code?: number;
  division_customer_order_status_value?: string;
  division_delivery_code?: number;
  division_delivery_name?: string;
  division_delivery_value?: string;
  division_settle_status_name?: string;
  division_settle_status_code?: number;
  division_settle_status_value?: string;
  division_status_name?: string;
  division_status_code?: string;
  division_status_value?: string;
  employee_receiving_last_name?: string;
  employee_receiving_first_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  employee_deleted_last_name?: string;
  employee_deleted_first_name?: string;
  delivery_id?: string; // 配送詳細画面で配送登録状況確認のために利用する
  delivery_date_time?: string; // 配送詳細画面で配送登録状況確認のために利用する
}
