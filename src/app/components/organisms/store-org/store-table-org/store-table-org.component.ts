import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { catchError, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { Store, StoreApiResponse } from 'src/app/models/store';
import { StoreService } from 'src/app/services/store.service';
import { modalConst } from 'src/app/const/modal.const';
import { TableData } from 'src/app/components/atoms/table/table.component';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-store-table-org',
  templateUrl: './store-table-org.component.html',
  styleUrls: ['./store-table-org.component.scss'],
})
export class StoreTableOrgComponent implements OnInit, OnDestroy {
  /**
   * コンストラクター
   * @param storeService
   */
  constructor(
    private storeService: StoreService,
    public common: CommonService
  ) {}

  // 購読を管理
  subscription = new Subscription();

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
  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Store; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'name', name_jp: '店舗名' },
    { name: 'alias', name_jp: '略称' },
    { name: 'tel', name_jp: '電話番号' },
    { name: 'postal_code', name_jp: '所在地' },
    { name: 'province', name_jp: '' },
    { name: 'locality', name_jp: '' },
    { name: 'street_address', name_jp: '' },
    { name: 'other_address', name_jp: '' },
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
    this.tableEvent
      .pipe(
        tap((_) => (this.common.loading = true)),
        switchMap((x) => this.storeService.getAll(this.createApiParams(x))),
        catchError((error: HttpErrorResponse) => {
          return of(error);
        })
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
        complete: () => this.getTableData(),
      });
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
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(res: StoreApiResponse): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    body.forEach((row) => {
      let column: number = -1;
      // idをリンクへ変更
      column = header.indexOf('ID');
      row[column] = {
        href: `/setting/store/detail/${row[column]}`,
        text: row[column] + '',
      };
    });
    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  /**
   * 親コンポーネントへエラーを送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '店舗一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  ngOnDestroy(): void {
    // 全ての購読を終了
    this.subscription.unsubscribe();
  }
}
