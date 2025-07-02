import { Injectable } from '@angular/core';
import { InterfaceDomain, ApiResponse } from 'src/app/domains/interface.domain';
import {
  DepositDetail,
  DepositDetailApiResponse,
} from 'src/app/models/deposit-detail';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

/**
 *
 * 入金明細のビジネスロジック
 *
 */
@Injectable({
  providedIn: 'root',
})
export class DepositDetailDomain implements InterfaceDomain {
  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  public modifiedTableBody(record: DepositDetail, link = '', link_column = '') {
    // console.log(link);
    // console.log(link_column);
    return (mapping: Mapping<DepositDetail>) => {
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

      if (mapping.name === 'deposit_date') {
        let depositDate;
        if (record.deposit_date === '') {
          depositDate = '';
        } else if (record.deposit_date === 'NaT') {
          depositDate = '';
        } else {
          depositDate = new Date(
            record.deposit_date as string
          ).toLocaleDateString();
        }
        return depositDate;
      }

      if (mapping.name === 'deposit_amount') {
        let def = 0;
        if (record.deposit_amount) {
          def = record.deposit_amount;
        }
        return {
          unit: false,
          align: 'right',
          text: Number(def),
        };
      }

      if (mapping.name === 'deposit_detail_division_code') {
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
          (x) => x.value === record.deposit_detail_division_code
        )?.text;
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
}
