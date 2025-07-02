/**
 * ロールAPIからのレスポンス
 */
export interface RoleApiResponse {
  message: string;
  totalItems: number;
  data: Role[];
}

/**
 * ロール
 */
export type Role = {
  /**
   *
   */
  id: number;

  /**
   * ロール名
   */
  name: string;

  /**
   * ロール概要
   */
  description?: string;

  /**
   * 登録日時
   */
  created_at?: string;

  /**
   * 登録者ID
   */
  created_id?: number;

  /**
   * 最終更新日時
   */
  updated_at?: string;

  /**
   * 最終更新者ID
   */
  updated_id?: number;

  /**
   * 削除日時
   */
  deleted_at?: string;

  /**
   * 削除者ID
   */
  deleted_id?: number;

  /**
   * 登録者 姓
   */
  employee_created_last_name?: string;

  /**
   * 登録者 名
   */
  employee_created_first_name?: string;

  /**
   * 最終更新者 姓
   */
  employee_updated_last_name?: string;

  /**
   * 最終更新者 名
   */
  employee_updated_first_name?: string;
};

// 詳細画面ループ用
export const roleKeysForDisplay = [
  'name',
  'description',
  'created_at',
  'created_id',
  'updated_at',
  'updated_id',
];

// 論理名取得用
export const roleLogicalNames = {
  name: '権限名',
  description: '権限概要',
  created_at: '登録日時',
  updated_at: '最終更新日時',
  deleted_at: '削除日時',
  employee_created_last_name: '登録者 姓',
  employee_created_first_name: '登録者 名',
  employee_updated_last_name: '最終更新者 姓',
  employee_updated_first_name: '最終更新者 姓',
};

// 画面表示用
type RoleLogicalNamesForDisplay = {
  [key: string]: string;
};

// 画面表示用
export const roleLogicalNamesForDisplay: RoleLogicalNamesForDisplay = {
  id: '主キー',
  name: '権限名',
  description: '権限概要',
  created_at: '登録日時',
  created_id: '登録者',
  updated_at: '最終更新日時',
  updated_id: '最終更新者',
  deleted_at: '削除日時',
  deleted_id: '削除者',
  employee_created_last_name: '登録者 姓',
  employee_created_first_name: '登録者 名',
  employee_updated_last_name: '最終更新者 姓',
  employee_updated_first_name: '最終更新者 姓',
};
