/**
 * APIからのレスポンス
 */
export interface RentalProductApiResponse {
  message: string;
  totalItems: number;
  data: RentalProduct[];
}

/**
 * ステータス指定
 */
export interface RentalProductChangeStatus {
  status_division_id: number;
  product_id_list: string;
}

/**
 * レンタル商品
 */
export interface RentalProduct {
  id: number;
  count?: number; // 貸出可能個数を保持する目的で追加、GETデータには含まれない、POSTデータに含めいないこと
  store_id: number;
  name: string;
  name_kana: string;
  cost_price: number;
  standard: string;
  sales_tax_division_id: number;
  sales_fraction_division_id: number;
  product_barcode: string;
  barcode: string;
  delivery_charge: number;
  gross_profit_rate: number;
  selling_price: number;
  discount_division_id: number;
  product_division_id: number;
  point_division_id: number;
  large_category_id: number;
  medium_category_id: number;
  small_category_id: number;
  remarks_1: string;
  remarks_2: string;
  remarks_3: string;
  remarks_4: string;
  image_path: string;
  data_permission_division_id: number;
  status_division_id: number;
  delivery_charge_flag: number;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  out_of_service_at?: string;
  out_of_service_id?: number;
  store_name: string;
  division_sales_tax_code?: number;
  division_sales_tax_name?: string;
  division_sales_tax_value?: string;
  division_sales_fraction_code?: number;
  division_sales_fraction_name?: string;
  division_sales_fraction_value?: string;
  division_discount_code?: number;
  division_discount_name?: string;
  division_discount_value?: string;
  division_product_code?: number;
  division_product_name?: string;
  division_product_value?: string;
  division_point_code?: number;
  division_point_name?: string;
  division_point_value?: string;
  large_category_name?: string;
  medium_category_name?: string;
  small_category_name?: string;
  division_data_permission_code?: number;
  division_data_permission_name?: string;
  division_data_permission_value?: string;
  division_status_code?: number;
  division_status_name?: string;
  division_status_value?: string;
  employee_created_first_name?: string;
  employee_created_last_name?: string;
  employee_updated_first_name?: string;
  employee_updated_last_name?: string;
  employee_out_of_service_first_name?: string;
  employee_out_of_service_last_name?: string;
}
