/**
 * ランク価格APIからのレスポンス
 */
export interface PriceRankingApiResponse {
  message: string;
  totalItems: number;
  data: PriceRanking[];
}

/**
 * ランク価格
 */
export interface PriceRanking {
  id: number;
  rank_division_id: number;
  store_id: number;
  product_id: number;
  sales_tax_division_id: number;
  sales_fraction_division_id: number;
  gross_profit_rate: number | '';
  b_gross_profit_rate: number | '';
  c_gross_profit_rate: number | '';
  selling_price: number;
  b_selling_price: number | '';
  c_selling_price: number | '';
  supplier_sales_tax_division_id: number;
  supplier_sales_fraction_division_id: number;
  supplier_cost_price: number;
  b_supplier_cost_price: number | '';
  c_supplier_cost_price: number | '';
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number | '';
  deleted_at: string;
  deleted_id: number | '';
  store_name: string;
  product_name: string;
  division_rank_name: string;
  division_rank_code: number | '';
  division_rank_value: string;
  division_sales_tax_name: string;
  division_sales_tax_code: number | '';
  division_sales_tax_value: string;
  division_sales_fraction_name: string;
  division_sales_fraction_code: number | '';
  division_sales_fraction_value: string;
  division_supplier_sales_tax_name: string;
  division_supplier_sales_tax_code: number | '';
  division_supplier_sales_tax_value: string;
  division_supplier_sales_fraction_name: string;
  division_supplier_sales_fraction_code: number | '';
  division_supplier_sales_fraction_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
