/**
 * APIレスポンス
 */
export interface SalesSlipApiResponse {
  message: string;
  totalItems: number;
  data: SalesSlip[];
}

/**
 * 売上伝票
 */
export interface SalesSlip {
  id: number;
  sales_slip_cd: number;
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
  payment_division_cd: number | '';
  total_quantity: number | '';
  total_cost: number | '';
  total_discount: number | '';
  tax_excluded_target_amount: number | '';
  tax_excluded_target_tax: number | '';
  tax_included_target_amount: number | '';
  tax_included_target_tax: number | '';
  slip_amount: number | '';
  slip_amount_tax_excluded: number | '';
  cash: number | '';
  change: number | '';
  miscellaneous_income: number | '';
  gift_1: number | '';
  gift_2: number | '';
  gift_3: number | '';
  gift_4: number | '';
  credit: number | '';
  accounts_receivable: number | '';
  decimal_point_fraction: number | '';
  tax_fraction: number | '';
  tax_division_cd: number | '';
  tax_rate: number | '';
  tax_calculating_division_cd: number | '';
  for_slip_return_limit: number | '';
  member_id: number | '';
  member_cd: string;
  member_name: string;
  client_cd: number | '';
  billing_cd: number | '';
  client_name_1: string;
  client_name_2: string;
  register_closing_times: number;
  accounts_receivable_closing_date: number;
  accounts_receivable_year_month: number | '';
  last_point: number | '';
  current_grant_point: number | '';
  input_point: number | '';
  used_point: number | '';
  point_balance: number | '';
  point_target_amount: number | '';
  point_magnification: number | '';
  billing_field_cd: number | '';
  slip_creation_time: string;
  slip_update_time: string;
  deleted_flag: number;
  coordination_flag: number;
  created_at: string;
  member_last_name: string;
  member_first_name: string;
  updated_at?: string;
  updated_id?: number;
}
