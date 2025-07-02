/**
 * 単位
 */
export interface Unit {
  /**
   * 主キー
   */
  id: number;

  /**
   * 単位名
   */
  unit_name: string;

  /**
   * 単位区分ID
   */
  unit_division_id: number;

  /**
   * 登録日時
   */
  created_at: string;

  /**
   * 登録者ID
   */
  created_employee_id: number;

  /**
   * 最終更新日時
   */
  updated_at: string;

  /**
   * 最終更新者ID
   */
  updated_employee_id: number;

  /**
   * 削除日時
   */
  deleted_at: string;

  /**
   * 削除者ID
   */
  deleted_employee_id: number;
}
