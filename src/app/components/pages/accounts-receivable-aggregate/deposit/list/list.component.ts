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
  DepositDetail,
  DepositDetailApiResponse,
} from 'src/app/models/deposit-detail';
import { DepositDetailService } from 'src/app/services/deposit-detail.service';
import { DepositDetailDomain } from 'src/app/domains/deposit-detail.domain';
import { CommonService } from 'src/app/services/shared/common.service';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';

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
  localStorageKey = 'filterParams-deposit';

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this.saveFilterParams(arg); // データを保存
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi();
  }

  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;
  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi();
  }

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  tableNameMapping: Mapping<DepositDetail>[] = [
    { name: 'deposit_id', name_jp: '入金ID' },
    { name: 'deposit_client_name', name_jp: '請求先' },
    { name: 'deposit_date', name_jp: '入金日' },
    { name: 'deposit_detail_division_code', name_jp: '入金区分' },
    { name: 'deposit_amount', name_jp: '入金金額' },
    { name: 'employee_created_last_name', name_jp: '登録者' },
  ];

  // エクスポート関連
  get export$() {
    return this.service.getCsv('csv', { ...this._filter }).pipe(
      catchError(this.service.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = '入金一覧';
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
    private service: DepositDetailService,
    private depositDetailDomain: DepositDetailDomain
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
        catchError(this.service.handleErrorModal<DepositDetailApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        console.log(url_params);
        delete url_params['limit'];
        console.log(url_params);

        let totalDepositAmount = 0;
        this.service
          .getAll(url_params)
          .pipe(
            catchError(
              this.service.handleErrorModal<DepositDetailApiResponse>()
            ),
            finalize(() => (this.common.loading = false))
          )
          .subscribe((allres) => {
            console.log(allres);
            const filteredData = allres.data.map((item) => ({
              deposit_amount: item.deposit_amount,
              deposit_detail_division_code: item.deposit_detail_division_code,
            }));

            totalDepositAmount = filteredData.reduce((total, item) => {
              if (
                item.deposit_detail_division_code ===
                  accountsReceivableAggregateConst.STATUS_CODE.CASH ||
                item.deposit_detail_division_code ===
                  accountsReceivableAggregateConst.STATUS_CODE.TRANSFER
              ) {
                return total + item.deposit_amount;
              } else if (
                item.deposit_detail_division_code ===
                accountsReceivableAggregateConst.STATUS_CODE.DISCOUNT
              ) {
                return total - item.deposit_amount;
              } else {
                return total;
              }
            }, 0);

            const footer = [
              '',
              '',
              '',
              '合計',
              totalDepositAmount.toLocaleString(),
              '',
            ];

            const params = this.createTableParams<DepositDetail>(
              res,
              this.tableNameMapping,
              (data: DepositDetail) =>
                this.depositDetailDomain.modifiedTableBody(
                  data,
                  './detail-view',
                  'deposit_id'
                ),
              footer
              // this.modifiedTableBody
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
    // ソート列の物理名を取得
    const tmpColumn = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;

    let column;
    if (tmpColumn === 'deposit_client_name') {
      column = 'deposit_client_name_kana';
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
  private createTableParams<T>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any,
    footer?: any[]
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
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  // private modifiedTableBody(record: DepositDetail) {
  //   return (mapping: Mapping<DepositDetail>) => {
  //     // 値が空なら何もしない
  //     if (record[mapping.name] === '') {
  //       return record[mapping.name];
  //     }
  //     // IDならリンクに修正
  //     if (mapping.name === 'deposit_id') {
  //       return {
  //         href: `./detail-view/${record[mapping.name]}`,
  //         text: record[mapping.name] + '',
  //       };
  //     }
  //     // 得意先IDならリンクに修正
  //     // if (mapping.name === 'deposit_client_name') {
  //     //   return {
  //     //     href: `/master/client/detail/${record.deposit_client_id}`,
  //     //     text: record.deposit_client_name,
  //     //   };
  //     // }
  //     // 入金日ならテキスト切替
  //     if (mapping.name === 'deposit_date') {
  //       let depositDate;
  //       if (record.deposit_date === '') {
  //         depositDate = '';
  //       } else if (record.deposit_date === 'NaT') {
  //         depositDate = '';
  //       } else {
  //         depositDate = new Date(
  //           record.deposit_date as string
  //         ).toLocaleDateString();
  //       }
  //       return depositDate;
  //     }
  //     if (mapping.name === 'deposit_amount') {
  //       let def = 0;
  //       if (record.deposit_amount) {
  //         def = record.deposit_amount;
  //       }
  //       return {
  //         unit: false,
  //         align: 'right',
  //         text: Number(def),
  //       };
  //     }
  //     // 入金区分ならテキスト切替
  //     if (mapping.name === 'deposit_detail_division_code') {
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
  //         (x) => x.value === record.deposit_detail_division_code
  //       )?.text;
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
