/**
 * 区分APIからのレスポンス
 */
export interface BasicInformationApiResponse {
  message: string;
  totalItems: number;
  data: BasicInformation[];
}

/**
 * 基本情報マスタ
 */
export interface BasicInformation {
  /**
   * 法人番号
   */
  corporate_num?: string;

  /**
   * 登録日時
   */
  created_at: string;

  /**
   * 登録者ID
   */
  created_id: number;

  /**
   * 結合テーブルの値
   */
  division_sales_fraction_code?: number;
  division_sales_fraction_name?: string;
  division_sales_fraction_value?: string;
  division_sales_tax_fraction_code?: number;
  division_sales_tax_fraction_name?: string;
  division_sales_tax_fraction_value?: string;
  employee_created_first_name?: string;
  employee_created_last_name?: string;
  employee_updated_first_name?: string;
  employee_updated_last_name?: string;

  /**
   * FAX番号
   */
  fax?: string;

  /**
   * 自動採番ID
   */
  id?: number;

  /**
   * インボイス登録番号
   */
  invoice_number: string;

  /**
   * 市区町村
   */
  locality: string;

  /**
   * ロゴ画像のパス
   */
  logo_image_path?: string;

  /**
   * メールアドレス
   */
  mail?: string;

  /**
   * 社名
   */
  name: string;

  /**
   * 社名カナ
   */
  name_kana?: string;

  /**
   * 建物名など
   */
  other_address?: string;

  /**
   * その他の企業情報
   */
  other_attribute?: object;

  /**
   * 振込先1
   */
  payee_1?: string;

  /**
   * 振込先2
   */
  payee_2?: string;

  /**
   * 郵便番号
   */
  postal_code: string;

  /**
   * 都道府県
   */
  province: string;

  /**
   * 代表者画像のパス
   */
  representative_image_path?: string;

  /**
   * 代表者名
   */
  representative_name?: string;

  /**
   * 販売端数区分ID
   */
  sales_fraction_division_id: number;

  /**
   * 消費税端数区分ID
   */
  sales_tax_fraction_division_id: number;

  /**
   * 町名番地
   */
  street_address: string;

  /**
   * 電話番号
   */
  tel: string;

  /**
   * 最終更新日時
   */
  updated_at?: string;

  /**
   * 最終更新者ID
   */
  updated_id?: number;
}

// 詳細表示用キー
export const BasicInformationKeysForDisplay = [
  'name',
  'name_kana',
  'corporate_num',
  'invoice_number',
  'postal_code',
  'province',
  'locality',
  'street_address',
  'other_address',
  'tel',
  'fax',
  'mail',
  // 'other_attribute', 利用しない
  'sales_fraction_division_id',
  'sales_tax_fraction_division_id',
  'payee_1',
  'payee_2',
  'representative_name',
  'created_at',
  'created_id',
  'updated_at',
  'updated_id',
];

type BasicInformationLogicalNamesForDisplay = {
  [key: string]: string;
};

// 詳細表示用
export const BasicInformationLogicalNames: BasicInformationLogicalNamesForDisplay =
  {
    name: '社名',
    name_kana: '社名カナ',
    corporate_num: '法人番号',
    invoice_number: 'インボイス制度登録番号',
    postal_code: '郵便番号',
    province: '都道府県',
    locality: '市区町村',
    street_address: '町名番地',
    other_address: '建物名など',
    tel: '電話番号',
    fax: 'FAX番号',
    mail: 'メールアドレス',
    // other_attribute: 'その他の企業情報', 利用しない
    sales_fraction_division_id: '販売端数区分',
    sales_tax_fraction_division_id: '消費税端数区分',
    payee_1: '振込先1',
    payee_2: '振込先2',
    representative_name: '代表者名',
    created_at: '登録日時',
    created_id: '登録者',
    updated_at: '最終更新日時',
    updated_id: '最終更新者',
  };
