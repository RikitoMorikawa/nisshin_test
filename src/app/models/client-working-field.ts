/**
 * 得意先現場APIからのレスポンス
 */
export interface ClientWorkingFieldApiResponse {
  message: string;
  totalItems: number;
  data: ClientWorkingField[];
}

// 得意先現場
export interface ClientWorkingField {
  id: number;
  field_cd: number;
  name: string;
  client_id: number;
  client_name?: string;
  created_at?: string;
  created_id?: string;
  updated_at?: string;
  updated_id?: string;
  deleted_at?: string;
  deleted_id?: string;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;
}
