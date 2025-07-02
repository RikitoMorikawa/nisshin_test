/**
 * 在庫履歴APIからのレスポンス
 */
export interface StockTransferApiResponse {
  message: string;
  totalItems: number;
  data: StockTransfer[];
}

/**
 * 在庫
 */
export interface StockTransfer {
  id: number;
  product_id: number;
  product_name: string;
  store_id: number;
  store_name: string;
  parent_id?: number;
  quantity: number;
  stock_transfer_date: string;
  remarks: string;
  created_at: string;
  created_id: number;

  /**
   * 最終更新日時
   */
  updated_at?: string;

  /**
   * 最終更新者ID
   */
  updated_id?: string;
  /**
   * 登録者 姓
   */
  employee_created_last_name?: string;

  /**
   * 登録者 名
   */
  employee_created_first_name?: string;

  /**
   * 更新者 姓
   */
  employee_updated_last_name?: string;

  /**
   * 更新者 名
   */
  employee_updated_first_name?: string;
}
