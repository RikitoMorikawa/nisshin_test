import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, Subscription, catchError, of, switchMap, tap } from 'rxjs';
import {
  TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import {
  PriceRanking,
  PriceRankingApiResponse,
} from 'src/app/models/price_ranking';
import { PriceRankingService } from 'src/app/services/price-ranking.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  constructor(
    private priceRankingService: PriceRankingService,
    public common: CommonService
  ) {}

  // 購読を一元管理する
  private subscription = new Subscription();

  //テーブルイベント購読用 インスタンスは親コンポーネントから受け取る
  @Input() tableEvent!: Subject<object>;

  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 絞り込み用オブジェクト
  private filter = {};

  private readonly defaultSort = {
    column: 'ID',
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
  tableNameMapping: { name: keyof PriceRanking; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'rank_division_id', name_jp: 'ランク名' },
    { name: 'product_id', name_jp: '商品名' },
    { name: 'store_id', name_jp: '店舗名' },
    { name: 'selling_price', name_jp: 'バラ売価' },
    { name: 'b_selling_price', name_jp: '小分け売価' },
    { name: 'c_selling_price', name_jp: 'ケース売価' },
  ];

  ngOnInit(): void {
    // テーブルのイベントを購読開始
    this.getTableData();

    // 初回データの取得のためにイベントを送信
    this.tableEvent.next(this.pages);
  }

  /**
   * テーブル関連のイベント購読
   * @returns void
   */
  getTableData(): void {
    this.subscription.add(
      this.tableEvent
        .pipe(
          tap((_) => (this.common.loading = true)),
          switchMap((x) =>
            this.priceRankingService.getAll(this.createApiParams(x))
          ),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe({
          next: (res) => {
            this.common.loading = false;
            if (res instanceof HttpErrorResponse) {
              const message = res.error
                ? res.error.message
                : 'エラーが発生しました。';
              this.handleError(res.status, res.error.message);
              return;
            }
            this.tableParams.next(this.createTableParams(res));
          },
          complete: () => this.getTableData(),
        })
    );
  }

  /**
   * APIコール用のパラメータを生成する。
   * @param arg 各イベントから取得されたオブジェクト。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams(arg: object) {
    const isTableEvent = this.isTableWithPaginationEvent(arg);

    if (isTableEvent) {
      this.pages = arg;
    } else {
      this.filter = arg;
      // 絞り込みの場合はページを1にリセットする
      this.pages.page = 1;
    }

    if (Object.keys(this.pages.sort).length === 0) {
      this.pages.sort = this.defaultSort;
    }

    const tmp_column = this.tableNameMapping.find(
      (obj) => obj.name_jp === this.pages.sort.column
    )?.name;

    let column;
    if (tmp_column === 'product_id') {
      column = 'product_name_kana';
    } else {
      column = tmp_column;
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
   * @returns boolean
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
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: PriceRankingApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, i) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('ID');
      row[column] = { href: `./detail/${row[column]}`, text: row[column] + '' };

      column = header.indexOf('ランク名');
      row[column] = res.data[i].division_rank_value;

      // IDをリンクへ変更
      column = header.indexOf('商品名');
      row[column] = {
        href: `/master/product/detail/${row[column]}`,
        text: res.data[i].product_name,
      };

      // IDをリンクへ変更
      column = header.indexOf('店舗名');
      row[column] = {
        href: `/setting/store/detail/${row[column]}`,
        text: res.data[i].store_name + '',
      };

      column = header.indexOf('バラ売価');
      if (
        row[column] === null ||
        row[column] === undefined ||
        row[column] === '' ||
        row[column] === 0
      ) {
        row[column] = '設定なし';
      } else {
        row[column] = {
          unit: false,
          align: 'right',
          text: Number(row[column]),
        };
      }

      column = header.indexOf('小分け売価');
      if (
        row[column] === null ||
        row[column] === undefined ||
        row[column] === '' ||
        row[column] === 0
      ) {
        row[column] = '設定なし';
      } else {
        row[column] = {
          unit: false,
          align: 'right',
          text: Number(row[column]),
        };
      }

      column = header.indexOf('ケース売価');
      if (
        row[column] === null ||
        row[column] === undefined ||
        row[column] === '' ||
        row[column] === 0
      ) {
        row[column] = '設定なし';
      } else {
        row[column] = {
          unit: false,
          align: 'right',
          text: Number(row[column]),
        };
      }
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '価格変更一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }
}
