import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  map,
  of,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import { purchaseOrderConst } from 'src/app/const/purchase-order.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { BasicInformation } from 'src/app/models/basic-information';
import { Division } from 'src/app/models/division';
import { Employee } from 'src/app/models/employee';
import { Order } from 'src/app/models/order';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { PurchaseOrder } from 'src/app/models/purchase-order';
import { AuthorService } from 'src/app/services/author.service';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { DivisionService } from 'src/app/services/division.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { regExConst } from 'src/app/const/regex.const';
import { divisionConst } from 'src/app/const/division.const';
import { orderConst } from 'src/app/const/order.const';
import { convertArrayToCsvBlob } from 'src/app/functions/shared-functions';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { CommonService } from 'src/app/services/shared/common.service';

import { Purchase } from 'src/app/models/purchase';
import { PurchaseDetail } from 'src/app/models/purchase-detail';
import { PurchaseService } from 'src/app/services/purchase.service';
import { PurchaseDetailService } from 'src/app/services/purchase-detail.service';
import { DivisionIdService } from 'src/app/services/shared/divisionid.service';

type OrderProduct = Product & Order;

export interface OrderForm extends FormGroup {
  controls: {
    purchase_id: FormControl;
    id: FormControl;
    purchase_order_id: FormControl;
    product_id: FormControl;
    order_quantity: FormControl;
    cost_price: FormControl;
    insert_receiving_quantity: FormControl;
    origin_receiving_quantity: FormControl;
    receiving_quantity: FormControl;
    receiving_date: FormControl;
    receiving_employee_id: FormControl;
    order_status_division_id: FormControl;
    remarks: FormControl;
  };
}

export interface OrdersForm extends FormGroup {
  controls: {
    order: FormArray<OrderForm>;
  };
}

export interface InputData {
  id: string;
  name: string;
  value: string;
}

export interface productOrderingStatus {
  order_id: number;
  product_id: number;
  ordering_barcode: string;
  ordering_gross_profit_rate: number | '';
  ordering_quantity: number | '' /** 入り数　b_,c_,quantity */;
  ordering_order_all_num: number /** バラ総数 b_,c_,quantit * order_quantity*/;
  ordering_selling_price: number | '';
  ordering_supplier_cost_price: number;
  ordering_unit_division_id: number | '';
  ordering_unit_name: string | '';
  ordering_unit_code: number | '';
  ordering_unit_code_name: string | '';
}

@Component({
  selector: 'app-inspection',
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss'],
})
export class InspectionComponent implements OnInit, OnDestroy {
  constructor(
    private authorService: AuthorService,
    private poService: PurchaseOrderService,
    private orderService: OrderService,
    private productService: ProductService,
    private biService: BasicInformationService,
    private divisionService: DivisionService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    public common: CommonService,
    private purchaseService: PurchaseService,
    private purchaseDetailService: PurchaseDetailService,
    private dIService: DivisionIdService
  ) {}

  // ログイン中ユーザー
  author!: Employee;

  // エラーモーダルのタイトル
  errorModalTitle = '発注書詳細エラー：' + modalConst.TITLE.HAS_ERROR;

  errorConst = errorConst;

  errorModalTitleOrderQuantity =
    'オーダー量更新エラー：' + modalConst.TITLE.HAS_ERROR;

  // 購読を一元管理
  private subscription = new Subscription();

  // 発注書
  purchaseOrder!: PurchaseOrder;

  // 発注書ステータス定数
  purchaseOrderConst = purchaseOrderConst;

  // 選択中の発注書ID
  private selectedId!: number;

  // 発注書に紐付く発注データ
  orders!: OrderProduct[];

  // 発注先で絞り込まれた商品データ
  private products!: Product[];

  // 基本情報
  basicInformation!: BasicInformation;

  // 一覧のパス
  listPagePath = '/purchase-order';

  inspectionPath = '/purchase-order/inspection';

  // 発注書詳細のパス
  detailPagePath!: string;

  // 最終更新者フルネーム
  updaterFullName!: string;

  // 送信済みステータスフラグ
  isSent!: boolean;

