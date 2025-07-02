/**
 * APIレスポンス
 */
export interface AccountsReceivableBalanceApiResponse {
  message: string;
  totalItems: number;
  data: AccountsReceivableBalance[];
}

/**
 * 売上残高
 */
export interface AccountsReceivableBalance {
  id: number;
  client_id: number;
  previous_month_balance: string;
  deposit_amount: string;
  sales_amount: string;
  consumption_tax: string;
  current_month_balance: string;
  reduced_tax: string;
  consumption_tax_1: string;
  reduced_tax_1: string;
  created_at: string;
  created_id: number;
  client_client_cd: number;
  client_name: string;
  client_name_kana: string;
  client_pic_name: string;
  client_pic_name_kana: string;
  client_billing_cd: number;
  client_postal_code: string;
  client_province: string;
  client_locality: string;
  client_street_address: string;
  client_other_address: string;
  client_tel: string;
  client_fax: string;
  client_mail: string;
  client_remarks_1: string;
  client_remarks_2: string;
  client_cutoff_date_billing: number;
  client_scheduled_payment_date: number;
  client_payment_division_id: number;
  client_payment_term: number;
  client_sales_tax_division_id: string;
  client_sales_tax_calc_division_id: number;
  client_sales_fraction_division_id: string;
  client_sales_tax_fraction_division_id: number;
  client_print_division_id: string;
  client_rank_division_id: number;
  client_credit: string;
  client_line_num: string;
  client_title_division_id: number;
  client_custom_title: string;
  client_division_payment_name: string;
  client_division_payment_code: number;
  client_division_payment_value: string;
  client_division_sales_tax_fraction_name: string;
  client_division_sales_tax_fraction_code: number;
  client_division_sales_tax_fraction_value: string;
  client_division_sales_tax_name: string;
  client_division_sales_tax_code: string;
  client_division_sales_tax_value: string;
  client_division_sales_tax_calc_name: string;
  client_division_sales_tax_calc_code: number;
  client_division_sales_tax_calc_value: string;
  client_division_sales_fraction_name: string;
  client_division_sales_fraction_code: string;
  client_division_sales_fraction_value: string;
  client_division_print_name: string;
  client_division_print_code: string;
  client_division_print_value: string;
  client_division_rank_name: string;
  client_division_rank_code: number;
  client_division_rank_value: string;
  client_division_title_name: string;
  client_division_title_code: number;
  client_division_title_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
}
