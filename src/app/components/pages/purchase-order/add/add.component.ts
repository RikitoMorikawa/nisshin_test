import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { purchaseOrderConst } from 'src/app/const/purchase-order.const';
import { productConst } from 'src/app/const/product.const';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { StoreService } from 'src/app/services/store.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { regExConst } from 'src/app/const/regex.const';
import { ProductService } from 'src/app/services/product.service';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private poService: PurchaseOrderService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private storeService: StoreService,
    private divisionService: DivisionService,
    private productService: ProductService,
    private common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // ログイン中ユーザー
  author!: Employee;

  // 仕入先選択肢
  supplierSuggests!: SelectOption[];

  selectedSupplierName!: string;
  // 発注担当者選択肢
  employeeSuggests!: SelectOption[];

  // 店舗選択肢
  storeOptions!: SelectOption[];

  // 発注書ステータス区分
  poDivisions!: SelectOption[];

  // 一覧のパス
  listPagePath = '/purchase-order';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '発注書新規登録キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '発注書新規登録エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;

  // 客注 ステータス区分Id
  orderStatusDivisionId!: string;

  products: Product[] = [];

  //単位
  DIVISION_ORDER_STATUS = divisionConst.ORDER_STATUS;
  DIVISION_ORDER_STATUS_CODE = 0;
  status_division_id!: number;

  product_division: any[] = [];
  PRODUCT_DIVISION_CUSTOM_CODE = productConst.PRODUCT_DIVISION.CODE.CUSTOM;
  PRODUCT_DIVISION_CUSTOM!: any;
  isDivisionCustom: boolean = false;

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    dateGroup: this.fb.group(
      {
        order_date: ['', [Validators.required]],
        preferred_delivery_date: ['', [Validators.required]],
      },
      {
        validators: [
          CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
            'order_date',
            'preferred_delivery_date'
          ),
        ],
      }
    ),
    store_id: ['', [Validators.required]],
    supplier_id: ['', [Validators.required]],
    order_employee_id: ['', [Validators.required]],
  });

  get ctrls() {
    return this.form.controls;
  }
  // 商品追加フォームで商品番号で指定するか商品名で指定するかのフラグ
  selectionTypeIsProductId = true;
  // 商品区分 特注品判別
  DIVISION_PRODUCT_CODE_SPECIAL_ORDER: number = 2;

  unit_division_list: any[] = [];

  ngOnInit(): void {
    // ログイン中ユーザー取得処理
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.author = this.authorService.author;
      this.ctrls.order_employee_id.patchValue(String(this.author.id));
      this.ctrls.store_id.patchValue(String(this.author.store_id));
      // 選択肢初期化処理
      this.initOptions();
    } else {
      // authorServiceに値がない場合
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          this.ctrls.order_employee_id.patchValue(String(this.author.id));
          this.ctrls.store_id.patchValue(String(this.author.store_id));
          // 選択肢初期化処理
          this.initOptions();
        })
      );
    }

    // キャンセルのモーダルを購読
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
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 選択肢初期化
   */
  initOptions() {
    this.common.loading = true;

    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([
        this.supplierService.getAsSelectOptions(),
        this.employeeService.getAsSelectOptions(),
        this.storeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.PURCHASE_ORDER_STATUS,
        }),
        this.divisionService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: this.DIVISION_ORDER_STATUS,
          division_code: this.DIVISION_ORDER_STATUS_CODE,
        }),
        //this.productService.getAll(),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
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

          // レスポンスの配列の要素が4つあるか
          if (res.length !== 6) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // 仕入先データセット
          this.supplierSuggests = res[0];

          // 社員データセット
          this.employeeSuggests = res[1];

          // 店舗データセット
          this.storeOptions = res[2];

          // 発注書ステータス区分セット
          this.poDivisions = res[3][divisionConst.PURCHASE_ORDER_STATUS];

          // 単位区分のオブジェクト
          this.unit_division_list = res[4][divisionConst.UNIT];
          this.product_division = res[4][divisionConst.PRODUCT];
          this.PRODUCT_DIVISION_CUSTOM = this.product_division.find(
            (x) => x.code === this.PRODUCT_DIVISION_CUSTOM_CODE
          );
          console.log(this.PRODUCT_DIVISION_CUSTOM);
          // 発注書初期ステータス
          this.status_division_id = res[5][this.DIVISION_ORDER_STATUS][0].value;
        })
    );
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
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (!this.form.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.listPagePath);
    }
  }

  /**
   * データ保存処理
   * フォームデータをapiへpost
   * @returns
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.form.markAsPristine();

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.form.value;

    // order_status_division_id

    const orders = this._getCustomerOrders();

    // 発注担当者の値チェック
    const employeeIdExists = this.employeeSuggests.some((employee) => {
      const employeeVal = Number(employee.value);
      const employeeId = Number(formVal.order_employee_id);
      return employeeVal === employeeId;
    });
    if (!employeeIdExists) {
      this.ctrls.order_employee_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 仕入先の値チェック
    const supplierIdExists = this.supplierSuggests.some((supplier) => {
      const supplierVal = Number(supplier.value);
      const supplierId = Number(formVal.supplier_id);
      return supplierVal === supplierId;
    });
    if (!supplierIdExists) {
      this.ctrls.supplier_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 届け先店舗の値チェック
    const storeIdExists = this.storeOptions.some((store) => {
      const storeVal = Number(store.value);
      const storeId = Number(formVal.store_id);
      return storeVal === storeId;
    });
    if (!storeIdExists) {
      this.ctrls.store_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 発注日・希望納入日の値チェック
    if (
      !formVal.dateGroup?.order_date ||
      !formVal.dateGroup?.preferred_delivery_date
    ) {
      this.ctrls.dateGroup.controls.order_date.setValue('');
      this.ctrls.dateGroup.controls.preferred_delivery_date.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 下書きステータスのIDを取得
    const draftStatusDivision = this.poDivisions.find((x) => {
      return x.text === purchaseOrderConst.STATUS.DRAFT;
    });

    // フォームの値を送信用フォーマットに置き換え
    const po = {
      order_date: new Date(formVal.dateGroup.order_date).toLocaleDateString(),
      preferred_delivery_date: new Date(
        formVal.dateGroup.preferred_delivery_date
      ).toLocaleDateString(),
      order_employee_id: formVal.order_employee_id,
      supplier_id: formVal.supplier_id,
      store_id: formVal.store_id,
      purchase_order_status_division_id: draftStatusDivision?.value,
      order: orders,
    };
    // 購読管理用サブスクリプションへ格納
    this.subscription.add(
      // 保存処理開始
      this.poService
        .add(po)
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
              this.errorModalTitle,
              res.error.message
            );
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.listPagePath);
        })
    );
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, title: string, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: this.listPagePath,
    });
  }

  /**
   * 客注追加・編集時に商品IDと商品名で入力を切り替える
   */
  setSelectionType(orderForm: FormGroup) {
    // フラグ反転
    const boolValue = !orderForm.controls['selectionTypeIsProductId'].value;
    // フォームクリア
    orderForm.reset({ product_id: '', quantity: '' });
    orderForm.controls['selectionTypeIsProductId'].patchValue(boolValue);
    this._setDefaultValue(orderForm);
  }
  /**
   * 初期値の設定
   */
  private _setDefaultValue(form: FormGroup): void {
    //form.controls['unit'].patchValue('個');
  }
  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProductIdSuggests(form: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        id: form.controls['product_id'].value, //this.fc.product_name.value,
        supplier_id: this.ctrls.supplier_id.value,
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
        name: form.controls['product_name'].value, //this.fc.product_name.value,
        supplier_id: this.ctrls.supplier_id.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   *
   */
  changeProductNameAlias(e: any) {
    console.log((e.target as HTMLInputElement).value);
  }
  /**
   * 取得データをフォームにセット
   * @param orderForm
   * @param product
   * @returns
   */
  handleSelectedProductData(orderForm: FormGroup, product: Product) {
    if (product === undefined) {
      return;
    }
    //orderForm.controls['product_id'].patchValue(product.id);
    //orderForm.controls['product_name'].patchValue(product.name);
    /**
     * ID 選択時 product_nameをセットする
     */
    if (
      this.getFormControlTypeValue(orderForm, 'selectionTypeIsProductId').value
    ) {
      orderForm.controls['product_name'].patchValue(product.name);
    }
    console.log(product);
    orderForm.controls['order_quantity'].patchValue(1);
    orderForm.controls['cost_price'].patchValue(
      this.getSupplierCostPrice(product)
    );
    orderForm.controls['order_status_division_id'].patchValue(
      this.status_division_id
    );
    let total_cost_price =
      Number(orderForm.controls['cost_price'].value) *
      Number(orderForm.controls['order_quantity'].value);
    orderForm.controls['total_cost_price'].patchValue(total_cost_price);
    let supplier_data = this.supplierSuggests.find((x) => {
      return x.value === this.ctrls.supplier_id.value;
    });
    orderForm.controls['supplier_name'].patchValue(supplier_data?.text);
    orderForm.controls['product_divition_id'].patchValue(
      product.product_division_id
    );

    if (product.product_division_id === this.PRODUCT_DIVISION_CUSTOM.value) {
      this.isDivisionCustom = true;
    } else {
      this.isDivisionCustom = false;
    }
  }

  /**
   * 数量の変更をキャッチ
   * @param orderForm
   */
  handleCahgeQuantityCostPrice(orderForm: FormGroup) {
    if (!orderForm.controls['cost_price'].value) {
      orderForm.controls['total_cost_price'].patchValue(0);
    }
    let total_cost_price =
      Number(orderForm.controls['cost_price'].value) *
      Number(orderForm.controls['order_quantity'].value);
    orderForm.controls['total_cost_price'].patchValue(total_cost_price);
  }
  orderForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  // 追加ボタンがおされたときに追加したいフォーム定義しています。returnでFormGroupを返しています。
  get orderForm(): FormGroup {
    const form = this.fb.group({
      product_id: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ], // 商品ID
      order_quantity: [
        1,
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ], // 発注数量
      cost_price: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ], // 原価
      product_name_alias: [' ', Validators.maxLength(255)], // 別称
      order_status_division_id: [
        '',
        [Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ], // ステータス区分ID
      // POST時削除
      product_name: ['', [Validators.required]], // 商品ID
      selectionTypeIsProductId: true,
      supplier_name: [''],
      total_cost_price: [0],
      product_divition_id: [],
    });
    // カスタム名変更を購読
    return form;
  }

  get orderArray(): FormArray {
    return this.orderForms.get('forms') as FormArray;
  }

  get orderArrayControls() {
    return this.orderArray.controls as FormGroup[];
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  getFormControlTypeValueData(form: AbstractControl, controlName: string) {
    return form.get(controlName)?.value;
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

  addCustomerOrderForm() {
    const orderForm = this.orderForm;
    this.orderArray.push(orderForm);
  }

  // removeAtでインデックスを指定することで、FormArrayのフォームを削除します。
  removeCustomerOrderForm(idx: number) {
    this.orderArray.removeAt(idx);
  }

  getProduct(product_id: number) {
    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([this.productService.getAll({ id: product_id })])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          console.log(res);
        })
    );
  }

  //データnullチェック
  private isNotFalseValue(elm: any): boolean {
    let result: boolean = false;
    if (elm !== undefined && elm !== '' && elm !== null) {
      result = true;
    }
    return result;
  }
  //データnullチェック
  private isFalseValue(elm: any): boolean {
    let result: boolean = false;
    if (elm === undefined && elm === '' && elm === null) {
      result = true;
    }
    return result;
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

  /**
   * 登録する明細データの取得
   *
   */
  private _getCustomerOrders() {
    const orderForms = this.orderForms;
    //
    const orders = orderForms.value.forms.map((order: any) => {
      if (order.product_name_alias) {
        order.product_name_alias = order.product_name_alias.trim();
      } else {
        order.product_name_alias = '';
      }
      delete order.selectionTypeIsProductId;
      delete order.supplier_name;
      delete order.total_cost_price;
      return order;
    });
    return orders;
  }
}
