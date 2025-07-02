/**
 * 発注書APIからのレスポンス
 */
export interface PurchaseOrderApiResponse {
  message: string;
  totalItems: number;
  data: PurchaseOrder[];
}

/**
 * 発注書
 */
export interface PurchaseOrder {
  id: number;
  store_id: number;
  order_date: string;
  from_date_of_sale: string;
  to_date_of_sale: string;
  preferred_delivery_date: string;
  order_employee_id: number;
  purchase_order_status_division_id: number | '';
  remarks?: string;
  pdf: string;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
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
  supplier_id: number;
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
  purchase_order_status_code?: string | number;
  purchase_order_status_name?: string | number;
  purchase_order_status_value?: string | number;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
