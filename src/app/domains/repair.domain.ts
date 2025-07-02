import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { InterfaceDomain, ApiResponse } from 'src/app/domains/interface.domain';
import { Repair, RepairApiResponse } from 'src/app/models/repair';
import { RepairService } from 'src/app/services/repair.service';
import { modalConst } from 'src/app/const/modal.const';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
// import { Mapping } from '../components/pages/accounts-payable-aggregate/payment-slip/slip-list/slip-list.component';
import { convertToJpDate } from 'src/app/functions/shared-functions';

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
 * 修理のビジネスロジック
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
export class RepairDomain implements InterfaceDomain {
  constructor(
    private repairService: RepairService,
    private common: CommonService,
    private errorService: ErrorService
  ) {}

  getTableData(
    subscription: Subscription,
    filter: object,
    tableNameMapping: Mapping<Repair>[],
    apiParams: any,
    callback: (params: any) => void,
    //modFn?: (record: Repair, link: string, link_column: string) => (mapping: Mapping<Repair>) => any
    modFn?: (record: Repair) => (mapping: Mapping<Repair>) => any
  ) {
    // const apiParams = {
    //   ...filter,
    //   accounts_payable_aggregate_id: selectedId,
    //   sort: 'id:desc',
    // };

    this.common.loading = true;
    subscription.add(
      this.repairService
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

          const params = this.createTableParams<Repair>(
            res,
            tableNameMapping,
            modFn
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
  public modifiedTableBody(record: Repair, link = '', link_column = '') {
    return (mapping: Mapping<Repair>) => {
      console.log(mapping);
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }

      // 仕入IDならリンクに修正
      if (
        link_column !== '' &&
        mapping.name === link_column &&
        link === 'accounts-payable-aggregate/payment-slip'
      ) {
        const parentIdName = 'accounts_payable_aggregate_id';
        return {
          href: `../${record[parentIdName]}/repair/${record[mapping.name]}`,
          text: record[mapping.name] + '',
        };
      }

      // 仕入先名ならリンクに修正
      if (mapping.name === 'supplier_name') {
        return {
          href: `/master/supplier/detail/${record.supplier_id}`,
          text: record.supplier_name,
        };
      }

      if (mapping.name === 'arrival_date') {
        return convertToJpDate(record[mapping.name]);
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
    modFn?: (data: T) => (mapping: Mapping<T>) => any
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );

    // 生成した TableParams を返却
    return { total: res.totalItems, header, body };
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
      title: '修理一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }
}
