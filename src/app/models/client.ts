/**
 * 得意先APIからのレスポンス
 */
export interface ClientApiResponse {
  message: string;
  totalItems: number;
  data: Client[];
}

/**
 * 得意先
 */
export interface Client {
  id: number; // 主キー
  client_cd: number; // 得意先コード
  name: string; // 得意先名
  name_kana: string; // 得意先名カナ
  pic_name: string; // 担当者名
  pic_name_kana: string; // 担当者名カナ
  billing_cd: number; // 請求先コード
  postal_code: string; // 郵便番号
  province: string; // 都道府県
  locality: string; // 市区町村
  street_address: string; // 町名番地
  other_address: string; // 建物名など
  mail: string; // メールアドレス
  tel: string; // 電話番号
  fax: string; // FAX番号
  remarks_1: string; // 備考1
  remarks_2: string; // 備考2
  cutoff_date_billing: number; // 締日
  scheduled_payment_date: number | ''; // 支払予定日
  next_billing_date?: string; // 次回請求日
  payment_division_id: number; // 支払区分
  division_payment_value: string; // 支払区分値
  payment_term: number | ''; // 支払いサイト（注意：「支払サイト」でなない）
  sales_tax_division_id: number | ''; // 消費税区分
  division_sales_tax_value: string; // 消費税区分値
  sales_tax_calc_division_id: number; // 消費税計算区分
  division_sales_tax_calc_value: string; // 消費税計算区分値
  sales_fraction_division_id: number | ''; // 販売端数区分
  division_sales_fraction_value: string; // 販売端数区分値
  sales_tax_fraction_division_id: number; // 消費税端数区分
  division_sales_tax_fraction_value: string; // 消費税端数区分値
  print_division_id: number | ''; // 印刷区分
  division_print_value: string; // 印刷区分値
  rank_division_id: string | number; // ランク価格区分id
  division_rank_name: string; // ランク価格区分名
  division_rank_value: string; // ランク価格区分値
  division_rank_code: number; // ランク価格区分コード
  credit: number | ''; // 売掛限度額
  line_num: number | ''; // 明細行数
  title_division_id: number | ''; // 敬称
  division_title_value: string; // 敬称「指定」時の敬称
  custom_title: string; // カスタム敬称
  accounts_receivable_balance?: number | ''; // 売掛金
  next_credit_confirmation_date: string; // 与信の次回確認日
  created_at: string; // 登録日時
  created_id: number; // 登録者ID
  updated_at: string; // 最終更新日時
  updated_id: number; // 最終更新者ID
  deleted_at: string; // 削除日時
  deleted_id: number; // 削除者ID
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
