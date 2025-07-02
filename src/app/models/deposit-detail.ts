/**
 * 入金明細APIからのレスポンス
 */
export interface DepositDetailApiResponse {
  message: string;
  totalItems: number;
  data: DepositDetail[];
}

/**
 * 入金明細
 */
export interface DepositDetail {
  id: number;
  deposit_id: number;
  deposit_detail_division_code: number;
  deposit_amount: number;
  estimated_deposit_amount: number;
  deposit_date: string;
  remarks_1: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at: string;
  deleted_id: string;
  deposit_remarks_1: string;
  deposit_client_id: number;
  deposit_client_name: string;
  deposit_client_name_kana: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}

export const dummyData: DepositDetail[] = [
  // 以下のデータを15回繰り返します
  ...Array(15)
    .fill(null)
    .map((_, index) => ({
      id: 1,
      deposit_id: 1,
      deposit_detail_division_code: 1,
      deposit_amount: 10,
      estimated_deposit_amount: 10,
      deposit_date: '2024-02-01T00:00:00',
      remarks_1: '詳細備考001',
      created_at: '2024-02-08T17:25:08',
      created_id: 8,
      updated_at: '2024-02-08T17:25:08',
      updated_id: 8,
      deleted_at: '',
      deleted_id: '',
      deposit_remarks_1: '備考1',
      deposit_client_id: 1,
      deposit_client_name: '得意先001',
      deposit_client_name_kana: '',
      employee_created_last_name: 'テスト',
      employee_created_first_name: '社員 名更新',
      employee_updated_last_name: 'テスト',
      employee_updated_first_name: '社員 名更新',
    })),
];
