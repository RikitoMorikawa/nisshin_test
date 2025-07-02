/**
 * 区分APIからのレスポンス
 */
export interface CustomTagApiResponse {
  message: string;
  totalItems: number;
  data: CustomTag[];
}

/**
 * カスタムタグ
 */
export interface CustomTag {
  /**
   * 主キー
   */
  id: number;

  /**
   * タグ名
   */
  name: string;

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
  updated_at: string;

  /**
   * 最終更新者ID
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
   * 登録者姓
   */
  employee_created_last_name: string;

  /**
   * 登録者名
   */
  employee_created_first_name: string;

  /**
   * 登録者姓
   */
  employee_updated_last_name: string;

  /**
   * 登録者名
   */
  employee_updated_first_name: string;
}
