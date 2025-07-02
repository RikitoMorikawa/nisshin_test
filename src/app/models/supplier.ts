/**
 * 区分APIからのレスポンス
 */
export interface SupplierApiResponse {
  message: string;
  totalItems: number;
  data: Supplier[];
}

/**
 * 仕入先
 */
export interface Supplier {
  id: number;
  name: string;
  name_kana: string;
  postal_code: string;
  province: string;
  locality: string;
  street_address: string;
  other_address: string;
  tel: string;
  fax: string;
  mail: string;
  cutoff_date_billing: number;
  scheduled_payment_date: number | '';
  payment_division_id: number;
  payment_site_division_id: number | '';
  sales_tax_division_id: number;
  sales_tax_calc_division_id: number;
  sales_fraction_division_id: number | '';
  sales_tax_fraction_division_id: number;
  remarks_1: string;
  remarks_2: string;
  pic_name: string;
  pic_name_kana: string;
  payee_1: string;
  payee_2: string;
  account_payable: number | '';
  logo_image_path: string;
  last_login_at: string;
  oid: string;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number | '';
  deleted_at: string;
  deleted_id: number | '';
  division_payment_name: string;
  division_payment_code: number | '';
  division_payment_value: string;
  division_sales_tax_calc_name: string;
  division_sales_tax_calc_code: number | '';
  division_sales_tax_calc_value: string;
  division_sales_tax_name: string;
  division_sales_tax_code: number | '';
  division_sales_tax_value: string;
  division_sales_fraction_name: string;
  division_sales_fraction_code: number | '';
  division_sales_fraction_value: string;
  division_sales_tax_fraction_name: string;
  division_sales_tax_fraction_code: number;
  division_sales_tax_fraction_value: string;
  division_payment_site_name: string;
  division_payment_site_code: number | '';
  division_payment_site_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  employee_updated_last_name: string;
  employee_updated_first_name: string;
}
