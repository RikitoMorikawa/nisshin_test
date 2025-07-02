import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, finalize, Subject } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { errorConst } from 'src/app/const/error.const';
import {
  PaymentDetail,
  PaymentDetailApiResponse,
} from 'src/app/models/payment-detail';
import { PaymentDetailService } from 'src/app/services/payment-detail.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
import { PaymentDetailDomain } from 'src/app/domains/payment-detail.domain';

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  // 初期値のパス
  topPagePath = '/setting';

  // ストレージキー
  localStorageKey = 'filterParams-payment-clearing';

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this.saveFilterParams(arg); // データを保存
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi();
  }

  private readonly defaultSort = {
    column: '支払ID',
    order: 'desc',
  } as TableSortStatus;

  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;
  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi();
  }

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  tableNameMapping: Mapping<PaymentDetail>[] = [
    { name: 'payment_id', name_jp: '支払ID' },
    { name: 'payment_supplier_name', name_jp: '支払先' },
    { name: 'payment_date', name_jp: '支払日' },
    { name: 'payment_type_division_code', name_jp: '支払区分' },
    { name: 'payment_amount', name_jp: '支払額' },
    { name: 'employee_created_last_name', name_jp: '登録者' },
  ];

  // エクスポート関連
  get export$() {
    return this.service.getCsv('csv', { ...this._filter }).pipe(
      catchError(this.service.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = '支払消込一覧';
  errorConst = errorConst;

  /**
   * コンストラクタ
   * @param fb
   * @param common
   * @param service
   */
  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private service: PaymentDetailService,
    private paymentDetailDomain: PaymentDetailDomain
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    const savedFilter = this.loadFilterParams();
    if (savedFilter) {
      this._filter = savedFilter;
    }
    this.callApi();
  }

  /**
   * エクスポートの進捗応じた処理
   * @param status エクスポートコンポーネントから取得されるステータス
   */
  onExportStatusChange(status: ExportStatus) {
    if (status === ExportStatus.START) {
      // エラー発生時に備えて false の設定はオブザーバブルの finalize で処理
      this.common.loading = true;
    }
  }

  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private callApi() {
    this.common.loading = true;
    let url_params: any = this.createApiParams();
    this.service
      .getAll(url_params)
      .pipe(
        catchError(this.service.handleErrorModal<PaymentDetailApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        console.log(url_params);
        delete url_params['limit'];
        console.log(url_params);

        let totalPaymentAmount = 0;
        this.service
          .getAll(url_params)
          .pipe(
            catchError(
              this.service.handleErrorModal<PaymentDetailApiResponse>()
            ),
            finalize(() => (this.common.loading = false))
          )
          .subscribe((allres) => {
            console.log(allres);
            const filteredData = allres.data.map((item) => ({
              payment_amount: Number(item.payment_amount),
              payment_type_division_code: item.payment_type_division_code,
            }));

            totalPaymentAmount = filteredData.reduce((total, item) => {
              if (
                item.payment_type_division_code ===
                  accountsReceivableAggregateConst.STATUS_CODE.CASH ||
                item.payment_type_division_code ===
                  accountsReceivableAggregateConst.STATUS_CODE.TRANSFER
              ) {
                return total + item.payment_amount;
              } else if (
                item.payment_type_division_code ===
                accountsReceivableAggregateConst.STATUS_CODE.DISCOUNT
              ) {
                return total - item.payment_amount;
              } else {
                return total;
              }
            }, 0);

            const footer = [
              '',
              '',
              '',
              '合計',
              totalPaymentAmount.toLocaleString(),
              '',
            ];

            const params =
              this.paymentDetailDomain.createTableParams<PaymentDetail>(
                res,
                this.tableNameMapping,
                (data: PaymentDetail) =>
                  this.paymentDetailDomain.modifiedTableBody(
                    data,
                    './detail-view',
                    'payment_id'
                  ),
                footer
              );
            this.tableParams.next(params);
          });
      });
  }

  /**
   * APIコール用のパラメータを生成する。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams() {
    if (Object.keys(this._pages.sort).length === 0) {
      this._pages.sort = this.defaultSort;
    }

    // ソート列の物理名を取得
    const tmpColumn = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;

    let column;
    if (tmpColumn === 'payment_supplier_name') {
      column = 'payment_supplier_name_kana';
    } else if (tmpColumn === 'employee_created_last_name') {
      column = 'employee_created_last_name_kana';
    } else {
      column = tmpColumn;
    }

    // APIコール用のパラメータを生成して返却
    return {
      ...this._filter,
      limit: this._pages.itemsPerPage,
      offset: (this._pages.page - 1) * this._pages.itemsPerPage,
      sort: column ? `${column}:${this._pages.sort.order}` : '',
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト。
   * @param mappings APIの項目名とテーブルのヘッダ名のマッピングオブジェクト。
   * @param modFn APIレスポンスのレコードをテーブルボディへ格納する際の変換を行う関数。
   * @returns 生成された`TableWithPaginationParams`オブジェクト。
   */
  // private createTableParams<T>(
  //   res: ApiResponse<T>,
  //   mappings: Mapping<T>[],
  //   modFn?: (data: T) => (mapping: Mapping<T>) => any
  // ) {
  //   // APIから取得した値を格納
  //   const header = mappings.map((x) => x.name_jp);
  //   const body = res.data.map((record) =>
  //     mappings.map(modFn ? modFn(record) : (x) => record[x.name])
  //   );
  //   // 生成した TableParams を返却
  //   return { total: res.totalItems, header, body };
  // }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  // private modifiedTableBody(record: PaymentDetail) {
  //   return (mapping: Mapping<PaymentDetail>) => {
  //     // 値が空なら何もしない
  //     if (record[mapping.name] === '') {
  //       return record[mapping.name];
  //     }
  //     // IDならリンクに修正
  //     if (mapping.name === 'payment_id') {
  //       return {
  //         href: `./detail-view/${record[mapping.name]}`,
  //         text: record[mapping.name] + '',
  //       };
  //     }
  //     // 支払先IDならリンクに修正
  //     // if (mapping.name === 'payment_supplier_name') {
  //     //   return {
  //     //     href: `/master/supplier/detail/${record.payment_supplier_id}`,
  //     //     text: record.payment_supplier_name,
  //     //   };
  //     // }
  //     // 支払日ならテキスト切替
  //     if (mapping.name === 'payment_date') {
  //       let paymentDate;
  //       if (record.payment_date === '') {
  //         paymentDate = '';
  //       } else if (record.payment_date === 'NaT') {
  //         paymentDate = '';
  //       } else {
  //         paymentDate = new Date(
  //           record.payment_date as string
  //         ).toLocaleDateString();
  //       }
  //       return paymentDate;
  //     }
  //     // 支払区分ならテキスト切替
  //     if (mapping.name === 'payment_type_division_code') {
  //       // 表示区分選択肢
  //       let aggregateOptions = [
  //         {
  //           value: accountsReceivableAggregateConst.STATUS_CODE.CASH,
  //           text: accountsReceivableAggregateConst.STATUS.CASH,
  //         },
  //         {
  //           value: accountsReceivableAggregateConst.STATUS_CODE.DISCOUNT,
  //           text: accountsReceivableAggregateConst.STATUS.DISCOUNT,
  //         },
  //         {
  //           value: accountsReceivableAggregateConst.STATUS_CODE.TRANSFER,
  //           text: accountsReceivableAggregateConst.STATUS.TRANSFER,
  //         },
  //       ];
  //       return aggregateOptions.find(
  //         (x) => x.value === record.payment_type_division_code
  //       )?.text;
  //     }
  //     // 金額
  //     if (mapping.name === 'payment_amount') {
  //       const payment_amount = record.payment_amount;
  //       return {
  //         unit: false,
  //         align: 'right',
  //         text: Number(payment_amount),
  //       };
  //     }
  //     // 登録者なら結合表示
  //     if (mapping.name === 'employee_created_last_name') {
  //       return (
  //         record.employee_created_last_name +
  //         '' +
  //         record.employee_created_first_name
  //       );
  //     }
  //     return record[mapping.name];
  //   };
  // }

  /*
  APIレスポンスからテーブルコンポーネントへ渡すオブジェクトをローカルストレージに保存と取得
  */
  private saveFilterParams(filter: object) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(filter));
  }
  private loadFilterParams(): object | null {
    const params = localStorage.getItem(this.localStorageKey);
    return params ? JSON.parse(params) : null;
  }
}
