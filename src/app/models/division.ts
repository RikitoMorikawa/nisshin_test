/**
 * 区分APIからのレスポンス
 */
export interface DivisionApiResponse {
  message: string;
  totalItems: number;
  data: Division[];
}

/**
 * 区分テーブル
 */
export interface Division {
  /**
   * 主キー
   */
  id: number;

  /**
   * 区分名
   */
  name: string;

  /**
   * 区分コード
   */
  division_code: number;

  /**
   * 値
   */
  value: string;

  /**
   * 登録日時
   */
  created_at: string;

  /**
   * 登録者ID
   */
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
   * 削除日時
   */
  deleted_at?: string;

  /**
   * 削除者ID
   */
  deleted_id?: string;

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
