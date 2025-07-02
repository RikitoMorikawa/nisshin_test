/**
 * 特売APIからのレスポンス
 */
export interface SpecialSaleApiResponse {
  message: string;
  totalItems: number;
  data: SpecialSale[];
}

/**
 * 特売
 */
export interface SpecialSale {
  id: number;
  special_sale_cd: number;
  store_id: number;
  gyo_cd: number;
  product_id: number;
  barcode: string;
  start_date: string;
  end_date: string;
  special_sale_price: number;
  special_sale_const_price: number;
  created_at: string;
  created_id: number | '';
  updated_at: string;
  updated_id: number | '';
  deleted_at: string;
  deleted_id: number | '';
  store_name: string;
  product_name: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
