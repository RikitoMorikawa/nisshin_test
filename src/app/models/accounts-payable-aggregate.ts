/**
 * 買掛集計APIからのレスポンス
 */
export interface AccountsPayableAggregateApiResponse {
  message: string;
  totalItems: number;
  data: AccountsPayableAggregate[];
}

/**
 * 買掛集計モデル
 */
export interface AccountsPayableAggregate {
  id: number;
  status_division_id: number;
  billing_date: string;
  payment_due_date: string;
  supplier_id: number;
  billing_amount: number;
  scheduled_payment_amount?: number;
  balance?: number;
  data_entry_employee_id?: number;
  data_entry_date?: string;
  incident_division_id: number;
  created_at: string;
  created_id: number;
  previous_month_balance?: number;
  pay_amount?: number;
  cf_amount?: number;
  purchase_amount?: number;
  consumption_tax?: number;
  reduced_tax?: number;
  current_month_balance?: number;
  division_status_code: number;
  division_status_name: string;
  division_status_value: string;
  supplier_name: string;
  supplier_cutoff_date_billing: number;
  supplier_scheduled_payment_date: number;
  supplier_account_payable: number;
  supplier_payment_site_name: string;
  supplier_payment_site_code: number;
  supplier_payment_site_value: string;
  employee_data_entry_last_name: string;
  employee_data_entry_first_name: string;
  division_incident_code: number;
  division_incident_name: string;
  division_incident_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
}

export const dummyData: AccountsPayableAggregate[] = [
  // 以下のデータを15回繰り返します
  ...Array(15)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      status_division_id: index + 1,
      billing_date: `2023-05-01`,
      payment_due_date: `2023-06-01`,
      supplier_id: index + 1,
      billing_amount: (index + 1) * 1000,
      payment_date: `2023-05-${String(index + 1).padStart(2, '0')}`,
      scheduled_payment_amount: (index + 1) * 1000 - 200,
      balance: 200,
      data_entry_employee_id: index + 1,
      data_entry_date: `2023-05-${String(index + 1).padStart(2, '0')}`,
      incident_division_id: index + 1,
      created_at: `2023-05-${String(index + 1).padStart(2, '0')}T00:00:00`,
      created_id: index + 1,
      previous_month_balance: 1111,
      pay_amount: 1111,
      cf_amount: 1111,
      purchase_amount: 1111,
      consumption_tax: 1111,
      reduced_tax: 1111,
      current_month_balance: 1111,
      division_status_code: index + 1,
      division_status_name: `Status ${index + 1}`,
      division_status_value: `status_${index + 1}`,
      supplier_name: `Supplier ${index + 1}`,
      supplier_cutoff_date_billing: 1,
      supplier_scheduled_payment_date: 11,
      supplier_account_payable: 123,
      supplier_payment_site_name: '支払いサイト',
      supplier_payment_site_code: 1,
      supplier_payment_site_value: '翌月',
      employee_data_entry_last_name: `LastName${index + 1}`,
      employee_data_entry_first_name: `FirstName${index + 1}`,
      division_incident_code: index + 1,
      division_incident_name: `Incident ${index + 1}`,
      division_incident_value: `incident_${index + 1}`,
      employee_created_last_name: `CreatedLastName${index + 1}`,
      employee_created_first_name: `CreatedFirstName${index + 1}`,
    })),
];
