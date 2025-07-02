/**
 * 配送APIからのレスポンス
 */
export interface DeliveryApiResponse {
  message: string;
  totalItems: number;
  data: Delivery[];
}

/**
 * 配送モデル
 */
export interface Delivery {
  id: number;
  delivery_type_division_id: number;
  customer_type: number;
  customer_id?: number;
  name: string;
  sales_type_id: number;
  sales_id?: number;
  shipping_address?: string;
  tel?: string;
  additional_tel?: string;
  delivery_specified_time?: string;
  delivery_start_time?: string;
  delivery_complete_time?: string;
  delivery_employee_id?: number;
  cors_slip_id?: number;
  rs_slip_id?: number;
  remarks_1?: string;
  remarks_2?: string;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  deleted_at?: string;
  deleted_id?: number;
  division_delivery_type_code: number;
  division_delivery_type_name: string;
  division_delivery_type_value: string;
  employee_delivery_last_name?: string;
  employee_delivery_first_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  employee_deleted_last_name?: string;
  employee_deleted_first_name?: string;
}

// type DeliveryLogicalNamesForDisplay = {
//   [key: string]: string;
// };

// // 物理名で論理名を取得するためのオブジェクト（画面表示用）
// export const deliveryLogicalNamesForDisplay: DeliveryLogicalNamesForDisplay = {
//   sales_slip_sales_slip_cd: '売上伝票番号',
//   member_name: '会員名',
//   address: '配送住所',
//   tel: '電話番号',
//   delivery_specified_time: '配送指定日時',
//   delivery_start_time: '配送開始日時',
//   delivery_complete_time: '配送完了日時',
//   employee_delivery_name: '配送担当者',
//   remarks_1: '備考1',
//   remarks_2: '備考2',
//   created_at: '登録日時',
//   employee_created_name: '登録者',
//   updated_at: '最終更新日時',
//   employee_updated_name: '最終更新者名',
// };

// // 画面表示用キー
// export const deliveryKeysForDisplay = [
//   'sales_slip_sales_slip_cd',
//   'member_name',
//   'address',
//   'tel',
//   'delivery_specified_time',
//   'delivery_start_time',
//   'delivery_complete_time',
//   'employee_delivery_name',
//   'remarks_1',
//   'remarks_2',
//   'created_at',
//   'employee_created_name',
//   'updated_at',
//   'employee_updated_name',
// ];

// /**
//  * 空の配送オブジェクト
//  */
// export const emptyDelivery: Delivery = {
//   id: 0,
//   member_id: 0,
//   sales_id: 0,
//   address: '',
//   tel: '',
//   delivery_specified_time: '',
//   delivery_start_time: '',
//   delivery_complete_time: '',
//   delivery_employee_id: 0,
//   remarks_1: '',
//   remarks_2: '',
// };
