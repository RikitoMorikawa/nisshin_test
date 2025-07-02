/**
 * 社員APIからのレスポンス
 */
export interface EmployeeApiResponse {
  message: string;
  totalItems: number;
  data: Employee[];
}

export type EmployeeAndRelatedValue = {
  message: string;
  totalItems: number;
  data: Employee[];
  statusDivisions: { value: number; text: string };
};

/**
 * 社員
 */
export type Employee = {
  /**
   * 社員バーコード
   */
  barcode?: string;

  /**
   * 社員コード
   */
  code: number;

  /**
   * 登録日時
   */
  created_at: string;

  /**
   * 登録者ID
   */
  created_id: number;

  /**
   * 区分コード
   */
  division_status_code?: string | number;

  /**
   * 区分名
   */
  division_status_name?: string | number;

  /**
   * 区分の値
   */
  division_status_value?: string | number;

  /**
   * 登録者名
   */
  employee_created_first_name?: string;

  /**
   * 登録者姓
   */
  employee_created_last_name?: string;

  /**
   * 更新者名
   */
  employee_updated_first_name?: string;

  /**
   * 更新者姓
   */
  employee_updated_last_name?: string;

  /**
   * 名
   */
  first_name: string;

  /**
   * メイ
   */
  first_name_kana: string;

  /**
   * 主キー
   */
  id: number;

  /**
   * プロフィール画像へのパス
   */
  image_path?: string;

  /**
   * 最終ログイン日時
   */
  last_login_at: string;

  /**
   * 姓
   */
  last_name: string;

  /**
   * セイ
   */
  last_name_kana: string;

  /**
   * メールアドレス
   */
  mail: string;

  /**
   * 最大割引率
   */
  max_discount_rate?: number | string;

  /**
   * B2CユーザーID
   */
  oid: string;

  /**
   * ログイン用パスワード
   */
  password: string;

  /**
   * POS用パスワード
   */
  pos_password?: string;

  /**
   * ロールID
   */
  role_id: number;

  /**
   * ロール名
   */
  role_name?: string;

  /**
   * 表示区分ID
   */
  status_division_id: number;

  /**
   * 店舗ID
   */
  store_id: number;

  /**
   * 店舗名
   */
  store_name?: string;

  /**
   * 店舗名かな
   */
  store_name_kana?: string;

  /**
   * 電話番号
   */
  tel?: string;

  /**
   * 更新日時
   */
  updated_at: string;

  /**
   * 更新者ID
   */
  updated_id: number;
};

type EmployeeLogicalNamesForDisplay = {
  [key: string]: string;
};

// 物理名で論理名を取得するためのオブジェクト（画面表示用）
export const employeeLogicalNamesForDisplay: EmployeeLogicalNamesForDisplay = {
  code: '社員コード',
  store_id: '所属店舗',
  role_id: '権限',
  last_name: '姓',
  first_name: '名',
  last_name_kana: 'セイ',
  first_name_kana: 'メイ',
  mail: 'メールアドレス',
  tel: '電話番号',
  barcode: '社員バーコード',
  max_discount_rate: '最大割引率',
  status_division_id: '表示区分',
  last_login_at: '最終ログイン日時',
  created_at: '登録日時',
  created_id: '登録者',
  updated_at: '更新日時',
  updated_id: '更新者',
};

// 画面表示用キー
export const employeeKeysForDisplay = [
  'code',
  'store_id',
  'role_id',
  'last_name',
  'first_name',
  'last_name_kana',
  'first_name_kana',
  'mail',
  'tel',
  'barcode',
  'max_discount_rate',
  'status_division_id',
  'last_login_at',
  'created_at',
  'created_id',
  'updated_at',
  'updated_id',
];

// 物理名で論理名を取得するためのオブジェクト
export const employeeLogicalNames = {
  id: 'ID',
  code: '社員コード',
  store_id: '所属店舗',
  role_id: '権限',
  mail: 'メールアドレス',
  tel: '電話番号',
  last_name: '姓',
  first_name: '名',
  last_name_kana: 'セイ',
  first_name_kana: 'メイ',
  password: 'ログイン用パスワード',
  pos_password: 'POS用パスワード',
  max_discount_rate: '最大割引率',
  barcode: '社員バーコード',
  oid: 'B2CユーザーID',
  last_login_at: '最終ログイン日時',
  created_at: '登録日時',
  created_id: '登録者',
  updated_at: '更新日時',
  updated_id: '更新者',
  status_division_id: '表示区分',
};
