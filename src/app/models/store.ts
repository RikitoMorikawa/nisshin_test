/**
 * 店舗APIからのレスポンス
 */
export interface StoreApiResponse {
  message: string;
  totalItems: number;
  data: Store[];
}

// 店舗モデル
export type Store = {
  /**
   * 主キー
   */
  id: number;

  /**
   * 店舗名
   */
  name: string;

  /**
   * 店舗名カナ
   */
  name_kana?: string;

  /**
   * 略称名
   */
  alias?: string;

  /**
   * 郵便番号
   */
  postal_code: string;

  /**
   * 都道府県
   */
  province: string;

  /**
   * 市区町村
   */
  locality: string;

  /**
   * 町名番地
   */
  street_address: string;

  /**
   * 建物名など
   */
  other_address?: string;

  /**
   * 電話番号
   */
  tel: string;

  /**
   * FAX番号
   */
  fax?: string;

  /**
   * 振込先1
   */
  payee_1?: string;

  /**
   * 振込先2
   */
  payee_2?: string;

  /**
   * ロゴ画像URL
   */
  logo_image_path?: string;

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

export const storeLogicalNames = {
  name: '店舗名',
  name_kana: '店舗名カナ',
  alias: '略称名',
  postal_code: '郵便番号',
  province: '都道府県',
  locality: '市区町村',
  street_address: '町名番地',
  other_address: '建物名など',
  tel: '電話番号',
  fax: 'FAX番号',
  payee_1: '振込先1',
  payee_2: '振込先2',
  logo_image_path: 'ロゴ画像URL',
  created_at: '登録日時',
  updated_at: '最終更新日時',
  deleted_at: '削除日時',
  employee_created_last_name: '登録者 姓',
  employee_created_first_name: '登録者 名',
  employee_updated_last_name: '最終更新者 姓',
  employee_updated_first_name: '最終更新者 名',
};

// 詳細画面ループ用
export const storeKeysForDisplay = [
  'name',
  'name_kana',
  'alias',
  'postal_code',
  'province',
  'locality',
  'street_address',
  'other_address',
  'tel',
  'fax',
  'payee_1',
  'payee_2',
  'created_at',
  'created_id',
  'updated_at',
  'updated_id',
];

//
type StoreLogicalNamesForDisplay = {
  [key: string]: string;
};

export const storeLogicalNamesForDisplay: StoreLogicalNamesForDisplay = {
  name: '店舗名',
  name_kana: '店舗名カナ',
  alias: '略称名',
  postal_code: '郵便番号',
  province: '都道府県',
  locality: '市区町村',
  street_address: '町名番地',
  other_address: '建物名など',
  tel: '電話番号',
  fax: 'FAX番号',
  payee_1: '振込先1',
  payee_2: '振込先2',
  logo_image_path: 'ロゴ画像URL',
  created_at: '登録日時',
  created_id: '登録者',
  updated_at: '最終更新日時',
  updated_id: '最終更新者',
};
