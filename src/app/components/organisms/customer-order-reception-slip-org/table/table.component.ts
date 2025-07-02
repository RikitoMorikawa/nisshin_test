import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  catchError,
  finalize,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { customerOrderReceptionSlipConst } from 'src/app/const/customer-order-reception-slip.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  CustomerOrderReceptionSlip,
  CustomerOrderReceptionSlipApiResponse,
} from 'src/app/models/customer-order-reception-slip';
import { CustomerOrderReceptionSlipService } from 'src/app/services/customer-order-reception-slip.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  /**
   * コンストラクタ
   * @param corService
   */
  constructor(
    private corService: CustomerOrderReceptionSlipService,
    public common: CommonService
  ) {}

  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  private subscription?: Subscription;
  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 絞り込み用オブジェクト
  private filter = {};
  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {
      column: '受付番号',
      order: 'desc',
    },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  clientId!: number;

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: {
    name: keyof CustomerOrderReceptionSlip;
    name_jp: string;
  }[] = [
    { name: 'id', name_jp: '受付番号' },
    { name: 'division_customer_type_value', name_jp: 'お客様タイプ' },
    { name: 'client_name', name_jp: 'お客様名' },
    { name: 'client_tel', name_jp: 'お客様電話番号' },
    { name: 'reception_date', name_jp: '受付日' },
    { name: 'reception_employee_id', name_jp: '受付担当者' },
    {
      name: 'division_status_value',
      name_jp: 'ステータス',
    },
    // { name: 'total_amount_including_tax', name_jp: '税込合計金額' },
  ];

  /**
   * Angular ライフサイクルフック
   *
   */
  ngOnInit(): void {
    this.subscribeEventListener(); // イベントを購読
    // src/app/components/organisms/customer-order-reception-slip-org/search/search.component.ts
    // で初期状態で特定のフィルタリングを設定しているので、こちらはコメントアウト
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
        switchMap((x) => this.corService.getAll(this.createApiParams(x))), // APIコールへスイッチ
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
          console.log(res);
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
    const column = this.tableNameMapping.find(
      (obj) => obj.name_jp === this.pages.sort.column
    )?.name;
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
      title: '客注受付票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: CustomerOrderReceptionSlipApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, index) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('受付番号');
      row[column] = {
        href: `./detail/${row[column]}`,
        text: row[column] + '',
        queryParams: { clientId: this.clientId },
      };

      // お客様タイプによってお客様名を表示
      column = header.indexOf('お客様タイプ');
      switch (row[column]) {
        case customerOrderReceptionSlipConst.CUSTOMER_TYPE_DIVISION.VALUE
          .CLIENT:
          column = header.indexOf('お客様名');
          row[column] = row[column] + '様';
          column = header.indexOf('お客様電話番号');
          row[column] = res.data[index].tel + ' ';
          break;
        case customerOrderReceptionSlipConst.CUSTOMER_TYPE_DIVISION.VALUE
          .MEMBER:
          column = header.indexOf('お客様名');
          row[column] =
            res.data[index].member_last_name +
            ' ' +
            res.data[index].member_first_name +
            '様';
          column = header.indexOf('お客様電話番号');
          row[column] = res.data[index].tel + ' ';
          break;
        case customerOrderReceptionSlipConst.CUSTOMER_TYPE_DIVISION.VALUE
          .GENERAL:
          column = header.indexOf('お客様名');
          row[column] =
            res.data[index].last_name + ' ' + res.data[index].first_name + '様';
          column = header.indexOf('お客様電話番号');
          row[column] = res.data[index].tel + ' ';
          break;
        default:
          break;
      }

      // 日時の表示を修正
      column = header.indexOf('受付日');
      row[column] = new Date(row[column] as string).toLocaleDateString();

      // 受付担当者の姓・名結合
      column = header.indexOf('受付担当者');
      row[column] =
        res.data[index].employee_reception_last_name +
        ' ' +
        res.data[index].employee_reception_first_name;

      // 金額表示 (※9695 非表示対応)
      // column = header.indexOf('税込合計金額');
      // if (
      //   row[column] === null ||
      //   row[column] === undefined ||
      //   row[column] === '' ||
      //   row[column] === 0 ||
      //   row[column] === '0'
      // ) {
      //   row[column] = '商品登録前';
      // } else {
      //   row[column] = (row[column] as string).toLocaleString() + ' 円';
      // }
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }
}
