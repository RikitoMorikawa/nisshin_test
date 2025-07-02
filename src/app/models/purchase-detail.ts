/**
 * 仕入明細APIからのレスポンス
 */
export interface PurchaseDetailApiResponse {
  message: string;
  totalItems: number;
  data: PurchaseDetail[];
}

/**
 * 仕入明細
 */
export interface PurchaseDetail {
  id: number;
  purchase_id: number;
  product_id: number;
  order_quantity: number;
  purchase_order_id: number;
  // purchase_order_order_date: string;
  order_price: number | '';
  receiving_date: string;
  receiving_quantity: number;
  receiving_employee_id: number;
  order_status_division_id: number | '';
  product_name_alias?: string;
  supplier_name?: string;
  shelf_value?: string;
  unit_value?: string;
  shelf_col_value?: string;
  price_tag_value?: string;
  seal_print_value?: string;
  created_at?: string;
  created_id?: number;
  updated_at?: string;
  updated_id?: number;
  purchase_accounts_payable_aggregate_id?: number;
  product_name?: string;
  product_barcode: string;
  product_minimum_order_quantity?: string;
  product_supplier_product_cd?: string;
  product_regulated_stock_num: number;
  product_quantity: number;
  total: number;
  order_status_code?: number;
  order_status_name?: string;
  order_status_value?: string;
  employee_receiving_last_name?: string;
  employee_receiving_first_name?: string;
  employee_cancel_last_name?: string;
  employee_cancel_first_name?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  supplier_sales_tax_division_value?: string;
  supplier_sales_tax_division_id?: number;
  is_discount?: number;
}
