/**
 * APIからのレスポンス
 */
export interface RentalSlipApiResponse {
  message: string;
  totalItems: number;
  data: RentalSlip[];
}

/**
 * レンタル伝票
 */
export interface RentalSlip {
  id: number;
  customer_type_division_id: number;
  store_id: number;
  client_id: number;
  member_id: number;
  last_name: string | '';
  first_name: string | '';
  last_name_kana: string | '';
  first_name_kana: string | '';
  tel: string | '';
  identification_document_confirmation_date: string | '';
  mobile_number: number;
  shipping_address: string | '';
  status_division_id: number;
  remarks_1: string;
  remarks_2: string;
  reception_tag?: string | '';
  reception_date: string;
  reception_employee_id: number;
  settle_status_division_id: number;
  incident_division_id: number;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number | '';
  deleted_at: string;
  deleted_id: number | '';
  store_name: string;
  send_sms_flg: number | '';
  processing_units?: number;
  client_name: string | '';
  client_client_cd: number | '';
  client_billing_cd?: number;
  client_credit: number;
  client_custom_title?: string;
  client_cutoff_date_billing: number;
  client_fax?: string;
  client_line_num?: number;
  client_locality: string;
  client_mail?: string;
  client_name_kana?: string;
  client_other_address: string;
  client_payment_term?: number;
  client_pic_name?: string;
  client_pic_name_kana?: string;
  client_postal_code?: string;
  client_province: string;
  client_remarks_1?: string;
  client_remarks_2?: string;
  client_scheduled_payment_date?: number;
  client_street_address: string;
  client_tel?: string;
  client_division_title_code: number;
  client_division_title_name: string;
  client_division_title_value: string;
  member_name?: string;
  member_last_name?: string;
  member_last_name_kana?: string;
  member_first_name?: string;
  member_first_name_kana?: string;
  member_cd?: number;
  member_postal_code?: string;
  member_province: string;
  member_locality: string;
  member_street_address: string;
  member_other_address: string;
  member_tel?: string;
  member_mail?: string;
  member_point?: string;
  member_status_division_id?: number;
  member_division_status_code?: number;
  member_division_status_name?: string;
  member_division_status_value?: string;
  member_remarks_1?: string;
  member_remarks_2?: string;
  division_status_name?: string;
  division_status_code?: number;
  division_status_value?: string;
  division_customer_type_name?: string;
  division_customer_type_code?: number;
  division_customer_type_value?: string;
  employee_reception_last_name?: string;
  employee_reception_first_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
