import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject, tap, switchMap, catchError, of, Subscription } from 'rxjs';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { Stock, StockApiResponse } from 'src/app/models/stock';
import { StockService } from '../../../../services/stock.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  private subscription?: Subscription;
  @Output() err = new EventEmitter<HttpErrorResponse>();
  private filter = {};
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;

  // テーブル周りで使用する変数
  tableParams = new Subject<TableWithPaginationParams>();
  loading = false;

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Stock; name_jp: string }[] = [
    { name: 'id', name_jp: '在庫ID' }, // createTableParams 内で値を修正
    { name: 'product_name', name_jp: '商品名' },
    { name: 'quantity', name_jp: '月次在庫数量' },
    { name: 'created_at', name_jp: '登録日時' },
  ];

  /**
   * コンストラクタ
   */
  constructor(private stockService: StockService) {}

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    this.subscribeEventListener(); // イベントを購読
    this.eventListener.next(this.pages); // 初回のデータを取得
  }

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener() {
    this.subscription?.unsubscribe(); // 念のため
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.loading = true)),
        switchMap((x) => {
          console.log(this.createApiParams(x));
          return this.stockService.getAll(this.createApiParams(x));
        }), // APIコールへスイッチ
        catchError(this.handleError())
      )
      .subscribe({
        next: (res) => {
          this.tableParams.next(this.createTableParams(res));
          this.loading = false;
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
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`StockApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (err: HttpErrorResponse) => {
      this.err.emit(err);
      return of({ data: [] as Stock[] } as StockApiResponse);
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(res: StockApiResponse): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, index) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('在庫ID');
      row[column] = { href: `./detail/${row[column]}`, text: row[column] + '' };

      column = header.indexOf('登録日時');
      row[column] = new Date(row[column] as string).toLocaleString();
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }
}
