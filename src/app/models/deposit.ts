/**
 * APIレスポンス
 */
export interface DepositApiResponse {
  message: string;
  totalItems: number;
  data: Deposit[];
}

/**
 * 入金
 */
export interface Deposit {
  id: number;
  client_id: number;
  remarks_1: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at: string;
  deleted_id: string;
  client_client_cd: number;
  client_name: string;
  client_name_kana: string;
  client_pic_name: string;
  client_pic_name_kana: string;
  client_billing_cd: number;
  client_postal_code: string;
  client_province: string;
  client_locality: string;
  client_street_address: string;
  client_other_address: string;
  client_tel: string;
  client_fax: string;
  client_mail: string;
  client_remarks_1: string;
  client_remarks_2: string;
  client_cutoff_date_billing: number;
  client_scheduled_payment_date: string;
  client_payment_division_id: number;
  client_payment_term: string;
  client_sales_tax_division_id: string;
  client_sales_tax_calc_division_id: number;
  client_sales_fraction_division_id: number;
  client_sales_tax_fraction_division_id: number;
  client_print_division_id: string;
  client_rank_division_id: string;
  client_credit: string;
  client_line_num: string;
  client_title_division_id: string;
  client_custom_title: string;
  client_division_payment_name: string;
  client_division_payment_code: number;
  client_division_payment_value: string;
  client_division_sales_tax_fraction_name: string;
  client_division_sales_tax_fraction_code: number;
  client_division_sales_tax_fraction_value: string;
  client_division_sales_tax_name: string;
  client_division_sales_tax_code: string;
  client_division_sales_tax_value: string;
  client_division_sales_tax_calc_name: string;
  client_division_sales_tax_calc_code: number;
  client_division_sales_tax_calc_value: string;
  client_division_sales_fraction_name: string;
  client_division_sales_fraction_code: number;
  client_division_sales_fraction_value: string;
  client_division_print_name: string;
  client_division_print_code: string;
  client_division_print_value: string;
  client_division_rank_name: string;
  client_division_rank_code: string;
  client_division_rank_value: string;
  client_division_title_name: string;
  client_division_title_code: string;
  client_division_title_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}

export const dummyData: Deposit[] = [
  // 以下のデータを15回繰り返します
  ...Array(15)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      client_id: index + 1,
      remarks_1: `テスト00` + (index + 1),
      created_at: `2024/02/0` + Math.floor(Math.random() * 9 + 1),
      created_id: index + 1,
      updated_at: `2024/02/0` + Math.floor(Math.random() * 9 + 1),
      updated_id: index + 1,
      deleted_at: `2024/02/0` + Math.floor(Math.random() * 9 + 1),
      deleted_id: `テスト00` + (index + 1),
      client_client_cd: index + 1,
      client_name: `テスト00` + (index + 1),
      client_name_kana: `テスト00` + (index + 1),
      client_pic_name: `テスト00` + (index + 1),
      client_pic_name_kana: `テスト00` + (index + 1),
      client_billing_cd: index + 1,
      client_postal_code: `テスト00` + (index + 1),
      client_province: `テスト00` + (index + 1),
      client_locality: `テスト00` + (index + 1),
      client_street_address: `テスト00` + (index + 1),
      client_other_address: `テスト00` + (index + 1),
      client_tel: `テスト00` + (index + 1),
      client_fax: `テスト00` + (index + 1),
      client_mail: `テスト00` + (index + 1),
      client_remarks_1: `テスト00` + (index + 1),
      client_remarks_2: `テスト00` + (index + 1),
      client_cutoff_date_billing: index + 1,
      client_scheduled_payment_date: `テスト00` + (index + 1),
      client_payment_division_id: index + 1,
      client_payment_term: `テスト00` + (index + 1),
      client_sales_tax_division_id: `テスト00` + (index + 1),
      client_sales_tax_calc_division_id: index + 1,
      client_sales_fraction_division_id: index + 1,
      client_sales_tax_fraction_division_id: index + 1,
      client_print_division_id: `テスト00` + (index + 1),
      client_rank_division_id: `テスト00` + (index + 1),
      client_credit: `テスト00` + (index + 1),
      client_line_num: `テスト00` + (index + 1),
      client_title_division_id: `テスト00` + (index + 1),
      client_custom_title: `テスト00` + (index + 1),
      client_division_payment_name: `テスト00` + (index + 1),
      client_division_payment_code: index + 1,
      client_division_payment_value: `テスト00` + (index + 1),
      client_division_sales_tax_fraction_name: `テスト00` + (index + 1),
      client_division_sales_tax_fraction_code: index + 1,
      client_division_sales_tax_fraction_value: `テスト00` + (index + 1),
      client_division_sales_tax_name: `テスト00` + (index + 1),
      client_division_sales_tax_code: `テスト00` + (index + 1),
      client_division_sales_tax_value: `テスト00` + (index + 1),
      client_division_sales_tax_calc_name: `テスト00` + (index + 1),
      client_division_sales_tax_calc_code: index + 1,
      client_division_sales_tax_calc_value: `テスト00` + (index + 1),
      client_division_sales_fraction_name: `テスト00` + (index + 1),
      client_division_sales_fraction_code: index + 1,
      client_division_sales_fraction_value: `テスト00` + (index + 1),
      client_division_print_name: `テスト00` + (index + 1),
      client_division_print_code: `テスト00` + (index + 1),
      client_division_print_value: `テスト00` + (index + 1),
      client_division_rank_name: `テスト00` + (index + 1),
      client_division_rank_code: `テスト00` + (index + 1),
      client_division_rank_value: `テスト00` + (index + 1),
      client_division_title_name: `テスト00` + (index + 1),
      client_division_title_code: `テスト00` + (index + 1),
      client_division_title_value: `テスト00` + (index + 1),
      employee_created_last_name: `テスト00` + (index + 1),
      employee_created_first_name: `テスト00` + (index + 1),
      employee_updated_last_name: `テスト00` + (index + 1),
      employee_updated_first_name: `テスト00` + (index + 1),
    })),
];

