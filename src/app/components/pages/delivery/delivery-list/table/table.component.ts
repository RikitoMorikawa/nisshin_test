import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { modalConst } from 'src/app/const/modal.const';
import { DeliveryService } from 'src/app/services/delivery.service';
import { Delivery, DeliveryApiResponse } from 'src/app/models/delivery';
import { deliveryConst } from 'src/app/const/delivery.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  constructor(
    private deliveryService: DeliveryService,
    public common: CommonService
  ) {}

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
    sort: { column: '配送または回収日時', order: 'asc' },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Delivery; name_jp: string }[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'sales_type_id', name_jp: '売上タイプ' },
    { name: 'delivery_type_division_id', name_jp: '配送区分' },
    { name: 'delivery_specified_time', name_jp: '配送または回収日時' },
    { name: 'tel', name_jp: '連絡先電話番号' },
    { name: 'name', name_jp: 'お名前' },
    { name: 'shipping_address', name_jp: '配送先' },
  ];

  ngOnInit(): void {
    // テーブルのイベントを購読開始
    this.getTableData();

    // 本日以降の検索条件で実行
    this.tableEvent.next({
      customer_type: '',
      customer_id: '',
      name: '',
      shipping_address: '',
      tel: '',
      additional_tel: '',
      from_delivery_specified_time:
        new Date().toISOString().split('T')[0].replace(/-/g, '/') + ' 00:00:00',
    });
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
            this.deliveryService.getAll(this.createApiParams(x))
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

    let sortParam = '';
    // ソートが指定されている場合
    if (this.pages.sort && this.pages.sort.column) {
      const column = this.tableNameMapping.find(
        (obj) => obj.name_jp === this.pages.sort.column
      )?.name;
      if (column) {
        sortParam = `${column}:${this.pages.sort.order}`;
      }
    }
    // ソートが指定されていない場合
    if (!sortParam) {
      sortParam = 'delivery_specified_time:asc';
    }

    return {
      ...this.filter,
      limit: this.pages.itemsPerPage,
      offset: (this.pages.page - 1) * this.pages.itemsPerPage,
      sort: sortParam,
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
    res: DeliveryApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    let id: number | undefined;

    body.forEach((row, i) => {
      let data = res.data[i];
      let column: number = -1;

      column = header.indexOf('ID');
      row[column] = {
        href: `detail/${row[column]}`,
        text: row[column] + '',
      };

      // 売上タイプidから名称を取得してセット
      column = header.indexOf('売上タイプ');
      const salesType = deliveryConst.SALES_TYPE.find((salesType) => {
        return salesType.id === row[column];
      });

      if (salesType?.id) {
        let page = '';

        if (salesType?.id === 2 && data.cors_slip_id) {
          id = data.cors_slip_id;
          page = '/customer-order-reception-slip';
        } else if (salesType?.id === 4 && data.rs_slip_id) {
          id = data.rs_slip_id;
          page = '/rental-slip';
        }

        if (page) {
          page += '/detail/' + id;
          row[column] = {
            href: `${page}`,
            text: salesType?.name ? salesType.name : '',
          };
        } else {
          //　page 空なら文字のみ格納
          row[column] = salesType?.name ? salesType.name : '';
        }
      } else {
        row[column] = '';
      }

      // 配送区分名をセット
      column = header.indexOf('配送区分');
      row[column] = res.data[i].division_delivery_type_value;

      // 配送または回収日時のフォーマット変換
      column = header.indexOf('配送または回収日時');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleString();
      }

      // 追加連絡先があればtelよりそちらを表示する
      column = header.indexOf('連絡先電話番号');
      const addTel = res.data[i].additional_tel;
      if (addTel) {
        row[column] = addTel;
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
      title: '配送一覧：' + modalConst.TITLE.HAS_ERROR,
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
}
