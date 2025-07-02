/**
 * 価格変更APIからのレスポンス
 */
export interface PriceChangeApiResponse {
  message: string;
  totalItems: number;
  data: PriceChange[];
}

/**
 * 価格変更
 */
export interface PriceChange {
  /**
   * 主キー
   */
  id: number;

  /**
   * 商品ID
   */
  product_id: number;

  /**
   * 商品名
   */
  product_name: string;

  /**
   * 商品名かな
   */
  product_name_kana: string;

  /**
   * 仕入先消費税区分ID
   */
  supplier_sales_tax_division_id: number;

  /**
   * 消費税区分ID（売上用）
   */
  sales_tax_division_id: number;

  /**
   * 変更後荒利率
   */
  gross_profit_rate: number;

  /**
   * 変更後B荒利率
   */
  b_gross_profit_rate: number;

  /**
   * 変更後C荒利率
   */
  c_gross_profit_rate: number;

  /**
   * 変更後原価
   */
  cost_price: number;

  /**
   * 変更後B原価
   */
  b_cost_price: number;

  /**
   * 変更後C原価
   */
  c_cost_price: number;

  /**
   * 変更後売価
   */
  selling_price: number;

  /**
   * 変更後B売価
   */
  b_selling_price: number;

  /**
   * 変更後C売価
   */
  c_selling_price: number;

  /**
   * 価格変更日時（予定）
   */
  scheduled_price_change_date: string;

  /**
   * 価格変更完了日時
   */
  price_change_completion_date: string;

  /**
   * 登録日時
   */
  created_at: string;

  /**
   * 登録者ID
   */
  created_id: number;

  /**
   * 更新日時
   */
  updated_at: string;

  /**
   * 更新者ID
   */
  updated_id: number;

  /**
   * 削除日時
   */
  deleted_at: string;

  /**
   * 削除者ID
   */
  deleted_id: number;

  /**
   * 登録者 姓
   */
  employee_created_last_name: string;

  /**
   * 登録者 名
   */
  employee_created_first_name: string;

  /**
   * 更新者 姓
   */
  employee_updated_last_name: string;

  /**
   * 更新者 名
   */
  employee_updated_first_name: string;
}

export const dummyData: PriceChange[] = Array(15)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    product_id: index + 1,
    product_name: `Product ${index + 1}`,
    product_name_kana: `Product ${index + 1}`,
    supplier_sales_tax_division_id: index + 1,
    sales_tax_division_id: index + 1,
    gross_profit_rate: (index + 1) * 10,
    b_gross_profit_rate: (index + 1) * 10 + 1,
    c_gross_profit_rate: (index + 1) * 10 + 2,
    cost_price: (index + 1) * 1000,
    b_cost_price: (index + 1) * 1000 + 100,
    c_cost_price: (index + 1) * 1000 + 200,
    selling_price: (index + 1) * 2000,
    b_selling_price: (index + 1) * 2000 + 200,
    c_selling_price: (index + 1) * 2000 + 400,
    scheduled_price_change_date: `2023-06-${String(index + 1).padStart(
      2,
      '0'
    )}T00:00:00`,
    price_change_completion_date: `2023-06-${String(index + 2).padStart(
      2,
      '0'
    )}T00:00:00`,
    created_at: `2023-06-${String(index + 1).padStart(2, '0')}T00:00:00`,
    created_id: index + 1,
    updated_at: `2023-06-${String(index + 2).padStart(2, '0')}T00:00:00`,
    updated_id: index + 2,
    deleted_at: `2023-06-${String(index + 3).padStart(2, '0')}T00:00:00`,
    deleted_id: index + 3,
    employee_created_last_name: `CreatedLastName${index + 1}`,
    employee_created_first_name: `CreatedFirstName${index + 1}`,
    employee_updated_last_name: `UpdatedLastName${index + 1}`,
    employee_updated_first_name: `UpdatedFirstName${index + 1}`,
  }));

// /**
//  * 価格変更
//  */
// export interface PriceChange {
//   /**
//    * 主キー
//    */
//   id: number;

//   /**
//    * 商品ID
//    */
//   product_id: number;

//   /**
//    * 商品名
//    */
//   product_name: string;

//   /**
//    * 商品コード
//    */
//   product_product_cd: string;

//   /**
//    * 変更前荒利率
//    */
//   gross_profit_rate: number;

//   /**
//    * 変更前B荒利率
//    */
//   b_gross_profit_rate: number;

//   /**
//    * 変更前C荒利率
//    */
//   c_gross_profit_rate: number;

//   /**
//    * 変更前原価
//    */
//   cost_price: number;

//   /**
//    * 変更前原価（税抜）
//    */
//   tax_excluded_cost_price: number;

