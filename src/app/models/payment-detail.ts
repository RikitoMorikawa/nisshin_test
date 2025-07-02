/**
 * 支払明細APIからのレスポンス
 */
export interface PaymentDetailApiResponse {
  message: string;
  totalItems: number;
  data: PaymentDetail[];
}

/**
 * 支払明細
 */
export interface PaymentDetail {
  id: number;
  payment_id: number;
  payment_type_division_code: number;
  payment_amount: number;
  scheduled_payment_amount: number;
  payment_date: string;
  remarks_1: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at: string;
  deleted_id: number;
  payment_remarks_1: string;
  payment_supplier_id: number;
  payment_supplier_name: string;
  payment_supplier_name_kana: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
