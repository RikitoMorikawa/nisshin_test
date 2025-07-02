import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  filter,
  take,
} from 'rxjs';
import {
  TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  PurchaseOrder,
  PurchaseOrderApiResponse,
} from 'src/app/models/purchase-order';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { modalConst } from 'src/app/const/modal.const';
import { CommonService } from 'src/app/services/shared/common.service';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { purchaseOrderConst } from 'src/app/const/purchase-order.const';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param poService
   */
  constructor(
    private poService: PurchaseOrderService,
    public common: CommonService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService
  ) {}

  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  private subscription = new Subscription();
  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  //チェックボックス選択内容(is)をリスト格納
  items: any = [];
  selectitems?: string;

  listItem: any = [];

  // 削除キャンセル時のモーダルのタイトル
  cancelModalTitle = '発注書削除キャンセル：' + modalConst.TITLE.CANCEL;
  // エラーモーダルのタイトル
  errorModalTitle = '発注書削除キャンセルエラー：' + modalConst.TITLE.HAS_ERROR;

  // 送信済みステータスフラグ
  isSent!: boolean;

  // 絞り込み用オブジェクト
  private filter = {};

  // デフォルトのソート状態
  private readonly defaultSort = {
    column: '発注書No',
    order: 'desc',
  } as TableSortStatus;

  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: { column: '発注書No', order: 'desc' },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof PurchaseOrder; name_jp: string }[] = [
    { name: 'id', name_jp: '選択' },
    { name: 'id', name_jp: '発注書No' },
    { name: 'order_date', name_jp: '発注日' },
    { name: 'preferred_delivery_date', name_jp: '希望納入日' },
    { name: 'supplier_name', name_jp: '仕入先名' },
    { name: 'employee_order_first_name', name_jp: '発注担当者' },
    { name: 'purchase_order_status_division_id', name_jp: 'ステータス' },
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
   *
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

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener(wkSelected: boolean) {
    this.subscription?.unsubscribe(); // 念のため
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) => this.poService.getAll(this.createApiParams(x))), // APIコールへスイッチ
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => (this.common.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(
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
    if (Object.keys(this.pages.sort).length === 0) {
      this.pages.sort = this.defaultSort;
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
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleError(status: number, title: string, message: string) {
    this.errorEvent.emit({
      status: status,
      title: title,
      message: message,
    });
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: PurchaseOrderApiResponse,
    wkSelected: boolean
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    this.listItem = this.deleteList.get('idlist');
    this.selectitems = this.listItem.value;

    if (this.selectitems != undefined) {
      this.selectLists = this.selectitems?.split(',');
    }

    body.forEach((row, index) => {
      let column: number = -1;
      const isSelected: boolean = wkSelected === true;

      //発注書Noをcheckbox用に格納
      column = header.indexOf('発注書No');
      let nam = row[column]?.toLocaleString();
      let selected: boolean = false;

      if (this.selectLists.includes(nam)) {
        selected = true;
      }

      // checkbox
      column = header.indexOf('選択');
      // 送信済みのチェックはできない。
      if (
        res.data[index].purchase_order_status_code ===
        purchaseOrderConst.STATUS_CODE.SENT
      ) {
        row[column] = '';
      } else {
        row[column] = {
          checkbox: true,
          name: 'checkbox',
          value: row[column] + '',
          selected: isSelected,
        };
        if (wkSelected === true) {
          this.selectcheck(row[column]);
        }
      }

      // IDをリンクへ変更
      column = header.indexOf('発注書No');
      const supplierId = res.data[index].supplier_id;
      row[column] = {
        href: `./detail/${row[column]}`,
        text: row[column] + '',
      };

      // 発注日のフォーマット変換
      column = header.indexOf('発注日');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleDateString();
      }

      // 希望納入日のフォーマット変換
      column = header.indexOf('希望納入日');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleDateString();
      }

      // 発注担当者の姓・名結合
      column = header.indexOf('発注担当者');
      let dummy: any = '';
      if (res.data[index].employee_order_first_name) {
        dummy = res.data[index].employee_order_first_name;
      }
      row[column] = {
        dummy_flg: true,
        text: String(dummy) + '',
        dummy:
          res.data[index].employee_order_last_name +
          '　' +
          res.data[index].employee_order_first_name,
      };

      // ステータスの表示名取得
      column = header.indexOf('ステータス');
      row[column] = String(res.data[index].purchase_order_status_value);
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  } // 選択 id の出し入れ

  selectItemList(newItem: string) {
    let index = this.items.indexOf(newItem);
    if (index === -1) {
      this.items.push(newItem);
    } else {
      this.items.splice(index, 1);
    }

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

  onSubmit() {
    alert(JSON.stringify(this.deleteList.value));
  }

  allSelectItems() {
    let wkSelected: boolean = true;
    this.resetSelectItems();
    this.loadTableData(wkSelected);
  }
  selectcheck(item: any) {
    this.selectItemList(item.value);
  }

  reset() {
    this.ngOnDestroy();
    this.ngOnInit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  resetSelectItems(): void {
    //reset selectItem
    this.selectitems = '';
    this.listItem = [];
    this.list_string = '';
    this.items = [];
    this.deleteList.setValue({
      idlist: '',
    });
  }

  /**
   * 削除処理
   * データが下書き中の場合のみ実行される
   * （バックエンドでも対応しているがフロントエンドでも対応）
   */
  handleClickDelete() {
    // 送信済みの場合はエラーモーダルを表示
    if (this.isSent) {
      this.handleError(
        422,
        purchaseOrderConst.ERROR.CANNOT_BE_DELETED,
        purchaseOrderConst.ERROR.ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE
      );
      return;
    }

    // モーダルのタイトル
    const modalTitle = '発注書' + modalConst.TITLE.DELETE;
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
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除実行
            this.poService
              .listremove(this.list_string)
              .pipe(
                finalize(() => (this.common.loading = false)),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  this.handleError(res.status, res.error.title, res.message);
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
                this.router.navigateByUrl('purchase-order');
              });
          }
        })
    );
  }
}
