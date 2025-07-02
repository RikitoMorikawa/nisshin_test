import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { InterfaceDomain, ApiResponse } from 'src/app/domains/interface.domain';
import {
  PaymentDetail,
  PaymentDetailApiResponse,
} from 'src/app/models/payment-detail';
import { PaymentDetailService } from 'src/app/services/payment-detail.service';
import { modalConst } from 'src/app/const/modal.const';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
// import { Mapping } from '../components/pages/accounts-payable-aggregate/payment-slip/slip-list/slip-list.component';

import {
  TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

/**
 *
 * 支払明細のビジネスロジック
 *
 */
@Injectable()
/**
 * 共通利用する場合は下記設定
 * そうじゃ無い場合は呼び出しもとのmoduleでproviderに設定
 * src/app/components/pages/accounts-payable-aggregate/payment-slip/payment-slip.module.ts
 * で設定しています
 */
// @Injectable({
//   providedIn: 'root',
// })
export class PaymentDetailDomain implements InterfaceDomain {
  constructor(
    private paymentDetailService: PaymentDetailService,
    private common: CommonService,
    private errorService: ErrorService
  ) {}

  getTableData(
    subscription: Subscription,
    filter: object,
    tableNameMapping: Mapping<PaymentDetail>[],
    apiParams: any,
    callback: (params: any) => void,
    modFn?: (record: PaymentDetail) => (mapping: Mapping<PaymentDetail>) => any
  ) {
    // const apiParams = {
    //   ...filter,
    //   accounts_payable_aggregate_id: selectedId,
    //   sort: 'id:desc',
    // };

    this.common.loading = true;
    subscription.add(
      this.paymentDetailService
        .getAll(apiParams)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            console.error('Error fetching payment details:', res);
            return;
          }

          //const params = this.createTableParams(res, tableNameMapping);

          const params = this.createTableParams<PaymentDetail>(
            res,
            tableNameMapping,
            this.modifiedTableBody
          );
          callback(params);
        })
    );
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  public modifiedTableBody(record: PaymentDetail, link = '', link_column = '') {
    return (mapping: Mapping<PaymentDetail>) => {
      console.log(mapping);
      let selected: boolean = false;
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      if (link_column !== '' && mapping.name === link_column) {
        return {
          href: `${link}/${record[mapping.name]}`,
          text: record[mapping.name] + '',
        };
      }

      // 支払日ならテキスト切替
      if (mapping.name === 'payment_date') {
        let paymentDate;
        if (record.payment_date === '') {
          paymentDate = '';
        } else if (record.payment_date === 'NaT') {
          paymentDate = '';
        } else {
          paymentDate = new Date(
            record.payment_date as string
          ).toLocaleDateString();
        }
        return paymentDate;
      }

      // 支払区分ならテキスト切替
      if (mapping.name === 'payment_type_division_code') {
        // 表示区分選択肢
        let aggregateOptions = [
          {
            value: accountsReceivableAggregateConst.STATUS_CODE.CASH,
            text: accountsReceivableAggregateConst.STATUS.CASH,
          },
          {
            value: accountsReceivableAggregateConst.STATUS_CODE.DISCOUNT,
            text: accountsReceivableAggregateConst.STATUS.DISCOUNT,
          },
          {
            value: accountsReceivableAggregateConst.STATUS_CODE.TRANSFER,
            text: accountsReceivableAggregateConst.STATUS.TRANSFER,
          },
        ];
        return aggregateOptions.find(
          (x) => x.value === record.payment_type_division_code
        )?.text;
      }

      // 金額
      if (mapping.name === 'payment_amount') {
        const payment_amount = record.payment_amount;
        return {
          unit: false,
          align: 'right',
          text: Number(payment_amount),
        };
      }

      // 登録者なら結合表示
      if (mapping.name === 'employee_created_last_name') {
        return (
          record.employee_created_last_name +
          '' +
          record.employee_created_first_name
        );
      }

      return record[mapping.name];
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト。
   * @param mappings APIの項目名とテーブルのヘッダ名のマッピングオブジェクト。
   * @param modFn APIレスポンスのレコードをテーブルボディへ格納する際の変換を行う関数。
   * @returns 生成された`TableWithPaginationParams`オブジェクト。
   */
  public createTableParams<T>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any,
    footer: any[] = []
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );

    // 生成した TableParams を返却
    return { total: res.totalItems, header, body, footer };
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '支払伝票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }
}