  // キャンセル時のモーダルタイトル
  cancelModalTitle = '発注検品キャンセル：' + modalConst.TITLE.CANCEL;

  // ステータス選択肢
  statusDivisionOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  purchaseOrderStatusDivisions!: Division[];
  orderStatusDivisions!: Division[];

  // 商品追加用リアクティブフォーム
  ordersForm!: OrdersForm;
  orders_origin_receiving_quantity: number[] = [];

  product_order_status!: productOrderingStatus[];
  product_order_status_list!: productOrderingStatus[];

  //単位区分
  unitDivisions!: Division[];

  //単位
  DIVISION_UNIT_CATEGORY_SMALL!: number;
  DIVISION_UNIT_CATEGORY_MEDIUM!: number;
  DIVISION_UNIT_CATEGORY_LARGE!: number;

  // 納品済み商品
  delivered_orders_products: any[] = [];
  delivered_order_status!: productOrderingStatus[];
  delivered_order_status_list!: productOrderingStatus[];

  // 納品済みフラグ(一件でもあればtrue)
  is_delivered: boolean = false;

  // 同月に納品票があるかどうか
  is_posted: boolean = false;

  // order 納品用データ
  ordersDetail: any[] = [];

  // purchasedetail 同月納品済みデータ
  // 同じ月に納品があった場合に値が入る
  purchaseData: Purchase[] = [];
  purchaseDetails: PurchaseDetail[] = [];

