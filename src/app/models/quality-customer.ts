import { internals } from '@azure/msal-browser';

/**
 * APIレスポンス
 */
export interface QualityCustomerApiResponse {
  message: string;
  totalItems: number;
  data: QualityCustomer[];
}

/**
 * 客層
 */
export interface QualityCustomer {
  id: number;
  name: string;
  furi?: string | null;
  code: number;
  created_at: string;
  created_id: number;
  updated_at: string;
  updated_id: number;
  deleted_at?: string | null;
  deleted_id?: number | null;
  employee_created_last_name?: string;
  employee_created_first_name?: string;
  employee_updated_last_name?: string;
  employee_updated_first_name?: string;

  employee_created_fullName?: string | null;
  employee_updated_fullName?: string | null;
}
