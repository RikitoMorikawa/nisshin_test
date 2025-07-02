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
  of,
  switchMap,
  tap,
  finalize,
  take,
  filter,
} from 'rxjs';
import { TableWithPaginationEvent } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import {
  AccountsReceivableAggregate,
  AccountsReceivableAggregateApiResponse,
} from 'src/app/models/accounts-receivable-aggregate';
import { AccountsReceivableAggregateService } from 'src/app/services/accounts-receivable-aggregate.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { dummyData } from 'src/app/models/accounts-receivable-aggregate';
import { TableData } from './table/table.component';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';

type HeaderContents = {
  displayName: string;
  colName: string;
};

interface TableWithPaginationParams {
  header: string[];
  body: TableData[][];
  total: number;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  constructor(
    private araService: AccountsReceivableAggregateService,
    private common: CommonService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService
  ) {}

  // 購読を一元管理する
  private subscription = new Subscription();

  //テーブルイベント購読用 インスタンスは親コンポーネントから受け取る
  @Input() isLoading!: boolean;
  @Input() eventListener!: Subject<object>;
  @Input() paymentEvent!: Subject<object>;
  @Input() bulkIds!: string[];

  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // バルク用のIDリストを親に共有する
  @Output() bulkIdsChange = new EventEmitter<any[]>();

  //チェックボックス選択内容(is)をリスト格納
  items: any = [];
  selectitems?: string;
  listItem: any = [];

  // 送信済みステータスフラグ
  isSent!: boolean;
  // 絞り込み用オブジェクト
  private filter = {};

  private readonly defaultSort = {
    column: '請求ID',
    order: 'desc',
  } as TableSortStatus;

  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 50,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // スピナーコンポーネント表示・非表示切り替えフラグ
  loading = false;

  headerContents: HeaderContents[] = [
    { displayName: '選択', colName: 'id' },
    { displayName: '請求ID', colName: 'id' },
    { displayName: '請求先', colName: 'client_name' },
    { displayName: '請求日', colName: 'billing_date' },
    { displayName: '請求金額', colName: 'billing_amount' },
    { displayName: '入金予定日', colName: 'payment_exp_date' },
    { displayName: '請求書PDF', colName: 'pdf' },
  ];

  // リアクティブフォームとバリデーションの設定
  deleteList = new FormGroup({
    idlist: new FormControl('', [Validators.required]),
  });

  selectLists!: any;
  list_string: string = '';
  button_status: boolean = true;

  /**
   * Angular ライフサイクルフック
   */
  ngOnInit(): void {
    this.button_status = true;
    let wkSelected: boolean = false;
    this.loadTableData(wkSelected);
    this.resetSelectItems();
  }

  loadTableData(wkSelected: boolean): void {
    this.subscribeEventListener(wkSelected); // イベントを購読
    this.eventListener.next(this.pages); // 初回のデータを取得
  }

