/**
 * APIレスポンス
 */
export interface SalesDetailApiResponse {
  message: string;
  totalItems: number;
  data: SalesDetail[];
}

/**
 * 売上明細
 */
export interface SalesDetail {
  id: number;
  sales_slip_cd: number;
  gyo_cd: number;
  sale_date: string;
  sale_year: number;
  sale_month: number;
  sale_month_and_year: number | '';
  sale_day: number;
  sale_hour: number;
  business_date: string;
  business_year: number;
  business_month: number;
  business_month_and_year: number;
  business_day: number;
  business_hour: number;
  store_cd: number | '';
  terminal_cd: number | '';
  sales_slip_division_cd: number | '';
  input_employee_cd: number | '';
  input_employee_name: string;
  number_of_people: number | '';
  quality_customer_cd: number | '';
  product_cd: number | '';
  barcode: string;
  product_name: string;
  product_name_kana: string;
  large_category_cd: number | '';
  medium_category_cd: number | '';
  small_category_cd: number | '';
  supplier_cd: number | '';
  standard: string;
  part_number: string;
  quantity_per_carton: number | '';
  delivery_case_number: number | '';
  unit_cd: number | '';
  unit_division_cd: number | '';
  delivery_real_number: number | '';
  warehouse_cd: number | '';
  tax_excluded_cost: number | '';
  unit_price: number | '';
  slip_item_total_sales: number | '';
  slip_item_tax_excluded_total_sales: number | '';
  discount_amount: number | '';
  discount_type: string;
  tax_division_cd: number | '';
  tax_excluded_target_amount: number | '';
  tax_excluded_target_tax: number | '';
  tax_included_target_amount: number | '';
  tax_included_target_tax: number | '';
  special_sale_cd: number | '';
  member_id: number | '';
  member_cd: number | '';
  member_name: string;
  client_cd: number | '';
  billing_cd: number | '';
  register_closing_times: number | '';
  accounts_receivable_closing_date: number | '';
  accounts_receivable_year_month: number | '';
  warranty_printing_division_cd: number | '';
  slip_creation_time: string;
  slip_update_time: string;
  deleted_flag: number | '';
  coordination_flag: number;
  created_at: string;
  member_last_name: string;
  member_first_name: string;
}
