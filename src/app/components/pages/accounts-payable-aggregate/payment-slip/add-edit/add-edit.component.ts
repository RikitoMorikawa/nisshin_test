import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { StoreService } from 'src/app/services/store.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { Supplier } from 'src/app/models/supplier';

import { Purchase } from 'src/app/models/purchase';
import {
  PurchaseDetail,
  PurchaseDetailApiResponse,
} from 'src/app/models/purchase-detail';
import { PurchaseService } from 'src/app/services/purchase.service';
import { PurchaseDetailService } from 'src/app/services/purchase-detail.service';

import {
  AccountsPayableAggregate,
  AccountsPayableAggregateApiResponse,
} from 'src/app/models/accounts-payable-aggregate';
import { AccountsPayableAggregateService } from 'src/app/services/accounts-payable-aggregate.service';

/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};

// 仕入伝票登録用データ型
type purchaseDataType = {
  accounts_payable_aggregate_id: number;
  purchase_date: string;
  order_date: string;
  preferred_delivery_date: string;
  store_id: number;
  order_employee_id: number;
  supplier_id: number;
  remarks: string;
  purchase_detail: any[];
};

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private storeService: StoreService,
    private errorService: ErrorService,
    private purchaseService: PurchaseService,
    private purchaseDetailService: PurchaseDetailService,
    private accountsPayableAggregateService: AccountsPayableAggregateService,
    private common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // 各種パラメータ
  breadcrumbList: BreadcrumbList[] = [];
  accounts_payable_aggregate_id =
    this.route.snapshot.params['accounts_payable_aggregate_id'];
  url = this.router.url;
  currentUrl = this.url;
  detailUrl = this.url.replace('/edit', '');
  listlUrl = `/setting/accounts-payable-aggregate/payment-slip`;
  prevUrl = this.currentUrl.replace('/add', '').replace('/edit', '');
  slipListUrl = `${this.listlUrl}/${this.accounts_payable_aggregate_id}`;
  pageTitle = this.accounts_payable_aggregate_id
    ? '支払伝票新規登録'
    : '支払消込新規登録';
  detailPagePath: string = this.prevUrl;
  authorTitle = this.accounts_payable_aggregate_id ? '更新者' : '登録者';
  purchase_id = this.route.snapshot.params['purchase_id'];
  accountsPayableAggregate!: AccountsPayableAggregate; //{ [key: string]: string | number };

  updater = 'データ取得中...';
  authorname = 'データ取得中...';

  // ログイン中ユーザー
  author!: Employee;

  // 仕入先選択肢
  supplierSuggests!: SelectOption[];

  // 登録者選択肢
  employeeSuggests!: SelectOption[];

  // 届け先店舗
  storeSuggests!: SelectOption[];

  // 一覧のパス
  topPagePath = '/setting';
  listPagePath = '/setting/accounts-payable-aggregate/payment-slip';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = this.pageTitle + 'キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = this.pageTitle + 'エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;

  // 値引き・返品チェックボックス
  checkbox = this.fb.group({
    minusflug: [false],
  });
  // 値引き・返品フラグ
  isDiscount: boolean = false;
  tortal_cost: number = 0;

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    order_date: ['', [Validators.required]],
    preferred_delivery_date: ['', [Validators.required]],
    store_id: ['', [Validators.required]],
    supplier_id: ['', [Validators.required]],
    order_employee_id: ['', [Validators.required]],
    remarks: [''],
    purchase_date: ['', [Validators.required]],
    accounts_payable_aggregate_id: ['', [Validators.required]],
    purchase_detail: this.fb.array([
      this.fb.group({
        id: [''],
        api_product_name: [''],
        purchase_order_id: [''],
        product_id: [''],
        order_quantity: [''],
        order_price: [''],
        receiving_date: [''],
        receiving_quantity: [''],
        receiving_employee_id: [''],
        is_discount: [''],
      }),
    ]),
    purchase_detail_del: this.fb.array([
      this.fb.group({
        id: [''],
        purchase_order_id: [''],
        product_id: [''],
        order_quantity: [''],
        order_price: [''],
        receiving_date: [''],
        receiving_quantity: [''],
        receiving_employee_id: [''],
      }),
    ]),
  });

  get ctrls() {
    return this.form.controls;
  }
  get checkflg() {
    return this.checkbox.controls;
  }
  purchaseDetailAny: any = [];

  purchaseDetailRemoveForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  purchaseDetailForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  get purchaseDetailArray(): FormArray {
    return this.purchaseDetailForms.get('forms') as FormArray;
  }

  get purchaseDetailArrayControls() {
    return this.purchaseDetailArray.controls as FormGroup[];
  }

  get purchaseDetailForm(): FormGroup {
    return this.fb.group({
      // 修理区分タイプ
      id: [''],
      view_barcode: [''],
      view_total: [''],
      view_supplier_product_cd: [''],
      view_division_unit_value: [''],
      view_division_seal_print_value: [''],
      view_division_shelf_value: [''],
      view_division_shelf_col_value: [''],
      view_division_price_tag_value: [''],
      view_minimum_order_quantity: [''],
      view_quantity: [''],
      view_regulated_stock_num: [''],

      api_product_name: [''],
      purchase_id: [''],
      product_id: [''],
      order_quantity: [''],
      order_price: [''],
      receiving_date: [''],
      receiving_quantity: [''],
      //receiving_employee_id: [''],
      string_view_total: [''], //表示用
      is_discoount: [''],
    });
  }

  check(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.isDiscount = target.checked;
    }
  }
  ngOnInit(): void {
    //console.log(this.accounts_payable_aggregate_id);
    //console.log(this.purchase_id);
    // 初期状態のパンくずリストを設定
    this.breadcrumbList = this.createBreadcrumbList(this.router.url);

    this.initAuthor();

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
            this.router.navigateByUrl(this.detailPagePath);
          }
        })
    );

    // 新規登録なら処理終了
    if (!this.purchase_id) {
      this.detailPagePath = this.listPagePath;

      //初期値設定(ctrls.order_date purchase_date)
      let date = new Date();
      const today = date.toISOString().split('T')[0];
      this.ctrls.order_date.patchValue(today);
      this.ctrls.purchase_date.patchValue(today);

      return;
    }

    const pageName = this.purchase_id ? '支払消込閲覧' : '支払消込新規登録';

    this.setEditData();
    this.setEditDetailData();
  }

  /**
   * 仕入れ伝票編集データ取得
   *
   */
  setEditData(): void {
    // 支払消込情報入力のフォーム設定
    this.subscription.add(
      this.purchaseService
        .find(this.purchase_id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              modalConst.TITLE.HAS_ERROR,
              res.error.message
            );
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(
              400,
              modalConst.TITLE.HAS_ERROR,
              errorConst.COULD_NOT_GET_DATA
            );
            return;
          }
          const purchase$ = res.data[0];
          this.form.controls.supplier_id.patchValue(
            String(purchase$.supplier_id)
          );
          //this.form.controls.created_id.patchValue(String(purchase$.created_id));
          this.form.controls.order_date.patchValue(
            String(purchase$.order_date)
          );
          this.form.controls.preferred_delivery_date.patchValue(
            String(purchase$.preferred_delivery_date)
          );
          this.form.controls.store_id.patchValue(String(purchase$.store_id));
          this.form.controls.order_employee_id.patchValue(
            String(purchase$.order_employee_id)
          );
          this.form.controls.purchase_date.patchValue(
            String(purchase$.purchase_date)
          );
          this.form.controls.accounts_payable_aggregate_id.patchValue(
            String(purchase$.accounts_payable_aggregate_id)
          );
        })
    );
  }

  setEditDetailData(): void {
    // 支払消込明細のフォーム設定
    this.subscription.add(
      this.purchaseDetailService
        .getAll({ purchase_id: this.purchase_id })
        .pipe(
          catchError(
            this.purchaseDetailService.handleErrorModal<PurchaseDetailApiResponse>()
          ),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              modalConst.TITLE.HAS_ERROR,
              res.error.message
            );
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(
              400,
              modalConst.TITLE.HAS_ERROR,
              errorConst.COULD_NOT_GET_DATA
            );
            return;
          }
          const purchaseDetail$ = res.data;
          res.data.forEach((item) => {
            if (item.order_price && item.order_quantity) {
              let total =
                Number(item.order_price) * Number(item.order_quantity);
              this.tortal_cost += total;
            }
            if (item.is_discount === 1) {
              this.isDiscount = true;
              this.checkflg.minusflug.setValue(true);
              console.log(this.isDiscount);
            }
          });

          if (purchaseDetail$.length) {
            //this.form.controls.purchase_detail.clear();
            this.purchaseDetailArray.clear();
          }
          purchaseDetail$.map((row) => {
            const purchaseDetailForm = this.purchaseDetailForm;
            purchaseDetailForm.controls['view_barcode'].patchValue(
              row.product_barcode
            );
            purchaseDetailForm.controls['view_supplier_product_cd'].patchValue(
              row.product_supplier_product_cd
            );
            purchaseDetailForm.controls['view_division_unit_value'].patchValue(
              row.unit_value
            );
            purchaseDetailForm.controls[
              'view_division_seal_print_value'
            ].patchValue(row.seal_print_value);
            purchaseDetailForm.controls['view_division_shelf_value'].patchValue(
              row.shelf_value
            );
            purchaseDetailForm.controls[
              'view_division_shelf_col_value'
            ].patchValue(row.shelf_col_value);
            purchaseDetailForm.controls[
              'view_division_price_tag_value'
            ].patchValue(row.price_tag_value);
            purchaseDetailForm.controls[
              'view_minimum_order_quantity'
            ].patchValue(row.product_minimum_order_quantity);
            purchaseDetailForm.controls['view_quantity'].patchValue(
              row.product_quantity
            );
            purchaseDetailForm.controls['view_regulated_stock_num'].patchValue(
              row.product_regulated_stock_num
            );
            purchaseDetailForm.controls['receiving_quantity'].patchValue(
              row.receiving_quantity
            );
            purchaseDetailForm.controls['order_quantity'].patchValue(
              row.order_quantity
            );
            purchaseDetailForm.controls['order_price'].patchValue(
              row.order_price
            );
            purchaseDetailForm.controls['product_id'].patchValue(
              row.product_id
            );
            purchaseDetailForm.controls['purchase_id'].patchValue(
              row.purchase_id
            );
            purchaseDetailForm.controls['api_product_name'].patchValue(
              row.product_name
            );
            purchaseDetailForm.controls['id'].patchValue(row.id);
            purchaseDetailForm.controls['string_view_total'].patchValue(
              (
                Number(row.order_quantity) * Number(row.order_price)
              ).toLocaleString()
            );

            this.purchaseDetailArray.push(purchaseDetailForm);
          });
        })
    );
  }

  /**
   * ログイン中ユーザー取得処理
   *
   */
  initAuthor(): void {
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.author = this.authorService.author;
      //this.ctrls.created_id.patchValue(String(this.author.id));
      // 選択肢初期化処理
      this.initOptions();
      return;
    }

    // authorServiceに値がない場合
    // 購読を格納
    this.subscription.add(
      // ログイン中ユーザーを取得
      this.authorService.author$.subscribe((author) => {
        this.author = author;
        //this.ctrls.created_id.patchValue(String(this.author.id));
        // 選択肢初期化処理
        this.initOptions();
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

          // レスポンスの配列の要素が3つあるか
          if (res.length !== 3) {
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
          this.storeSuggests = res[2];
        })
    );
    this.callApi(true);
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
      // console.log(this.detailPagePath);
      // console.log(this.prevUrl);
      this.router.navigateByUrl(this.prevUrl);
    }
  }

  /**
   * データ保存処理
   * フォームデータをapiへpost
   * @returns
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    //this.form.markAsPristine();

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.form.value;

    // フォームの値を送信用フォーマットに置き換え
    const rawDelValues = this.purchaseDetailForms.getRawValue();
    rawDelValues.forms.forEach((x: any) => {
      let purchaseDetails = {
        id: undefined,
        product_id: x.product_id,
        order_quantity: x.order_quantity,
        order_price: x.order_price,
        //receiving_date: new Date(String(x.receiving_date)).toLocaleString(),
        receiving_quantity: x.receiving_quantity,
        //receiving_employee_id: x.receiving_employee_id,
        is_discount: this.isDiscount ? 1 : 0,
      };
      if (x.id) {
        purchaseDetails.id = x.id;
      } else {
        delete purchaseDetails.id;
      }
      this.purchaseDetailAny.push(purchaseDetails);
    });

    const postData: purchaseDataType = {
      accounts_payable_aggregate_id: Number(this.accounts_payable_aggregate_id),
      purchase_date: new Date(String(formVal.purchase_date)).toLocaleString(),
      order_date: new Date(String(formVal.order_date)).toLocaleString(),
      preferred_delivery_date: new Date(
        String(formVal.preferred_delivery_date)
      ).toLocaleString(),
      supplier_id: Number(this.accountsPayableAggregate.supplier_id),
      order_employee_id: Number(formVal.order_employee_id),
      store_id: Number(formVal.store_id),
      remarks: String(formVal.remarks),
      purchase_detail: [...this.purchaseDetailAny],
    };
    // console.log(this.form);
    // console.log(this.purchaseDetailForms);
    // console.log(this.purchaseDetailRemoveForms);
    // console.log(postData);
    this.removeDetail();

    let observable$ = this.purchaseService.add(postData);
    let response = '作成しました';
    let message = '正常に登録されました。';

    // 編集なら各種変数を書き換える
    if (this.purchase_id) {
      observable$ = this.purchaseService.update(this.purchase_id, postData);
      response = '更新しました';
      message = '正常に更新されました。';
    }

    // APIコール
    observable$
      .pipe(
        // エラー対応
        catchError((error: HttpErrorResponse) => {
          // 空の値を返却
          return of(error);
        }),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.handleError(res.status, this.errorModalTitle, res.message);
          return;
        }
        const purpose: FlashMessagePurpose = 'success';
        this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        this.router.navigateByUrl(this.prevUrl);
      });
  }

  removeDetail(): void {
    const purchaseDetailRemoveForms =
      this.purchaseDetailRemoveForms.getRawValue();
    purchaseDetailRemoveForms.forms.forEach((x: any) => {
      this.purchaseDetailService
        .remove(x.id)
        .pipe(
          // エラー対応
          catchError((error: HttpErrorResponse) => {
            // 空の値を返却
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
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
        });
    });
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
    });
  }

  /**
   * 請求残高計算
   */
  calc() {
    let answer = 0;
    const rawValues = this.ctrls.purchase_detail.getRawValue();
    // rawValues.forEach((x) => {
    //   answer += Number(x.payment_amount);
    // });
    return Math.floor(answer);
  }

  /**
   * URLに応じたパンくずリストオブジェクトを生成する。
   * @param url 表示されているページのURL。
   */
  private createBreadcrumbList(url: string) {
    const paths = url
      .replace(/.*\/accounts-payable-aggregate\/?/, '')
      .split('/');
    const pageName = this.purchase_id ? '支払伝票詳細閲覧' : '支払伝票新規登録';
    const pageUrl = this.purchase_id ? `${this.detailUrl}` : '';
    const pageFg = this.purchase_id ? true : false;
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting', text: '設定一覧' },
      { path: this.listlUrl, text: '支払データ一覧' },
      { path: this.slipListUrl, text: '支払伝票一覧' },
      { path: pageUrl, text: pageName },
    ];
    if (pageFg) {
      breadcrumbList.push({ text: `支払伝票編集` });
    }
    return breadcrumbList;
  }

  private callApi(initFg: boolean) {
    if (initFg) {
      this.getAccountsPayableAggregate(this.accounts_payable_aggregate_id);
    }
  }

  /**
   * idで指定した1件の支払伝票データを取得
   * @param id
   */
  getAccountsPayableAggregate(id: number) {
    this.common.loading = true;
    this.subscription.add(
      this.accountsPayableAggregateService
        .find(id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, 'データ取得エラー', res.error.message);
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(
              400,
              'データ取得エラー',
              errorConst.COULD_NOT_GET_DATA
            );
            return;
          }
          this.accountsPayableAggregate = res.data[0];
          this.ctrls.supplier_id.patchValue(
            String(this.accountsPayableAggregate.supplier_id)
          );
          this.ctrls.accounts_payable_aggregate_id.patchValue(String(id));
        })
    );
  }

  tmpInvalid() {
    //console.log(this.form);
    //console.log(this.form.invalid);
  }
}
