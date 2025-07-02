import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
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
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import { orderConst } from 'src/app/const/order.const';
import { purchaseOrderConst } from 'src/app/const/purchase-order.const';
import { createFileNameWithDate } from 'src/app/functions/shared-functions';
import { BasicInformation } from 'src/app/models/basic-information';
import { Division } from 'src/app/models/division';
import { Order } from 'src/app/models/order';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { SalesDetail } from 'src/app/models/sales-detail';
import { PurchaseOrder } from 'src/app/models/purchase-order';
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
import { SalesDetailService } from 'src/app/services/sales-detail.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { regExConst } from 'src/app/const/regex.const';
import { PurchaseService } from 'src/app/services/purchase.service';
import { PurchaseDetailService } from 'src/app/services/purchase-detail.service';
import { productConst } from '../../../../const/product.const';

type OrderProduct = Product & Order;

export interface InputData {
  id: string;
  name: string;
  value: string;
}
export interface LastDate {
  yyyymm: number;
  date: number;
}

export interface dammylApiResponse {
  message: string;
  totalItems: number;
  data: SalesDetail[];
}

export interface sales_detail_data {
  product_id: number;
  delivery_real_number: number;
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
  product_name_alias?: string | '';
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef> | undefined;
  constructor(
    private poService: PurchaseOrderService,
    private orderService: OrderService,
    private productService: ProductService,
    private salseDetailService: SalesDetailService,
    private biService: BasicInformationService,
    private divisionService: DivisionService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private purcharseService: PurchaseService,
    private purchaseDetailService: PurchaseDetailService,
    public common: CommonService
  ) {}

  // エラーモーダルのタイトル
  errorModalTitle = '発注書詳細エラー：' + modalConst.TITLE.HAS_ERROR;
  errorDownloadPdfModalTitle =
    '発注書PDFダウンロードエラー：' + modalConst.TITLE.HAS_ERROR;
  errorModalTitleOrderQuantity =
    '発注数量更新エラー：' + modalConst.TITLE.HAS_ERROR;

  // バリデーションエラー
  // 半角数字制限
  numericLimitViolation = {
    message: errorConst.FORM_ERROR.NUMERIC_LIMIT_VIOLATION,
  };
  // 文字数超過
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  //必須項目
  requiredViolation = {
    message: errorConst.FORM_ERROR.REQUIRED_ITEM,
  };

  errorConst = errorConst;

  // 購読を一元管理
  subscription = new Subscription();

  // 発注書
  purchaseOrder!: PurchaseOrder;

  // 発注書ステータス定数
  purchaseOrderConst = purchaseOrderConst;

  // 選択中の発注書ID
  selectedId!: number;

  // 発注書に紐付く発注データ
  orders!: OrderProduct[];

  salsedetail!: SalesDetail[];

  // 発注先で絞り込まれた商品データ
  products!: Product[];

  // 発注書の仕入先
  supplierId!: number;
  supplier_name!: string;

  // 発注書PDFファイル名のpreFix
  pdfFileNamePreFix = '発注書';

  // 発注書PDF作成済みフラグ
  isPOPdfCreated = false;

  // 商品登録サジェスト用選択肢
  productSuggests!: SelectOption[];

  // 基本情報
  basicInformation!: BasicInformation;

  // 一覧のパス
  listPagePath = '/purchase-order';

  // 編集ページのパス
  editPagePath!: string;

  // データ取得中フラグ
  // isDuringAcquisition!: boolean;

  // 最終更新者フルネーム
  updaterFullName!: string;

  // 送信済みステータスフラグ
  isSent!: boolean;

  // 発注追加フォーム表示フラグ
  addFormIsOpen = false;

  // 発注編集フォーム表示フラグ
  editFormIsOpen = false;

  // 発注情報更新フラグ
  isUpdatingOrder = false;

  // 編集対象発注
  editTarget!: OrderProduct;

  // ステータス区分
  statusDivisions!: Division[];
  //単位区分
  unitDivisions!: Division[];

  selected_product_data!: Product;
  // ステータス選択肢
  statusDivisionOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  product_order_status!: productOrderingStatus[];
  product_order_status_list!: productOrderingStatus[];

  yesterday!: LastDate;
  sales_detail_lists!: sales_detail_data[];
  sales_detail!: SalesDetail[];

