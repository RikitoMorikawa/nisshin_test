import {
  Component,
  OnDestroy,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  of,
  Subscription,
  take,
  Subject,
} from 'rxjs';
import {
  TableWithPaginationEvent,
  //  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { TableWithPaginationParams } from 'src/app/components/organisms/purchase-detail-org/table/table.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  ApiResponseIsInvalid,
  isParameterInvalid,
} from 'src/app/functions/shared-functions';

import { Purchase } from 'src/app/models/purchase';
import {
  PurchaseDetail,
  PurchaseDetailApiResponse,
} from 'src/app/models/purchase-detail';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PurchaseService } from 'src/app/services/purchase.service';
import { PurchaseDetailService } from 'src/app/services/purchase-detail.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { ProductService } from 'src/app/services/product.service';
import { DivisionService } from 'src/app/services/division.service';

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};

@Component({
  selector: 'app-slip-detail',
  templateUrl: './slip-detail.component.html',
  styleUrls: ['./slip-detail.component.scss'],
})
export class SlipDetailComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param route
   * @param router
   * @param modalService
   * @param repairService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private purchaseService: PurchaseService,
    private purchaseDetailService: PurchaseDetailService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService,
    private productService: ProductService,
    private divisionService: DivisionService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;
  salesPurchaseId!: number;

  // 初期値のパス
  id = this.route.snapshot.params['id'];
  topPagePath = '/setting';
  listPagePath = `${this.topPagePath}/accounts-payable-aggregate/payment-slip`;
  slipListPagePath = this.listPagePath + '/' + this.id;

  // エラーモーダルのタイトル
  errorModalTitle = '支払伝票詳細：' + modalConst.TITLE.HAS_ERROR;

  // 表示用商品オブジェクト
  purchase!: Purchase; //{ [key: string]: string | number };

  // 値引き・返品フラグ
  isDiscount: boolean = false;
  tortal_cost: number = 0;

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi(false);
  }

  // ページネーション ダミー用
  //meals: string[] = [];

  // ページネーションの状態
  _pages = {
    page: 1,
    itemsPerPage: 50,
    sort: {},
  } as TableWithPaginationEvent;

  //page = 1;
  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi(false);
  }

  // TODO 削除予定
  // pageLimits: SelectOption[] = [
  //   { value: 10, text: '1ページに10レコード表示' },
  //   { value: 25, text: '1ページに25レコード表示' },
  // ];
  // // TODO 削除予定
  // frmPageLimit = new FormControl(this.pageLimits[0].value, {
  //   updateOn: 'change',
  // });

  data: PurchaseDetail[] = [];
  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  @Output() pageChange = new EventEmitter<TableWithPaginationEvent>();
  // _params: TableWithPaginationParams = { total: 0, data: [] };
  counts = {
    start: 0,
    end: 0,
  };

  tableNameMapping: Mapping<PurchaseDetail>[] = [
    { name: 'id', name_jp: '自コード' },
    { name: 'product_name', name_jp: 'JAN' },
    { name: 'product_name_alias', name_jp: '商品名' },
    { name: 'product_id', name_jp: '販売数量' },
    { name: 'order_quantity', name_jp: '数量' },
    { name: 'order_price', name_jp: '単位' },
    { name: 'receiving_date', name_jp: '規定在庫' },
    { name: 'receiving_quantity', name_jp: 'ケース入数' },
    { name: 'receiving_employee_id', name_jp: '単価' },
    { name: 'order_status_division_id', name_jp: '金額' },
    { name: 'supplier_sales_tax_division_value', name_jp: '仕入先消費税区分' },
  ];

  ngOnInit(): void {
    console.log('slip-detail');
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          ) // キャンセルモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    // 取得したパスパラメータをメンバへセット
    this.callApi(true);
    //console.log(this._pages);
  }

  /**
   * 画面上のAPI呼出
   * @param id
   */
  private callApi(initFg: boolean) {
    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.params['purchase_id'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);

    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);
    this.salesPurchaseId = this.route.snapshot.params['purchase_id'];
    if (initFg) {
      this.getPurchase(this.salesPurchaseId);
    }
    this.getPurchaseDetail();
  }

  /**
   * idで指定した1件の支払データを取得
   * @param id
   */
  getPurchase(purchase_id: number) {
    this.common.loading = true;
    this.subscription.add(
      this.purchaseService
        .find(purchase_id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.purchase = res.data[0];
        })
    );
  }

  /**
   * 税区分情報を空で設定し、
   * 初期表示のテーブルの表示を統一する
   * @param detailData
   */
  private initializeEmptyTaxInfo(
    detailData: PurchaseDetail[]
  ): PurchaseDetail[] {
    return detailData.map((item) => {
      item.supplier_sales_tax_division_value = '';
      return item;
    });
  }

  private getPurchaseDetail() {
    this.common.loading = true;
    this.tortal_cost = 0;
    this.isDiscount = false;
    this.purchaseDetailService
      .getAll(this.createApiParams())
      .pipe(
        catchError(
          this.purchaseDetailService.handleErrorModal<PurchaseDetailApiResponse>()
        )
      )
      .subscribe((res) => {
        //const params = this.createTableParams<PurchaseDetail>(
        //  res,
        //  this.tableNameMapping,
        //  this.modifiedTableBody
        //);

        res.data.forEach((item) => {
          if (item.order_price && item.order_quantity) {
            let total = Number(item.order_price) * Number(item.order_quantity);
            this.tortal_cost += total;
          }
          if (item.is_discount === 1) {
            this.isDiscount = true;
          }
        });

        // 基本データをセット
        this.data = this.initializeEmptyTaxInfo(res.data);
        const totalItems = res.totalItems;

        // 不要かも
        //this._params = { total: res.totalItems, data: res.data };
        // this.updateCounts();

        //console.log(res.totalItems);
        //console.log(this.data);

        // データが0件の場合は早期表示
        if (this.data.length === 0) {
          this.tableParams.next({ total: totalItems, data: this.data });
          this.common.loading = false;
          return;
        }

        const productIds = this.data
          .map((item) => item.product_id)
          .filter(Boolean)
          .join(',');

        if (!productIds) {
          // 商品IDがない場合も早期表示
          this.tableParams.next({ total: totalItems, data: this.data });
          this.common.loading = false;
          return;
        }

        // 税区分情報の取得を開始
        this.productService.getAll({ id: productIds }).subscribe({
          next: (productRes) => {
            // 商品ID -> 消費税区分ID のマッピング
            const taxDivisionMap: { [key: number]: number } = {};
            productRes.data.forEach((product) => {
              if (product && product.id) {
                taxDivisionMap[product.id] =
                  product.supplier_sales_tax_division_id;
              }
            });

            // 消費税区分情報の取得
            this.divisionService
              .getAsSelectOptions({ name: '仕入先消費税区分' })
              .subscribe({
                next: (divisions) => {
                  const taxDivisions = divisions['仕入先消費税区分'] || [];

                  // 明細データに消費税区分情報を追加
                  this.data.forEach((item) => {
                    const taxDivisionId = taxDivisionMap[item.product_id];
                    if (taxDivisionId) {
                      const division = taxDivisions.find(
                        (d) => d.value == taxDivisionId
                      );
                      item.supplier_sales_tax_division_id = taxDivisionId;
                      item.supplier_sales_tax_division_value = division
                        ? division.text
                        : '';
                    }
                  });

                  // すべての情報が揃った状態でテーブルを表示
                  this.tableParams.next({
                    total: totalItems,
                    data: this.data,
                  });
                  this.common.loading = false;
                },
                error: (err) => {
                  console.error('消費税区分の取得に失敗しました', err);
                  this.tableParams.next({
                    total: totalItems,
                    data: this.data,
                  });
                  this.common.loading = false;
                },
              });
          },
          error: (err) => {
            console.error('商品情報の取得に失敗しました', err);
            this.tableParams.next({
              total: totalItems,
              data: this.data,
            });
            this.common.loading = false;
          },
        });
      });
  }

  /**
   * APIコール用のパラメータを生成する。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams() {
    // ソート列の物理名を取得
    const column = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;
    //console.log(this._pages);

    // APIコール用のパラメータを生成して返却
    return {
      ...this._filter,
      purchase_id: this.selectedId,
      limit: this._pages.itemsPerPage,
      offset: (this._pages.page - 1) * this._pages.itemsPerPage,
      sort: column ? `${column}:${this._pages.sort.order}` : '',
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト。
   * @param mappings APIの項目名とテーブルのヘッダ名のマッピングオブジェクト。
   * @param modFn APIレスポンスのレコードをテーブルボディへ格納する際の変換を行う関数。
   * @returns 生成された`TableWithPaginationParams`オブジェクト。
   */
  private createTableParams<T>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );
    // 生成した TableParams を返却
    return { total: res.totalItems, header, body };
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: PurchaseDetail) {
    return (mapping: Mapping<PurchaseDetail>) => {
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      if (record[mapping.name] === undefined) {
        return '';
      }

      // 商品IDならリンクに修正
      if (mapping.name === 'product_name') {
        return {
          href: `/master/product/detail/${String(record.product_id)}`,
          text: record.product_name,
        };
      }
      return record[mapping.name];
    };
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '支払伝票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントが破棄される時に実行
   */
  ngOnDestroy(): void {
    // 一元管理した購読を全て解除
    this.subscription.unsubscribe();
  }

  /**
   * 消費税区分は詳細画面でのみ表示し、
   * 追加・編集画面では表示しない
   */
  shouldShowTaxColumn(): boolean {
    const currentUrl = this.router.url;
    return !currentUrl.includes('/edit') && !currentUrl.includes('/add');
  }

  /**
   * 現在表示されているページを更新し、親コンポーネントへイベントを通知する。
   * @param page 次に表示したいページ番号
   */
  // updatePage(page: number) {
  //   this.page = page;

  //   this._pages = {
  //     page: this.page,
  //     itemsPerPage: this._pages.itemsPerPage,
  //     sort: this._pages.sort,
  //   };
  //   //this.pageChange.emit({
  //   //  page: this.page,
  //   //  itemsPerPage: this._pages.itemsPerPage,
  //   //  sort: this._pages.sort,
  //   //});
  //   //console.log();
  //   //this.createApiParams();
  //   this.getPurchaseDetail();
  // }

  /**
   * 件数表示用オブジェクトを更新する。
   */
  // private updateCounts() {
  //   const start = (this.page - 1) * this._pages.itemsPerPage + 1;
  //   this.counts.start = start < this._params.total ? start : this._params.total;
  //   const end = start + this._pages.itemsPerPage - 1;
  //   this.counts.end = end < this._params.total ? end : this._params.total;
  // }

  // TODO 削除予定
  // setLimit(event: any): void {
  //   const limit = event.target.value;
  //   const params = {
  //     currentPage: 1,
  //     itemsPerPage: limit,
  //   };
  //   //this.pagerConfig.currentPage = 1;
  //   //this.pagerConfig.itemsPerPage = limit;
  //   this._pages.itemsPerPage = limit;
  //   this.getPurchaseDetail();
  //   //this.sender.emit(params);
  // }
}
