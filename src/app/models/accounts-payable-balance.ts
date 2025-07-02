/**
 * 買掛残高APIからのレスポンス
 */
export interface AccountsPayableBalanceApiResponse {
  message: string;
  totalItems: number;
  data: AccountsPayableBalance[];
}

/**
 * 買掛残高モデル
 */
export interface AccountsPayableBalance {
  id: number;
  supplier_id: number;
  previous_month_balance: number;
  payment_amount: number;
  purchase_amount: number;
  consumption_tax: number;
  reduced_tax: number;
  current_month_balance: number;
  created_at: string;
  created_id: number;
  supplier_name: string;
  supplier_name_kana: string;
  supplier_postal_code: string;
  supplier_province: string;
  supplier_locality: string;
  supplier_street_address: string;
  supplier_other_address: string;
  supplier_tel: string;
  supplier_fax: string;
  supplier_mail: string;
  supplier_cutoff_date_billing: number;
  supplier_scheduled_payment_date: string;
  supplier_remarks_1: string;
  supplier_remarks_2: string;
  supplier_pic_name: string;
  supplier_pic_name_kana: string;
  supplier_payee_1: string;
  supplier_payee_2: string;
  supplier_account_payable: number;
  supplier_logo_image_path: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  blank_discount_amount: string;
  blank_payment_amount: string;
  carryforward_amount: number;
  total_price: number;
}
