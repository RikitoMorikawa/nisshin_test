import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import { MemberService } from 'src/app/services/member.service';
import { Member, MemberApiResponse } from 'src/app/models/member';
import { CommonService } from 'src/app/services/shared/common.service';
@Component({
  selector: 'app-member-table',
  templateUrl: './member-table.component.html',
  styleUrls: ['./member-table.component.scss'],
})
export class MemberTableComponent implements OnInit, OnDestroy {
  //テーブルイベント購読用 インスタンスは親コンポーネントから受け取る
  @Input() tableEvent!: Subject<object>;
  // エラーイベントを親コンポーネントへ送信するEmitter
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 購読を一元的に保持
  subscription = new Subscription();
  // 絞り込み用オブジェクト
  private filter = {};
  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;
  // テーブルのページネーションイベント購読用インスタンス
  tableParams = new Subject<TableWithPaginationParams>();
  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Member; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'member_cd', name_jp: '会員番号' },
    { name: 'last_name', name_jp: '会員氏名' }, // 苗字と名前を結合
    // { name: 'mail', name_jp: 'メールアドレス' }, B2C除外対応
    { name: 'tel', name_jp: '電話番号' },
    { name: 'province', name_jp: '住所' }, // 郵便番号～番地を結合
  ];

  /**
   * コンストラクタ
   * @param memberService
   */
  constructor(
    private memberService: MemberService,
    public common: CommonService
  ) {}

  ngOnInit(): void {
    // テーブルのイベントを購読
    this.getTableData();
    // 初回データ取得のためにイベントを送信
    this.tableEvent.next(this.pages);
  }

  /**
   * テーブルのイベントを購読
   */
  getTableData(): void {
    this.subscription.add(
      this.tableEvent
        .pipe(
          tap((_) => (this.common.loading = true)),
          switchMap((x) => this.memberService.getAll(this.createApiParams(x))),
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
      // 絞り込みの場合はページを１にリセットする
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
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する
   * @param res APIレスポンスのオブジェクト
   * @returns 生成されたTableWithPaginationParamsオブジェクト
   */
  createTableParams(res: MemberApiResponse): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, index) => {
      let column: number = -1;
      // idをリンクへ変更
      column = header.indexOf('ID');
      row[column] = {
        href: `detail/${row[column]}`,
        text: row[column] + '',
      };
      // 会員氏名＋様を生成
      column = header.indexOf('会員氏名');
      const member = res.data[index];
      row[column] =
        `${member.last_name}` + ' ' + `${member.first_name}` + ' 様';
      // 住所を生成
      column = header.indexOf('住所');
      row[column] =
        `〒${member.postal_code}` +
        ' ' +
        `${member.province}${member.locality}${member.street_address}${member.other_address}`;
    });
    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  /**
   * エラーを親コンポーネントへ送信する
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '会員一覧' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * コンポーネントの終了処理
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
