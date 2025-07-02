/**
 * 個別請求APIからのレスポンス
 */
export interface IndividualBillApiResponse {
  message: string;
  totalItems: number;
  data: IndividualBill[];
}

/**
 * 個別請求
 */
export interface IndividualBill {
  from_date_of_sale: string;
  to_date_of_sale: string;
  client_id: string;
}
