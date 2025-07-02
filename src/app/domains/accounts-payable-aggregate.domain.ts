import { Injectable } from '@angular/core';
import {
  AccountsPayableAggregate,
  AccountsPayableAggregateApiResponse,
} from 'src/app/models/accounts-payable-aggregate';
/**
 *
 * 買掛集金のビジネスロジック
 *
 */
@Injectable({
  providedIn: 'root',
})
export class AccountsPayableAggregateDomain {
  /**
   * 支払い予定額の取得
   *
   */
  public getScheduledPaymentAmount(
    accountsPayableAggregate: AccountsPayableAggregate[],
    paymentDate?: any
  ): number | void {
    if (accountsPayableAggregate.length === 0) {
      return;
    }
    if (
      paymentDate === undefined ||
      paymentDate === null ||
      paymentDate === ''
    ) {
      return;
    }

    const strPaymentDate = new Date(paymentDate as string).toLocaleDateString(
      'ja-JP',
      { year: 'numeric', month: '2-digit', day: '2-digit' }
    );

    // 支払サイト 1:翌月 2:翌々月 3: ３ヶ月後 4: 当月
    // const paymentSiteCode = accountsPayableAggregate[0].supplier_payment_site_code;
    // // 締日
    // const cutofDateBilling = accountsPayableAggregate[0].supplier_cutoff_date_billing;
    // // 支払日
    // const scheduledPaymentDate = accountsPayableAggregate[0].supplier_scheduled_payment_date;
    return this._getScheduledPaymentAmount(
      accountsPayableAggregate,
      strPaymentDate
    );
  }

  /**
   *
   * 支払い予定額の取得
   *
   */
  private _getScheduledPaymentAmount(
    accountsPayableAggregate: AccountsPayableAggregate[],
    strPaymentDate: string
  ): number {
    // 前回買掛残
    // const supplierAccountPayable = accountsPayableAggregate[0].supplier_account_payable || 0;
    // 支払サイト 1:翌月 2:翌々月 3: ３ヶ月後 4: 当月
    const paymentSiteCode =
      accountsPayableAggregate[0].supplier_payment_site_code;
    // { 当月用
    const tmpDt = new Date(strPaymentDate);
    tmpDt.setMonth(tmpDt.getMonth() - 1);
    const tmpStrPaymentDate = tmpDt.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // } 当月用

    let scheduledPaymentAmount = 0;
    accountsPayableAggregate.forEach((row) => {
      const paymentDueDate = new Date(
        row.payment_due_date as string
      ).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      if (paymentSiteCode == 4) {
        // 当月用
        if (paymentDueDate < tmpStrPaymentDate) {
          return;
        }
        const tmpScheduledPaymentAmount = row.scheduled_payment_amount || 0;
        // 前回買掛残（仕入先テーブルの前回買掛残）
        const balrance = row.balance || 0;
        scheduledPaymentAmount = balrance + tmpScheduledPaymentAmount;
      }

      if (paymentDueDate < strPaymentDate) {
        return;
      }
      // 支払予定金額
      const tmpScheduledPaymentAmount = row.scheduled_payment_amount || 0;
      // 前回買掛残（仕入先テーブルの前回買掛残）
      const balrance = row.balance || 0;
      scheduledPaymentAmount = balrance + tmpScheduledPaymentAmount;
    });
    return scheduledPaymentAmount;
  }
}
