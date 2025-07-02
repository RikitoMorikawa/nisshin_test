/**
 * 支払データ締めAPIからのレスポンス
 */
export interface PaymentCutoffApiResponse {
  message: string;
  totalItems: number;
  data: PaymentCutoff[];
}

/**
 * 支払データ締め
 */
export interface PaymentCutoff {
  from_payment_date: string;
  to_payment_date: string;
}