  // セーブできるデータがあるか
  is_save_true: boolean = false;
  /**
   * カスタムバリデータ
   * 入庫数が発注数量を上回る場合エラー
   * @returns ValidatorFn
   */
  receivingQuantityLarge(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const order_quantity = control.get('order_quantity')?.value;
      const receiving_quantity = control.get('receiving_quantity')?.value;
      return order_quantity < receiving_quantity
        ? { receivingQuantityLarge: true }
        : null;
    };
  }

  ngOnInit(): void {
    // ログイン中ユーザー取得処理
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.author = this.authorService.author;
    } else {
      // authorServiceに値がない場合
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          )
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];

    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);

    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }

    this.selectedId = Number(selectedId);

    this.detailPagePath = this.listPagePath + '/detail/' + selectedId;

    this.initialization(Number(selectedId));

    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.detailPagePath);
          }
        })
    );
  }

  /**
   * string型の数字のパスパラメータ・クエリパラメータを受け取り正当性を確認
   * @param parameter
   * @returns
   */
  private isParameterInvalid(parameter: string): boolean {
    if (parameter === null) {
      // パラメータ取得エラー
      return true;
    } else if (isNaN(Number(parameter))) {
      // number型へのキャストエラー
      return true;
    }
    return false;
  }

  /**
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  getMonthFirstDate() {
    let date = new Date();
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).toLocaleDateString();
  }
  getMonthLastDate() {
    let date = new Date();
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).toLocaleDateString();
  }
  /**
   * ページ表示項目の初期化処理
   * @param selectedId
   */
  private initialization(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    // 発注書データと発注書表示に必要な付帯データ・紐付く発注商品を取得
    this.subscription.add(
      forkJoin([
        this.poService.find(selectedId),
        this.orderService.getAll({ purchase_order_id: selectedId }),
        this.biService.find(),
        this.divisionService.getAll(),
        this.purchaseService.getAll({
          //納品票が今月登録されているか。
          purchase_order_id: selectedId,
          from_purchase_date: this.getMonthFirstDate(),
          to_purchase_date: this.getMonthLastDate(),
        }),
        this.purchaseDetailService.getAll({
          //納品票が今月登録されているか。
          purchase_order_id: selectedId,
          from_receiving_date: this.getMonthFirstDate(),
          to_receiving_date: this.getMonthLastDate(),
        }),
      ])
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          switchMap((res) => {
            if (res instanceof HttpErrorResponse) {
              this.common.loading = false;
              return of(res);
            }
            const purchaseOrder = res[0].data[0];
            const orders = res[1].data;
            const productIds = orders.map((order) => order.product_id);
            const basicInformation = res[2].data[0];
            const statusDivisions = res[3].data;
            const purchase = res[4].data;
            const purchaseDetails = res[5].data;
            return this.productService
              .getAll({
                supplier_id: purchaseOrder.supplier_id,
                id: productIds.join(', '),
              })
              .pipe(
                map((productResponse) => ({
                  purchaseOrder,
                  orders,
                  basicInformation,
                  statusDivisions,
                  products: productResponse.data,
                  purchase: purchase,
                  purchaseDetails: purchaseDetails,
                })),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                }),
                finalize(() => (this.common.loading = false))
              );
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error
              ? res.error.title
                ? res.error.title
                : ''
              : 'エラー';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }

          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // レスポンスが配列であり配列の要素が5つあるか
          if (Array.isArray(res) && res.length !== 5) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // 同月入庫票の有無
          if (res.purchase.length > 0) {
            this.is_posted = true;
            this.purchaseData = res.purchase;
            this.purchaseDetails = res.purchaseDetails;
          }
          // 発注書データ
          this.purchaseOrder = res.purchaseOrder;

          // 送信済みフラグ
          this.isSent = false;
          this.purchaseOrderStatusDivisions = res.statusDivisions.filter(
            (divisions) => {
              return divisions.name === divisionConst.PURCHASE_ORDER_STATUS;
            }
          );
          this.orderStatusDivisions = res.statusDivisions.filter(
            (divisions) => {
              return divisions.name === divisionConst.ORDER_STATUS;
            }
          );

          if (
            this.purchaseOrder.purchase_order_status_code ===
            purchaseOrderConst.STATUS_CODE.SENT
          ) {
            this.isSent = true;
          }

          //単位名称
          this.unitDivisions = res.statusDivisions.filter((divisions) => {
            return divisions.name === divisionConst.UNIT;
          });

          // 最終更新者のフルネーム作成
          this.updaterFullName =
            this.purchaseOrder.employee_updated_last_name +
            ' ' +
            this.purchaseOrder.employee_updated_first_name;

          // 基本情報データ
          this.basicInformation = res.basicInformation;

          // 仕入先idで絞り込んだ商品
          this.products = res.products;

          // 紐付く発注データ
          const orders = res.orders;

          // 発注データへ商品情報をマージ
          const ordersProducts = this.mergeOrdersAndProducts(
            this.products,
            orders
          );

          // 発注それぞれのフォームを格納する配列
          const orderForms: OrderForm[] = [];

          ordersProducts.forEach((v, i) => {
            /**
             * purchase_detail 更新のため該当 id を取得
             * 複数あっても同じ月のものは同じIDを持つ
             */
            const detail_data = this.purchaseDetails.find((x) => {
              return x.product_id === v.product_id;
            });
            // 検品数がない場合は初期値として客注の注文数を表示させる
            const receivingQuantity =
              String(v.receiving_quantity) === '' ? 0 : v.receiving_quantity;
            // insert_receiving_quantity は注文数から入庫済みの数量を差し引いた数値

            const insertReceivingQuantity = v.receiving_quantity
              ? v.order_quantity - v.receiving_quantity
              : v.order_quantity;

            // フォームの初期値をセット
            // 納品済みのものはフォームにセットしないい
            if (
              v.order_status_division_id !=
              this.getOrderStatusId(orderConst.STATUS_CODE.INSPECTED)
            ) {
              const orderForm: OrderForm = this.fb.group({
                id: v.id,
                purchase_order_id: v.purchase_order_id,
                purchase_id: detail_data?.purchase_id,
                product_id: v.product_id,
                order_quantity: v.order_quantity,
                cost_price: v.cost_price,
                receiving_quantity: v.order_quantity,
                insert_receiving_quantity: insertReceivingQuantity,
                origin_receiving_quantity: receivingQuantity,
                receiving_date: v.receiving_date,
                receiving_employee_id: v.receiving_employee_id,
                order_status_division_id: v.order_status_division_id,
                remarks: v.remarks,
              });
              orderForms.push(orderForm);
            }
          });

          this.ordersForm = this.fb.group({
            order: this.fb.array(orderForms),
          });

          this.ordersForm.controls.order.controls.forEach((orderForm) => {
            orderForm.addValidators(this.receivingQuantityLarge());
            orderForm.controls.receiving_quantity.addValidators(
              Validators.pattern(regExConst.NUMERIC_REG_EX)
            );
          });
          let in_deliverable_orders_products: any = [];

          let order_status = res.statusDivisions.filter((x) => {
            return x.name === divisionConst.ORDER_STATUS;
          });
          let inspected_division_status = order_status.find((x) => {
            return x.division_code === orderConst.STATUS_CODE.INSPECTED;
          });

          /** 納品済みとそれ以外を分ける */
          for (let i in ordersProducts) {
            if (
              ordersProducts[i].order_status_division_id ===
              inspected_division_status?.id
            ) {
              this.delivered_orders_products.push(ordersProducts[i]);
              this.is_delivered = true;
            } else {
              in_deliverable_orders_products.push(ordersProducts[i]);
            }
          }

          // 棚番号でソート
          const sortedOrders = this.sortByShelfNumber(
            in_deliverable_orders_products
          );

          //ソート済みの列からオリジナルの納品数を取得
          const dummy = sortedOrders.filter((x) => {
            this.orders_origin_receiving_quantity.push(x.receiving_quantity);
          });

          // プロパティへセット
          this.orders = sortedOrders;
          // 入庫後総数の表記 << 合計値を先に記入
          for (let i in this.orders) {
            this.orders[i].receiving_quantity = this.orders[i].order_quantity;
          }

          // オーダーの有無(保存できるデータがあるか)
          if (this.orders.length) {
            this.is_save_true = true;
          }

          // 数量・単価計算のためにordering_target_barcodeの情報を集める
          // 表示されるオーダーと同じインクリメントでアクセスできるようにする
          this.product_order_status = this.orderingTargetData(this.orders);
          this.delivered_order_status = this.orderingTargetData(
            this.delivered_orders_products
          );

          this.product_order_status_list = sortedOrders.map((val, index) => {
            let results!: productOrderingStatus;
            this.product_order_status.forEach((value) => {
              if (
                val.product_id == value.product_id &&
                val.id == value.order_id
              ) {
                results = value;
                results['ordering_unit_name'] = this.getUnitName(
                  value.ordering_unit_division_id
                );
                results['ordering_unit_code_name'] = this.getUnitName(
                  value['ordering_unit_code']
                );
                results['ordering_order_all_num'] =
                  Number(value.ordering_quantity) * Number(val.order_quantity);
              }
            });
            return results;
          });
          this.delivered_order_status_list = this.delivered_orders_products.map(
            (val, index) => {
              let results!: productOrderingStatus;
              this.delivered_order_status.forEach((value) => {
                if (
                  val.product_id == value.product_id &&
                  val.id == value.order_id
                ) {
                  results = value;
                  results['ordering_unit_name'] = this.getUnitName(
                    value.ordering_unit_division_id
                  );
                  results['ordering_unit_code_name'] = this.getUnitName(
                    value['ordering_unit_code']
                  );
                  results['ordering_order_all_num'] =
                    Number(value.ordering_quantity) *
                    Number(val.order_quantity);
                }
              });
              return results;
            }
          );

          // 定数初期値設定
          // dIService statusDivisions
          this.DIVISION_UNIT_CATEGORY_SMALL = this.dIService.getDivisionid(
            res.statusDivisions,
            divisionConst.DIVISION_UNIT_CATEGORY,
            purchaseOrderConst.UNIT_CATEGORY.CODE.SMALL
          );
          this.DIVISION_UNIT_CATEGORY_MEDIUM = this.dIService.getDivisionid(
            res.statusDivisions,
            divisionConst.DIVISION_UNIT_CATEGORY,
            purchaseOrderConst.UNIT_CATEGORY.CODE.MEDIUM
          );
          this.DIVISION_UNIT_CATEGORY_LARGE = this.dIService.getDivisionid(
            res.statusDivisions,
            divisionConst.DIVISION_UNIT_CATEGORY,
            purchaseOrderConst.UNIT_CATEGORY.CODE.LARGE
          );
        })
    );
  }

  getUnitName(unit_id: any): string | '' {
    let unit_name = '';
    this.unitDivisions.map((val, index) => {
      if (val.id == unit_id) {
        unit_name = val.value;
      }
    });
    return unit_name;
  }
  /**
   *
   * @param orders
   * create  barcode   * b_barcode   * c_barcode
   *
   */
  orderingTargetData(orders: OrderProduct[]): productOrderingStatus[] {
    let target_barcode: productOrderingStatus[] = [];
    let result: productOrderingStatus;
    orders.forEach((order) => {
      switch (order.ordering_target_barcode) {
        case order.b_barcode:
          result = {
            order_id: order.id,
            product_id: order.product_id,
            ordering_gross_profit_rate: order.b_gross_profit_rate,
            ordering_barcode: order.b_barcode,
            ordering_quantity: order.b_quantity,
            ordering_order_all_num: 0,
            ordering_selling_price: order.b_selling_price,
            ordering_supplier_cost_price: order.b_supplier_cost_price,
            ordering_unit_division_id: order.b_unit_division_id,
            ordering_unit_name: '',
            ordering_unit_code: this.DIVISION_UNIT_CATEGORY_MEDIUM,
            ordering_unit_code_name: '',
          };
          break;
        case order.c_barcode:
          result = {
            order_id: order.id,
            product_id: order.product_id,
            ordering_gross_profit_rate: order.c_gross_profit_rate,
            ordering_barcode: order.c_barcode,
            ordering_quantity: order.c_quantity,
            ordering_order_all_num: 0,
            ordering_selling_price: order.c_selling_price,
            ordering_supplier_cost_price: order.c_supplier_cost_price,
            ordering_unit_division_id: order.c_unit_division_id,
            ordering_unit_name: '',
            ordering_unit_code: this.DIVISION_UNIT_CATEGORY_LARGE,
            ordering_unit_code_name: '',
          };
          break;
        default:
          result = {
            order_id: order.id,
            product_id: order.product_id,
            ordering_gross_profit_rate: order.gross_profit_rate,
            ordering_barcode: order.barcode,
            ordering_quantity: order.quantity,
            ordering_order_all_num: 0,
            ordering_selling_price: order.selling_price,
            ordering_supplier_cost_price: order.supplier_cost_price,
            ordering_unit_division_id: order.unit_division_id,
            ordering_unit_name: '',
            ordering_unit_code: this.DIVISION_UNIT_CATEGORY_SMALL,
            ordering_unit_code_name: '',
          };
          break;
      }
      target_barcode.push(result);
    });

    return target_barcode;
  }

  /**
   * 第1引数のオブジェクトへ第2引数オブジェクトをマージしたOrderProductの配列を返す
   *
   * @param products
   * @param orders
   * @returns orderProduct: OrderProduct[]
   */
  private mergeOrdersAndProducts(products: Product[], orders: Order[]) {
    let ordersProducts: OrderProduct[] = [];
    orders.forEach((order) => {
      products.forEach((product) => {
        if (order.product_id === product.id) {
          ordersProducts.push({ ...product, ...order });
        }
      });
    });
    return ordersProducts;
  }

  /**
   * 棚番号+棚列番号でソートした OrderProduct[] を返す
   * @param orderProduct 発注と商品をマージしたOrderProductの配列
   * @returns OrderProduct[]
   */
  private sortByShelfNumber(orderProduct: OrderProduct[]): OrderProduct[] {
    const sortedOrders = orderProduct.sort((a, b) => {
      if (
        a.division_shelf_value &&
        b.division_shelf_col_value &&
        a.division_shelf_col_value &&
        b.division_shelf_col_value
      ) {
        return a.division_shelf_value + a.division_shelf_col_value >
          a.division_shelf_value + b.division_shelf_col_value
          ? 1
          : -1;
      } else {
        return a.product_id > b.product_id ? 1 : -1;
      }
    });
    return sortedOrders;
  }

  /**
   * 文字列をDateへ変換
   * @param date
   * @returns Date
   */
  dateFormatter(date: string) {
    return new Date(date).toLocaleDateString();
  }

  /**
   * 保存ボタンクリック時の処理
   */
  bulkUpdate() {
    // ローディング開始
    this.common.loading = true;
    // 検品したデータの中身をチェックしながら送信用データとして追加していく配列
    const orders: Order[] = [];

    const deliveries: Order[] = [];

    let statusDivisionId: any = undefined;
    let receivingQuantity: any = undefined;

    // delivery

    // 検品データを生成する
    this.ordersForm.controls.order.controls.forEach((v) => {
      console.log(v);
      // 入庫がない場合全数欠品にする
      if (
        v.controls.receiving_quantity.value === null ||
        v.controls.receiving_quantity.value === undefined ||
        v.controls.receiving_quantity.value === '' ||
        v.controls.receiving_quantity.value === 0
      ) {
        // ステータスを検品前にする
        statusDivisionId = this.getOrderStatusId(
          orderConst.STATUS_CODE.BEFORE_INSPECTION
        );
        receivingQuantity = 0;
      }

      // 発注数より入庫数が多い場合（バリデーションしているのでここは通らないが念の為処理を追加）
      else if (
        v.controls.order_quantity.value < v.controls.receiving_quantity.value
      ) {
        // ステータスを検品前にする
        statusDivisionId = this.getOrderStatusId(
          orderConst.STATUS_CODE.BEFORE_INSPECTION
        );
        receivingQuantity = 0;
      }

      // 検品数が全数ではない場合
      else if (
        v.controls.order_quantity.value > v.controls.receiving_quantity.value
      ) {
        // ステータスを'一部検品済み・一部納品済み'にする
        statusDivisionId = this.getOrderStatusId(
          orderConst.STATUS_CODE.SHORTAGE_OUT_OF_STOCK
        );
        // 検品数を保持する
        receivingQuantity = v.controls.receiving_quantity.value;
      } else {
        // ステータスを検品済・納品済みにする
        statusDivisionId = this.getOrderStatusId(
          orderConst.STATUS_CODE.INSPECTED
        );
        // 検品数を保持する
        receivingQuantity = v.controls.receiving_quantity.value;
      }

      const order: Order = {
        id: v.controls.id.value,
        purchase_order_id: v.controls.purchase_order_id.value,
        product_id: v.controls.product_id.value,
        order_quantity: v.controls.order_quantity.value,
        cost_price: v.controls.cost_price.value,
        receiving_quantity: receivingQuantity,
        receiving_date: new Date().toLocaleString(),
        receiving_employee_id: this.author.id,
        order_status_division_id: statusDivisionId,
        remarks: v.controls.remarks.value,
      };
      orders.push(order);

      /** ステータスが 検品前以外の場合 に追加
       * 当月追加分は 更新にあたる　purchase_idが必須になる
       */
      if (
        statusDivisionId !=
        this.getOrderStatusId(orderConst.STATUS_CODE.BEFORE_INSPECTION)
      ) {
        const delivery: any = {
          purchase_order_id: v.controls.purchase_order_id.value,
          product_id: v.controls.product_id.value,
          purchase_id: v.controls.purchase_id.value,
          order_quantity: v.controls.order_quantity.value,
          order_price: v.controls.cost_price.value,
          receiving_quantity: v.controls.insert_receiving_quantity.value,
          receiving_date: new Date().toLocaleString(),
          receiving_employee_id: this.author.id,
          order_status_division_id: statusDivisionId,
          remarks: v.controls.remarks.value,
        };
        deliveries.push(delivery);
      }
    });

    //値なしの場合
    if (!orders.length) {
      this.common.loading = false;
      return;
    }
    // Blobに変換bulkadd
    const blob = convertArrayToCsvBlob(orders);

    /** 通常データの保存 */
    this.orderService
      .bulkAdd(blob)
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

        // 入庫テーブルへの格納処理
        if (this.is_posted === true) {
          this.common.loading = true;
          // 当月すでに入庫あり（追加入庫）
          //PurchaseDetailのみ追加
          const deliveries_blob = convertArrayToCsvBlob(deliveries);
          this.purchaseDetailService
            .bulkAdd(deliveries_blob)
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
              window.location.reload();
            });
        } else {
          this.common.loading = true;
          // 当月初入庫(入庫票も発行)
          // Purchase PurchaseDetail 追加
          const { id, ...pOrder } = Object.assign({}, this.purchaseOrder);
          // Purchase  order と一括登録
          const Purchase: any = Object.assign(pOrder, {
            purchase_order_id: this.purchaseOrder.id,
            purchase_date: new Date().toLocaleString(),
            purchase_detail: deliveries,
          });

          this.purchaseService
            .add(Purchase)
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

              window.location.reload();
            });
        }
      });
  }

  /**
   * 引数のステータスコードからステータス区分のidを取得して返す
   * @param statusCode
   * @returns ステータスコードから取得されたIDか空文字を返す。
   */
  private getOrderStatusId(statusCode: number): number | '' {
    const statusDivision = this.orderStatusDivisions.find((x) => {
      return x.division_code === statusCode;
    });

    if (statusDivision) {
      return statusDivision.id;
    } else {
      return '';
    }
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
              .remove(this.selectedId)
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
                this.router.navigateByUrl(this.listPagePath);
              });
          }
        })
    );
  }

  /**
   * キャンセルボタンクリック時の処理
   * @returns void
   */
  handleClickCancel(): void {
    this.modalService.setModal(
      this.cancelModalTitle,
      modalConst.BODY.CANCEL,
      'warning',
      modalConst.BUTTON_TITLE.EXECUTION,
      modalConst.BUTTON_TITLE.CANCEL
    );
  }
  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param error
   */
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath?: string
  ) {
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  updateReceivingQuantity(event: Event, order_id: number) {
    let targ_value = (event.target as HTMLInputElement).value;
    let targ_form = this.ordersForm.controls.order.controls.find((x) => {
      return x.controls.id.value === order_id;
    });
    /** 変更のない初期データはorigin_receiving_quantityに保管してある*/
    let total_num =
      Number(targ_form?.controls.origin_receiving_quantity.value) +
      Number(targ_value);

    targ_form?.controls.receiving_quantity.patchValue(Number(total_num));
    const t = this.orders.find((x, i) => {
      if (x.id === order_id) {
        x.receiving_quantity = Number(total_num);
      }
    });
  }

  getValue(event: Event): any {
    let targ_value = (event.target as HTMLInputElement).value;
    let targ_id = (event.target as HTMLInputElement).id;
    let targ_name = (event.target as HTMLInputElement).name;
    let changeItemData = {
      id: targ_id,
      name: targ_name,
      value: targ_value,
    };
    if (targ_name == 'order_quantity') {
      this.changeOrderData(changeItemData);
    } else if (targ_name == 'cost_price') {
      this.changeCostrData(changeItemData);
    }

    return targ_value;
  }
  changeOrderData(changeItem: InputData) {
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
            this.handleError(
              res.status,
              this.errorModalTitleOrderQuantity,
              res.message
            );
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
                this.handleError(
                  res.status,
                  this.errorModalTitleOrderQuantity,
                  res.error.message
                );
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
  changeCostrData(changeItem: InputData) {
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
            this.handleError(
              res.status,
              this.errorModalTitleOrderQuantity,
              res.message
            );
            return;
          }
          // 発注書データ
          let order = res.data[0];

          const po = {
            cost_price: target_value,
            order_quantity: order.order_quantity,
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
                this.handleError(
                  res.status,
                  this.errorModalTitleOrderQuantity,
                  res.error.message
                );
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
   * 合計金額を計算
   */
  calculateTotalAmount(): number {
    if (!this.orders || !this.product_order_status_list) {
      return 0;
    }

    let total = 0;
    this.orders.forEach((order, i) => {
      if (this.product_order_status_list[i]) {
        total += Number(order.cost_price) * order.order_quantity;
      }
    });

    return total;
  }

  /**
   * 検品済み商品の合計金額を計算
   */
  calculateDeliveredTotalAmount(): number {
    if (!this.delivered_orders_products || !this.delivered_order_status_list) {
      return 0;
    }

    let total = 0;
    this.delivered_orders_products.forEach((order, i) => {
      if (this.delivered_order_status_list[i]) {
        total += Number(order.cost_price) * order.order_quantity;
      }
    });

    return total;
  }
}
