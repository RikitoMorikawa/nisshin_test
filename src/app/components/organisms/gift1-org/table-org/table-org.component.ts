import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';
import { catchError, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import { Gift1, Gift1ApiResponse } from 'src/app/models/gift1';
import { Gift1Service } from 'src/app/services/gift1.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-table-org',
  templateUrl: './table-org.component.html',
  styleUrls: ['./table-org.component.scss'],
})
export class TableOrgComponent implements OnInit, OnDestroy {
  // テーブルイベント購読用
  @Input() tableEvent!: Subject<object>;
  // エラーイベントを親コンポーネントへ送信するEmitter
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 購読を一括して保持
  subscription = new Subscription();
  // 絞り込み用のオブジェクト
  private filter = {};
  // 一括表示パラメータのオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;
  // テーブルのページネーションイベント購読用インスタンス
  tableParams = new Subject<TableWithPaginationParams>();
  // APIレスポンスとヘッダ名のマッピング
  tableNameMapping: { name: keyof Gift1; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'name', name_jp: 'ギフト1名' },
    { name: 'furi', name_jp: 'ギフト1名ふりがな' },
    { name: 'created_at', name_jp: '登録日時' },
    { name: 'updated_at', name_jp: '最終更新日時' },
  ];

  /**
   * コンストラクタ
   * @param gift1Service
   */
  constructor(
    private gift1Service: Gift1Service,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // テーブルイベントを購読
    this.getTableData();
    // 初回データ取得のためにイベントを送信
    this.tableEvent.next(this.pages);
  }

  /**
   * テーブル関連のイベントを購読
   * @returns void
   */
  getTableData(): void {
    this.subscription.add(
      this.tableEvent
        .pipe(
          tap((_) => (this.common.loading = true)),
          switchMap((x) => this.gift1Service.getAll(this.createApiParams(x))),
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
            this.tableParams.next(this.createTablePrams(res));
          },
          complete: () => this.getTableData(),
        })
    );
  }

  /**
   * APIコール用のパラメータを生成する
   * @param arg 各イベントから取得されたオブジェクト
   * @returns APIコールのパラメータとなるオブジェクト
   */
  createApiParams(arg: object) {
    const isTableEvent = this.isTableWithPaginationEvent(arg);

    if (isTableEvent) {
      this.pages = arg;
    } else {
      this.filter = arg;
      // 絞り込みの場合はページを１にリセット
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
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する
   * @param res APIレスポンスのオブジェクト
   * @returns 生成されたTableWithPaginationParamsオブジェクト
   */
  createTablePrams(res: Gift1ApiResponse): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    body.forEach((row) => {
      let column: number = -1;
      // idをリンクへ変更
      column = header.indexOf('ID');
      row[column] = {
        href: `/setting/non-cash-item/gift1/detail/${row[column]}`,
        text: row[column] + '',
      };
      // 登録日時
      column = header.indexOf('登録日時');
      row[column] = new Date(row[column] as string).toLocaleString();
      // 最終更新日時
      column = header.indexOf('最終更新日時');
      row[column] = new Date(row[column] as string).toLocaleString();
    });
    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  /**
   * オブジェクトがTableWithPaginationEventのインスタンスかどうかを確認する
   * @param arg 検証対象のオブジェクト
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
   * 親コンポーネントへエラーを送信する
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: 'ギフト1一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