  //単位
  DIVISION_UNIT_CATEGORY_SMALL!: number;
  DIVISION_UNIT_CATEGORY_MEDIUM!: number;
  DIVISION_UNIT_CATEGORY_LARGE!: number;

  // オーダーステータスフォーム初期値：検品前:128
  ORDER_STATUS_INITIAL_DIVISION_ID!: string;

  // 商品追加フォームで商品番号で指定するか商品名で指定するかのフラグ
  selectionTypeIsProductId = true;

  division?: any[];

  product_division: any[] = [];
  PRODUCT_DIVISION_CUSTOM_CODE = productConst.PRODUCT_DIVISION.CODE.CUSTOM;
  PRODUCT_DIVISION_CUSTOM!: any;
  isDivisionCustom: boolean = false;

  // 商品追加用リアクティブフォームとバリデーションの設定
  addForm = this.fb.group({
    product_id: ['', [Validators.required]],
    product_name: ['', [Validators.required]],
    order_quantity: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    cost_price: [
      Validators.required,
      Validators.pattern(regExConst.NUMERIC_REG_EX),
    ],
    remarks: ['', Validators.maxLength(255)],
    shelf_value: '',
    product_data: [''],
    supplier_name: [''],
    product_name_alias: [''],
    total_cost_price: [0, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    order_status_division_id: [''], // 128 → 「検品前」を初期値で入れる
  });

  /**
   * 選択チェックボックス用
   */
  id_list: string[] = [];
  deleteList = new FormGroup({
    idlist: new FormControl('', [Validators.required]),
  });
  button_status: boolean = true;

  purcharse_min!: any[];

  editForm = this.fb.group({
    product_id: ['', [Validators.required]],
    purchase_order_id: ['', [Validators.required]],
    order_quantity: ['', [Validators.required]],
    cost_price: ['', [Validators.required]],
    product_name_alias: [''],
    product_division_code: [''],
  });

  get addFormCtrls() {
    return this.addForm.controls;
  }

  get editFormCtrls() {
    return this.editForm.controls;
  }

  ngOnInit(): void {
    // 一括ボタン
    this.button_status = true;

    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];

    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);

    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        this.errorModalTitle,
        'パラメータがエラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    this.selectedId = Number(selectedId);

    // 取得したパスパラメータをメンバへセット
    this.editPagePath = this.listPagePath + '/edit/' + selectedId;

    // 発注書PDFファイル名PreFixに発注書番号を設定
    this.pdfFileNamePreFix += '_' + selectedId;

    this.initialization(Number(selectedId));
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

  getLastdate(): LastDate {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let y = yesterday.getFullYear();
    let m = ('00' + (yesterday.getMonth() + 1)).slice(-2);
    let d = ('00' + yesterday.getDate()).slice(-2);
    let ym = y + m;
    let result = {
      yyyymm: parseInt(ym),
      date: parseInt(d),
    };
    return result;
  }

  getId(event: Event): any {
    this.button_status = false;

    let targ_value = (event.target as HTMLInputElement).value;
    let targ_name = (event.target as HTMLInputElement).id;
    let split_id = targ_name.split('__');
    let changeItemData = {
      id: split_id[1],
      name: split_id[0],
      value: targ_value,
    };

    // チェックボックスのチェック状態を確認
    if ((event.target as HTMLInputElement).checked) {
      // チェックが入っている場合、新しい値を追加
      this.id_list.push(targ_value);
    } else {
      // チェックが外れた場合、既に存在する値を削除
      this.id_list = this.id_list.filter((item) => item !== targ_value);
    }

    // 重複を解消（既に削除しているので不要ですが、念のため）
    let unique = Array.from(new Set(this.id_list));

    // 数値としてソート
    unique.sort((a, b) => Number(a) - Number(b));

    this.id_list = unique;

    // FormControlの値を更新
    this.deleteList.get('idlist')?.setValue(this.id_list.join(','));
    console.log(this.deleteList.get('idlist')?.value);

    /** 削除・解除ボタン*/
    if (this.id_list.length === 0) {
      this.button_status = true;
    }

    return targ_value;
  }
  /**
   * 客注追加・編集時に商品IDと商品名で入力を切り替える
   */
  setSelectionType() {
    // フラグ反転
    this.selectionTypeIsProductId = !this.selectionTypeIsProductId;
    // フォームクリア
    this.addForm.reset({ product_id: '', order_quantity: '' });
  }