export const dummyDataDetail: Deposit = {
  id: 1,
  client_id: 1,
  remarks_1: `テスト00` + 1,
  created_at: `2024/02/0` + Math.floor(Math.random() * 9 + 1),
  created_id: 1,
  updated_at: `2024/02/0` + Math.floor(Math.random() * 9 + 1),
  updated_id: 1,
  deleted_at: `2024/02/0` + Math.floor(Math.random() * 9 + 1),
  deleted_id: `テスト00` + 1,
  client_client_cd: 1,
  client_name: `テスト00` + 1,
  client_name_kana: `テスト00` + 1,
  client_pic_name: `テスト00` + 1,
  client_pic_name_kana: `テスト00` + 1,
  client_billing_cd: 1,
  client_postal_code: `テスト00` + 1,
  client_province: `テスト00` + 1,
  client_locality: `テスト00` + 1,
  client_street_address: `テスト00` + 1,
  client_other_address: `テスト00` + 1,
  client_tel: `テスト00` + 1,
  client_fax: `テスト00` + 1,
  client_mail: `テスト00` + 1,
  client_remarks_1: `テスト00` + 1,
  client_remarks_2: `テスト00` + 1,
  client_cutoff_date_billing: 1,
  client_scheduled_payment_date: `テスト00` + 1,
  client_payment_division_id: 1,
  client_payment_term: `テスト00` + 1,
  client_sales_tax_division_id: `テスト00` + 1,
  client_sales_tax_calc_division_id: 1,
  client_sales_fraction_division_id: 1,
  client_sales_tax_fraction_division_id: 1,
  client_print_division_id: `テスト00` + 1,
  client_rank_division_id: `テスト00` + 1,
  client_credit: `テスト00` + 1,
  client_line_num: `テスト00` + 1,
  client_title_division_id: `テスト00` + 1,
  client_custom_title: `テスト00` + 1,
  client_division_payment_name: `テスト00` + 1,
  client_division_payment_code: 1,
  client_division_payment_value: `テスト00` + 1,
  client_division_sales_tax_fraction_name: `テスト00` + 1,
  client_division_sales_tax_fraction_code: 1,
  client_division_sales_tax_fraction_value: `テスト00` + 1,
  client_division_sales_tax_name: `テスト00` + 1,
  client_division_sales_tax_code: `テスト00` + 1,
  client_division_sales_tax_value: `テスト00` + 1,
  client_division_sales_tax_calc_name: `テスト00` + 1,
  client_division_sales_tax_calc_code: 1,
  client_division_sales_tax_calc_value: `テスト00` + 1,
  client_division_sales_fraction_name: `テスト00` + 1,
  client_division_sales_fraction_code: 1,
  client_division_sales_fraction_value: `テスト00` + 1,
  client_division_print_name: `テスト00` + 1,
  client_division_print_code: `テスト00` + 1,
  client_division_print_value: `テスト00` + 1,
  client_division_rank_name: `テスト00` + 1,
  client_division_rank_code: `テスト00` + 1,
  client_division_rank_value: `テスト00` + 1,
  client_division_title_name: `テスト00` + 1,
  client_division_title_code: `テスト00` + 1,
  client_division_title_value: `テスト00` + 1,
  employee_created_last_name: `テスト00` + 1,
  employee_created_first_name: `テスト00` + 1,
  employee_updated_last_name: `テスト00` + 1,
  employee_updated_first_name: `テスト00` + 1,
};
