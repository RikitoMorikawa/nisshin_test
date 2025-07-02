/**
 * 支払伝票APIからのレスポンス
 */
export interface PaymentApiResponse {
  message: string;
  totalItems: number;
  data: Payment[];
}

/**
 * 支払伝票
 */
export interface Payment {
  id: number;
  supplier_id: number;
  remarks_1: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at: string;
  deleted_id: number;
  accounts_payable_aggregate_id: number;
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
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
