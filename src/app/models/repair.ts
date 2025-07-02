/**
 * 修理APIからのレスポンス
 */
export interface RepairApiResponse {
  message: string;
  totalItems: number;
  data: Repair[];
}

/**
 * 修理モデル
 */
export interface Repair {
  id: number;
  repair_slip_id: number;
  repair_type_division_id: number;
  polishing_number?: number;
  failure_status?: string;
  repair_order_company?: string;
  maker_name?: string;
  product_name: string;
  product_id?: number;
  product_product_name?: string;
  supplier_id?: number;
  supplier_name?: string;
  supplier_name_kana?: string;
  customer_budget?: number;
  taking_out_date?: string;
  quote_cost: number;
  quote_selling_price: number;
  tax_included_quote_selling_price: number;
  in_house_repairs: number;
  cost_of_parts?: number;
  arrival_date?: string;
  arrival_expected_date?: string;
  passing_date?: string;
  settle_status_division_id: number;
  delivery_division_id: number;
  remarks?: string;
  created_at: string;
  created_id: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: string;
  division_repair_type_name?: string;
  division_repair_type_code?: number;
  division_repair_type_value?: string;
  division_repair_status_name?: string;
  division_repair_status_code?: number;
  division_repair_status_value?: string;
  division_settle_status_name?: string;
  division_settle_status_code?: number;
  division_settle_status_value?: string;
  division_delivery_name?: string;
  division_delivery_code?: number;
  division_delivery_value?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  employee_deleted_last_name?: string;
  employee_deleted_first_name?: string;
  delivery_id?: string; // 配送詳細画面で配送登録状況確認のために利用する
  delivery_date_time?: string; // 配送詳細画面で配送登録状況確認のために利用する
  accounts_payable_aggregate_id?: number;
  accounts_payable_aggregate_billing_date?: string;
  accounts_payable_aggregate_payment_due_date?: string;
  accounts_payable_aggregate_scheduled_payment_amount?: string;
  accounts_payable_aggregate_balance?: string;
}