  /*loadTableData(wkSelected: boolean): void {
    this.isLoading = true;
    this.getTableData(wkSelected);
    this.eventListener.next(this.pages);
    this.isLoading = false;
  }*/

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener(wkSelected: boolean) {
    this.subscription?.unsubscribe(); // 念のため
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) => this.araService.getAll(this.createApiParams(x))), // APIコールへスイッチ
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => (this.common.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleErrors(
              res.status,
              '発注書一覧：' + modalConst.TITLE.HAS_ERROR,
              res.error.message
            );
            return;
          }
          this.tableParams.next(this.createTableParams(res, wkSelected));
        },
        // エラー発生時 complete が走るため、再度サブスクライブを設定
        complete: () => this.subscribeEventListener(wkSelected),
      });
  }

  /**
   * テーブル関連のイベント購読
   * @returns void

  getTableData(wkSelected: boolean): void {
    this.subscription.add(
      this.eventListener
        .pipe(
          tap((_) => (this.common.loading = true)),
          switchMap((x) =>
            this.araService.getAll(
              this.createApiParams(x)
            )
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
            // TODO: ダミーデータを使用する場合
            //this.tableParams.next(this.createTableParams({ message: '', totalItems: 15, data: dummyData }, wkSelected));
            this.tableParams.next(this.createTableParams(res, wkSelected));
          },
          complete: () => this.getTableData(wkSelected),
        })
    );
  }   */

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

    const tmpColumn = this.headerContents.find(
      (obj) => obj.displayName === this.pages.sort.column
    )?.colName;

    let column;
    if (tmpColumn === 'client_name') {
      column = 'client_name_kana';
    } else if (tmpColumn === 'created_id') {
      column = 'id';
    } else if (tmpColumn === 'pdf') {
      column = 'id';
    } else {
      column = tmpColumn;
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
    res: AccountsReceivableAggregateApiResponse,
    wkSelected: boolean
  ): TableWithPaginationParams {
    const header = this.headerContents.map((x) => x.displayName);
    const body = res.data.map((record) =>
      this.headerContents.map(
        (x) =>
          record[x.colName as keyof AccountsReceivableAggregate] as TableData
      )
    );

    this.listItem = this.deleteList.get('idlist');
    this.selectitems = this.listItem.value;

    if (this.selectitems != undefined) {
      this.selectLists = this.selectitems?.split(',');
    }

    body.forEach((row, i) => {
      let column: number = -1;
      const isSelected: boolean = wkSelected === true;

      //発注書Noをcheckbox用に格納
      column = header.indexOf('請求ID');
      let nam = row[column]?.toLocaleString();
      let selected: boolean = false;

      if (this.selectLists.includes(nam)) {
        selected = true;
      }

      // checkbox
      column = header.indexOf('選択');
      row[column] = {
        checkbox: true,
        name: 'checkbox',
        value: row[column] + '',
        selected: isSelected,
      };
      if (wkSelected === true) {
        this.selectcheck(row[column]);
      }

      // 請求IDをリンクへ変更
      column = header.indexOf('請求ID');
      row[column] = {
        position: 'text-center',
        href: `./slip-list/${res.data[i].id}`,
        text: row[column] + '',
      };
      // 請求IDをリンクへ変更
      column = header.indexOf('請求先');
      row[column] = {
        position: 'text-center',
        // href: `/master/client/detail/${res.data[i].client_id}`,
        text: row[column] + '',
      };
      //請求日を日付書式へ変更
      column = header.indexOf('請求日');
      if (
        row[column] === '' ||
        row[column] === undefined ||
        row[column] === null ||
        row[column] === 'NaT'
      ) {
        row[column] = { position: 'text-center', text: '' };
      } else {
        row[column] = {
          position: 'text-center',
          text: new Date(row[column] as string).toLocaleDateString(),
        };
      }
      //請求金額を金額書式へ変更
      column = header.indexOf('請求金額');
      row[column] = {
        position: 'text-right',
        text: row[column]
          ? Number(row[column]).toLocaleString() + ' '
          : '0' + ' ',
      };
      //入金予定日を日付書式へ変更
      column = header.indexOf('入金予定日');
      if (
        row[column] === '' ||
        row[column] === undefined ||
        row[column] === null ||
        row[column] === 'NaT'
      ) {
        row[column] = { position: 'text-center', text: '' };
      } else {
        row[column] = {
          position: 'text-center',
          text: new Date(row[column] as string).toLocaleDateString(),
        };
      }
      //請求書PDFをリンクへ変更
      column = header.indexOf('請求書PDF');
      if (row[column] !== '') {
        row[column] = {
          position: 'text-center',
          href: row[column] as string,
          icon: 'article-line',
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
      title: '債権一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }
  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleErrors(status: number, title: string, message: string) {
    this.errorEvent.emit({
      status: status,
      title: title,
      message: message,
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

  resetSelectItems(): void {
    //reset selectItem
    this.selectitems = '';
    this.listItem = [];
    this.list_string = '';
    this.updateBulkIds([]);
    this.items = [];
    this.deleteList.setValue({
      idlist: '',
    });
  }

  /**
   * チェックボックスの全選択・全選択解除
   * @param event
   */
  checkUncheckAll(event: any) {
    const isSelected = event.target.checked;
    this.loadTableData(isSelected);
  }

  checkUnCheck(item: any) {
    const checkValue = item.value;

    if (item.selected == true) {
      this.bulkIds.push(checkValue);
      return;
    }
    const index = this.bulkIds.indexOf(checkValue);
    if (index > -1) {
      this.bulkIds.splice(index, 1);
    }
  }

  allSelectItems() {
    let wkSelected: boolean = true;
    this.resetSelectItems();
    this.loadTableData(wkSelected);
  }
  selectcheck(item: any) {
    this.selectItemList(item.value);
  }

  selectItemList(newItem: string) {
    let index = this.items.indexOf(newItem);
    if (index === -1) {
      this.items.push(newItem);
    } else {
      this.items.splice(index, 1);
    }
    this.updateBulkIds(this.items);
    if (this.items.length > 0) {
      this.list_string = this.items.join(',');
      this.button_status = false;
    } else {
      this.button_status = true;
    }
    this.deleteList.setValue({
      idlist: this.list_string,
    });

    this.selectitems = this.list_string;
  }

  reset() {
    this.ngOnDestroy();
    this.ngOnInit();
  }

  /**
   * 削除処理
   * データが下書き中の場合のみ実行される
   * （バックエンドでも対応しているがフロントエンドでも対応）
   */
  handleClickDelete() {
    // 送信済みの場合はエラーモーダルを表示
    if (this.isSent) {
      this.handleErrors(
        422,
        accountsReceivableAggregateConst.ERROR.CANNOT_BE_DELETED,
        accountsReceivableAggregateConst.ERROR
          .ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE
      );
      return;
    }

    // モーダルのタイトル
    const modalTitle = '請求' + modalConst.TITLE.DELETE;
    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'danger';

    // 削除確認モーダル呼び出し
    this.modalService.setModal(
      modalTitle,
      modalConst.BODY.DELETE,
      modalPurposeDanger,
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          ) // 削除のモーダルじゃなければスルー
        )
        .subscribe((res: string) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除実行
            this.araService
              .listremove(this.list_string)
              .pipe(
                finalize(() => (this.common.loading = false)),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  this.handleErrors(res.status, res.error.title, res.message);
                  return;
                }
                const flashMessagePurpose: FlashMessagePurpose = 'success';
                this.flashMessageService.setFlashMessage(
                  res.message,
                  flashMessagePurpose,
                  15000
                );

                this.resetSelectItems();
                this.ngOnDestroy();
                this.ngOnInit(); // イベントを購読

                this.common.loading = false;
                this.router.navigateByUrl('accounts-receivable-aggregate/bill');
              });
          }
        })
    );
  }

  // bulkIdsが変更されたときに親コンポーネントに通知
  updateBulkIds(newBulkIds: any[]) {
    this.bulkIds = newBulkIds;
    this.bulkIdsChange.emit(this.bulkIds);
  }
}
