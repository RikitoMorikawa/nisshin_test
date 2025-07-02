/**
 * 売掛集計APIからのレスポンス
 */
export interface AccountsReceivableAggregateApiResponse {
  message: string;
  totalItems: number;
  data: AccountsReceivableAggregate[];
}

/**
 * 売掛集計モデル
 */
export interface AccountsReceivableAggregate {
  id: number;
  status_division_id: number;
  billing_id: number;
  billing_date: string;
  payment_due_date: string;
  client_id: number;
  billing_amount: number;
  payment_date?: string;
  payment_amount?: number;
  payment_exp_date: string;
  balance?: number;
  pdf?: string;
  data_entry_employee_id?: number;
  data_entry_date?: string;
  incident_division_id: number;
  created_at: string;
  created_id: number;
  reduced_tax_rate_target_amount: number;
  consumption_tax_rate_target_amount: number;
  reduced_tax: number;
  consumption_tax: number;
  previous_invoice_total: number;
  payment_total: number;
  carried_over_amount: number;
  slip_quantity: number;
  purchase_total_including_tax: number;
  tax_total: number;
  division_status_code: number;
  division_status_name: string;
  division_status_value: string;
  client_name: string;
  employee_data_entry_last_name: string;
  employee_data_entry_first_name: string;
  division_incident_code: number;
  division_incident_name: string;
  division_incident_value: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
}

export const dummyData: AccountsReceivableAggregate[] = [
  // 以下のデータを15回繰り返します
  ...Array(15)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      status_division_id: index + 1,
      billing_id: index + 1,
      billing_date: `2023-05-01`,
      payment_due_date: `2023-06-01`,
      client_id: index + 1,
      billing_amount: (index + 1) * 1000,
      payment_date: `2023-05-${String(index + 1).padStart(2, '0')}`,
      payment_amount: (index + 1) * 1000 - 200,
      payment_exp_date: `2023-06-01`,
      balance: 200,
      pdf: `https://mikehibm.github.io/angular-pdf-example/assets/sample2.pdf`,
      data_entry_employee_id: index + 1,
      data_entry_date: `2023-05-${String(index + 1).padStart(2, '0')}`,
      incident_division_id: index + 1,
      created_at: `2023-05-${String(index + 1).padStart(2, '0')}T00:00:00`,
      created_id: index + 1,
      reduced_tax_rate_target_amount: 1111,
      consumption_tax_rate_target_amount: 1111,
      reduced_tax: 1111,
      consumption_tax: 1111,
      previous_invoice_total: 1111,
      payment_total: 1111,
      carried_over_amount: 1111,
      slip_quantity: 1111,
      purchase_total_including_tax: 1111,
      tax_total: 1111,
      division_status_code: index + 1,
      division_status_name: `Status ${index + 1}`,
      division_status_value: `status_${index + 1}`,
      client_name: `Client ${index + 1}`,
      employee_data_entry_last_name: `LastName${index + 1}`,
      employee_data_entry_first_name: `FirstName${index + 1}`,
      division_incident_code: index + 1,
      division_incident_name: `Incident ${index + 1}`,
      division_incident_value: `incident_${index + 1}`,
      employee_created_last_name: `CreatedLastName${index + 1}`,
      employee_created_first_name: `CreatedFirstName${index + 1}`,
    })),
];