//   /**
//    * 変更前原価（税込）
//    */
//   tax_included_cost_price: number;

//   /**
//    * 変更前B原価
//    */
//   b_cost_price: number;

//   /**
//    * 変更前B原価（税抜）
//    */
//   b_tax_excluded_cost_price: number;

//   /**
//    * 変更前B原価（税込）
//    */
//   b_tax_included_cost_price: number;

//   /**
//    * 変更前C原価
//    */
//   c_cost_price: number;

//   /**
//    * 変更前C原価（税抜）
//    */
//   c_tax_excluded_cost_price: number;

//   /**
//    * 変更前C原価（税込）
//    */
//   c_tax_included_cost_price: number;

//   /**
//    * 変更前売価
//    */
//   selling_price: number;

//   /**
//    * 変更前売価（税抜）
//    */
//   tax_excluded_selling_price: number;

//   /**
//    * 変更前売価（税込）
//    */
//   tax_included_selling_price: number;

//   /**
//    * 変更前B売価
//    */
//   b_selling_price: number;

//   /**
//    * 変更前B売価（税抜）
//    */
//   b_tax_excluded_selling_price: number;

//   /**
//    * 変更前B売価（税込）
//    */
//   b_tax_included_selling_price: number;

//   /**
//    * 変更前C売価
//    */
//   c_selling_price: number;

//   /**
//    * 変更前C売価（税抜）
//    */
//   c_tax_excluded_selling_price: number;

//   /**
//    * 変更前C売価（税込）
//    */
//   c_tax_included_selling_price: number;

//   /**
//    * 変更後荒利率
//    */
//   after_gross_profit_rate: number;

//   /**
//    * 変更後B荒利率
//    */
//   after_b_gross_profit_rate: number;

//   /**
//    * 変更後C荒利率
//    */
//   after_c_gross_profit_rate: number;

//   /**
//    * 変更後原価
//    */
//   after_cost_price: number;

//   /**
//    * 変更後原価（税抜）
//    */
//   after_tax_excluded_cost_price: number;

//   /**
//    * 変更後原価（税込）
//    */
//   after_tax_included_cost_price: number;

//   /**
//    * 変更後B原価
//    */
//   after_b_cost_price: number;

//   /**
//    * 変更後B原価（税抜）
//    */
//   after_b_tax_excluded_cost_price: number;

//   /**
//    * 変更後B原価（税込）
//    */
//   after_b_tax_included_cost_price: number;

//   /**
//    * 変更後C原価
//    */
//   after_c_cost_price: number;

//   /**
//    * 変更後C原価（税抜）
//    */
//   after_c_tax_excluded_cost_price: number;

//   /**
//    * 変更後C原価（税込）
//    */
//   after_c_tax_included_cost_price: number;

//   /**
//    * 変更後売価
//    */
//   after_selling_price: number;

//   /**
//    * 変更後売価（税抜）
//    */
//   after_tax_excluded_selling_price: number;

//   /**
//    * 変更後売価（税込）
//    */
//   after_tax_included_selling_price: number;

//   /**
//    * 変更後B売価
//    */
//   after_b_selling_price: number;

//   /**
//    * 変更後B売価（税抜）
//    */
//   after_b_tax_excluded_selling_price: number;

//   /**
//    * 変更後B売価（税込）
//    */
//   after_b_tax_included_selling_price: number;

//   /**
//    * 変更後C売価
//    */
//   after_c_selling_price: number;

//   /**
//    * C売価（税抜）
//    */
//   after_c_tax_excluded_selling_price: number;

//   /**
//    * 変更後C売価（税込）
//    */
//   after_c_tax_included_selling_price: number;

//   /**
//    * 価格変更日時（予定）
//    */
//   scheduled_price_change_date: string;

//   /**
//    * 価格変更完了日時
//    */
//   price_change_completion_date: string;

//   /**
//    * 登録日時
//    */
//   created_at: string;

//   /**
//    * 登録者ID
//    */
//   created_id: number;

//   /**
//    * 更新日時
//    */
//   updated_at: string;

//   /**
//    * 更新者ID
//    */
//   updated_id: number;

//   /**
//    * 削除日時
//    */
//   deleted_at: string;

//   /**
//    * 削除者ID
//    */
//   deleted_id: number;

//   /**
//    * 登録者 姓
//    */
//   employee_created_last_name: string;

//   /**
//    * 登録者 名
//    */
//   employee_created_first_name: string;

//   /**
//    * 更新者 姓
//    */
//   employee_updated_last_name: string;

//   /**
//    * 更新者 名
//    */
//   employee_updated_first_name: string;
// }
