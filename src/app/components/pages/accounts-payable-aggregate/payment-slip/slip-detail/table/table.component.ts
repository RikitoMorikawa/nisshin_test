import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  Subject,
  Subscription,
  catchError,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import { repairSlipConst } from 'src/app/const/repair-slip-const';
import { RepairSlip, RepairSlipApiResponse } from 'src/app/models/repair-slip';
import { RepairSlipService } from 'src/app/services/repair-slip.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  constructor(
    private rsService: RepairSlipService,
    public common: CommonService
  ) {}

  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  @Input() isDiscount: boolean = false;
  @Input() total_cost: number = 0;

  private subscription?: Subscription;
  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 絞り込み用オブジェクト
  private filter = {};

  private readonly defaultSort = {
    column: '修理受付票ID',
    order: 'desc',
  } as TableSortStatus;

  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof RepairSlip; name_jp: string }[] = [
    { name: 'id', name_jp: '修理受付票ID' },
    { name: 'customer_type_division_id', name_jp: 'お客様タイプ' },
    { name: 'client_id', name_jp: 'お客様名' },
    { name: 'reception_date', name_jp: '受付日時' },
    { name: 'reception_employee_id', name_jp: '受付担当者' },
    { name: 'status_division_id', name_jp: 'ステータス' },
  ];

  ngOnInit(): void {
    this.subscribeEventListener(); // イベントを購読
    //this.eventListener.next(this.pages); // 初回のデータを取得
  }

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener() {
    this.subscription?.unsubscribe(); // 念のため
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) => this.rsService.getAll(this.createApiParams(x))), // APIコールへスイッチ
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => (this.common.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          this.tableParams.next(this.createTableParams(res));
        },
        // エラー発生時 complete が走るため、再度サブスクライブを設定
        complete: () => this.subscribeEventListener(),
      });
  }

  /**
   * APIコール用のパラメータを生成する。
   * @param arg 各イベントから取得されたオブジェクト。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams(arg: object) {
    if (this.isTableWithPaginationEvent(arg)) {
      this.pages = arg;
    } else {
      this.filter = arg;
      this.pages.page = 1;
    }
    if (Object.keys(this.pages.sort).length === 0) {
      this.pages.sort = this.defaultSort;
    }
    const tmpColumn = this.tableNameMapping.find(
      (obj) => obj.name_jp === this.pages.sort.column
    )?.name;

    let column;
    if (tmpColumn === 'client_id') {
      column = 'client_name_kana';
    } else if (tmpColumn === 'reception_employee_id') {
      column = 'employee_reception_last_name_kana';
    } else {
      column = tmpColumn;
    }

    return {
      ...this.filter,
      limit: this.pages.itemsPerPage,
      offset: (this.pages.page - 1) * this.pages.itemsPerPage,
      sort: column ? `${column}:${this.pages.sort.order}` : '',
    };
  }

  /**
   * オブジェクトが`TableWithPaginationEvent`のインスタンスかを確認する。
   * @param arg 検証対象のオブジェクト。
   * @returns
   */
  isTableWithPaginationEvent(arg: object): arg is TableWithPaginationEvent {
    const { page, itemsPerPage, sort } = arg as TableWithPaginationEvent;
    return (
      typeof page === 'number' &&
      typeof itemsPerPage === 'number' &&
      typeof sort === 'object'
    );
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '修理受付票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: RepairSlipApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, index) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('修理受付票ID');
      row[column] = {
        href: `./detail/${row[column]}`,
        text: row[column] + '',
      };

      // お客様タイプの表示名取得
      column = header.indexOf('お客様タイプ');
      row[column] = String(res.data[index].division_customer_type_value);

      // お客様名の取得
      column = header.indexOf('お客様名');
      switch (res.data[index].division_customer_type_code) {
        case repairSlipConst.CUSTOMER_TYPE_DIVISION.CODE.CLIENT:
          row[column] = String(res.data[index].client_name) + ' 様';
          break;
        case repairSlipConst.CUSTOMER_TYPE_DIVISION.CODE.MEMBER:
          row[column] =
            String(res.data[index].member_last_name) +
            ' ' +
            String(res.data[index].member_first_name) +
            ' 様';
          break;
        case repairSlipConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL:
          row[column] =
            String(res.data[index].last_name) +
            ' ' +
            String(res.data[index].first_name) +
            ' 様';
          break;
        default:
          row[column] = '不明';
      }

      // 受付日のフォーマット変換
      column = header.indexOf('受付日時');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleString();
      }

      // 受付担当者の姓・名結合
      column = header.indexOf('受付担当者');
      row[column] =
        res.data[index].employee_reception_last_name +
        ' ' +
        res.data[index].employee_reception_first_name;

      // ステータスの表示名取得
      column = header.indexOf('ステータス');
      row[column] = String(res.data[index].division_status_value);
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }
}
