import { DepositDetail } from 'src/app/models/deposit-detail';
import { PaymentDetail } from 'src/app/models/payment-detail';

export interface InterfaceDomain {
  modifiedTableBody: (record: any, link: string, link_column: string) => any;
}
export type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};
