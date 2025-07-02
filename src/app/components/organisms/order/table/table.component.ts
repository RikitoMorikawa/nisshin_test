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
  Subject,
  tap,
  switchMap,
  finalize,
  catchError,
  of,
  Subscription,
} from 'rxjs';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import { orderConst } from 'src/app/const/order.const';
import { Order, OrderApiResponse } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import { CommonService } from 'src/app/services/shared/common.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';

export interface InputData {
  id: string;
  name: string;
  value: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
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
    sort: { column: '個票No', order: 'desc' },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();
  // スピナーコンポーネント表示・非表示切り替えフラグ
  // loading = false;

  // エラーモーダルのタイトル
  errorModalTitle = '更新エラー：' + modalConst.TITLE.HAS_ERROR;

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Order; name_jp: string }[] = [
    { name: 'id', name_jp: '個票No' }, // createTableParams 内で値を修正
    { name: 'purchase_order_id', name_jp: '発注書No' },
    { name: 'order_status_value', name_jp: 'ステータス' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'supplier_name', name_jp: '仕入先名' },
    { name: 'product_minimum_order_quantity', name_jp: '最小発注数' },
    { name: 'order_quantity', name_jp: '発注数量' },
    { name: 'receiving_quantity', name_jp: '検品数量' }, // createTableParams 内で値を修正
    { name: 'receiving_date', name_jp: '検品日時' }, // createTableParams 内で値を修正
    { name: 'shelf_value', name_jp: '陳列棚' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private orderService: OrderService,
    public common: CommonService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService
  ) {}

  order?: OrderService;
  // 一覧のパス
  listPagePath = '/order/specification';
  /**
   * 初期化処理
   */
  ngOnInit(): void {
    this.subscribeEventListener(); // イベントを購読
    this.eventListener.next(this.pages); // 初回のデータを取得
  }
  changeItemData(changeItem: InputData) {
    this.common.loading = true;
    //フォームデータに整える
    // フォームの値を送信用フォーマットに置き換え
    // フォームの値を送信用フォーマットに置き換え
    let target_id = Number(changeItem.id);
    let target_value = Number(changeItem.value);

    /*find*/
    this.subscription.add(
      this.orderService
        .find(target_id)
        .pipe(
          finalize(() => (this.common.loading = true)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.message);
            return;
          }
          // 発注書データ
          let order = res.data[0];
          const po = {
            order_quantity: target_value,
            purchase_order_id: order.purchase_order_id,
            product_id: order.product_id,
          };

          // 保存処理開始
          this.orderService
            .update(target_id, po)
            .pipe(
              finalize(() => (this.common.loading = false)),
              catchError((error: HttpErrorResponse) => {
                return of(error);
              })
            )
            .subscribe((res) => {
              if (res instanceof HttpErrorResponse) {
                this.handleError(res.status, res.error.message);
                return;
              }
              const purpose: FlashMessagePurpose = 'success';
              this.flashMessageService.setFlashMessage(
                res.message,
                purpose,
                15000
              );
              this.common.loading = false;
            });
        })
    );
  }

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener() {
    this.subscription?.unsubscribe(); // 念のため
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) => this.orderService.getAll(this.createApiParams(x))), // APIコールへスイッチ
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        tap(() => (this.common.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          /**
           * alias とproduct_name差し替え
           */
          let res_data = res.data;
          res.data.forEach((value, index) => {
            if (value.product_name_alias !== '') {
              res.data[index].product_name = value.product_name_alias;
            }
          });

          console.log(res);
          this.tableParams.next(this.createTableParams(res));
        },
        // エラー発生時 complete が走るため、再度サブスクライブを設定
        complete: () => this.subscribeEventListener(),
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
  private handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '発注個票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(res: OrderApiResponse): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    const res_data = res.data;
    body.forEach((row, index) => {
      let other_param = res.data[index];
      let column: number = -1;

      let product_id = res_data[index].product_id;

      // IDをリンクへ変更
      column = header.indexOf('個票No');
      let no = row[column];
      row[column] = { href: `./detail/${row[column]}`, text: row[column] + '' };

      // 商品名
      column = header.indexOf('商品名');
      row[column] = {
        href: `/master/product/detail/${product_id}`,
        text: row[column] + '',
        target: true,
      };

      // 検品数がない場合0を表示する
      column = header.indexOf('検品数量');
      row[column] = row[column] === '' ? 0 : row[column];

      // 検品日のフォーマットを変換
      column = header.indexOf('検品日時');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleString();
      }
      // 陳列棚
      column = header.indexOf('陳列棚');
      row[column] = row[column];

      // 最小発注数
      column = header.indexOf('発注数量');
      let tmp_num = row[column] === '' ? 0 : row[column];
      row[column] = {
        id: 'order_quantity__' + no + '',
        text: true,
        name: 'order_quantity',
        value: tmp_num + '',
      };
      // 最小発注数
      column = header.indexOf('最小発注数');
      row[column] = row[column] === '' ? '未設定' : row[column];
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
