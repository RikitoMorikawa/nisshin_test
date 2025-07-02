import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
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
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { Employee, EmployeeApiResponse } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { modalConst } from 'src/app/const/modal.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-employee-table-org',
  templateUrl: './employee-table-org.component.html',
  styleUrls: ['./employee-table-org.component.scss'],
})
export class EmployeeTableOrgComponent implements OnInit, OnDestroy {
  // 購読を一元管理する
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
    sort: { column: 'ID', order: 'desc' },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Employee; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'code', name_jp: '社員コード' },
    { name: 'division_status_value', name_jp: '表示区分' },
    { name: 'store_name', name_jp: '所属店舗名' },
    { name: 'last_name', name_jp: '姓' },
    { name: 'first_name', name_jp: '名' },
    { name: 'mail', name_jp: 'メールアドレス' },
    { name: 'last_login_at', name_jp: '最終ログイン日時' },
  ];

  /**
   * コンストラクタ
   *
   * @param {EmployeeService} employeeService
   */
  constructor(
    private employeeService: EmployeeService,
    public common: CommonService
  ) {}

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
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
            this.employeeService.getAll(this.createApiParams(x))
          ),
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

    const sortColumn = this.tableNameMapping.find(
      (obj) => obj.name_jp === this.pages.sort.column
    )?.name;
    let column = sortColumn;
    if (sortColumn === 'division_status_value') {
      column = 'status_division_id';
    } else if (sortColumn === 'store_name') {
      column = 'store_name_kana';
    } else if (sortColumn === 'last_name') {
      column = 'last_name_kana';
    } else if (sortColumn === 'first_name') {
      column = 'first_name_kana';
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
    res: EmployeeApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    body.forEach((row, index) => {
      let column: number = -1;
      // idをリンクへ変更
      column = header.indexOf('ID');
      row[column] = {
        href: `/employee/detail/${row[column]}`,
        text: row[column] + '',
      };
      // 最終ログイン日時のフォーマット変換
      column = header.indexOf('最終ログイン日時');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleString();
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
      title: '社員一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読終了
    this.subscription.unsubscribe();
  }
}
