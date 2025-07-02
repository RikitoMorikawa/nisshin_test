import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, catchError, forkJoin, of, finalize, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { OrderFn } from 'src/app/functions/order-functions';
import { Order, OrderApiResponse } from 'src/app/models/order';
import { ModalService } from 'src/app/services/modal.service';
import { OrderService } from 'src/app/services/order.service';
import { CommonService } from 'src/app/services/shared/common.service';

type ListItem = {
  name: string;
  value?: string;
  display: 'visible' | 'hidden' | 'editable';
  prop_name?: keyof Order;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  order = {} as Order;
  updater?: string;
  private orderId = this.route.snapshot.params['id'];
  removeMethod$: Observable<ApiResponse> = this.orderService
    .remove(this.orderId)
    .pipe(catchError(this.handleError<OrderApiResponse>()));

  // リスト要素で表示する項目の一覧とマッピング表
  readonly listItems: ListItem[] = [
    { name: '個票No', display: 'visible', prop_name: 'id' },
    { name: '発注書No', display: 'visible', prop_name: 'purchase_order_id' },
    { name: 'ステータス', display: 'visible', prop_name: 'order_status_value' },
    { name: '商品名', display: 'visible', prop_name: 'product_name' },
    { name: '発注数量', display: 'visible', prop_name: 'order_quantity' },
    { name: '発注商品登録者', display: 'visible', prop_name: 'created_at' },
    { name: '発注商品登録日時', display: 'visible', prop_name: 'created_at' },
    { name: '検品数量', display: 'visible', prop_name: 'receiving_quantity' },
    { name: '検品日時', display: 'hidden', prop_name: 'receiving_date' },
    {
      name: '検品担当者',
      display: 'hidden',
      prop_name: 'receiving_employee_id',
    },
    { name: '最終更新日時', display: 'hidden', prop_name: 'updated_at' },
    { name: '最終更新者', display: 'hidden', prop_name: 'updated_id' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private modal: ModalService,
    private orderService: OrderService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ページ遷移時に表示範囲を最上段へ戻す
    window.scrollTo(0, 0);

    // ローディング表示
    this.common.loading = true;

    // 仕入先情報の Observable
    const order$ = this.orderService.find(this.orderId).pipe(
      map((x) => x.data[0]),
      catchError(this.handleError<Order>())
    );

    // 各 Observable を購読
    forkJoin({ order$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((res) => {
        this.order = res.order$;
        this.updater = `${this.order.employee_updated_last_name}　${this.order.employee_updated_first_name}`;
        this.setListItemsValue(res.order$);
      });
  }

  /**
   * ユーザーへエラーを通知するモーダルを表示し、アプリの動作を止めないよう空のオブジェクトを返却する。
   * @returns `catchError`関数へ渡す関数。
   */
  private handleError<T>() {
    return (err: HttpErrorResponse) => {
      console.error(err);
      this.modal.setModal(
        `通信エラー(${err.status})`,
        err.message,
        'danger',
        '閉じる',
        ''
      );
      return of({} as T);
    };
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param order 仕入先オブジェクト。
   */
  private setListItemsValue(order: Order) {
    // Order のプロパティそのままのものを格納
    this.listItems
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (order[item.prop_name!] ?? '') + '';
      });

    // 発注商品登録日時/登録者
    order.created_at
      ? (this.getListItem('発注商品登録日時')!.value = new Date(
          order.created_at
        ).toLocaleString())
      : '';
    this.getListItem(
      '発注商品登録者'
    )!.value = `${order.employee_created_last_name} ${order.employee_created_first_name}`;

    // 検品
    if (this.getListItem('検品日時')!.value != '') {
      this.getListItem('検品日時')!.value = new Date(
        order.receiving_date
      ).toLocaleString();
    }
    this.getListItem(
      '検品担当者'
    )!.value = `${order.employee_receiving_last_name} ${order.employee_receiving_first_name}`;

    // 最終更新日時/最終更新者
    if (order.updated_at) {
      this.getListItem('最終更新日時')!.value = new Date(
        order.updated_at
      ).toLocaleString();
      this.getListItem(
        '最終更新者'
      )!.value = `${order.employee_updated_last_name} ${order.employee_updated_first_name}`;
    }
  }

  /**
   * `this.listItems`から対象項目のオブジェクトを取得する。
   * @param name 取得対象の`ListItem.name`。
   * @returns ListItemオブジェクト。
   */
  private getListItem(name: string) {
    return this.listItems.find((x) => x.name === name);
  }
}
