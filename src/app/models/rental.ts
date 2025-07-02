/**
 * APIからのレスポンス
 */
export interface RentalApiResponse {
  message: string;
  totalItems: number;
  data: Rental[];
}

/**
 * レンタル
 */
export interface Rental {
  id: number;
  rental_slip_id: number;
  rental_product_id: number;
  rental_item_count: number;
  rental_fee: number;
  delivery_division_id: number;
  delivery_date: string;
  delivery_price: number;
  collection_division_id: number;
  collection_date: string;
  collection_price: number;
  scheduled_rental_date: string;
  rental_date?: string | '';
  scheduled_return_date: string;
  return_date: string;
  delinquency_flag: number;
  late_fee: number;
  parent_id: number | null;
  rental_employee_id: number;
  return_employee_id: number;
  delivery_charge_flag: number;
  late_return_reported: number;
  grace_period_end: string;
  settle_status_division_id: number;
  remarks_1?: string;
  remarks_2?: string;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  rental_product_name?: string;
  division_delivery_name?: string;
  division_delivery_code?: number;
  division_delivery_value?: string;
  division_collection_name?: string;
  division_collection_code?: number;
  division_collection_value?: string;
  division_settle_status_name?: string;
  division_settle_status_code?: number;
  division_settle_status_value?: string;
  employee_rental_last_name?: string;
  employee_rental_first_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  employee_deleted_last_name?: string;
  employee_deleted_first_name?: string;
  delivery_id?: string; // 配送詳細画面で配送登録状況確認のために利用する
  delivery_date_time?: string; // 配送詳細画面で配送登録状況確認のために利用する
  collection_id?: string; // 配送詳細画面で配送登録状況確認のために利用する
  collection_date_time?: string; // 配送詳細画面で配送登録状況確認のために利用する
  refund_fee?: number;
  overdue_rentals_status_name?: string;
}

/**
 * レンタル
 */
export interface RentalDiffForm {
  parent_id: number | null;
  rental_slip_id: number;
  rental_product_id: number;
  rental_product_name?: string;
  rental_item_count: number;
  rental_fee: number;
  delivery_division_id: number;
  delivery_date: string;
  delivery_price: number;
  collection_division_id: number;
  collection_date: string;
  collection_price: number;
  scheduled_rental_date: string;
  rental_date?: string | '';
  scheduled_return_date: string;
  return_date?: string | '';
  delinquency_flag: number;
  late_fee: number;
  rental_employee_id: number;
  return_employee_id?: number;
  delivery_charge_flag: number;
  late_return_reported: number;
  grace_period_end: string;
  settle_status_division_id: number;
  refund_fee?: number;
}
