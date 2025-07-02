import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  catchError,
  finalize,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationParams,
  TableWithPaginationEvent,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import {
  QualityCustomerApiResponse,
  QualityCustomer,
} from 'src/app/models/quality-customer';
import { QualityCustomerService } from 'src/app/services/quality-customer.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-table-org',
  templateUrl: './table-org.component.html',
  styleUrls: ['./table-org.component.scss'],
})
export class TableOrgComponent implements OnInit, OnDestroy {
  // テーブルイベント購読用
  @Input() tableEvent!: Subject<object>;
  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  // エラーイベントを親コンポーネントへ送信するEmitterを初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 購読を一括して保持
  subscription = new Subscription();
  // 絞り込み用オブジェクト
  private filter = {};
  // 一覧表示用パラメータのオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;
  // テーブルのページネーションイベント購読用インスタンスの初期化
  tableParams = new Subject<TableWithPaginationParams>();
  // スピナーコンポーネント表示切り替えフラグ

  // APIレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof QualityCustomer; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'name', name_jp: '客層名' },
    { name: 'furi', name_jp: '客層名ふりがな' },
    { name: 'code', name_jp: '客層コード' },
    { name: 'created_at', name_jp: '登録日時' },
    { name: 'updated_at', name_jp: '最終更新日時' },
  ];

  /**
   * コンストラクタ
   * @param qualityCustomerService
   */
  constructor(
    private qualityCustomerService: QualityCustomerService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // テーブルのイベントを購読
    this.getTableData();
    // 初回データ取得のためにイベントを送信
    this.eventListener.next(this.pages);
  }

  /**
   * テーブル関連のイベント購読
   * @returns void
   */
  getTableData(): void {
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) =>
          this.qualityCustomerService.getAll(this.createApiParams(x))
        ),
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
   * APIコール用のパラメータを生成する
   * @param arg 各イベントから取得されたオブジェクト
   * @returns APIコールのパラメータとなるオブジェクト
   */
  private createApiParams(arg: object) {
    const isTableEvent = this.isTableWithPaginationEvent(arg);

    if (isTableEvent) {
      this.pages = arg;
    } else {
      this.filter = arg;
      // 絞り込みの場合はページを1にリセット
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
  private createTableParams(
    res: QualityCustomerApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    body.forEach((row) => {
      let column: number = -1;
      // idをリンクへ変更
      column = header.indexOf('ID');
      row[column] = {
        href: `/setting/quality-customer/detail/${row[column]}`,
        text: row[column] + '',
      };
      // 登録日時の処理
      column = header.indexOf('登録日時');
      row[column] = new Date(row[column] as string).toLocaleString();
      // 最終更新日時の処理
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
      title: '客層一覧：' + modalConst.TITLE.HAS_ERROR,
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
