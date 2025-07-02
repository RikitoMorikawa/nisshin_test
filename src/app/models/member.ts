/**
 * 会員APIからのレスポンス
 */
export interface MemberApiResponse {
  first_name: string;
  last_name: string;
  message: string;
  totalItems: number;
  data: Member[];
}

export interface MemberSuggestsApiResponse {
  message: string;
  totalItems: number;
  data: Member[];
}

/**
 * 会員model
 */
export interface Member {
  id: number;
  member_cd: number;
  last_name: string;
  first_name: string;
  last_name_kana?: string;
  first_name_kana?: string;
  postal_code?: string;
  province?: string;
  locality?: string;
  street_address?: string;
  other_address?: string;
  tel?: string;
  mail?: string;
  point?: string;
  status_division_id: number;
  division_status_value: string;
  remarks_1?: string;
  remarks_2?: string;
  identification_document_confirmation_date?: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at?: string;
  deleted_id?: number;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
  // 他のプロパティ
  full_name?: string; // 追加
}

type memberLogicalNameForDisplay = {
  [key: string]: string;
};

// 物理名で論理名を取得するためのオブジェクト（画面表示用）
export const memberLogicalNameForDisplay: memberLogicalNameForDisplay = {
  member_cd: '会員番号',
  last_name: 'お名前（姓）',
  first_name: 'お名前（名）',
  last_name_kana: 'お名前（姓）カナ',
  first_name_kana: 'お名前（名）カナ',
  postal_code: '郵便番号',
  province: '都道府県',
  locality: '市区町村',
  street_address: '町名番地',
  other_address: '建物名など',
  tel: '電話番号',
  mail: 'メールアドレス',
  point: 'ポイント保有数',
  status_division_id: '会員ステータス区分',
  remarks_1: '備考1',
  remarks_2: '備考2',
  password: 'ログイン用パスワード',
  confirm_password: 'ログイン用パスワード（確認）',
  created_at: '登録日時',
  created_id: '登録者ID',
  updated_at: '更新日時',
  updated_id: '更新者ID',
  deleted_at: '削除日時',
  deleted_id: '削除者ID',
  employee_created_last_name: '登録者 姓',
  employee_created_first_name: '登録者 名',
  employee_updated_last_name: '更新者 姓',
  employee_updated_first_name: '更新者 名',
};
