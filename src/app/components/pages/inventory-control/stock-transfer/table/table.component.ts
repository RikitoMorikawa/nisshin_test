import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
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
  StockTransfer,
  StockTransferApiResponse,
} from 'src/app/models/stock-transfer';
import { StockTransferService } from 'src/app/services/stock-transfer.service';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from './table-with-pagination/table-with-pagination.component';
import { TableData } from './child-table/child-table.component';
import { CommonService } from 'src/app/services/shared/common.service';
import { StockTransferDomain } from 'src/app/domains/stock-transfer.domain';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';

@Component({
  selector: 'app-stock-transfer-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  constructor(
    private stockTransferDomain: StockTransferDomain,
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
    redirectPath?: string;
  }>();

  // 絞り込み用オブジェクト
  private filter = {};
  private _stockTransferFilter = {};
  set stockTransferFilter(stockTransfers: TableData[][]) {
    console.log(stockTransfers);
    this.stockTransfers = stockTransfers;
    this.stockTransfersTotalItems = stockTransfers.length;
  }
  stockTransfersTotalItems: number = 0;
  stockTransfersHeaders!: string[];
  stockTransfers!: TableData[][];
  stockTransfersOrg!: TableData[][];

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
  stockTransferTableNameMapping: {
    name: keyof StockTransfer;
    name_jp: string;
  }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'store_name', name_jp: '店舗名' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'quantity', name_jp: '数量' },
    { name: 'remarks', name_jp: '備考' },
    { name: 'stock_transfer_date', name_jp: '在庫移動実行日' },
  ];

  ngOnInit(): void {
    // テーブルのイベントを購読開始
    this.getTableData();

    // 初回データの取得のためにイベントを送信
    this.tableEvent.next(this.pages);
  }

  getTableData(): void {
    this.subscription.add(
      this.tableEvent
        .pipe(
          tap((_) => (this.common.loading = true)),
          switchMap((x) => {
            const apiParams = this.createApiParams(x);
            // PromiseでラップしてObservableに変換
            return new Promise<any>((resolve) => {
              this.stockTransferDomain.getTableData(
                this.subscription,
                this._stockTransferFilter,
                this.stockTransferTableNameMapping,
                apiParams,
                (params: any) => resolve(params),
                (record: StockTransfer) =>
                  this.stockTransferDomain.modifiedTableBody(
                    record,
                    'inventory-control/stock-transfer',
                    'id'
                  )
              );
            });
          }),
          catchError((error: HttpErrorResponse) => of(error)),
          finalize(() => (this.common.loading = false))
        )
        .subscribe({
          next: (params) => {
            this.common.loading = false;
            if (params instanceof HttpErrorResponse) {
              this.handleError(params);
              return;
            }
            this.tableParams.next(params);
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
    const column = this.stockTransferTableNameMapping.find(
      (obj: any) => obj.name_jp === this.pages.sort.column
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
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(res: HttpErrorResponse) {
    const title = res.error ? res.error.title : 'エラー';
    const message = res.error ? res.error.message : 'エラーが発生しました。';
    this.errorEvent.emit({
      status: res.status,
      title: title,
      message: message,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
