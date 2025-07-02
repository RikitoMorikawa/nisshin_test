/**
 * 区分APIからのレスポンス
 */
export interface InventoryApiResponse {
  message: string;
  totalItems: number;
  data: Inventory[];
}

/**
 * 発注
 */
export interface Inventory {
  id: number;
  management_cd: string;
  product_id: number;
  stock_quantity: number;
  store_id: number;
  inventory_stock_quantity: number;
  difference_quantity: number;
  inventory_execution_date: string;
  inventory_complete_date: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  product_name: string;
  product_image_path: string;
  store_name: string;
  supplier_name: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
