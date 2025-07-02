/**
 * 会社マスタ
 */
export interface Company {
  /**
   * 主キー
   */
  id: number;

  /**
   * ユーザーオブジェクトID
   */
  user_object_id: string;

  /**
   * 会社名
   */
  name: string;
}