  private initialization(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    // まず発注書データを取得して、前日の日付を計算する
    this.subscription.add(
      this.poService.find(selectedId).subscribe((poResponse) => {
        this.purchaseOrder = poResponse.data[0];

        // 発注日の前日を計算
        const prevDate = this.getPreviousDateFromPurchaseOrder();

        // 発注書データと発注書表示に必要な付帯データ・紐付く発注商品を取得
        this.subscription.add(
          forkJoin([
            of(poResponse), // 既に取得した発注書データを再利用
            this.orderService.getAll({ purchase_order_id: selectedId }),
            this.biService.find(),
            this.divisionService.getAll({
              name: divisionConst.PURCHASE_ORDER_STATUS,
            }),
            this.salseDetailService.getAll({
              sale_month_and_year: prevDate.yyyymm,
              sale_day: prevDate.date,
            }),
            this.divisionService.getAll({
              name: divisionConst.UNIT,
            }),
            this.divisionService.getAsSelectOptions({
              name: divisionConst.DIVISION_UNIT_CATEGORY,
            }),
            this.divisionService.getAsSelectOptions({
              name: divisionConst.ORDER_STATUS,
            }),
            this.divisionService.getAsSelectOptions(),
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
                const basicInformation = res[2].data[0];
                const statusDivisions = res[3].data;
                const salesDetails = res[4].data;
                const unitDetails = res[5].data;
                const divisionUnitCategory = res[6];
                const divisionOrderStatus = res[7];
                const division = res[8];

                let order_id_list = this.getIdLists(orders, 'product_id');
                console.log(orders);
                this.productService
                  .getAll({ id: order_id_list })
                  .subscribe((res) => {
                    this.purcharse_min = res.data;
                  });
                return this.productService
                  .getAll({
                    supplier_id: purchaseOrder.supplier_id,
                    id: order_id_list,
                  })
                  .pipe(
                    map((productResponse) => ({
                      purchaseOrder,
                      orders,
                      basicInformation,
                      statusDivisions,
                      products: productResponse.data,
                      sales_detail: salesDetails,
                      unit_division: unitDetails,
                      divisionUnitCategory: divisionUnitCategory,
                      divisionOrderStatus: divisionOrderStatus,
                      division: division,
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
                  modalConst.BODY.HAS_ERROR,
                  this.listPagePath
                );
                return;
              }

              // レスポンスが配列であり配列の要素が5つあるか
              if (Array.isArray(res) && res.length !== 6) {
                this.handleError(
                  400,
                  this.errorModalTitle,
                  modalConst.BODY.HAS_ERROR
                );
                return;
              }
              // 発注書データ
              this.purchaseOrder = res.purchaseOrder;

              // 最終更新者のフルネーム作成
              this.updaterFullName =
                this.purchaseOrder.employee_updated_last_name +
                ' ' +
                this.purchaseOrder.employee_updated_first_name;

              // 発注書PDF作成フラグの操作
              if (
                this.purchaseOrder.pdf !== null &&
                this.purchaseOrder.pdf !== undefined &&
                this.purchaseOrder.pdf !== '' &&
                this.purchaseOrder.pdf !== 'undefined'
              ) {
                this.isPOPdfCreated = true;
              }
              // 紐付く発注データ
              const orders = res.orders;
              this.products = res.products;

              // 発注データへ商品情報をマージ
              const ordersProducts = this.mergeOrdersAndProducts(
                this.products,
                orders
              );

              // 棚番号でソート
              const sortedOrders = this.sortByShelfNumber(ordersProducts);
              // プロパティへセット
              this.orders = sortedOrders;
              console.log(this.orders);
              // product_name_alias空白文字の場合トリムする
              this.orders.forEach((value, index) => {
                let alias_string = value.product_name_alias
                  ? value.product_name_alias.trim()
                  : '';
                if (alias_string === '') {
                  this.orders[index].product_name_alias = alias_string;
                }
              });

              // 数量・単価計算のためにordering_target_barcodeの情報を集める
              // 表示されるオーダーと同じインクリメントでアクセスできるようにする
              this.product_order_status = this.orderingTargetData(this.orders);
              console.log(this.product_order_status);
              //単位名称
              this.unitDivisions = res.unit_division;

              this.product_order_status_list = sortedOrders.map(
                (val, index) => {
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
                        Number(value.ordering_quantity) *
                        Number(val.order_quantity);
                    }
                  });
                  return results;
                }
              );

              // 基本情報データ
              this.basicInformation = res.basicInformation;
              // 仕入先idで絞り込んだ商品選択肢
              this.productSuggests = this.products.map((v) => {
                const suggests = {
                  value: v.id,
                  text: v.name,
                };
                return suggests;
              });

              const salsedetails = res.sales_detail;

              /**前日の売り上げ数 */
              this.sales_detail_lists = ordersProducts.map((val, index) => {
                console.log('sales_detail_lists');
                let delivery_number;
                salsedetails.forEach((value) => {
                  if (String(value.product_cd) === String(val.product_id)) {
                    delivery_number = value.delivery_real_number;
                  }
                });
                if (delivery_number === undefined) {
                  delivery_number = 0;
                }
                return {
                  product_id: val.product_id,
                  delivery_real_number: delivery_number,
                };
              });

              // 送信済みフラグ
              this.isSent = false;

              this.statusDivisions = res.statusDivisions;

              if (
                this.purchaseOrder.purchase_order_status_code ===
                purchaseOrderConst.STATUS_CODE.SENT
              ) {
                this.isSent = true;
              }

              //各種初期定数をセット
              this.setUnitCategoryConst(
                res.divisionUnitCategory[divisionConst.DIVISION_UNIT_CATEGORY]
              );

              this.setOrderStatusConst(
                res.divisionOrderStatus[divisionConst.ORDER_STATUS]
              );

              // 対象フォームへ初期値設定
              this.addFormCtrls.order_status_division_id.setValue(
                this.ORDER_STATUS_INITIAL_DIVISION_ID
              );
              this.product_division = res.division[divisionConst.PRODUCT];
              console.log(this.PRODUCT_DIVISION_CUSTOM);
              this.PRODUCT_DIVISION_CUSTOM = this.product_division.find(
                (x) => x.code === this.PRODUCT_DIVISION_CUSTOM_CODE
              );
              console.log(this.PRODUCT_DIVISION_CUSTOM);
            })
        );
      })
    );
  }

  handleSelectedProductData(addForm: FormGroup, product: Product) {
    if (product === undefined) {
      return;
    }
    addForm.controls['product_id'].patchValue(product.id);
    addForm.controls['product_name'].patchValue(product.name);
    // 選択時初期は１個としておく
    addForm.controls['order_quantity'].patchValue(1);
    addForm.controls['cost_price'].patchValue(
      this._getSupplierCostPrice(product)
    );
    let total_cost_price =
      Number(addForm.controls['cost_price'].value) *
      Number(addForm.controls['order_quantity'].value);
    addForm.controls['total_cost_price'].patchValue(total_cost_price);

    if (product.product_division_id === this.PRODUCT_DIVISION_CUSTOM.value) {
      this.isDivisionCustom = true;
    } else {
      this.isDivisionCustom = false;
    }
  }

  getIdLists(data: any, key: string): string | '' {
    let id_lists: any = [];
    let datalist = data.find((x: any) => {
      if (x) {
        id_lists.push(x[key]);
      }
    });
    let dataliststring = id_lists.join(', ');
    return dataliststring;
  }

  setOrderStatusConst(division: any) {
    this.ORDER_STATUS_INITIAL_DIVISION_ID = String(
      this.getDivisionIdFromCode(
        division,
        orderConst.STATUS_CODE.BEFORE_INSPECTION
      )
    );
  }
  setUnitCategoryConst(division: any) {
    //最小発注単位のセット
    this.DIVISION_UNIT_CATEGORY_SMALL = Number(
      this.getDivisionIdFromCode(
        division,
        purchaseOrderConst.UNIT_CATEGORY.CODE.SMALL
      )
    );
    this.DIVISION_UNIT_CATEGORY_MEDIUM = Number(
      this.getDivisionIdFromCode(
        division,
        purchaseOrderConst.UNIT_CATEGORY.CODE.MEDIUM
      )
    );
    this.DIVISION_UNIT_CATEGORY_LARGE = Number(
      this.getDivisionIdFromCode(
        division,
        purchaseOrderConst.UNIT_CATEGORY.CODE.LARGE
      )
    );
  }

  getDivisionIdFromCode(division: any, code: number) {
    let data = division.find((x: any) => {
      return x.code === code;
    });
    return data.value;
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

  getCostPrice() {
    console.log(this.addFormCtrls);
  }

  getFormValue(form: AbstractControl, controlName: string) {
    const formControl = this.getFormControlTypeValue(form, controlName);
    if (formControl.value === null) {
      return '';
    }
    if (controlName === 'supplier_name') {
      return formControl.value;
    }
    if (controlName === 'product_name') {
      return formControl.value;
    }
    const retNumber = Number(formControl.value);
    return retNumber;
  }
  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
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
          console.log('b_barcode');
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
          console.log('c_barcode');
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
   * サジェスト用商品名を取得
   * @returns
   */
  getProductSuggestsId(form: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        id: form['product_id'].value,
        supplier_id: this.purchaseOrder.supplier_id,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProductSuggestsName(form: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: form['product_name'].value, //this.fc.product_name.value,
        supplier_id: this.purchaseOrder.supplier_id,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 発注データを取得
   */
  private getOrders(product_list: string | '') {
    // 発注日の前日を計算
    const prevDate = this.getPreviousDateFromPurchaseOrder();

    let param = {};
    if (product_list) {
      param = {
        id: product_list,
        supplier_id: this.purchaseOrder.supplier_id,
      };
    }
    this.subscription.add(
      forkJoin([
        this.orderService.getAll({ purchase_order_id: this.selectedId }),
        this.salseDetailService.getAll({
          sale_month_and_year: prevDate.yyyymm,
          sale_day: prevDate.date,
        }),
        this.divisionService.getAll({
          name: divisionConst.UNIT,
        }),
        this.productService.getAll(param),
      ])
        .pipe(
          finalize(() => (this.isUpdatingOrder = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.title, res.message);
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

          // 紐付く発注データ
          const orders = res[0].data;
          const salsedetails = res[1].data;
          const unitDetails = res[2].data;
          const product = res[3].data;
          // 発注データへ商品情報をマージ
          let products!: any;
          if (product.length > 0) {
            products = product;
          } else {
            products = this.products;
          }
          const ordersProducts = this.mergeOrdersAndProducts(products, orders);

          /**前日の売り上げ数 */
          this.sales_detail_lists = ordersProducts.map((val, index) => {
            console.log('sales_detail_lists');
            let delivery_number;
            salsedetails.forEach((value) => {
              if (value.product_cd === val.product_id) {
                delivery_number = value.delivery_real_number;
              }
            });
            if (delivery_number === undefined) {
              delivery_number = 0;
            }
            return {
              product_id: val.product_id,
              delivery_real_number: delivery_number,
            };
          });

          // 棚番号でソート
          const sortedOrders = this.sortByShelfNumber(ordersProducts);

          // プロパティへセット
          this.orders = sortedOrders;

          // 数量・単価計算のためにordering_target_barcodeの情報を集める
          // 表示されるオーダーと同じインクリメントでアクセスできるようにする
          this.product_order_status = this.orderingTargetData(this.orders);
          //単位名称
          this.unitDivisions = unitDetails;

          this.product_order_status_list = this.orders.map((val, index) => {
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
        })
    );
  }

  /**
   * ステータス変更
   * @param statusConst
   */
  changeStatus(statusConst: string) {
    // 指定されたステータスのみに絞り込み
    const status = this.statusDivisions.find((v) => {
      return v.value === statusConst;
    });

    // 更新データ作成
    const po = {
      order_date: this.purchaseOrder.order_date,
      preferred_delivery_date: this.purchaseOrder.preferred_delivery_date,
      store_id: this.purchaseOrder.store_id,
      supplier_id: this.purchaseOrder.supplier_id,
      order_employee_id: this.purchaseOrder.order_employee_id,
      purchase_order_status_division_id: status !== undefined ? status.id : '',
      remarks: this.purchaseOrder.remarks,
    };

    this.common.loading = true;

    this.subscription.add(
      this.poService
        .update(this.selectedId, po)
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
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          if (status?.value === purchaseOrderConst.STATUS.DRAFT) {
            this.isSent = false;
            this.purchaseOrder.purchase_order_status_division_id = status.id;
          } else if (status?.value === purchaseOrderConst.STATUS.SENT) {
            this.isSent = true;
            this.purchaseOrder.purchase_order_status_division_id = status.id;
          }
        })
    );
  }

  /**
   * 発注データの各レコードから変更ボタンがクリックされた時の処理
   */
  handleClickOrderEditButton() {
    this.editFormIsOpen = false;
    this.orders.map((order) => {
      if (order.id === this.editTarget.id) {
        order.order_quantity = Number(this.editFormCtrls.order_quantity.value);
      }
    });
    const formVal = this.editForm.value;
    const postData = {
      order_quantity: formVal.order_quantity,
      cost_price: formVal.cost_price,
      product_name_alias: formVal.product_name_alias,
      purchase_order_id: formVal.purchase_order_id,
      product_id: formVal.product_id,
    };

    // 発注情報更新開始
    this.isUpdatingOrder = true;
    this.common.loading = true;
    this.subscription.add(
      this.orderService
        .update(this.editTarget.id, postData)
        .pipe(
          finalize(() => {
            this.editTarget = <OrderProduct>{};
            this.common.loading = false;
          }),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const message = `${res.message}\n\n${res.error.message}\n`;
            this.handleError(res.status, res.error.title, message);
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

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);

          let order_id_list = this.getIdLists(this.orders, 'product_id');
          this.getOrders(order_id_list);
        })
    );
  }

  /**
   * product_id からデータ取得
   */
  getSupplierCostPrice(product_id: string | null | undefined): number | '' {
    let pdoructid: number = Number(product_id);
    let targ_index = this.products.findIndex(
      (product) => product.id === pdoructid
    );
    let data = this.products[targ_index];
    let result!: number | '';

    switch (data.ordering_target_barcode) {
      case data.b_barcode:
        result = data.b_supplier_cost_price;
        break;
      case data.c_barcode:
        result = data.c_supplier_cost_price;
        break;
      default:
        result = data.supplier_cost_price;
        break;
    }
    return result;
  }

  /**
   * product_id からデータ取得
   */
  _getSupplierCostPrice(data: Product | null | undefined): number | '' {
    let result: number = 0;
    if (data == null || data == undefined) {
      return 0;
    }
    switch (data.ordering_target_barcode) {
      case data.b_barcode:
        result = data.b_supplier_cost_price;
        break;
      case data.c_barcode:
        result = data.c_supplier_cost_price;
        break;
      default:
        result = data?.supplier_cost_price;
        break;
    }
    return result;
  }
  /**
   * 数量の変更をキャッチ
   * @param orderForm
   */
  handleCahgeQuantityCostPrice(addform: FormGroup) {
    if (!addform.controls['cost_price'].value) {
      addform.controls['total_cost_price'].patchValue(0);
    }
    let total_cost_price =
      Number(addform.controls['cost_price'].value) *
      Number(addform.controls['order_quantity'].value);
    addform.controls['total_cost_price'].patchValue(total_cost_price);
  }
  /**
   * 発注追加ボタンがクリックされた時の処理
   */
  handleClickOrderSaveButton() {
    this.addFormIsOpen = false;
    const formVal = this.addForm.value;
    const postData = {
      purchase_order_id: this.purchaseOrder.id,
      product_id: formVal.product_id,
      product_name: formVal.product_name,
      product_name_alias: formVal.product_name_alias,
      order_quantity: formVal.order_quantity,
      remarks: formVal.remarks,
      order_status_division_id: formVal.order_status_division_id,
      cost_price: formVal.cost_price,
    };
    let order_id_list = this.getIdLists(this.orders, 'product_id');
    order_id_list += ', ' + String(formVal.product_id);

    // 発注情報更新開始
    this.isUpdatingOrder = true;
    this.common.loading = true;

    this.subscription.add(
      this.orderService
        .add(postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.title, res.message);
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

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);

          this.getOrders(order_id_list);
        })
    );
  }

  /**
   * 各レコードで削除ボタンがクリックされた場合の処理
   * @param id 発注ID
   */
  deleteOrder(id: number) {
    // モーダルのタイトル
    const modalTitle = '発注' + modalConst.TITLE.DELETE;
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
            // 更新処理ローディング開始
            this.isUpdatingOrder = true;
            // 削除実行
            this.orderService
              .remove(id)
              .pipe(
                finalize(() => (this.isUpdatingOrder = false)),
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
                let order_id_list = this.getIdLists(this.orders, 'product_id');
                this.getOrders(order_id_list);
              });
          }
        })
    );
  }

  /**
   * 各レコードの編集アイコンがクリックされた時の処理
   * @param order
   */
  editOrder(order: OrderProduct) {
    this.editTarget = order;
    this.editForm.patchValue({
      product_id: String(order.product_id),
      purchase_order_id: String(order.purchase_order_id),
      order_quantity: String(order.order_quantity),
      cost_price: String(order.cost_price),
      product_name_alias: order.product_name_alias,
      product_division_code: order.product_division_code,
    });
    this.editFormIsOpen = true;
  }

  /**
   * 発注の変更がキャンセルされた時の処理
   */
  editOrderCancel() {
    this.editTarget = <OrderProduct>{};
    this.editFormIsOpen = false;
    this.editForm.reset({ order_quantity: '' });
    this.editForm.markAsUntouched();
  }

  /**
   * 発注追加ボタンがクリックされた時の処理
   */
  addOrder() {
    this.addFormIsOpen = true;
    console.log('追加ボタン');
  }

  /**
   * 発注追加がキャンセルされた時の処理
   */
  addOrderCancel() {
    this.addFormIsOpen = false;
    this.addForm.reset({ product_id: '', order_quantity: '' });
    this.addForm.markAsUntouched();
  }

  toInspectionPage() {
    console.log('検品ページへ');
    this.router.navigate([
      `${this.listPagePath}/inspection/${this.selectedId}`,
    ]);
  }

  /**
   * すべてのチェックボックスを選択状態にし、一意でソートされた値でid_listを更新します。
   * フォームの'idlist'フィールドにカンマ区切りのid_listの値を設定します。
   * ボタンの状態を無効にします。
   */
  allSelectItems() {
    // チェックボックスが存在する場合、すべてのチェックボックスを選択状態にする
    this.checkboxes?.forEach((checkbox) => {
      // チェックボックスを選択状態にする
      (checkbox.nativeElement as HTMLInputElement).checked = true;
      // チェックボックスの値をid_listに追加する
      this.id_list.push((checkbox.nativeElement as HTMLInputElement).value);
    });

    // id_listの重複を排除し、一意の値の配列を作成する
    let unique = Array.from(new Set(this.id_list));
    // 一意の値を数値としてソートする
    unique.sort((a, b) => Number(a) - Number(b));
    // ソートされた一意の値の配列をid_listに設定する
    this.id_list = unique;

    // フォームの'idlist'フィールドにid_listをカンマ区切りで設定する
    this.deleteList.get('idlist')?.setValue(this.id_list.join(','));

    // ボタンの状態を無効にする
    this.button_status = false;
  }

  handleClickAllDelete() {
    // 1件の場合deleteOrderを実行し終了
    if (this.id_list.length === 1 && this.id_list[0]) {
      this.deleteOrder(Number(this.id_list[0]));
      return;
    }
    // orderService にてdelete
    // モーダルのタイトル
    const modalTitle = '発注' + modalConst.TITLE.DELETE;
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

    const list: any = this.deleteList.get('idlist')?.value;

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
            // 更新処理ローディング開始
            this.isUpdatingOrder = true;
            // 削除実行
            this.orderService
              .listremove(list)
              .pipe(
                finalize(() => (this.isUpdatingOrder = false)),
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
                let order_id_list = this.getIdLists(this.orders, 'product_id');
                this.getOrders(order_id_list);
                // チェックボックスクリア
                this.reset();
              });
          }
        })
    );
  }
  /**
   * すべてのチェックボックスを未選択状態にし、id_listを更新します。
   * フォームの'idlist'フィールドの値を空にします。
   * ボタンの状態を無効にします。
   */
  reset() {
    // チェックボックスが存在する場合、すべてのチェックボックスを未選択状態にする
    this.checkboxes?.forEach((checkbox) => {
      // チェックボックスを未選択状態にする
      (checkbox.nativeElement as HTMLInputElement).checked = false;
      // チェックボックスの値をid_listに追加する
      this.id_list.push((checkbox.nativeElement as HTMLInputElement).value);
    });

    // id_listを空にする
    this.id_list = [];
    // フォームの'idlist'フィールドの値を空にする
    this.deleteList.get('idlist')?.setValue('');
    // ボタンの状態を無効にする
    this.button_status = false;
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
   * 発注書PDF作成処理
   */
  createPOPdf() {
    this.common.loading = true;
    this.subscription.add(
      this.poService
        .createPdf(this.purchaseOrder.id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          // レスポンスがerrorResponseか?
          if (res instanceof HttpErrorResponse) {
            const title: string = res.error ? res.error.title : 'エラー';
            const message: string = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }
          // レスポンスがnull or undefinedか？
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }
          this.flashMessageService.setFlashMessage(
            res.message,
            'success',
            15000
          );
        })
    );
  }

  /**
   * 発注書PDFダウンロード処理
   */
  getPdf() {
    const url = this.purchaseOrder.pdf; // isPOPdfCreatedで判定してダウンロードボタンを表示しているので、ここでundefinedやNullになることはない
    const filename = createFileNameWithDate(this.pdfFileNamePreFix, 'pdf');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true); // GETメソッドを用いて指定されたURLに対して非同期でリクエスト
    xhr.responseType = 'blob';

    // リクエストが正常に終了したときに実行
    xhr.onload = () => {
      if (xhr.status === 200) {
        // ダウンロード処理
        const blob = new Blob([xhr.response], {
          type: 'application/octet-stream',
        });
        const objectUrl = URL.createObjectURL(blob);
        const aTag = document.createElement('a');
        aTag.href = objectUrl;
        aTag.download = filename;
        aTag.style.display = 'none';
        document.body.appendChild(aTag);
        aTag.click();
        // 削除・解放処理
        document.body.removeChild(aTag);
        URL.revokeObjectURL(objectUrl);
      } else {
        // エラー処理
        this.handleError(
          xhr.status,
          this.errorDownloadPdfModalTitle,
          modalConst.BODY.HAS_ERROR
        );
      }
    };
    xhr.send();

    // ※ ↓ の処理だと、console.log(aTag)ではaタグは意図したように設定されているけど、実際のファイル名には反映されない
    // const aTag = document.createElement('a');
    // aTag.href = this.purchaseOrder.pdf;
    // aTag.download = "test.pdf";
    // aTag.click();
    // console.log(aTag);
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

  getValue(event: Event): any {
    let targ_value = (event.target as HTMLInputElement).value;
    let targ_id = (event.target as HTMLInputElement).id;
    let targ_name = (event.target as HTMLInputElement).name;
    let changeItemData = {
      id: targ_id,
      name: targ_name,
      value: targ_value,
    };
    if (targ_name === 'product_name_alias') {
      this.changeItemName(changeItemData);
    } else {
      this.changeItemData(changeItemData);
    }

    return targ_value;
  }
  changeItemName(changeItem: InputData) {
    this.common.loading = true;
    //フォームデータに整える
    // フォームの値を送信用フォーマットに置き換え
    // フォームの値を送信用フォーマットに置き換え

    let target_id = Number(changeItem.id);
    let target_value = changeItem.value;

    let targ_index = this.orders.findIndex((item) => item.id === target_id);

    let targ_quantity = this.orders[targ_index].order_quantity;

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
            product_name_alias: target_value,
            order_quantity: targ_quantity,
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

              let targ_index = this.product_order_status_list.findIndex(
                (item) => item.order_id === target_id
              );

              this.common.loading = false;
            });
        })
    );
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

              let targ_index = this.product_order_status_list.findIndex(
                (item) => item.order_id === target_id
              );
              let order_all_num: number =
                Number(
                  this.product_order_status_list[targ_index].ordering_quantity
                ) * Number(target_value);
              this.product_order_status_list[
                targ_index
              ].ordering_order_all_num = order_all_num;

              /**
               *
               */

              this.common.loading = false;
            });
        })
    );
  }

  /**
   * 合計金額を計算
   */
  calculateTotalAmount(): number {
    if (!this.orders) {
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
   * 発注日の前日を計算して返す
   */
  getPreviousDateFromPurchaseOrder(): LastDate {
    if (!this.purchaseOrder || !this.purchaseOrder.order_date) {
      return this.getLastdate();
    }
    // 発注日の前日を計算
    let orderDateObj = new Date(this.purchaseOrder.order_date);
    orderDateObj.setDate(orderDateObj.getDate() - 1);
    // 年月と日を取得
    let y = orderDateObj.getFullYear();
    let m = ('00' + (orderDateObj.getMonth() + 1)).slice(-2);
    let d = ('00' + orderDateObj.getDate()).slice(-2);
    let ym = y + m;
    return {
      yyyymm: parseInt(ym),
      date: parseInt(d),
    };
  }

  isCustomProduct(editForm: any): boolean {
    console.log(editForm);
    if (editForm.controls.product_division_code.value == 2) {
      return true;
    }
    return false;
  }
}
