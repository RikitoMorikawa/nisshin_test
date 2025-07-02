/**
 * APIレスポンス
 */
export interface BillDetailApiResponse {
  message: string;
  totalItems: number;
  data: BillDetail[];
}

/**
 * 請求明細
 */
export interface BillDetail {
  id: number;
  sales_slip_cd: number;
  gyo_cd: number;
  sale_date: string;
  sale_year: number;
  sale_month: number;
  sale_month_and_year: string;
  sale_day: number;
  sale_hour: number;
  business_date: string;
  business_year: number;
  business_month: number;
  business_month_and_year: number;
  business_day: number;
  business_hour: number;
  store_cd: string;
  terminal_cd: string;
  sales_slip_division_cd: string;
  input_employee_cd: string;
  input_employee_name: string;
  number_of_people: string;
  quality_customer_cd: string;
  product_cd: string;
  barcode: string;
  product_name: string;
  product_name_kana: string;
  large_category_cd: string;
  medium_category_cd: string;
  small_category_cd: string;
  supplier_cd: string;
  standard: string;
  part_number: string;
  quantity_per_carton: string;
  delivery_case_number: string;
  unit_cd: string;
  unit_division_cd: string;
  delivery_real_number: string;
  warehouse_cd: string;
  tax_excluded_cost: string;
  unit_price: string;
  slip_item_total_sales: string;
  slip_item_tax_excluded_total_sales: string;
  discount_amount: string;
  discount_type: string;
  tax_division_cd: string;
  tax_excluded_target_amount: string;
  tax_excluded_target_tax: string;
  tax_included_target_amount: string;
  tax_included_target_tax: string;
  special_sale_cd: string;
  member_id: string;
  member_cd: string;
  member_name: string;
  client_cd: string;
  billing_cd: string;
  register_closing_times: number;
  accounts_receivable_closing_date: number;
  accounts_receivable_year_month: string;
  warranty_printing_division_cd: string;
  slip_creation_time: string;
  slip_update_time: string;
  deleted_flag: number;
  coordination_flag: number;
  created_at: string;
  member_last_name: string;
  member_first_name: string;
}
