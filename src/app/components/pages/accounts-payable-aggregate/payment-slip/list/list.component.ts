import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, finalize, Subject } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import {
  AccountsPayableAggregate,
  AccountsPayableAggregateApiResponse,
} from 'src/app/models/accounts-payable-aggregate';
import { AccountsPayableAggregateService } from 'src/app/services/accounts-payable-aggregate.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { convertToJpDate } from 'src/app/functions/shared-functions';

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

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
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
  tableNameMapping: Mapping<AccountsPayableAggregate>[] = [
    { name: 'id', name_jp: '支払ID' },
    { name: 'supplier_name', name_jp: '支払先' },
    { name: 'payment_due_date', name_jp: '支払予定日' },
    { name: 'scheduled_payment_amount', name_jp: '支払予定金額' },
    { name: 'supplier_cutoff_date_billing', name_jp: '締日' },
  ];
  //name: 'supplier_scheduled_payment_amount', name_jp: '支払予定金額' },

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private service: AccountsPayableAggregateService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.callApi();
  }

  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private callApi() {
    this.common.loading = true;
    this.service
      .getAll(this.createApiParams())
      .pipe(
        catchError(
          this.service.handleErrorModal<AccountsPayableAggregateApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<AccountsPayableAggregate>(
          res,
          this.tableNameMapping,
          this.modifiedTableBody
        );
        console.log(params);
        this.tableParams.next(params);
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
    if (tmpColumn === 'supplier_name') {
      column = 'supplier_name_kana';
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
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: AccountsPayableAggregate) {
    return (mapping: Mapping<AccountsPayableAggregate>) => {
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      // 仕入先名ならリンクに修正
      // if (mapping.name === 'supplier_name') {
      //   return {
      //     href: `/master/supplier/detail/${record.supplier_id}`,
      //     text: record.supplier_name,
      //   };
      // }
      if (mapping.name === 'id') {
        return {
          href: `./${record.id}`,
          text: String(record.id),
        };
      }
      if (mapping.name === 'payment_due_date') {
        return convertToJpDate(record[mapping.name]);
      }

      if (mapping.name === 'scheduled_payment_amount') {
        const scheduled_payment_amount = record.scheduled_payment_amount;
        return {
          unit: false,
          align: 'right',
          text: Number(scheduled_payment_amount),
        };
      }

      return record[mapping.name];
    };
  }
}
