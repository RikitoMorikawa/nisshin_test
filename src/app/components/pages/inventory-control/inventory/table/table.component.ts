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
import { TableData } from 'src/app/components/pages/inventory-control/inventory/table/child-table/child-table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/pages/inventory-control/inventory/table/table-with-pagination/table-with-pagination.component';
import { Inventory, InventoryApiResponse } from 'src/app/models/inventory';
import { InventoryService } from 'src/app/services/inventory.service';
import { ActivatedRoute } from '@angular/router';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import { StoreService } from 'src/app/services/store.service';
import { StoreApiResponse } from 'src/app/models/store';
import { ProductService } from 'src/app/services/product.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  constructor(
    private inventoryService: InventoryService,
    private storeService: StoreService,
    private route: ActivatedRoute,
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
  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: { column: '在庫ID', order: 'desc' },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // パスパラメータから取得したid
  selectedId?: number;

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Inventory; name_jp: string }[] = [
    { name: 'id', name_jp: '棚卸ID' },
    { name: 'product_id', name_jp: '商品ID' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'supplier_name', name_jp: '仕入先名' },
    { name: 'store_id', name_jp: '店舗名' }, // createTableParams()で店舗IDを店舗名に変換
    { name: 'stock_quantity', name_jp: '月次理論在庫数' },
    { name: 'inventory_stock_quantity', name_jp: '実在庫数' },
    { name: 'difference_quantity', name_jp: '差異' },
  ];

  // 管理コードでグループ化された一覧ページへのパス
  listPagePath = '/inventory-control/inventory';

  ngOnInit(): void {
    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.params['management_cd'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);
    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError({
        status: 400,
        title: 'エラー',
        message: 'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        redirectPath: this.listPagePath,
      });
      return;
    }
    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);

    this.filter = { management_cd: this.selectedId };

    // テーブルのイベントを購読開始
    this.getTableData();

    // 初回データの取得のためにイベントを送信
    this.tableEvent.next(this.pages);
  }

  /**
   * 棚卸未実施のみのデータを取得するかどうかを変更する。
   * @param event
   */
  notInputOnlyChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.inventoryService.changeGetAllEndpoint(target.checked);
      // 初回データの取得のためにイベントを送信
      this.tableEvent.next(this.pages);
    }
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
          switchMap((x) => {
            return this.inventoryService.getAll(this.createApiParams(x));
          }),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe({
          next: (inventory) => {
            if (inventory instanceof HttpErrorResponse) {
              const status = inventory.status;
              const title = inventory.error ? inventory.error.title : 'エラー';
              const message = inventory.error
                ? inventory.error.message
                : 'エラーが発生しました。';
              this.handleError({ status, title, message });
              return;
            }
            // 店舗情報を取得
            this.storeService
              .getAll()
              .pipe(
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                }),
                finalize(() => (this.common.loading = false))
              )
              .subscribe((store) => {
                if (store instanceof HttpErrorResponse) {
                  const status = store.status;
                  const title = store.error ? store.error.title : 'エラー';
                  const message = store.error
                    ? store.error.message
                    : 'エラーが発生しました。';
                  this.handleError({ status, title, message });
                  return;
                }

                this.tableParams.next(this.createTableParams(inventory, store));
              });
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
   * @param inventory APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    inventory: InventoryApiResponse,
    store: StoreApiResponse
  ): TableWithPaginationParams {
    const stores = store.data;
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = inventory.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    body.forEach((row, index) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('棚卸ID');
      row[column] = { href: `./detail/${row[column]}`, text: row[column] + '' };

      // IDをリンクへ変更
      column = header.indexOf('商品ID');
      row[column] = {
        href: `/master/product/detail/${row[column]}`,
        text: row[column] + '',
      };

      column = header.indexOf('商品名');
      row[column] = { header: '商品名', name: row[column] + '' };

      column = header.indexOf('店舗名');
      // 店舗IDを店舗名に変換して設定
      const storeIndex = stores.findIndex((store) => store.id === row[column]);
      row[column] = { header: '店舗名', name: stores[storeIndex].name + '' };

      column = header.indexOf('実在庫数');
      row[column] = {
        id: inventory.data[index].id + '',
        value: row[column] + '',
      };

      column = header.indexOf('仕入先名');
      row[column] = row[column];
    });

    return {
      total: inventory.totalItems,
      header,
      body,
    };
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(res: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    this.errorEvent.emit({
      status: res.status,
      title: res.title,
      message: res.message,
    });
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 購読終了
    this.subscription.unsubscribe();
  }
}
