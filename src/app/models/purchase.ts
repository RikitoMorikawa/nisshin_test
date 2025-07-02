/**
 * 仕入伝票APIからのレスポンス
 */
export interface PurchaseApiResponse {
  message: string;
  totalItems: number;
  data: Purchase[];
}

/**
 * 仕入伝票
 */
export interface Purchase {
  id: number;
  purchase_order_id: number;
  order_date: string;
  preferred_delivery_date: string;
  store_id: number;
  supplier_id: number;
  order_employee_id: number;
  purchase_date: string;
  order_employee_last_name: string;
  order_employee_first_name: string;
  remarks?: string;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  pdf: string;
  accounts_payable_aggregate_id: number;
  purchase_order_status_division_id: number | '';
  purchase_order_status_code?: string | number;
  purchase_order_status_name?: string | number;
  purchase_order_status_value?: string | number;
  store_alias?: string;
  store_fax?: string;
  store_locality?: string;
  store_logo_image_path?: string;
  store_name?: string;
  store_name_kana?: string;
  store_other_address?: string;
  store_payee_1?: string;
  store_payee_2?: string;
  store_postal_code?: string;
  store_province?: string;
  store_street_address?: string;
  store_tel?: string;
  supplier_account_payable?: string;
  supplier_cutoff_date_billing?: number;
  supplier_fax?: string;
  supplier_locality?: string;
  supplier_logo_image_path?: string;
  supplier_mail?: string;
  supplier_name?: string;
  supplier_name_kana?: string;
  supplier_other_address?: string;
  supplier_payee_1?: string;
  supplier_payee_2?: string;
  supplier_pic_name?: string;
  supplier_pic_name_kana?: string;
  supplier_postal_code?: string;
  supplier_province?: string;
  supplier_remarks_1?: string;
  supplier_remarks_2?: string;
  supplier_scheduled_payment_date?: string | number;
  supplier_street_address?: string;
  supplier_tel?: string;
  employee_order_last_name?: string;
  employee_order_first_name?: string;
  employee_order_full_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  is_discount?: number;
  purchaseDetails?: {
    order_price: number;
    order_quantity: number;
    total: number;
  }[];
}
