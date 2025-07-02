import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  Observable,
  of,
  Subscription,
  take,
  tap,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { customerOrderReceptionSlipConst } from 'src/app/const/customer-order-reception-slip.const';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  ApiResponseIsInvalid,
  convertToJpDate,
  download,
  phoneNumberFormatter,
  postalCodeFormatter,
} from 'src/app/functions/shared-functions';
import { BasicInformation } from 'src/app/models/basic-information';
import { CustomerOrder } from 'src/app/models/customer-order';
import {
  CustomerOrderReceptionSlip,
  CustomerOrderReceptionSlipApiResponse,
} from 'src/app/models/customer-order-reception-slip';
import { Division } from 'src/app/models/division';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { CustomerOrderReceptionSlipService } from 'src/app/services/customer-order-reception-slip.service';
import { CustomerOrderService } from 'src/app/services/customer-order.service';
import { DivisionService } from 'src/app/services/division.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CalcSalesPriceIncludingTax } from 'src/app/functions/product-functions';
import { customerOrderConst } from 'src/app/const/customer-order.const';
import { regExConst } from 'src/app/const/regex.const';
import { Order } from 'src/app/models/order';
import { deliveryConst } from 'src/app/const/delivery.const';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { formatDate } from '@angular/common';
import { AuthorService } from 'src/app/services/author.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { Employee } from 'src/app/models/employee';
import { DeliveryService } from 'src/app/services/delivery.service';
import { Delivery } from 'src/app/models/delivery';

type ProductCustomerOrder = Product & CustomerOrder;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private corsService: CustomerOrderReceptionSlipService,
    private coService: CustomerOrderService,
    private biService: BasicInformationService,
    private productService: ProductService,
    private divisionService: DivisionService,
    private flashMessageService: FlashMessageService,
    private modalService: ModalService,
    private errorService: ErrorService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private common: CommonService,
    private deliveryService: DeliveryService
  ) {}

  unit_division_list: any[] = [];

  // ログイン中ユーザー名
  authorName!: string;

  // ログイン中ユーザーロール
  authorRole!: string;

  // 購読を一元管理
  subscription = new Subscription();

  // 一覧のパス
  listPagePath = '/customer-order-reception-slip';

  // 編集ページのパス
  editPagePath!: string;

  // エラー表示用定数定義ファイル読み込み
  errorConst = errorConst;

  // エラーモーダルのタイトル
  errorModalTitle = '客注受付票詳細エラー：' + modalConst.TITLE.HAS_ERROR;

  // 選択中の発注書ID
  selectedId!: number;

  // 得意先ID
  clientId!: number;

  // PDFダウンロード用
  getPdf$!: Observable<any>;

  // PDFファイル名
  pdfFileName = '';

  modalMessage = 'エクスポートを実行するとPDFファイルがダウンロードされます。';

  // 見積書作成済みフラグ
  quotationCreationStatus?: number;

  // 配送依頼区分の配送依頼ありのid
  deliveryIncludedId!: number;

  // 配送依頼ありの客注
  deliveryIncludedCustomOrders!: CustomerOrder[];

  // 最終更新者フルネーム
  updaterFullName!: string;

  // 客注受付票の定数定義
  corsConst = customerOrderReceptionSlipConst;

  coConst = customerOrderConst;

  // 客注受付票
  cors!: CustomerOrderReceptionSlip;

  // barcodeへ渡す値
  barcodeValue!: string;

  // 会社基本情報モデル
  basicInformation!: BasicInformation;

  // ステータス変更ボタンに表示する文言
  statusConst!: string;

  // 商品追加フォームで商品番号で指定するか商品名で指定するかのフラグ
  selectionTypeIsProductId = true;

  // 商品追加フォームで選択中の商品情報
  displayTaxIncludedAmount?: number;
  displayProductName?: string;
  displaySupplierName?: string;
  displayProductUnitPrice?: number;
  displayQuantity?: number;
  // 客注合計金額
  totalAmount?: number;

  // 商品番号を指定した際の商品保持用
  additionalProduct?: Product;

  // 商品データ
  products!: Product[];

  // 商品登録サジェスト用選択肢
  productSuggests!: SelectOption[];

  // 客注受付票へ紐付く客注
  customerOrders!: CustomerOrder[];

  // 客注追加フォーム表示フラグ
  addFormIsOpen = false;

  // 客注編集フォーム表示フラグ
  editFormIsOpen = false;

  // 編集対象
  editTarget!: CustomerOrder;

  // 客注情報更新フラグ
  isUpdatingOrder = false;

  // 見積日
  quotationDate?: string;

  // 見積作成済みフラグ
  isQuotationCreated = false;

  // 見積有効期限
  // quotationExpirationDate?: string;

  // 見積担当者
  quotationEmployeeName?: string;

  // 受付担当者
  receptionEmployeeName?: string;

  // 連結された会社住所
  companyAddress?: string;

  // ハイフン入り会社電話番号
  companyTel?: string;

  // ハイフン入り会社FAX番号
  companyFax?: string;

  // ハイフン入り会社郵便番号
  companyPostalCode?: string;

  // 客注受付伝票ステータス区分
  statusDivisions!: Division[];

  // 客注ステータス区分
  customerOrderDivisions!: Division[];

  // 客注ステータス選択肢
  customerOrderDivisionOptions!: SelectOption[];

  // 客注精算ステータス区分
  settleStatusDivisions!: Division[];

  // 配送依頼区分選択肢
  deliveryDivisionOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  // 配送依頼の配送情報
  deliveries!: Delivery[];

  // 配送希望が含まれているかどうかのフラグ
  isDeliveryRequested = false;

  // ステータス選択肢
  statusDivisionOptions!: SelectOption[];

  // ステータス変更用
  statusForm = this.fb.group({
    status_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
  });

  // 商品追加用リアクティブフォームとバリデーションの設定
  addForm = this.fb.group({
    product_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ], // 商品ID
    supplier_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.required],
    ], // 仕入先ID
    supplier_name: [''], // 仕入先ID
    product_name: ['', [Validators.maxLength(255)]], // 商品名
    product_name_alias: [' ', Validators.maxLength(255)], //別称
    custom_name: ['', [Validators.maxLength(255)]], // 変更した場合の商品名
    quantity: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ], // 数量
    unit: ['', [Validators.required]], // 単位
    remarks: ['', [Validators.maxLength(255)]], // 備考
    cost_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]], //原価
    total_cost_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]], //原価合計
    delivery_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ], // 配送区分
    tax_included_unit_price: [
      // 税込単価
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    tax_included_amount: [
      // 税込金額
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    custom_unit_price: [
      // 変更した場合の税込単価
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    special_order: [''],
    order_status_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
  });

  // 客注編集用リアクティブフォームとバリデーションの設定
  editForm = this.fb.group({
    product_name: ['', [Validators.maxLength(255)]],
    custom_name: ['', [Validators.maxLength(255)]],
    quantity: ['', [Validators.required]],
    unit: ['', [Validators.required]],
    remarks: ['', [Validators.maxLength(255)]],
    cost_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    total_cost_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    status_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    delivery_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    tax_included_unit_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    tax_included_amount: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    custom_unit_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
  });

  // remarks_(num) 表示:true || 非表示:false
  show_remark: boolean = false;

  // 商品区分 特注品判別
  DIVISION_PRODUCT_CODE_SPECIAL_ORDER: number = 2;

  DIVISION_ORDER_STATUS = divisionConst.ORDER_STATUS;
  DIVISION_ORDER_STATUS_CODE = 0;
  status_division_id!: number;

  get statusFormCtrls() {
    return this.statusForm.controls;
  }

  get addFormCtrls() {
    return this.addForm.controls;
  }

  get editFormCtrls() {
    return this.editForm.controls;
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  /**
   * フォームコントロールの値を取得
   *
   * @param form
   * @param controlName
   * @returns
   */

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

  initWithAuthorInfo(author: Employee) {
    this.authorName = author.last_name + ' ' + author.first_name;
    this.authorRole = author.role_name ? author.role_name : '';
  }

  ngOnInit(): void {
    // ログイン中ユーザー取得処理
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.initWithAuthorInfo(this.authorService.author);
      // 選択肢初期化処理
      //this.initOptions();
    } else {
      // authorServiceに値がない場合
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.initWithAuthorInfo(author);
          // 選択肢初期化処理
          //this.initOptions();
        })
      );
    }

    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];
    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);

    // どちらかがエラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        this.errorModalTitle,
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);

    // PDFダウンロード用Observableをセット
    // this.getPdf$ = this.corsService.pdfDownload(this.selectedId).pipe(
    //   catchError((err: HttpErrorResponse) => {
    //     console.log(err)
    //     const title = err.error ? err.error.title : 'エラー';
    //     const message = err.error ? err.error.message : 'エラーが発生しました';
    //     this.handleError(
    //       err.status,
    //       title,
    //       message,
    //       this.listPagePath,
    //     );
    //     return of({} as any);
    //   })
    // );

    // PDFダウンロード用ファイル名をセット
    this.pdfFileName = `見積書_${formatDate(
      new Date(),
      'yyyyMMdd',
      'ja-JP'
    )}.pdf`;

    // 商品追加フォームの値変更を購読
    // 商品変更を購読
    this.subscription.add(
      this.addFormCtrls.product_id.valueChanges.subscribe((id) => {
        this.subscribeAddFormProductIdValueChanges(id);
      })
    );
    // 数量変更を購読
    this.subscription.add(
      this.addFormCtrls.quantity.valueChanges.subscribe((x) => {
        this.calculateAddFormTaxIncludedAmount();
      })
    );

    /*単価変更を購読*/
    this.subscription.add(
      this.addFormCtrls.tax_included_unit_price.valueChanges.subscribe((x) => {
        this.calculateAddFormChangeTaxIncluded();
      })
    );

    /* 原価変更を購読*/
    this.subscription.add(
      this.addFormCtrls.cost_price.valueChanges.subscribe((x) => {
        this.calculateAddFormChangeCostPrice();
      })
    );

    // カスタム名変更を購読
    this.subscription.add(
      this.addFormCtrls.custom_name.valueChanges.subscribe((x) => {
        if (x) {
          this.displayProductName = x;
        } else if (this.additionalProduct) {
          this.displayProductName = this.additionalProduct.name;
        }
      })
    );
    // カスタム単価変更を購読
    this.subscription.add(
      this.addFormCtrls.custom_unit_price.valueChanges.subscribe((x) => {
        this.subscribeAddFormCustomUnitPriceValueChanges(x);
      })
    );
    // 商品編集フォームの値変更を購読

    // 数量変更を購読
    this.subscription.add(
      this.editFormCtrls.quantity.valueChanges.subscribe((x) => {
        this.calculateEditFormTaxIncludedAmount();
      })
    );
    // カスタム名変更を購読
    this.subscription.add(
      this.editFormCtrls.custom_name.valueChanges.subscribe((x) => {
        if (x) {
          this.displayProductName = x;
        } else if (this.editTarget) {
          this.displayProductName = this.editTarget.product_name;
        }
      })
    );

    // カスタム単価変更を購読
    this.subscription.add(
      this.editFormCtrls.custom_unit_price.valueChanges.subscribe((x) => {
        this.subscribeEditFormCustomUnitPriceValueChanges(x);
      })
    );

    // カスタム単価変更を購読
    this.subscription.add(
      this.editFormCtrls.cost_price.valueChanges.subscribe((x) => {
        this.calculateEditFormChangeCostPrice(x);
      })
    );

    // barcodeへ渡す値をセット
    this.barcodeValue =
      this.corsConst.CALLED_NUMBER_PREFIX +
      selectedId.toString().padStart(11, '0');

    // 取得したパスパラメータをメンバへセット
    this.editPagePath = this.listPagePath + '/edit/' + selectedId;

    // 初期化処理実行
    this.initialization(Number(selectedId));
  }

  /**
   * 発注データ作成モーダル処理
   *
   */
  private subscribeToPurchaseOrderModal(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) => {
              // console.log(this.modalService.getModalProperties().title);
              return (
                this.modalService.getModalProperties().title ===
                '発注データ作成'
              );
            }
            // this.modalService.getModalProperties().title ===
            // this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          if (res !== modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            return;
          }
          //this.corsService.toPurchaseOrder(this.selectedId)
          console.log(res);
          console.log('this.selectedId:: ', this.selectedId);
          this.toPurchaseOrder();
          // if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
          //   this.router.navigate([this.detailPagePath], {
          //     queryParams: { clientId: this.clientId },
          //   });
          // }
        })
    );
  }

  private toPurchaseOrder() {
    this.subscription.add(
      this.corsService
        .toPurchaseOrder(this.selectedId)
        .pipe(
          finalize(() => (this.editTarget = <CustomerOrder>{})),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              `${res.message}\n${res.error.message}`
              //this.listPagePath
            );
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

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);

          // this.getCustomerOrders(this.cors.id);
        })
    );
  }

  /**
   * 客注登録時の商品ID変更処理
   *
   * @param id
   */
  private subscribeAddFormProductIdValueChanges(id: string | null) {
    // 商品データ取得
    if (id) {
      this.additionalProduct = this.products.find((p) => p.id === Number(id));
      if (this.additionalProduct) {
        const customName = this.addFormCtrls.custom_name.value;
        const customUnitPrice = Number(
          this.addFormCtrls.custom_unit_price.value
        );
        this.displayProductName = customName
          ? customName
          : this.additionalProduct.name;
        this.displaySupplierName = this.additionalProduct.supplier_name;
        this.displayProductUnitPrice = customUnitPrice
          ? customUnitPrice
          : this.additionalProduct.selling_price;
        this.addFormCtrls.product_name.setValue(this.displayProductName);
        this.addFormCtrls.tax_included_unit_price.setValue(
          String(this.displayProductUnitPrice)
        );
        this.calculateAddFormTaxIncludedAmount();
      }
    } else {
      this.additionalProduct = undefined;
      const customName = this.addFormCtrls.custom_name.value;
      const customUnitPrice = Number(this.addFormCtrls.custom_unit_price.value);
      this.displayProductName = customName ? customName : '';
      this.displayProductUnitPrice = customUnitPrice ? customUnitPrice : 0;
      this.addFormCtrls.product_name.setValue('');
      this.addFormCtrls.supplier_id.setValue('');
      this.addFormCtrls.tax_included_unit_price.setValue('');
      this.calculateAddFormTaxIncludedAmount();
    }
  }

  /**
   * 客注登録時のカスタム単価変更処理
   *
   * @param value
   */
  private subscribeAddFormCustomUnitPriceValueChanges(value: string | null) {
    if (value) {
      this.displayProductUnitPrice = Number(value);
      this.addFormCtrls.tax_included_unit_price.setValue(value);
      this.calculateAddFormTaxIncludedAmount();
    } else if (this.additionalProduct) {
      this.displayProductUnitPrice = this.additionalProduct.selling_price;
      this.addFormCtrls.tax_included_unit_price.setValue(
        String(this.additionalProduct.selling_price)
      );
      this.calculateAddFormTaxIncludedAmount();
    }
  }

  /**
   * 客注追加時の入力変更に伴う金額算出処理
   */
  calculateAddFormTaxIncludedAmount() {
    if (this.addFormCtrls.quantity.value === null) {
      return;
    }

    const quantity = Number(this.addFormCtrls.quantity.value);

    const cost_price = Number(this.addFormCtrls.cost_price.value);
    const total_cost_price = cost_price * quantity;

    const taxIncludedUnitPrice = Number(
      this.addFormCtrls.tax_included_unit_price.value
    );
    const customUnitPrice = Number(this.addFormCtrls.custom_unit_price.value);
    const amount = customUnitPrice
      ? quantity * customUnitPrice
      : quantity * taxIncludedUnitPrice;

    this.addFormCtrls.tax_included_amount.setValue(String(amount));
    this.displayTaxIncludedAmount = amount;
    this.addFormCtrls.total_cost_price.setValue(String(total_cost_price));
  }

  /**
   * 原価変更
   */
  calculateAddFormChangeCostPrice() {
    if (
      this.addFormCtrls.quantity.value === null ||
      this.addFormCtrls.cost_price.value == null
    ) {
      return;
    }
    const quantity = Number(this.addFormCtrls.quantity.value);
    const cost_price = Number(this.addFormCtrls.cost_price.value);
    const total_cost_price = cost_price * quantity;

    // 原価変更
    this.addFormCtrls.total_cost_price.setValue(String(total_cost_price));
    this.addFormCtrls.cost_price.setValue(String(cost_price));
  }
  /**
   * 単価変更
   */
  calculateAddFormChangeTaxIncluded() {
    if (
      this.addFormCtrls.quantity.value === null ||
      this.addFormCtrls.tax_included_unit_price.value == null ||
      this.addFormCtrls.tax_included_unit_price.value == undefined
    ) {
      return;
    }

    const quantity = Number(this.addFormCtrls.quantity.value);
    const taxIncludedUnitPrice = Number(
      this.addFormCtrls.tax_included_unit_price.value
    );

    const customUnitPrice = Number(this.addFormCtrls.custom_unit_price.value);
    const amount = customUnitPrice
      ? quantity * customUnitPrice
      : quantity * taxIncludedUnitPrice;

    this.addFormCtrls.tax_included_amount.setValue(String(amount));
    this.displayTaxIncludedAmount = amount;
    this.displayProductUnitPrice = taxIncludedUnitPrice;
  }
  /**
   * 客注変更時のカスタム単価変更処理
   *
   * @param value
   */
  private subscribeEditFormCustomUnitPriceValueChanges(value: string | null) {
    if (value) {
      this.displayProductUnitPrice = Number(value);
      this.editFormCtrls.tax_included_unit_price.setValue(value);
      this.calculateEditFormTaxIncludedAmount();
    } else if (this.editTarget) {
      this.displayProductUnitPrice = this.editTarget.tax_included_unit_price;
      this.editFormCtrls.tax_included_unit_price.setValue(
        String(this.editTarget.tax_included_unit_price)
      );
      this.calculateEditFormTaxIncludedAmount();
    }
  }

  /**
   * 原価変更
   */
  calculateEditFormChangeCostPrice(value: string | null) {
    if (value == null) {
      return;
    }
    const quantity = Number(this.editFormCtrls.quantity.value);
    const cost_price = Number(this.editFormCtrls.cost_price.value);
    const total_cost_price = cost_price * quantity;
    this.editFormCtrls.total_cost_price.setValue(String(total_cost_price));
    //
    console.log(this.editFormCtrls.total_cost_price);
    console.log(String(total_cost_price));
    console.log('cnange cost price');
  }

  /**
   * 客注変更時の入力変更に伴う金額算出処理
   */
  calculateEditFormTaxIncludedAmount() {
    const quantity = Number(this.editFormCtrls.quantity.value);
    const taxIncludedUnitPrice = Number(
      this.editFormCtrls.tax_included_unit_price.value
    );
    const customUnitPrice = Number(this.editFormCtrls.custom_unit_price.value);
    const cost_price = Number(this.editFormCtrls.cost_price.value);
    const amount = customUnitPrice
      ? quantity * customUnitPrice
      : quantity * taxIncludedUnitPrice;

    const total_cost_price = cost_price * quantity;

    this.editFormCtrls.tax_included_amount.setValue(String(amount));
    this.displayTaxIncludedAmount = amount;
    this.editFormCtrls.total_cost_price.setValue(String(total_cost_price));
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

  /**
   * 文字列をDateへ変換
   * @param date
   * @returns Date
   */
  dateFormatter(date: string | undefined) {
    return date ? new Date(date).toLocaleDateString() : '';
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

  getStatusValue(statusCode: number) {
    // typeof指定のためローカル変数へ格納
    const corsConst = this.corsConst;
    // STATUSを指定するためのキーを引数を利用して取得
    const statusKey = Object.keys(corsConst.STATUS)[
      statusCode
    ] as keyof typeof corsConst.STATUS;
    return corsConst.STATUS[statusKey];
  }

  /**
   * 客注の配列を受け取り、配送の予定があるかどうかを返す
   * @param customerOrders
   * @returns - boolean 配送あり: true 配送なし: false
   */
  isDeliveryRequestedCustomerOrders(customerOrders: CustomerOrder[]) {
    return customerOrders.some(
      (customerOrder) =>
        customerOrder.division_delivery_value ===
        this.corsConst.DELIVERY_DIVISION.VALUE.DELIVERY_INCLUDED
    );
  }

  /**
   * 初回画面表示に必要な情報を取得する
   *
   * @param selectedId
   */
  private initialization(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    this.subscribeToPurchaseOrderModal();

    // 客注受付票データと客注受付票表示に必要な付帯データを取得
    this.subscription.add(
      forkJoin([
        this.corsService.find(selectedId),
        this.coService.getAll({ customer_order_reception_slip_id: selectedId }),
        this.biService.find(),
        this.productService.getAll({ limit: 1 }),
        this.divisionService.getAll(),
        this.divisionService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: this.DIVISION_ORDER_STATUS,
          division_code: this.DIVISION_ORDER_STATUS_CODE,
        }),
        this.deliveryService.getAll({ cors_slip_id: selectedId }),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // エラーレスポンスが返ってきた場合
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              res.message,
              this.listPagePath
            );
            return;
          }

          // レスポンスがnull、 undefinedの場合
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
          if (Array.isArray(res) && res.length !== 8) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          // 配送の予定があるかどうかを確認
          this.deliveries = res[7].data;

          // 客注受付票データ取得エラーを確認
          const customOrderReceptionSlipResInvalid = ApiResponseIsInvalid(
            res[0]
          );
          if (customOrderReceptionSlipResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          // 客注受付票に紐付く客注データ取得エラーを確認
          // ただし、紐付く客注データが0件の場合もあるため0件の場合はエラーにしない
          const customOrderResInvalid =
            res[1].data.length === 0 ? false : ApiResponseIsInvalid(res[1]);
          if (customOrderResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }
          // 基本情報データ取得エラーを確認
          const biResInvalid = ApiResponseIsInvalid(res[2]);
          if (biResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          // 客注受付票を変数へ格納
          const cors = res[0].data[0];

          // ステータス更新フォームへ初期値をセット
          this.statusForm.reset({
            status_division_id: String(cors.status_division_id),
          });

          // 表示用見積日作成
          this.quotationDate = cors.quotation_date
            ? convertToJpDate(cors.quotation_date)
            : ' 年 月 日（見積書作成前）';
          // 表示用見積担当者作成
          this.quotationEmployeeName = cors.quotation_date
            ? cors.employee_quotation_last_name +
              ' ' +
              cors.employee_quotation_first_name
            : '----（見積書作成前）';
          // 表示用見積期限作成
          // this.quotationExpirationDate = cors.quotation_expiration_date
          //   ? convertToJpDate(cors.quotation_expiration_date)
          //   : ' 年 月 日（見積書作成前）';

          // 表示用受付担当者作成
          this.receptionEmployeeName =
            cors.employee_reception_last_name +
            ' ' +
            cors.employee_reception_first_name;

          // 取得した客注受付票データをメンバ変数へセット
          this.cors = cors;

          // 見積書作成済みの場合フラグをtrueにする
          if (
            cors.quotation_pdf_path !== null &&
            cors.quotation_pdf_path !== undefined &&
            cors.quotation_pdf_path !== '' &&
            cors.quotation_pdf_path !== 'undefined'
          ) {
            this.isQuotationCreated = true;
          }

          // 最終更新者のフルネーム作成
          this.updaterFullName =
            this.cors.employee_updated_last_name +
            ' ' +
            this.cors.employee_updated_first_name;

          // 基本情報データ
          this.basicInformation = res[2].data[0];
          // 基本情報の表示形式変更
          this.companyAddress =
            this.basicInformation.province +
            this.basicInformation.locality +
            this.basicInformation.street_address +
            this.basicInformation.other_address;
          this.companyTel = phoneNumberFormatter(
            String(this.basicInformation.tel)
          );
          this.companyFax = phoneNumberFormatter(
            String(this.basicInformation.fax)
          );
          this.companyPostalCode = postalCodeFormatter(
            String(this.basicInformation.postal_code)
          );

          // 商品選択肢
          this.productSuggests = res[3].data.map((v) => {
            const suggests = {
              value: v.id,
              text: v.name,
            };
            return suggests;
          });

          // 商品
          this.products = res[3].data;

          // 紐付く客注データ
          this.customerOrders = res[1].data;
          // 紐付く客注があれば配送の予定を確認
          if (this.customerOrders.length > 0) {
            this.isDeliveryRequested = this.isDeliveryRequestedCustomerOrders(
              this.customerOrders
            );
          }

          // 客注合計金額を取得
          this.totalAmount = this.cors.total_amount_including_tax;

          // 客注受付票ステータス取得
          this.statusDivisions = res[4].data.filter((x) => {
            return (
              x.name === divisionConst.CUSTOMER_ORDER_RECEPTION_SLIP_STATUS
            );
          });
          // コード順に並び替え
          const sortedDivisions = this.statusDivisions.sort(
            (a, b) => a.division_code - b.division_code
          );
          this.statusDivisionOptions = sortedDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });

          // 客注ステータス取得
          this.customerOrderDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.CUSTOMER_ORDER_STATUS;
          });
          const coDivisionOptions = this.customerOrderDivisions.filter((x) => {
            return x.value !== this.coConst.STATUS.PRODUCT_INSPECTION_FINISHED;
          });
          this.customerOrderDivisionOptions = coDivisionOptions.map((x) => {
            return { value: x.id, text: x.value };
          });

          // 配送区分
          const deliveryDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.DELIVERY_REQUEST;
          });
          const deliveryDivisionOptions = deliveryDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          this.deliveryDivisionOptions = [
            ...this.deliveryDivisionOptions,
            ...deliveryDivisionOptions,
          ];
          const deliveryIncludedOption = deliveryDivisionOptions.find((x) => {
            return (
              x.text ===
              customerOrderReceptionSlipConst.DELIVERY_DIVISION.VALUE
                .DELIVERY_INCLUDED
            );
          });
          if (deliveryIncludedOption) {
            this.deliveryIncludedId = deliveryIncludedOption.value;
          }
          this.deliveryIncludedCustomOrders = this.customerOrders.filter(
            (x) => {
              return x.delivery_division_id === this.deliveryIncludedId;
            }
          );

          // 客注精算ステータス区分
          this.settleStatusDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.SETTLE_STATUS;
          });

          // 単位区分取得
          this.unit_division_list = res[5][divisionConst.UNIT];

          // 発注書初期ステータス
          this.status_division_id = Number(
            res[6][this.DIVISION_ORDER_STATUS][0].value
          );

          console.log(this.cors);
        })
    );
  }

  /**
   * 客注受付票のステータスを更新する
   *
   * @param statusCode
   * @returns
   */
  statusUpdate() {
    // フォームの値を取得
    const formVal = this.statusForm.value;

    const selectedStatus = this.statusDivisions.find((x) => {
      return x.id === Number(formVal.status_division_id);
    });

    let today;

    if (
      selectedStatus &&
      selectedStatus.division_code ===
        this.corsConst.STATUS_CODE.QUOTATION_CREATED
    ) {
      today = new Date().toLocaleDateString();
    }

    // ローディング開始
    this.common.loading = true;

    // ポスト用データ作成
    const postData = {
      customer_type_division_id: this.cors.customer_type_division_id,
      client_id: this.cors.client_id,
      member_id: this.cors.member_id,
      store_id: this.cors.store_id,
      last_name: this.cors.last_name,
      first_name: this.cors.first_name,
      last_name_kana: this.cors.last_name_kana,
      first_name_kana: this.cors.first_name_kana,
      tel: this.cors.tel,
      status_division_id: formVal.status_division_id,
      total_amount_including_tax: this.totalAmount,
      shipping_address: this.cors.shipping_address,
      settle_status_division_id: this.cors.settle_status_division_id,
      incident_division_id: this.cors.incident_division_id,
      remarks_1: this.cors.remarks_1,
      remarks_2: this.cors.remarks_2,
      reception_date: this.cors.reception_date,
      reception_employee_id: this.cors.reception_employee_id,
      quotation_date: today ? today : this.cors.quotation_date,
      quotation_pdf_path: this.cors.quotation_pdf_path,
      quotation_employee_id: this.cors.quotation_employee_id,
      quotation_expiration_date: this.cors.quotation_expiration_date,
    };

    this.subscription.add(
      this.corsService
        .update(this.cors.id, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              res.message,
              this.listPagePath
            );
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.common.loading = false;
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          // 表示用データを更新する
          this.subscription.add(this.updateSlipInfo().subscribe());

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        })
    );
  }

  /**
   * 選択中の受付票idで受付票と紐付く客注を取得するObservableを返却する
   * @returns Observable CustomerOrderReceptionSlipService.find(), CustomerOrderService.getAll()
   */
  updateSlipInfo(): Observable<any> {
    this.common.loading = true;
    // Return the Observable directly
    return forkJoin([
      this.corsService.find(this.selectedId),
      this.coService.getAll({
        customer_order_reception_slip_id: this.selectedId,
      }),
    ]).pipe(
      catchError((error: HttpErrorResponse) => {
        return of(error);
      }),
      finalize(() => (this.common.loading = false)),
      tap((res) => {
        if (res instanceof HttpErrorResponse) {
          const errorTitle: string = res.error
            ? res.error.title
            : 'エラーが発生しました。';
          this.handleError(
            res.status,
            errorTitle,
            res.message,
            this.listPagePath
          );
          return;
        }

        if (res === null || res === undefined) {
          this.handleError(
            400,
            this.errorModalTitle,
            modalConst.BODY.HAS_ERROR,
            this.listPagePath
          );
          return;
        }

        this.cors = res[0].data[0];
        this.statusForm.reset({
          status_division_id: String(this.cors.status_division_id),
        });
        this.customerOrders = res[1].data;
        // 紐付く客注があれば配送の予定を確認
        if (this.customerOrders.length > 0) {
          this.isDeliveryRequested = this.isDeliveryRequestedCustomerOrders(
            this.customerOrders
          );
        }
        this.common.loading = false;
      })
    );
  }

  /**
   * 客注受付票を更新する
   *
   * @param postData
   */
  updateCors(postData: { [key: string]: string | number }) {
    // ローディング開始
    this.isUpdatingOrder = true;
    this.subscription.add(
      this.corsService
        .update(this.cors.id, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.isUpdatingOrder = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              res.message,
              this.listPagePath
            );
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.isUpdatingOrder = false;
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          this.isUpdatingOrder = false;

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        })
    );
  }

  /**
   * 客注受付票IDを指定して紐付く客注を取得する
   *
   * @param corsId
   */
  getCustomerOrders(corsId: number) {
    // ローディング開始
    this.isUpdatingOrder = true;

    // 客注受付票に紐付く客注商品データを取得
    this.subscription.add(
      this.coService
        .getAll({ customer_order_reception_slip_id: corsId })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.isUpdatingOrder = true;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              res.message,
              this.listPagePath
            );
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
          // 客注受付票に紐付く客注データ取得エラーを確認
          const customOrderResInvalid =
            res.data.length === 0 ? false : ApiResponseIsInvalid(res);
          if (customOrderResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          // 取得した客注をメンバ変数へセット
          this.customerOrders = res.data;
          console.log(this.cors);
          console.log(this.customerOrders);
          // 紐付く客注があれば配送の予定を確認
          if (this.customerOrders.length > 0) {
            this.isDeliveryRequested = this.isDeliveryRequestedCustomerOrders(
              this.customerOrders
            );
          }

          // 配送ありのレコードのみ抽出
          this.deliveryIncludedCustomOrders = this.customerOrders.filter(
            (x) => {
              return x.delivery_division_id === this.deliveryIncludedId;
            }
          );

          // 客注合計金額を取得
          this.totalAmount = res.data.reduce(
            (sum, item) => sum + item.tax_included_amount,
            0
          );

          const postData = {
            customer_type_division_id: this.cors.customer_type_division_id,
            client_id: this.cors.client_id,
            member_id: this.cors.member_id,
            store_id: this.cors.store_id,
            last_name: this.cors.last_name,
            first_name: this.cors.first_name ? this.cors.first_name : '',
            last_name_kana: this.cors.last_name_kana
              ? this.cors.last_name_kana
              : '',
            first_name_kana: this.cors.first_name_kana
              ? this.cors.first_name_kana
              : '',
            tel: this.cors.tel,
            status_division_id: this.cors.status_division_id,
            total_amount_including_tax: this.totalAmount,
            shipping_address: this.cors.shipping_address,
            settle_status_division_id: this.cors.settle_status_division_id,
            incident_division_id: this.cors.incident_division_id,
            remarks_1: this.cors.remarks_1,
            remarks_2: this.cors.remarks_2,
            reception_date: this.cors.reception_date,
            reception_employee_id: this.cors.reception_employee_id,
            quotation_date: this.cors.quotation_date,
            quotation_pdf_path: this.cors.quotation_pdf_path,
            quotation_employee_id: this.cors.quotation_employee_id,
            quotation_expiration_date: this.cors.quotation_expiration_date,
          };

          this.updateCors(postData);
        })
    );
  }

  /**
   * 客注追加・編集時に商品IDと商品名で入力を切り替える
   */
  setSelectionType() {
    // フラグ反転
    this.selectionTypeIsProductId = !this.selectionTypeIsProductId;
    // フォームクリア
    this.addForm.reset({ product_id: '', quantity: '' });
  }

  /**
   * 客注データの各レコードから変更ボタンがクリックされた時の処理
   */
  handleClickOrderEditButton() {
    this.editFormIsOpen = false;
    //const status = this.editTarget.status_division_id;
    const settleStatus = this.editTarget.settle_status_division_id;
    const formVal = this.editForm.value;
    const postData = {
      customer_order_reception_slip_id:
        this.editTarget.customer_order_reception_slip_id,
      product_id: this.editTarget.product_id,
      supplier_id: this.editTarget.supplier_id,
      product_name: formVal.custom_name
        ? formVal.custom_name
        : formVal.product_name,
      quantity: formVal.quantity,
      tax_included_unit_price: formVal.custom_unit_price
        ? formVal.custom_unit_price
        : formVal.tax_included_unit_price,
      tax_included_amount: formVal.tax_included_amount,
      status_division_id: formVal.status_division_id,
      delivery_division_id: formVal.delivery_division_id,
      settle_status_division_id: settleStatus,
      unit: formVal.unit,
      remarks: formVal.remarks,
      cost_price: Number(formVal.cost_price),
      total_cost_price: Number(formVal.total_cost_price),
    };

    this.customerOrders.map((co) => {
      if (co.id === this.editTarget.id) {
        co.product_name = formVal.custom_name
          ? formVal.custom_name
          : this.editTarget.product_name;
        co.quantity = Number(formVal.quantity);
        co.tax_included_unit_price = formVal.custom_unit_price
          ? Number(formVal.custom_unit_price)
          : Number(formVal.tax_included_unit_price);
        co.tax_included_amount = Number(formVal.tax_included_amount);
      }
    });

    // 客注情報更新開始
    this.isUpdatingOrder = true;
    this.subscription.add(
      this.coService
        .update(this.editTarget.id, postData)
        .pipe(
          finalize(() => (this.editTarget = <CustomerOrder>{})),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              res.message,
              this.listPagePath
            );
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

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);

          this.getCustomerOrders(this.cors.id);
        })
    );
  }

  /**
   * 追加ボタンがクリックされた時の処理
   */
  handleClickOrderSaveButton() {
    this.addFormIsOpen = false;
    const status = this.customerOrderDivisions.find((x) => {
      return x.value === this.coConst.STATUS.BEFORE_PLACING_AN_ORDER;
    });
    const settleStatus = this.settleStatusDivisions.find((x) => {
      return (
        x.value === this.coConst.SETTLE_STATUS_DIVISION.VALUE.BEFORE_PAYMENT
      );
    });
    const formVal = this.addForm.value;
    const postData = {
      customer_order_reception_slip_id: this.cors.id,
      product_id: formVal.product_id,
      supplier_id: Number(formVal.supplier_id),
      product_name: formVal.custom_name
        ? formVal.custom_name
        : formVal.product_name,
      quantity: formVal.quantity,
      tax_included_unit_price: formVal.custom_unit_price
        ? formVal.custom_unit_price
        : formVal.tax_included_unit_price,
      tax_included_amount: formVal.tax_included_amount,
      status_division_id: status?.id,
      delivery_division_id: formVal.delivery_division_id,
      settle_status_division_id: settleStatus?.id,
      unit: formVal.unit,
      remarks: formVal.remarks,
      cost_price: Number(formVal.cost_price),
      total_cost_price: Number(formVal.total_cost_price),
    };

    // 客注情報更新開始
    this.isUpdatingOrder = true;
    this.subscription.add(
      this.coService
        .add(postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.isUpdatingOrder = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(
              res.status,
              errorTitle,
              res.message,
              this.listPagePath
            );
            return;
          }

          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            console.log('null or undefined');
            this.isUpdatingOrder = false;
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          this.isUpdatingOrder = false;

          this.addForm.reset();

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);

          this.getCustomerOrders(this.cors.id);
        })
    );
  }

  /**
   * 客注の変更がキャンセルされた時の処理
   */
  editCustomerOrderCancel() {
    this.editTarget = <ProductCustomerOrder>{};
    this.editFormIsOpen = false;
    this.editForm.reset({
      product_name: '',
      custom_name: '',
      quantity: '',
      unit: '',
      remarks: '',
      tax_included_unit_price: '',
      tax_included_amount: '',
      custom_unit_price: '',
    });
    this.displaySupplierName = '';
    this.displayProductName = '';
    this.displayProductUnitPrice = 0;
    this.displayTaxIncludedAmount = 0;
  }

  /**
   * 客注の追加ボタンがクリックされた時の処理
   */
  addCustomerOrder() {
    this.addFormIsOpen = true;
    this._addFormInit();
  }

  /**
   * 商品追加フォーム初期化
   */
  private _addFormInit(): void {
    const deliveryIncludedOption = this.deliveryDivisionOptions.find((x) => {
      return x.text === this.corsConst.DELIVERY_DIVISION.VALUE.NO_DELIVERY;
    });

    let no_delivery = '';
    if (deliveryIncludedOption !== undefined) {
      no_delivery = String(deliveryIncludedOption.value);
    }
    this.addForm.patchValue({
      delivery_division_id: no_delivery,
    });
  }

  /**
   * 客注追加がキャンセルされた時の処理
   */
  addCustomerOrderCancel() {
    this.addFormIsOpen = false;
    this.addForm.reset({
      product_id: '',
      supplier_id: '',
      product_name: '',
      custom_name: '',
      quantity: '',
      unit: '',
      remarks: '',
      tax_included_unit_price: '',
      tax_included_amount: '',
      custom_unit_price: '',
    });
    this.displaySupplierName = '';
    this.displayProductName = '';
    this.displayProductUnitPrice = 0;
    this.displayTaxIncludedAmount = 0;
  }

  /**
   * 各レコードで削除ボタンがクリックされた場合の処理
   * @param id 客注ID
   */
  deleteOrder(id: number) {
    // 配送業者に引き渡し済みの場合はエラーモーダルを表示
    if (
      this.cors.division_status_code >
      this.corsConst.STATUS_CODE.CONTACTED_CUSTOMER
    ) {
      this.handleError(
        422,
        customerOrderReceptionSlipConst.ERROR.CANNOT_BE_DELETED,
        customerOrderReceptionSlipConst.ERROR
          .ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE
      );
      return;
    }

    // モーダルのタイトル
    const modalTitle = '客注' + modalConst.TITLE.DELETE;
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
            (_) => {
              console.log(this.modalService.getModalProperties().title);
              return true;
            } //this.modalService.getModalProperties().title === modalTitle
          ) // 削除のモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // データ更新前に客注から削除
            this.customerOrders = this.customerOrders.filter(
              (x) => x.id !== id
            );
            // 更新処理ローディング開始
            this.isUpdatingOrder = true;
            // 削除実行
            this.coService
              .remove(id)
              .pipe(
                catchError((error: HttpErrorResponse) => {
                  this.isUpdatingOrder = false;
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  const errorTitle: string = res.error
                    ? res.error.title
                    : 'エラーが発生しました。';
                  this.handleError(
                    res.status,
                    errorTitle,
                    res.message,
                    this.listPagePath
                  );
                  return;
                }
                const flashMessagePurpose: FlashMessagePurpose = 'success';
                this.flashMessageService.setFlashMessage(
                  res.message,
                  flashMessagePurpose,
                  15000
                );
                this.getCustomerOrders(this.cors.id);
              });
          }
        })
    );
  }

  /**
   * 各レコードの編集アイコンがクリックされた時の処理
   * @param order
   */
  editOrder(customerOrder: CustomerOrder) {
    this.editTarget = customerOrder;
    this.editForm.patchValue({
      cost_price: String(
        customerOrder.cost_price ? customerOrder.cost_price : 0
      ),
      total_cost_price: String(customerOrder.total_cost_price),
      custom_name: '',
      custom_unit_price: '',
      product_name: customerOrder.product_name,
      quantity: String(customerOrder.quantity),
      tax_included_unit_price: String(customerOrder.tax_included_unit_price),
      tax_included_amount: String(customerOrder.tax_included_amount),
      delivery_division_id: String(customerOrder.delivery_division_id),
      status_division_id: String(customerOrder.status_division_id),
      unit: customerOrder.unit,
      remarks: customerOrder.remarks,
    });

    //this.displaySupplierName = customerOrder.supplier_name;
    this.displaySupplierName = customerOrder.supplier_name;
    this.displayProductName = customerOrder.product_name;
    this.displayProductUnitPrice = customerOrder.tax_included_unit_price;
    this.displayTaxIncludedAmount = customerOrder.tax_included_amount;
    this.editFormIsOpen = true;
  }

  /**
   * 配送登録ページへ売上タイプと受付票idをクエリパラメータとして渡して遷移させる
   */
  toRegisterDeliverySchedulePage() {
    const salesType = deliveryConst.SALES_TYPE.find((x) => {
      return x.name === deliveryConst.CUSTOMER_ORDER;
    });
    this.router.navigate(['delivery/add'], {
      queryParams: { salesType: salesType?.id, slipId: this.selectedId },
    });
  }

  reCreateQuotation() {
    this.createQuotation();
    this.isQuotationCreated = false; // 再作成のためフラグをfalseにする
  }

  createQuotation() {
    // ローディング開始
    this.common.loading = true;

    this.subscription.add(
      this.corsService
        .createPdf(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title: string = res.error ? res.error.title : 'エラー';
            const message: string = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.common.loading = false;
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        })
    );
  }

  /**
   * 見積書PDFをダウンロードする
   */
  getPdf() {
    download(this.cors.quotation_pdf_path, this.pdfFileName);
  }

  /**
   * 発注データ作成
   */
  handleClickToPurchaseOrder() {
    console.log('toPurchaseOrder');
    // 入力があった場合はモーダルを表示
    const purpose: ModalPurpose = 'warning';
    this.modalService.setModal(
      '発注データ作成',
      '発注データ作成しますか？',
      purpose,
      modalConst.BUTTON_TITLE.EXECUTION,
      modalConst.BUTTON_TITLE.CANCEL
    );

    //download(this.cors.quotation_pdf_path, this.pdfFileName);
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
    console.log('エラー');
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProductIdSuggests(form: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        id: form['product_id'].value, //this.fc.product_name.value,
      }),
      idField: 'id',
      nameField: 'id',
    };
  }

  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProductSuggests(form: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: form['product_name'].value, //this.fc.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  handleSelectedProductData(product: Product) {
    if (product === undefined) {
      return;
    }

    this.addForm.controls['tax_included_unit_price'].patchValue(
      String(product.selling_price)
    );
    // 原価（仕入れ値を取得）
    // (最小単位)
    this.addForm.controls['cost_price'].patchValue(
      String(product.supplier_cost_price)
    );

    this.addForm.controls['supplier_id'].patchValue(
      String(product.supplier_id)
    );
    this.addForm.controls['product_name'].patchValue(product.name);

    //取得した product の最小単位(バラ)を、フォームの単位に自動差し込み
    let division_code = this.unit_division_list.find((x) => {
      return x.code === product.division_unit_code;
    });
    // append unit.value
    this.addForm.controls['unit'].patchValue(division_code.text);

    // preview
    this.displaySupplierName = product.supplier_name;
    this.displayProductName = product.name;
    this.displayProductUnitPrice = product.selling_price;
  }

  /**
   * コンポーネントの破棄時に購読を解除
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * product_id からデータ取得
   */
  getSupplierCostPrice(data: Product | null | undefined): number | '' {
    let result!: number | '';
    if (data == null || data == undefined) {
      return '';
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
}
