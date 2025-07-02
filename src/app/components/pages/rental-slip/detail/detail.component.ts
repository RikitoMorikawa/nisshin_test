import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  filter,
  finalize,
  forkJoin,
  of,
  take,
  tap,
  switchMap,
} from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { rentalSlipConst } from 'src/app/const/rental-slip.const';
import { RentalSlip, RentalSlipApiResponse } from 'src/app/models/rental-slip';
import {
  ApiResponseIsInvalid,
  RoundingMethod,
  calculatePrice,
  daysBetweenDates,
  getFractionMethod,
  getTaxRateAndTaxIncludedFlag,
  isEmptyOrNull,
  isObjectEmptyOrNull,
  isParameterInvalid,
  phoneNumberFormatter,
  postalCodeFormatter,
  roundPrice,
} from 'src/app/functions/shared-functions';
import { ErrorService } from 'src/app/services/shared/error.service';
import { RentalSlipService } from 'src/app/services/rental-slip.service';
import { RentalService } from 'src/app/services/rental.service';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { RentalProductService } from 'src/app/services/rental-product.service';
import { DivisionService } from 'src/app/services/division.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Rental,
  RentalApiResponse,
  RentalDiffForm,
} from 'src/app/models/rental';
import { BasicInformation } from 'src/app/models/basic-information';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  RentalProduct,
  RentalProductChangeStatus,
  RentalProductApiResponse,
} from 'src/app/models/rental-product';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { divisionConst } from 'src/app/const/division.const';
import { rentalProductConst } from 'src/app/const/rental-product.const';
import { taxFractionConst } from 'src/app/const/tax-fraction.const';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { deliveryConst } from 'src/app/const/delivery.const';
import { Division } from 'src/app/models/division';
import { ApiInput } from 'src/app/components/molecules/search-suggest-container/search-suggest-container.component';
import {
  AddFormType,
  EditFormType,
  FormService,
  StatusFormType,
  BulkFormType,
} from 'src/app/services/rental-slip/form.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { regExConst } from 'src/app/const/regex.const';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { DeliveryDomain } from 'src/app/domains/delivery.domain';
import { DeliveryService } from 'src/app/services/delivery.service';
import { Delivery } from 'src/app/models/delivery';

export type recalculationRentalFee = {
  id: number;
  product: RentalProduct;
  scheduled_rental_date: string;
  return_date?: string;
  before_rental_fee: number | 0;
  after_rental_fee: number | 0;
  refund_amount: number | 0;
  isrefund: boolean;
  rentals: Rental;
};

// 選択中のお客様情報を保持するタイプ
type SelectedCustomerType = {
  type: number;
  customer_type_code: string;
  id: string;
  fullName: string;
  fullNameKana: string;
  address: string;
  tel: string;
  idConfirmationDate: string;
  // 本人確認書類の確認が必要かどうかのフラグ
  isIdConfirmationRequired: boolean;
  identification_document_confirmation_date: string;
};

// クライアント・メンバーのボタン表示条件
type SelectedCustomerStatus = {
  type: string;
  reception_tag: boolean;
  rental_employee_id: boolean;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private errorService: ErrorService,
    private rsService: RentalSlipService,
    private rentalService: RentalService,
    private biService: BasicInformationService,
    private rentalProductService: RentalProductService,
    private divisionService: DivisionService,
    private flashMessageService: FlashMessageService,
    private modalService: ModalService,
    private router: Router,
    private formService: FormService,
    private common: CommonService,
    private employeeService: EmployeeService,
    private deliveryDomain: DeliveryDomain,
    private deliveryService: DeliveryService
  ) {}

  private subscription = new Subscription();

  private actNumSubscription = new Subscription();

  // レンタル・滞納・返金額 2日目移行の価格割合
  discount_price_late: number = 1;

  // 選択中のレンタル受付票
  rs!: RentalSlip;

  // レンタル受付票に紐付くレンタル明細
  rentals: Rental[] = [];
  overdue_rentals!: Rental[];
  overdue_rentals_ad_status: String = '';

  set_overdue_rentals: boolean = false;

  reception_tag_require: boolean = true;
  reception_tag_require_status_divisions: Number[] = [];
  // エラーモーダルのタイトル
  errorModalTitle = 'レンタル受付票詳細エラー：' + modalConst.TITLE.HAS_ERROR;

  // barcodeへ渡す値
  barcodeValue!: string;

  // 一覧画面のパス
  listPagePath = '/rental-slip';

  // 編集画面のパス
  editPagePath!: string;

  // 選択中の受付票ID
  selectedId!: number;

  // 最終更新者姓名
  updaterFullName!: string;

  // 受付担当者姓名
  receptionEmployeeFullName!: string;

  // 受付日
  receptionDate!: string;

  // レンタル受付票定数
  rsConst = rentalSlipConst;

  // レンタル商品定数
  rentalProductConst = rentalProductConst;

  // ニッシン様情報
  basicInformation!: BasicInformation;
  companyAddress!: string;
  companyTel!: string;
  companyFax!: string;
  companyPostalCode!: string;

  // 貸出可能な商品のサジェスト用選択肢
  //availableProductSuggests!: SelectOption[];
  // 貸出可能な商品のみ
  //availableProducts!: RentalProduct[];
  // 全てのレンタル商品
  //allRentalProducts!: RentalProduct[];
  // 選択中商品の売価を表示するための変数
  selectedProductPrice = 0;
  // 選択中の商品がレンタル商品か配送料かの判定フラグの値
  selectedProductDeliveryChargeFlag!: number;
  // 消費税区分選択肢
  taxDivisionOptions!: SelectOption[];
  // 消費税区分
  taxDivisionText = '';
  // 消費税計算用定数
  taxFractionConst = taxFractionConst;
  // 精算ステータス区分
  settleStatusDivision!: Division;
  // 延滞報告フラグ選択肢
  lateReturnReportedOptions: SelectOption[] = [
    { value: 0, text: '連絡なし' },
    { value: 1, text: '連絡あり' },
  ];

  // 処理単位Processing Units
  processingUnits: SelectOption[] = [
    { value: '1', text: '明細単位' },
    { value: '0', text: '受付票単位' },
  ];

  // レンタル商品データ公開区分
  rentalProductDataPermissionPublish!: Division;

  // レンタル商品貸出可能ステータス区分
  rentalProductStatusRentable!: Division;

  // 受付票ステータス区分選択肢
  statusDivisionOptions!: SelectOption[];
  statusDivisions!: any[];

  // 配送希望が含まれているか判定用フラグ
  isDeliveryRequested = false;

  // 配送依頼の配送情報
  deliveries!: Delivery[];
  // rentals: Rental[] = [];

  // 追加・編集フォーム関連変数
  addTarget!: Rental;
  addTargetProduct!: RentalProduct;
  editTarget!: Rental;
  editTargetProduct!: RentalProduct;

  totalAmount = 0;
  overdue_totalAmount = 0;
  overdue_refund_totalAmount = 0;

  action_num: number = 0;
  act_num: number = 0;
  // edit 展開時にオープンする作業担当者区分判定用
  rentalItemStatus: boolean = false;

  // レンタル商品の追加・編集・削除実行中フラグ
  isUpdatingRental = false;
  errorConst = errorConst;
  // 配送依頼区分選択肢
  deliveryDivisionOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];
  // 回収依頼区分選択肢
  collectionDivisionOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  RENTAL_ITEM_COUNT: number = 1; // 予約数は1で固
  DElIVERY_PRICE: number = 0; // 配送料金は0で固定
  COLLECTION_PRICE: number = 0; // 回収料金は0で固定

  rentalProductStatusCode: any[] = [];
  /************************************************
   *********** フォーム関連定義開始
   ************************************************/

  // レンタル明細追加フォームの表示フラグ
  addFormIsOpen = false;

  // レンタル明細更新フォームの表示フラグ
  editFormIsOpen = false;

  // 配送かどうか
  isDelivery = false;

  // ステータス変更用フォーム
  statusForm!: FormGroup<StatusFormType>;

  // レンタル明細追加用フォーム
  addForm!: FormGroup<AddFormType>;

  resetAddForm!: FormGroup<AddFormType>;

  // レンタル明細更新用フォーム
  editForm!: FormGroup<EditFormType>;

  bulkForm!: FormGroup<BulkFormType>;
  diffForm!: FormGroup<BulkFormType>;

  // 社員サジェスト
  employeeSuggests!: SelectOption[];

  //受付タグ
  reception_tag!: string;

  // 処理単位フラグ

  is_processing_units: boolean = false;

  //貸出日の有無
  boolean_rental_date: boolean = false;

  // 返却日の有無
  boolean_return_date: boolean = false;
  // 返却日の有無(受領)
  boolean_receipt_date: boolean = false;

  // 貸出担当 rental.rental_employee_id に格納
  rental_employee!: String;

  // 返却担当 rental.return_employee_id に格納
  return_employee!: String;

  // 受領担当 rental.return_employee_id に格納
  overdue_return_employee!: String;

  // 延滞報告
  bulk_late_return_reported: number = 0;

  // Rental個票から日付を取得する連番
  SELECT_RENRAL_LIST_ID: number = 0;

  rental_date_values: any = {
    scheduled_rental_date: '',
    scheduled_return_date: '',
    rental_date: '',
    return_date: '',
  };

  diff_date_values: any = {
    scheduled_rental_date: '',
    scheduled_return_date: '',
    rental_date: '',
    return_date: '',
  };

  DIFF_STAUS_DETENTION: String = '延滞';
  DIFF_STAUS_REFUND: String = '差額';

  // レンタル済みのプロダクトデータ
  ProductData: RentalProduct[] = [];

  // 返金分のレコード生成
  addDiffRecord: RentalDiffForm[] = [];
  diffrecords: recalculationRentalFee[] = [];
  refund_msg: string = '';
  REFOUND_MSG: string =
    '返金処理が発生します、返却処理後、返金操作を行ってください。';

  // プロダクトのリスト格納
  product_id_list: number[] = [];
  update_product_item: RentalProduct[] = [];
  //プロダクトのステータス
  //予約済み
  PRODUCT_STATUS_DIVISION_RESERVED!: number;
  //貸し出し中
  PRODUCT_STATUS_DIVISION_RENTED!: number;
  // 返却済み
  PRODUCT_STATUS_DIVISION_RETURNED!: number;
  // 清掃中
  PRODUCT_STATUS_DIVISION_CLEANING!: number;

  TODAY = new Date();

  selectedCustomer!: SelectedCustomerType;

  product_selling_price: any[] = [];
  /**
   * Member   : 0 会員
   * Client   : 1 得意先
   * General  : 2 一般
   */
  DIVISION_CUSTOMER_CODE_MEMBER: string = String(
    rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.MEMBER
  );
  DIVISION_CUSTOMER_CODE_CLIENT: string = String(
    rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.CLIENT
  );
  DIVISION_CUSTOMER_CODE_GENERAL: string = String(
    rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL
  );

  idConfirmationDate: boolean = false;

  // ステータスフォームのゲッター
  get statusFc(): StatusFormType {
    return this.statusForm.controls;
  }

  // レンタル明細追加フォームのゲッター
  get addFc(): AddFormType {
    return this.addForm.controls;
  }

  // レンタル明細更新フォームのゲッター
  get editFc(): EditFormType {
    return this.editForm.controls;
  }

  // レンタル明細一括更新フォームのゲッター
  get bulkFc(): BulkFormType {
    return this.bulkForm.controls;
  }
  // レンタル明細差額一括更新フォームのゲッター
  get diffFc(): BulkFormType {
    return this.diffForm.controls;
  }

  generalForm = this.fb.group({
    identification_document_confirmation_date: [''],
    idConfirmationDate_check: [false, [Validators.required]],
  });

  // 本人確認書類
  get generalFc() {
    return this.generalForm.controls;
  }

  selectedCustomerStatus: SelectedCustomerStatus = {
    type: '',
    reception_tag: false,
    rental_employee_id: false,
  };

  onCheckId(event: any) {
    const today = new Date().toLocaleString();
    if (event.target.checked) {
      this.confirmedIdentityVerificationDocuments();
      this.generalFc.identification_document_confirmation_date.setValue(today);
      this.selectedCustomer.identification_document_confirmation_date = today;
      this.selectedCustomer.isIdConfirmationRequired = true;
    } else {
      this.generalFc.identification_document_confirmation_date.setValue('');
      this.selectedCustomer.identification_document_confirmation_date = '';
      this.selectedCustomer.isIdConfirmationRequired = false;
    }
  }

  /**
   * 貸出担当者をidを指定して取得しフォームに設定する
   * @param id 受付担当者id
   * @returns
   */
  getEmployeeByIdRental(id: string) {
    this.employeeSuggests.find((x) => {
      if (Number(x.value) === Number(id)) {
        if (this.is_processing_units == true) {
          this.editFc.rental_employee_id.patchValue(x.value);
        } else {
          this.bulkFc.rental_employee_id.patchValue(x.value);
        }
      }
    });
  }
  // 貸出担当者id検索用フォーム
  getReceptionEmployeeByIdFormRental = this.fb.group({
    get_rental_employee_id: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
  });
  //  貸出担当者id検索フォームのゲッター
  get getEmployeeByIdFcRental() {
    return this.getReceptionEmployeeByIdFormRental.controls;
  }

  /**
   * 返却担当者をidを指定して取得しフォームに設定する
   * @param id 受付担当者id
   * @returns
   */
  getEmployeeByIdReturn(id: string) {
    this.employeeSuggests.find((x) => {
      if (Number(x.value) === Number(id)) {
        if (this.is_processing_units == true) {
          this.editFc.return_employee_id.patchValue(x.value);
        } else {
          this.bulkFc.return_employee_id.patchValue(x.value);
        }
      }
    });
  }
  // 返却担当者id検索用フォーム
  getReceptionEmployeeByIdFormReturn = this.fb.group({
    get_return_employee_id: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
  });
  //  返却当者id検索フォームのゲッター
  get getEmployeeByIdFcReturn() {
    return this.getReceptionEmployeeByIdFormReturn.controls;
  }

  /**
   * For Diff
   */
  /**
   * 返却担当者をidを指定して取得しフォームに設定する
   * @param id 受付担当者id
   * @returns
   */
  getEmployeeByIdDiff(id: string) {
    this.employeeSuggests.find((x) => {
      if (Number(x.value) === Number(id)) {
        this.diffFc.return_employee_id.patchValue(x.value);
      }
    });
  }
  // 返却担当者id検索用フォーム
  getReceptionEmployeeByIdFormDiff = this.fb.group({
    get_return_employee_id: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
  });
  //  返却当者id検索フォームのゲッター
  get getEmployeeByIdFcDiff() {
    return this.getReceptionEmployeeByIdFormDiff.controls;
  }

  /**
   * チェックボックスの状態管理
   * @param formControl
   * @returns
   */
  CheckBoxControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    const isChecked = formControl.value === false;
    const result = formControlState || isChecked;
    return result;
  }

  /**
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(
    formControl: FormControl | null | undefined
  ): boolean {
    if (formControl === null || formControl === undefined) {
      return false;
    }
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  /**
   * 追加フォームの日付入力要素へ初期値をセットする
   */
  private setDefaultValueToAddFormDateGroup() {
    // 貸出予定日、返却予定日へ今日の値をセット
    // 日付用コントロール用にISOStringでセットする
    this.addFc.scheduledDateGroup.controls.scheduled_rental_date.setValue(
      new Date().toISOString()
    );
    this.addFc.scheduledDateGroup.controls.scheduled_return_date.setValue(
      new Date().toISOString()
    );
  }

  /**
   * レンタル明細追加フォームを初期化する
   */
  private resetAddFormValues() {
    this.formService.resetAddForm(this.addForm);
  }

  /**
   * 編集フォームの値を初期化する
   */
  private resetEditFormValues() {
    this.formService.resetEditForm(this.editForm);
  }

  /**
   * レンタル明細編集フォームへ値をセットする
   *
   * @param rental Rental
   * @param rentalProduct RentalProduct
   * @returns
   */
  private setEditFormData(rental: Rental, rentalProduct: RentalProduct) {
    // console.log('OpenEdit');
    // 引数エラーハンドリング
    const rentalIsInvalid = isObjectEmptyOrNull(rental);
    const rentalProductIsInvalid = isObjectEmptyOrNull(rentalProduct);
    if (rentalIsInvalid || rentalProductIsInvalid) {
      this.createErrorAndExecHandleError(
        '選択したレンタル明細またはレンタル商品の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // フォームへ値をセットする
    try {
      this.formService.setEditFormData(this.editForm, rental);
      this.editFc.rental_fee.setValue(rental.rental_fee);
      if (this.set_overdue_rentals) {
        this.editFc.late_fee.setValue(rental.late_fee);
      }
      if (this.set_overdue_rentals) {
        this.editFc.refund_fee.setValue(rental.refund_fee);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.createErrorAndExecHandleError(
          `${error.message}一覧画面へ戻ります。`,
          this.listPagePath
        );
        return;
      } else {
        this.createErrorAndExecHandleError(
          'レンタル商品更新のためのフォームデータのセットに失敗しました。一覧画面へ戻ります。',
          this.listPagePath
        );
        return;
      }
    }

    // 選択中のレンタル商品が配送料金かどうかでバリデーション追加・削除を行う
    this.changeRentalFeeCtrlValidation(rentalProduct);
  }
  /**
   * レンタル商品が配送料かどうかでレンタル料金コントロールのバリデーション追加・削除を行う
   */
  private changeRentalFeeCtrlValidation(rentalProduct: RentalProduct) {
    // エラーハンドリング
    if (isObjectEmptyOrNull(rentalProduct)) {
      this.createErrorAndExecHandleError(
        '選択したレンタル商品の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }
    // 配送料フラグによってバリデーションを追加・削除
    // 選択中のレンタル商品が配送料金かどうかのフラグを取得
    const selectedProductDeliveryChargeFlag =
      rentalProduct.delivery_charge_flag;

    let fc;

    // 編集モードかどうか
    if (this.isEditing()) {
      fc = this.editFc;
    } else {
      fc = this.addFc;
    }

    // 選択中のレンタル商品が配送料金かどうかでバリデーション追加・削除を行う
    this.formService.changeValidatorsForRentalFeeControl(fc, rentalProduct);

    // 配送料フラグを更新する
    this.selectedProductDeliveryChargeFlag = selectedProductDeliveryChargeFlag;
  }

  /**
   * レンタル商品の追加ボタンがクリックされた時の処理
   */
  addFormOpen() {
    this.addFormIsOpen = true;
  }

  /**
   * レンタル商品の貸出ステータスチェック
   *  受付表単位
   */
  isItemBorrowed(): any {
    // 貸出可能かチェック
    let status_division_id = this.rentalProductStatusCode.find((x) => {
      return x.division_code === rentalProductConst.STATUS_CODE.RENTED;
    });

    let rentedItems = this.ProductData.filter(
      (item) => item.status_division_id === status_division_id.id
    ).map((item) => {
      // 必要なプロパティを抽出する
      return {
        id: item.id,
        name: item.name,
        status_division_id: item.status_division_id,
        // 他の必要なプロパティを追加
      };
    });

    if (rentedItems.length > 0) {
      return rentedItems;
    }

    return false;
  }

  /**
   * レンタル商品の貸出ステータスチェック
   *  明細単位
   */
  isItemBorrowed_(): any {
    // 貸出可能かチェック
    let status_division_id = this.rentalProductStatusCode.find((x) => {
      return x.division_code === rentalProductConst.STATUS_CODE.RENTED;
    });
    let rentedItems = [];
    if (this.editTargetProduct.status_division_id === status_division_id.id) {
      rentedItems.push({
        id: this.editTargetProduct.id,
        name: this.editTargetProduct.name,
        status_division_id: this.editTargetProduct.status_division_id,
        // 他の必要なプロパティを追加
      });
    }
    if (rentedItems.length > 0) {
      return rentedItems;
    }
    return false;
  }

  // ボタン(貸出・返却・受領)

  // 受付表単位: 貸出(当日)
  rentalToday() {
    let RentaledItems = this.isItemBorrowed();
    if (RentaledItems) {
      alert('レンタル未返却アイテムが含まれています。');
      return;
    }
    let today = new Date();
    this.bulkFc.dateGroup.controls.rental_date.setValue(today);
    this.handleClickBulkSaveRental();
  }

  // 受付表単位: 貸出(保存)
  rentalDateBulkSave() {
    // 貸出可能かチェック
    let RentaledItems = this.isItemBorrowed();
    if (RentaledItems) {
      alert('レンタル未返却アイテムが含まれています。');
      return;
    }
    this.handleClickBulkSaveRental();
  }

  // 受付単位: 返却 (当日)
  returnToday() {
    let bulk_form_data = this.bulkForm.value;
    let today = new Date();
    if (bulk_form_data.dateGroup) {
      bulk_form_data.dateGroup.return_date = today;
    }
    this.checkDatesAndShowModal(bulk_form_data, () =>
      this.handleClickBulkSaveReturn()
    );
  }

  // 受付単位: 返却 (保存)
  bulkSave() {
    let bulk_form_data = this.bulkForm.value;
    let isChangeStatus = false;

    if (!bulk_form_data.dateGroup?.return_date && isChangeStatus === false) {
      // 担当者未選択
      alert('返却日が未選択です');
      this.common.loading = false;
      return;
    }

    if (!bulk_form_data.return_employee_id && isChangeStatus === false) {
      // 担当者未選択
      alert('返却担当者が未選択です');
      this.common.loading = false;
      return;
    }

    this.checkDatesAndShowModal(bulk_form_data, () =>
      this.handleClickBulkSaveReturn()
    );
  }

  // 受付表単位: 受領
  receiptToday() {
    // 受領日 == return_date
    this.handleClickDiffSaveButton('return');
  }

  // 明細単位: 貸出(当日)
  sRentalToday() {
    // 貸出可能かチェック
    let RentaledItems = this.isItemBorrowed_();
    if (RentaledItems) {
      alert('レンタル未返却アイテムが含まれています。');
      return;
    }
    let form_data = this.editForm.value;
    let today = new Date();
    if (form_data.dateGroup) {
      form_data.dateGroup.rental_date = today;
    }

    this.handleClickEditExecutionButtonRental();
  }

  // 明細単位: 貸出(保存)
  RentalSaveButton() {
    // 貸出可能かチェック
    let RentaledItems = this.isItemBorrowed_();
    if (RentaledItems) {
      alert('レンタル未返却アイテムが含まれています。');
      return;
    }
    this.handleClickEditExecutionButtonRental();
  }

  // 編集フォームを閉じて貸出処理を呼び出す
  handleClickEditExecutionButtonRental() {
    this.editFormIsOpen = false;
    this.rentalItemRentalUpdate();
  }

  // 明細単位: 返却 (当日)
  sReturnToday() {
    /** 当日返却 */
    let form_data = this.editForm.value;
    let today = new Date();
    if (form_data.dateGroup) {
      form_data.dateGroup.return_date = today;
    }
    this.checkDatesAndShowModal(form_data, () =>
      this.handleClickRentalEditExecutionButton()
    );
  }

  // 明細単位: 返却 (保存)
  RentalEditExecutionButton() {
    let form_data = this.editForm.value;
    let isChangeStatus = false;

    if (!form_data.dateGroup?.return_date && isChangeStatus === false) {
      // 担当者未選択
      alert('返却日が未選択です');
      this.common.loading = false;
      return;
    }

    if (!form_data.return_employee_id && isChangeStatus === false) {
      // 担当者未選択
      alert('返却担当者が未選択です');
      this.common.loading = false;
      return;
    }

    this.checkDatesAndShowModal(form_data, () =>
      this.handleClickRentalEditExecutionButton()
    );
  }

  // 編集フォームを閉じて返却処理を呼び出す
  handleClickRentalEditExecutionButton() {
    this.editFormIsOpen = false;
    this.rentalItemReturnUpdate();
  }

  sReceiptToday() {
    // console.log('差額受領_当日');
  }

  // 明細単位 延滞・返金
  sDiffReturnToday() {
    let today = new Date().toLocaleDateString();
    this.handleClickRentalDiffExecutionButton(today);
  }

  // 日付比較 returnDate < scheduledReturnDate
  private checkDatesAndShowModal(form_data: any, callback: () => void) {
    if (
      form_data.dateGroup?.return_date &&
      form_data.scheduledDateGroup?.scheduled_return_date
    ) {
      const returnDate = new Date(form_data.dateGroup.return_date).getTime();
      const scheduledReturnDate = new Date(
        form_data.scheduledDateGroup.scheduled_return_date
      ).getTime();

      if (returnDate < scheduledReturnDate) {
        this.saveModal(callback);
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  saveModal(callback: () => void) {
    // モーダルのタイトル
    const modalTitle = '返却予定日より前の返却となります。ご確認ください。';
    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'warning';
    const modalBody: string = 'この操作は取り消せません。実行しますか？';
    // 削除確認モーダル呼び出し
    this.modalService.setModal(
      modalTitle,
      modalBody,
      modalPurposeDanger,
      modalConst.BUTTON_TITLE.EXECUTION,
      modalConst.BUTTON_TITLE.CANCEL
    );

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          )
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            callback(); // 渡された関数を実行
          }
        })
    );
  }
  /**
   * レンタル明細の更新ボタンがクリックされた時の処理
   * @param rental
   */
  editFormOpen(rental: Rental) {
    // 編集フォームを閉じて一旦リセット
    this.editFormCancel();

    this.addDiffRecord = [];

    // 編集ターゲットのレンタル明細をセット
    this.editTarget = rental;

    // ローディング開始
    this.common.loading = true;
    if (rental.rental_date === '') {
      this.rentalItemStatus = false;
    } else {
      this.rentalItemStatus = true;
    }

    // レンタル商品を取得
    this.subscription.add(
      forkJoin([this.rentalProductService.find(rental.rental_product_id)])
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.createHttpErrorAndExecHandleError(res, this.listPagePath);
            return;
          }

          if (res === null || res === undefined) {
            this.createErrorAndExecHandleError(
              'レンタル商品の取得に失敗しました。一覧画面へ戻ります。',
              this.listPagePath
            );
            return;
          }

          // ターゲットのレンタル商品としてセット
          this.editTargetProduct = res[0].data[0];
          // フォームの値をセット
          this.setEditFormData(this.editTarget, this.editTargetProduct);
          // 編集フォームを開く
          this.editFormIsOpen = true;
          this.setUpRentalReturnEmployee();
          /* 初期値がある場合セット*/
          this.setRentalReturnEmployeeDefaultValue(
            rental.rental_employee_id,
            rental.return_employee_id
          );

          // 初期値ない場合は受付ユーザーセットする。
          if (this.editFc.rental_employee_id.value) {
            this.selectedCustomerStatus.rental_employee_id = true;
          } else {
            //this.editFc.rental_employee_id.setValue(
            //  this.statusFc.reception_employee_id.value
            //);
          }

          // 値の変更キャッチ
          this.editFc.rental_employee_id.valueChanges.subscribe((newId) => {
            this.selectedCustomerStatus.rental_employee_id = true;
          });

          /**
           * ボタン表示用(オープン時にグローバル値に値をセットする)
           */

          // rental_date の有無()
          if (this.dateToString(rental.rental_date) != '') {
            this.boolean_rental_date = true;
          } else {
            this.boolean_rental_date = false;
          }
          // return_date の有無()
          if (this.dateToString(rental.return_date) != '') {
            this.boolean_return_date = true;
          } else {
            this.boolean_return_date = false;
          }

          /**
           * 入力チェック　return_date
           */

          this.checkingTheRentalEditPeriod(
            [this.editTargetProduct],
            this.rentals
          );
        })
    );
  }

  get getBulkDateGroup() {
    return this.bulkFc.dateGroup.controls;
  }
  /**
   * レンタル期間の確認
   * form bulkFc.dateGroup.controls.return_date の値変更を監視
   *
   */
  checkingTheRentalPeriod(ProductData: RentalProduct[], Rentals: Rental[]) {
    /** 担当者選択 */
    this.subscription.add(
      this.getBulkDateGroup.return_date.valueChanges.subscribe((value) => {
        if (value === null || value === undefined || value === '') {
          return;
        }

        this.diffrecords = [];
        for (let item in Rentals) {
          let product = ProductData.filter((x) => {
            return x.id == Rentals[item].rental_product_id;
          });
          if (product.length === 0) {
            continue;
          }
          let after_rental_fee: any = this.calculateRentalFee(
            product[0],
            new Date(Rentals[item].scheduled_rental_date).toISOString(),
            new Date(value).toISOString()
          );
          let before_rental_fee = Rentals[item].rental_fee;
          let refund_amount: number | 0 = after_rental_fee
            ? after_rental_fee - before_rental_fee
            : 0;
          let isrefund = refund_amount < 0 ? true : false;

          //Rental Edit
          if (refund_amount >= 0) {
            return;
          }

          let rentals_data: recalculationRentalFee = {
            id: Rentals[item].id,
            product: product[0],
            scheduled_rental_date: new Date(
              Rentals[item].scheduled_rental_date
            ).toISOString(),
            return_date: new Date(value).toISOString(),
            before_rental_fee: before_rental_fee,
            after_rental_fee: after_rental_fee,
            refund_amount: refund_amount,
            isrefund: isrefund,
            rentals: Rentals[item],
          };
          this.diffrecords.push(rentals_data);
          //差額用のPOSTデータを作成
          for (let diff in this.diffrecords) {
            let rec = this.diffrecords[diff].rentals;
            let diffparam = this.diffrecords[diff];
            let addPost: RentalDiffForm = {
              parent_id: rec.id,
              rental_slip_id: rec.rental_slip_id,
              rental_product_id: rec.rental_product_id,
              rental_item_count: 1,
              rental_fee: 0,
              delivery_division_id: rec.delivery_division_id,
              delivery_date: rec.delivery_date,
              delivery_price: rec.delivery_price,
              collection_division_id: rec.collection_division_id,
              collection_date: rec.collection_date,
              collection_price: rec.collection_price,
              scheduled_rental_date: rec.scheduled_rental_date,
              rental_date: rec.rental_date,
              scheduled_return_date: rec.scheduled_return_date,
              //"return_date": "",
              delinquency_flag: rec.delinquency_flag,
              late_fee: diffparam.refund_amount,
              rental_employee_id: rec.rental_employee_id,
              //"return_employee_id": rec.return_employee_id,
              delivery_charge_flag: rec.delivery_charge_flag,
              late_return_reported: rec.late_return_reported,
              grace_period_end: rec.grace_period_end,
              settle_status_division_id: rec.settle_status_division_id,
            };
            this.addDiffRecord.push(addPost);
            // console.log(this.addDiffRecord);
          }
        }
        // add view  refund msg
        this.refund_msg = '';
        if (this.diffrecords.length > 0) {
          this.refund_msg = this.REFOUND_MSG;
        }
        // this.diffrecords new record
      })
    );
  }
  /**
   * editFc.dateGroup.controls.return_date
   */
  checkingTheRentalEditPeriod(ProductData: RentalProduct[], Rentals: Rental[]) {
    /** 担当者選択 */
    this.subscription.add(
      this.editFc.dateGroup.controls.return_date.valueChanges.subscribe(
        (value) => {
          if (value === null || value === undefined || value === '') {
            return;
          }
          let num = 0;
          this.diffrecords = [];
          for (let item in Rentals) {
            let product = ProductData.filter((x) => {
              return x.id == Rentals[item].rental_product_id;
            });
            if (product.length === 0) {
              continue;
            }

            let after_rental_fee: any = this.calculateRentalFee(
              product[0],
              new Date(Rentals[item].scheduled_rental_date).toISOString(),
              new Date(value).toISOString()
            );
            let before_rental_fee = Rentals[item].rental_fee;
            let refund_amount: number | 0 = after_rental_fee
              ? after_rental_fee - before_rental_fee
              : 0;
            let isrefund = refund_amount < 0 ? true : false;

            //Rental Edit
            if (refund_amount >= 0) {
              return;
            }

            //Rental Edit

            let rentals_data: recalculationRentalFee = {
              id: Rentals[item].id,
              product: product[0],
              scheduled_rental_date: new Date(
                Rentals[item].scheduled_rental_date
              ).toISOString(),
              return_date: new Date(value).toISOString(),
              before_rental_fee: before_rental_fee,
              after_rental_fee: after_rental_fee,
              refund_amount: refund_amount,
              isrefund: isrefund,
              rentals: Rentals[item],
            };
            this.diffrecords.push(rentals_data);
            //差額用のPOSTデータを作成
            for (let diff in this.diffrecords) {
              let rec = this.diffrecords[diff].rentals;
              let diffparam = this.diffrecords[diff];
              let addPost: RentalDiffForm = {
                parent_id: rec.id,
                rental_slip_id: rec.rental_slip_id,
                rental_product_id: rec.rental_product_id,
                rental_item_count: 1,
                rental_fee: 0,
                delivery_division_id: rec.delivery_division_id,
                delivery_date: rec.delivery_date,
                delivery_price: rec.delivery_price,
                collection_division_id: rec.collection_division_id,
                collection_date: rec.collection_date,
                collection_price: rec.collection_price,
                scheduled_rental_date: rec.scheduled_rental_date,
                rental_date: rec.rental_date,
                scheduled_return_date: rec.scheduled_return_date,
                //"return_date": "",
                delinquency_flag: rec.delinquency_flag,
                late_fee: diffparam.refund_amount,
                rental_employee_id: rec.rental_employee_id,
                //"return_employee_id": rec.return_employee_id,
                delivery_charge_flag: rec.delivery_charge_flag,
                late_return_reported: rec.late_return_reported,
                grace_period_end: rec.grace_period_end,
                settle_status_division_id: rec.settle_status_division_id,
              };
              this.addDiffRecord = [addPost];
              // console.log(this.addDiffRecord);
            }
            num++;
          }
          // add view  refund msg
          this.refund_msg = '';
          if (this.diffrecords.length > 0) {
            this.refund_msg = this.REFOUND_MSG;
          }
          // this.diffrecords new record
        }
      )
    );
  }
  /**
   * setUp Diff_employee
   */
  setUpDiffEmployee() {
    /** 担当者選択 */
    this.subscription.add(
      this.getEmployeeByIdFcDiff.get_return_employee_id.valueChanges.subscribe(
        (value) => {
          if (value === null || value === undefined || value === '') {
            return;
          }
          this.getEmployeeByIdDiff(value);
        }
      )
    );
  }
  /**
   * 初期値設定
   * setDefault value Rental.Return _employee_id
   * @param return_employee_id
   *
   * @returns void
   */
  setDiffEmployeeDefaultValue(return_employee_id: any): void {
    /* 初期値がある場合セット*/
    if (return_employee_id) {
      this.getEmployeeByIdDiff(String(return_employee_id));
    }
  }

  /**
   * setUp Rental.Return _employee
   */
  setUpRentalReturnEmployee() {
    /** 担当者選択 */
    if (this.rentalItemStatus === false) {
      // 貸出のみ
      this.subscription.add(
        this.getEmployeeByIdFcRental.get_rental_employee_id.valueChanges.subscribe(
          (value) => {
            if (value === null || value === undefined || value === '') {
              return;
            }
            this.getEmployeeByIdRental(value);
          }
        )
      );
    } else {
      // 貸出・返却両方使用可能
      this.subscription.add(
        this.getEmployeeByIdFcRental.get_rental_employee_id.valueChanges.subscribe(
          (value) => {
            if (value === null || value === undefined || value === '') {
              return;
            }
            this.getEmployeeByIdRental(value);
          }
        )
      );

      this.subscription.add(
        this.getEmployeeByIdFcReturn.get_return_employee_id.valueChanges.subscribe(
          (value) => {
            if (value === null || value === undefined || value === '') {
              return;
            }
          }
        )
      );
    }
  }
  /**
   * 初期値設定
   * setDefault value Rental.Return _employee_id
   * @param rental_employee_id
   * @param return_employee_id
   *
   * @returns void
   */
  setRentalReturnEmployeeDefaultValue(
    rental_employee_id: any,
    return_employee_id: any
  ): void {
    /* 初期値がある場合セット*/
    if (rental_employee_id) {
      this.getEmployeeByIdRental(String(rental_employee_id));
    }
    if (return_employee_id) {
      this.getEmployeeByIdReturn(String(return_employee_id));
    }
  }
  /**
   * レンタル商品追加フォームのキャンセルボタン対応
   * フォームをリセットする
   */
  addFormCancel() {
    // 追加フォームを閉じる
    this.addFormIsOpen = false;
    // 追加フォームの値をリセット
    this.formService.resetAddForm(this.addForm);
    // 選択中レンタル明細をリセット
    this.addTarget = <Rental>{};
    // 選択中商品をリセット
    this.addTargetProduct = <RentalProduct>{};
  }

  /**
   * 編集フォームがキャンセルされた時の処理
   * 編集対象へ空のオブジェクトをセットし各要素を空にする
   */
  editFormCancel() {
    // 編集フォームを閉じる
    this.editFormIsOpen = false;
    // 編集フォームの値をリセット
    this.resetEditFormValues();
    // 選択中レンタル明細をリセット
    this.editTarget = <Rental>{};
    // 選択中商品をリセット
    this.editTargetProduct = <RentalProduct>{};
    // ボタン判定用変数リセット
    this.selectedCustomerStatus = <SelectedCustomerStatus>{};
  }

  /************************************************
   *********** フォーム関連定義終了
   ************************************************/

  /************************************************
   *********** 料金関連定義開始
   ************************************************/

  // レンタル商品が配送料かどうかのフラグ
  DELIVERY_CHARGE_FLAG_OFF = 0;
  DELIVERY_CHARGE_FLAG_ON = 1;

  /**
   * 配送料金フラグを更新する
   */
  private updateSelectedProductDeliveryChargeFlag(
    rentalProduct: RentalProduct
  ) {
    // 選択中のレンタル商品が配送料金かどうかのフラグを取得
    const selectedProductDeliveryChargeFlag =
      rentalProduct.delivery_charge_flag;
    // 配送料フラグを更新する
    this.selectedProductDeliveryChargeFlag = selectedProductDeliveryChargeFlag;
  }

  /************************************************
   *********** 料金関連定義 終了
   ************************************************/

  /************************************************
   *********** エラーハンドリング定義 開始
   ************************************************/

  /**
   * エラーステータス、エラータイトル、エラーメッセージ、リダイレクト先を作成しhandleError()を実行する
   */
  private createErrorAndExecHandleError(
    message: string,
    redirectPath?: string,
    status?: number,
    title?: string
  ) {
    status = status ? status : 400;
    title = title ? title : this.errorModalTitle;
    redirectPath = redirectPath ? redirectPath : undefined;
    this.errorService.setError({ status, title, message, redirectPath });
  }

  private createHttpErrorAndExecHandleError(
    error: HttpErrorResponse,
    redirectPath?: string
  ) {
    const status = error.status;
    const title = error.error ? error.error.title : 'エラーが発生しました';
    const message = error.error ? error.error.message : error.message;
    redirectPath = redirectPath ? redirectPath : undefined;
    this.errorService.setError({ status, title, message, redirectPath });
  }

  /************************************************
   *********** エラーハンドリング定義 終了
   ************************************************/

  setProcessingUnitsFlag(processing_units: any) {
    this.is_processing_units = false;
    if (processing_units == 1) {
      this.is_processing_units = true;
    }
  }
  /**
   * 更新モードかどうか判断する
   */
  isEditing(): boolean {
    // 編集モードかどうか判断するフラグ
    return this.editTarget && Object.keys(this.editTarget).length > 0
      ? true
      : false;
  }

  /**
   * パスパラメータを取得し値の検証を行う。値が正常であればメンバへセットする
   * 値が不正であればモーダル画面を表示して一覧画面へ戻す
   *
   * @returns void
   */
  private initRentalSlipId() {
    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];
    // パスパラメータ正当性確認
    const selectedIdIsInvalid: boolean = isParameterInvalid(selectedId);
    // エラーならモーダルを表示して一覧画面へ戻す
    if (selectedIdIsInvalid) {
      this.createErrorAndExecHandleError(
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }
    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);
  }

  /**
   * Angularライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    this.router.onSameUrlNavigation = 'reload';

    // 各フォームを作成
    this.statusForm = this.formService.createStatusForm(this.fb);
    this.addForm = this.formService.createAddForm(this.fb);
    this.editForm = this.formService.createEditForm(this.fb);
    this.bulkForm = this.formService.createBulkForm(this.fb);
    this.diffForm = this.formService.createDiffForm(this.fb);
    // パスパラメータから受付票IDを作成
    this.initRentalSlipId();

    // barcode番号を作成
    this.barcodeValue =
      this.rsConst.CALLED_NUMBER_PREFIX +
      this.selectedId.toString().padStart(11, '0');

    // 受付票IDで編集画面へのパスを作成
    this.editPagePath = this.listPagePath + '/edit/' + this.selectedId;

    // 新規登録のレンタル期間の値が変更を購読する
    this.subscription.add(
      this.addFc.scheduledDateGroup.valueChanges.subscribe((dates) => {
        if (isObjectEmptyOrNull(dates)) {
          return;
        }
        if (
          isEmptyOrNull(dates.scheduled_rental_date) ||
          isEmptyOrNull(dates.scheduled_return_date)
        ) {
          return;
        }
        this.calculateAndSetRentalFee(
          dates.scheduled_rental_date,
          dates.scheduled_return_date
        );
      })
    );

    // 編集のレンタル期間の値が変更を購読する
    this.subscription.add(
      this.editFc.scheduledDateGroup.valueChanges.subscribe((value) => {
        if (Object.keys(value).length === 0) {
          return;
        }
        if (
          isEmptyOrNull(value.scheduled_rental_date) ||
          isEmptyOrNull(value.scheduled_return_date)
        ) {
          return;
        }
        this.calculateAndSetRentalFee(
          value.scheduled_rental_date,
          value.scheduled_return_date
        );
      })
    );

    // 初期化処理実行
    this.initialization(this.selectedId);
  }

  // addRentalProduct() {
  //   // console.log('商品追加');
  // }

  // 対象のレンタル受付票を取得

  // 新規登録対象レンタル商品の取得

  // 編集対象レンタル明細の取得

  // 編集対象レンタル商品の取得

  // レンタル期間の算出

  // レンタル料金の算出

  // レンタル明細の新規登録

  // レンタル明細の更新

  /**
   * 受付票発行
   */
  issueReceipt() {
    // ローディング開始
    this.common.loading = true;

    // ポスト用データ作成
    const postData = {
      customer_type_division_id: this.rs.customer_type_division_id,
      store_id: this.rs.store_id,
      client_id: this.rs.client_id,
      member_id: this.rs.member_id,
      mobile_number: this.rs.mobile_number,
      shipping_address: this.rs.shipping_address,
      status_division_id: this.statusDivisionOptions.find(
        (x) => x.text === this.rsConst.STATUS.TICKET_ISSUED
      )?.value,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
      reception_tag: this.reception_tag,
      reception_date: this.rs.reception_date,
      reception_employee_id: this.rs.reception_employee_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      processing_units: this.rs.processing_units,
    };

    this.subscription.add(
      this.rsService
        .update(this.rs.id, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.createHttpErrorAndExecHandleError(res, this.listPagePath);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.common.loading = false;
            this.createErrorAndExecHandleError(
              'レンタル受付票の発行に失敗しました。一覧画面へ戻ります。',
              this.listPagePath
            );
            return;
          }

          // 表示用データを更新する
          this.subscription.add(this.updateSlipInfo().subscribe());

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.common.loading = false;
        })
    );
  }

  /**
   * レンタル商品名のサジェストを取得
   * @returns
   */
  getAddFormProductNameSuggests(): ApiInput<RentalProductApiResponse> {
    return {
      observable: this.rentalProductService.getAll({
        // 商品名で検索
        name: this.addFc.name.value,
        // ステータスが貸出可能な商品に絞り込む
        status_division_id: this.rentalProductStatusRentable.id,
        // 公開区分が公開中の商品に絞り込む
        data_permission_division_id: this.rentalProductDataPermissionPublish.id,
      }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }

  /**
   * レンタル商品名のサジェストで選択肢が選択された時の処理（選択した商品のidを取得）
   * idサジェストの値をリセットし、rental_product_idへ値をセットする
   * @param id レンタル商品ID string
   */
  onNameSuggestIdChange(id: string) {
    this.addFc.id.reset('', { emitEvent: false });
    this.addFc.rental_product_id.setValue(id, { emitEvent: false });
  }

  /**
   * レンタル商品名のサジェストで選択肢が選択された時の処理（選択した商品のデータそのものを取得）
   * @param selectedProduct 選択した商品のデータ RentalProduct
   */
  onNameSuggestDataSelected(selectedProduct: RentalProduct) {
    this.addTargetProduct = selectedProduct;
    this.updateSelectedProductDeliveryChargeFlag(selectedProduct);
  }

  /**
   * レンタル商品IDのサジェストを取得
   * @returns
   */
  getAddFormProductIdSuggests(): ApiInput<RentalProductApiResponse> {
    return {
      observable: this.rentalProductService.getAll({
        // 商品IDで検索
        id: this.addFc.id.value,
        // ステータスが貸出可能な商品に絞り込む
        status_division_id: this.rentalProductStatusRentable.id,
        // 公開区分が公開中の商品に絞り込む
        data_permission_division_id: this.rentalProductDataPermissionPublish.id,
      }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }

  /**
   * レンタル商品IDのサジェストでIDが更新された時の処理
   * nameサジェストの値をリセットし、rental_product_idへ値をセットする
   * @param id レンタル商品ID string
   */
  onIdSuggestIdChange(id: string) {
    this.addFc.name.reset('', { emitEvent: false });
    this.addFc.rental_product_id.setValue(id, { emitEvent: false });
  }

  /**
   * レンタル商品IDのサジェストで選択肢が選択された時の処理（選択した商品のデータそのものを取得）
   * @param selectedProduct 選択した商品のデータ RentalProduct
   */
  onIdSuggestDataSelected(selectedProduct: RentalProduct) {
    this.addTargetProduct = selectedProduct;
    this.updateSelectedProductDeliveryChargeFlag(selectedProduct);
  }

  /**
   * サジェストコントロールで追加商品が選択された時の処理
   * @param selectedProduct
   */
  handleAddProductData(selectedProduct: RentalProduct) {
    // 引数が正常に渡って来なかった場合エラーを表示して一覧画面へ戻る
    const selectedProductIsInvalid = isObjectEmptyOrNull(selectedProduct);
    if (selectedProductIsInvalid) {
      this.createErrorAndExecHandleError(
        '選択した商品の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // 選択中商品をメンバへセット
    this.addTargetProduct = selectedProduct;

    // 選択中商品の価格を取得してメンバへセット
    this.selectedProductPrice = selectedProduct.selling_price;

    // 選択中商品の消費税区分を取得
    const taxDivisionText = this.taxDivisionOptions.find(
      (x) => x.value === selectedProduct.sales_tax_division_id
    );

    // 選択中の商品の消費税区分をメンバへセット
    this.taxDivisionText = taxDivisionText ? taxDivisionText.text : '';

    // 選択中商品の配送料フラグの値を取得してメンバへセット
    this.selectedProductDeliveryChargeFlag =
      selectedProduct.delivery_charge_flag;

    // 貸出予定日と返却予定日へデフォルト値をセット
    this.setDefaultValueToAddFormDateGroup();

    // 配送なし区分を取得
    const noDelivery = this.deliveryDivisionOptions.find((x) => {
      return x.text === this.rsConst.DELIVERY_DIVISION.VALUE.NO_DELIVERY;
    });
    // 配送区分へ配送なしをセット
    this.addFc.delivery_division_id.reset(String(noDelivery?.value));

    // 回収なし区分を取得
    const noCollection = this.collectionDivisionOptions.find((x) => {
      return x.text === this.rsConst.COLLECTION_DIVISION.VALUE.NO_COLLECTION;
    });
    // 回収区分へ回収なしをセット
    this.addFc.collection_division_id.reset(String(noCollection?.value));

    // 配送料フラグによってバリデーションを追加・削除
    if (this.selectedProductDeliveryChargeFlag) {
      // 選択された商品が配送料の場合

      // 配送料金へ必須バリデーションを追加
      this.addFc.rental_fee.addValidators([Validators.required]);
      // バリデータが適用された後、コントロールのバリデーション状態を更新
      this.addFc.rental_fee.updateValueAndValidity();
    } else {
      // 選択された商品が配送料以外の場合

      // 配送料金へ必須バリデーションが付与されている場合必須バリデーションを削除
      this.addFc.rental_fee.removeValidators([Validators.required]);
      // バリデータが適用された後、コントロールのバリデーション状態を更新
      this.addFc.rental_fee.updateValueAndValidity();
    }
  }

  /**
   * 編集商品が選択された時の処理
   * @param selectedProduct
   */
  setEditProductData(selectedProduct: RentalProduct) {
    // 選択中商品の価格を取得してメンバへセット
    this.selectedProductPrice = selectedProduct.selling_price;

    // 選択中商品の消費税区分を取得
    const taxDivisionText = this.taxDivisionOptions.find(
      (x) => x.value === selectedProduct.sales_tax_division_id
    );

    // 選択中の商品の消費税区分をメンバへセット
    this.taxDivisionText = taxDivisionText ? taxDivisionText.text : '';

    // 選択中商品の配送料フラグの値を取得してメンバへセット
    this.selectedProductDeliveryChargeFlag = selectedProduct
      ? selectedProduct.delivery_charge_flag
      : this.DELIVERY_CHARGE_FLAG_OFF;
    // 商品が選択された場合に商品の売価を取得
    // 配送料が選択された場合商品IDとレンタル料金以外の必須項目へ値をセット
    if (this.selectedProductDeliveryChargeFlag) {
      // 配送区分をセット
      this.editFc.delivery_division_id.reset(
        String(this.editTarget.division_delivery_value)
      );
      // 回収区分をセット
      this.editFc.collection_division_id.reset(
        String(this.editTarget.division_collection_value)
      );
      // 配送料金へ必須バリデーションを追加
      this.editFc.delivery_price.addValidators([Validators.required]);
      // バリデータが適用された後、コントロールのバリデーション状態を更新
      this.editFc.delivery_price.updateValueAndValidity();
    } else {
      if (this.editTarget && Object.keys(this.editTarget).length > 0) {
        // 配送区分をリセット
        this.editFc.delivery_division_id.patchValue(
          String(this.editTarget.delivery_division_id)
        );
        // 回収区分をリセット
        this.editFc.collection_division_id.patchValue(
          String(this.editTarget.collection_division_id)
        );
        // 貸出予定日と返却予定日、貸出日と返却日をセット
        this.editFc.scheduledDateGroup.controls.scheduled_rental_date.patchValue(
          new Date(this.editTarget.scheduled_rental_date).toISOString()
        );
        this.editFc.scheduledDateGroup.controls.scheduled_return_date.patchValue(
          new Date(this.editTarget.scheduled_return_date).toISOString()
        );
        if (this.editTarget.rental_date) {
          this.editFc.dateGroup.controls.rental_date.patchValue(
            new Date(this.editTarget.rental_date).toISOString()
          );
        } else {
          this.editFc.dateGroup.controls.rental_date.patchValue('');
        }
        if (this.editTarget.rental_date) {
          this.editFc.dateGroup.controls.return_date.patchValue(
            new Date(this.editTarget.return_date).toISOString()
          );
        } else {
          this.editFc.dateGroup.controls.return_date.patchValue('');
        }
        // 配送料金から必須バリデーションを削除
        this.editFc.delivery_price.removeValidators([Validators.required]);
        // バリデータが適用された後、コントロールのバリデーション状態を更新
        this.editFc.delivery_price.updateValueAndValidity();
      } else {
        // 配送区分をリセット
        this.editFc.delivery_division_id.reset('');
        this.editFc.rental_employee_id.reset('');
        this.editFc.return_employee_id.reset('');
        // 回収区分をリセット
        this.editFc.collection_division_id.reset('');
        this.editFc.scheduledDateGroup.controls.scheduled_rental_date.reset('');
        this.editFc.scheduledDateGroup.controls.scheduled_return_date.reset('');
        this.editFc.dateGroup.controls.rental_date.reset('');
        this.editFc.dateGroup.controls.return_date.reset('');
        // 配送料金から必須バリデーションを削除
        this.editFc.delivery_price.removeValidators([Validators.required]);
        // バリデータが適用された後、コントロールのバリデーション状態を更新
        this.editFc.delivery_price.updateValueAndValidity();
      }
    }
  }

  /**
   * レンタル明細からレンタル料金の合計を算出して返却する
   *
   * @param rentals - レンタル明細
   * @returns - レンタル料合計金額
   */
  getTotalAmount(rentals: Rental[]): number {
    // 配列ではない場合
    if (!Array.isArray(rentals)) {
      return 0;
    }
    // 中身が空の場合
    if (rentals.length === 0) {
      return 0;
    }

    let totalAmount: number = 0;
    rentals.forEach((x) => {
      totalAmount += Number(x.rental_fee);
    });

    return totalAmount;
  }
  /**
   * レンタル明細からレンタル滞納・差額料金の合計を算出して返却する
   *
   * @param rentals - レンタル明細
   * @returns - レンタル料合計金額
   */
  getOverdueTotalAmount(rentals: Rental[]): number {
    // 配列ではない場合
    if (!Array.isArray(rentals)) {
      return 0;
    }
    // 中身が空の場合
    if (rentals.length === 0) {
      return 0;
    }

    let overdueTotalAmount: number = 0;

    rentals.forEach((x) => {
      overdueTotalAmount += Number(x.late_fee);
    });

    return overdueTotalAmount;
  }

  /**
   * レンタル明細からレンタル滞納・差額料金の合計を算出して返却する
   *
   * @param rentals - レンタル明細
   * @returns - レンタル料合計金額
   */
  getOverdueRefundTotalAmount(rentals: Rental[]): number {
    // 配列ではない場合
    if (!Array.isArray(rentals)) {
      return 0;
    }
    // 中身が空の場合
    if (rentals.length === 0) {
      return 0;
    }

    let overdueRefundTotalAmount: number = 0;

    rentals.forEach((x) => {
      overdueRefundTotalAmount += x.refund_fee ? x.refund_fee : 0;
    });

    return overdueRefundTotalAmount;
  }

  /**
   * レンタル受付票のstatus_division_idのみ更新する
   *
   * @param statusCode
   * @returns
   */

  statusDivisionIdUpdate(
    status_division_id: number,
    callback: () => void
  ): void {
    // ポスト用データ作成
    const postData = {
      customer_type_division_id: this.rs.customer_type_division_id,
      store_id: this.rs.store_id,
      client_id: this.rs.client_id,
      member_id: this.rs.member_id,
      mobile_number: this.rs.mobile_number,
      shipping_address: this.rs.shipping_address,
      status_division_id: status_division_id,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
      reception_tag: this.rs.reception_tag,
      reception_date: this.rs.reception_date,
      reception_employee_id: this.rs.reception_employee_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      processing_units: this.rs.processing_units,
    };
    this.subscription.add(
      this.rsService
        .update(this.rs.id, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (callback && typeof callback === 'function') {
            callback();
          }
          return;
        })
    );
  }
  /**
   * レンタル受付票のステータスを更新する
   *
   * @param statusCode
   * @returns
   */
  statusUpdate() {
    // フォームの値を取得
    const formVal = this.statusForm.value;

    // ローディング開始
    this.common.loading = true;

    // ポスト用データ作成
    const postData = {
      customer_type_division_id: this.rs.customer_type_division_id,
      store_id: this.rs.store_id,
      client_id: this.rs.client_id,
      member_id: this.rs.member_id,
      mobile_number: this.rs.mobile_number,
      shipping_address: this.rs.shipping_address,
      status_division_id: formVal.status_division_id,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
      reception_tag: formVal.reception_tag,
      reception_date: this.rs.reception_date,
      reception_employee_id: formVal.reception_employee_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      processing_units: formVal.processing_units,
    };

    this.subscription.add(
      this.rsService
        .update(this.rs.id, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.createHttpErrorAndExecHandleError(res, this.listPagePath);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.common.loading = false;
            this.createErrorAndExecHandleError(
              'レンタル受付票のステータス更新に失敗しました。一覧画面へ戻ります。',
              this.listPagePath
            );
            return;
          }

          //let nav_url = this.listPagePath + '/detail/' + String(this.rs.id);
          //this.router.navigateByUrl(nav_url);
          window.location.reload();
          // 表示用データを更新する
          //this.subscription.add(this.updateSlipInfo().subscribe());
          //const purpose: FlashMessagePurpose = 'success';
          //this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          //this.common.loading = false;
        })
    );
  }

  /**
   * 選択中の受付票idで受付票と紐付くレンタルを取得するObservableを返却する
   * @returns Observable CustomerOrderReceptionSlipService.find(), CustomerOrderService.getAll()
   */
  updateSlipInfo(): Observable<any> {
    this.common.loading = true;
    // Return the Observable directly
    return forkJoin([
      this.rsService.find(this.selectedId),
      this.rentalService.getAll({ rental_slip_id: this.selectedId }),
    ]).pipe(
      catchError((error: HttpErrorResponse) => {
        return of(error);
      }),
      finalize(() => (this.common.loading = false)),
      tap((res) => {
        if (res instanceof HttpErrorResponse) {
          this.createHttpErrorAndExecHandleError(res, this.listPagePath);
          return;
        }

        if (res === null || res === undefined) {
          this.common.loading = false;
          this.createErrorAndExecHandleError(
            'レンタル受付票の取得に失敗しました。一覧画面へ戻ります。',
            this.listPagePath
          );
          return;
        }

        // レスポンスが配列であり配列の要素が2つあるか
        if (Array.isArray(res) && res.length !== 2) {
          this.common.loading = false;
          this.createErrorAndExecHandleError(
            'レンタル受付票の取得に失敗しました。一覧画面へ戻ります。',
            this.listPagePath
          );
          return;
        }
        // レンタル受付票を更新
        this.rs = res[0].data[0];
        // 最終更新者のフルネーム作成
        this.updaterFullName =
          this.rs.employee_updated_last_name +
          ' ' +
          this.rs.employee_updated_first_name;

        // 受付担当者のフルネーム作成
        this.receptionEmployeeFullName =
          this.rs.employee_reception_last_name +
          ' ' +
          this.rs.employee_reception_first_name;

        // 受付日時のフォーマットを調整
        this.receptionDate = new Date(this.rs.reception_date).toLocaleString();

        // 紐付くレンタル明細
        /**
         * filterだとpushされるので一旦初期化
         */
        this.rentals = [];
        this.overdue_rentals = [];

        // 紐付くレンタル明細の日付表示のフォーマットを調整
        this.rentals = res[1].data;
        if (res[1].data.length > 0) {
          const t = res[1].data.map((rental) => {
            rental.scheduled_rental_date = new Date(
              rental.scheduled_rental_date
            ).toLocaleDateString();
            rental.rental_date = rental.rental_date
              ? new Date(rental.rental_date).toLocaleDateString()
              : '';
            rental.scheduled_return_date = new Date(
              rental.scheduled_return_date
            ).toLocaleDateString();
            rental.return_date = rental.return_date
              ? new Date(rental.return_date).toLocaleDateString()
              : '';
            return rental;
          });
        }

        // Rental item 判定用
        let rental_length_boolean = res[1].data.length > 0 ? true : false;
        this.isDelivery = this.deliveryDomain.isRentalDelivery(res[1].data);

        if (rental_length_boolean) {
          const t = res[1].data.map((rental) => {
            rental.scheduled_rental_date = this.dateToString(
              rental.scheduled_rental_date
            );
            rental.rental_date = this.dateToString(rental.rental_date);
            rental.scheduled_return_date = this.dateToString(
              rental.scheduled_return_date
            );
            rental.return_date = this.dateToString(rental.return_date);
            return rental;
          });
        }

        // Rentals
        /**
         * parent data
         */

        const a = res[1].data.filter((x) => {
          if (this.returnStringValue(x.rental_employee_id) != '') {
            this.rental_employee = this.returnStringValue(x.rental_employee_id);
          }
          if (this.returnStringValue(x.return_employee_id) != '') {
            this.return_employee = this.returnStringValue(x.return_employee_id);
          }
          return !x.parent_id;
        });
        /**
         *
         * child data
         */

        this.overdue_rentals = res[1].data.filter((x) => {
          if (this.returnStringValue(x.return_employee_id) != '') {
            this.overdue_return_employee = this.returnStringValue(
              x.return_employee_id
            );
          }
          // id に基づいたステータスの割り振り
          if (x.late_fee > 0) {
            x.overdue_rentals_status_name = String(this.DIFF_STAUS_DETENTION);
          } else if (x.refund_fee && x.refund_fee > 0) {
            x.overdue_rentals_status_name = String(this.DIFF_STAUS_REFUND);
          }

          return x.parent_id;
        });
        /**
         * Start: settig bulkFrom
         *   必要な初期値をセットする(処理単位が受付表単位のときのみ)
         */
        if (this.is_processing_units === false) {
          // set initial datetime
          // set scheduled rental_date return_date
          // レンタル個票登録の日付を取得_連番0
          // console.log(this.rentals);
          if (rental_length_boolean) {
            this.rental_date_values['scheduled_rental_date'] =
              this.rentals[this.SELECT_RENRAL_LIST_ID].scheduled_rental_date;
            this.rental_date_values['scheduled_return_date'] =
              this.rentals[this.SELECT_RENRAL_LIST_ID].scheduled_return_date;
            this.rental_date_values['rental_date'] =
              this.rentals[this.SELECT_RENRAL_LIST_ID].rental_date;

            this.rental_date_values['return_date'] = this.sanitizeDate(
              this.rentals[this.SELECT_RENRAL_LIST_ID].return_date
            );
          }

          if (this.overdue_rentals.length > 0) {
            this.diff_date_values['scheduled_rental_date'] =
              this.overdue_rentals[
                this.SELECT_RENRAL_LIST_ID
              ].scheduled_rental_date;
            this.diff_date_values['scheduled_return_date'] =
              this.overdue_rentals[
                this.SELECT_RENRAL_LIST_ID
              ].scheduled_return_date;
            this.diff_date_values['rental_date'] =
              this.overdue_rentals[this.SELECT_RENRAL_LIST_ID].rental_date;

            this.diff_date_values['return_date'] = this.sanitizeDate(
              this.overdue_rentals[this.SELECT_RENRAL_LIST_ID].return_date
            );
          }
          // check rental_date
          if (
            this.rental_date_values.rental_date === '' ||
            this.rental_date_values.rental_date === null ||
            this.rental_date_values.rental_date === undefined
          ) {
            this.rentalItemStatus = false;
          } else {
            this.rentalItemStatus = true;
          }

          // set rental_date return_date
          this.bulkFromInitialize(this.rental_date_values);

          // set Rental Return employee_id Controle
          this.setUpRentalReturnEmployee();

          // set Rental Return employee_id Default value
          this.setRentalReturnEmployeeDefaultValue(
            this.rental_employee,
            this.return_employee
          );
        }
        /**
         * End: settig bulkFrom
         */
        /**
         * Start: settig diffFrom
         *   必要な初期値をセットする(処理単位が受付表単位のときのみ)
         */
        if (this.overdue_rentals.length > 0) {
          this.set_overdue_rentals = true;
          this.diffFromInitialize(this.diff_date_values);
          this.setUpDiffEmployee();
          this.setDiffEmployeeDefaultValue(this.overdue_return_employee);
        }

        // 配送があるか確認
        if (this.rentals.length > 0) {
          this.isDeliveryRequested = this.isDeliveryRequestedRentals(
            this.rentals
          );
        }

        // 合計金額を取得
        this.totalAmount = this.getTotalAmount(this.rentals);
        this.overdue_totalAmount = this.getOverdueTotalAmount(
          this.overdue_rentals
        );
        this.overdue_refund_totalAmount = this.getOverdueRefundTotalAmount(
          this.overdue_rentals
        );
        //this.overdue_totalAmount = this.overdue_totalAmount - this.overdue_refund_totalAmount;

        // ステータスフォームのステータスを更新
        this.statusForm.reset({
          status_division_id: String(this.rs.status_division_id),
          reception_employee_id: String(this.rs.reception_employee_id),
          reception_tag: String(this.rs.reception_tag),
          processing_units: String(this.rs.processing_units),
        });
        this.setProcessingUnitsFlag(this.rs.processing_units);
        this.common.loading = false;
      })
    );
  }

  /**
   * レンタル予約の配列を受け取り、配送の予定があるかどうかを返す
   * @param rentals
   * @returns - boolean 配送あり: true 配送なし: false
   */
  isDeliveryRequestedRentals(rentals: Rental[]): boolean {
    return rentals.some(
      (rental) =>
        rental.division_delivery_value ===
        this.rsConst.DELIVERY_DIVISION.VALUE.DELIVERY_INCLUDED
    );
  }

  sanitizeDate(dateStr: string): string | null {
    if (!dateStr || dateStr === 'NaT' || dateStr === 'Invalid Date') {
      return '';
    } else {
      return dateStr;
    }
  }

  /**
   * 初回画面表示に必要な情報を取得する
   *
   * @param selectedId
   */
  private initialization(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    // レンタル受付票データとレンタル受付票表示に必要な付帯データを取得
    this.subscription.add(
      forkJoin([
        this.rsService.find(selectedId),
        this.rentalService.getAll({ rental_slip_id: selectedId }),
        this.biService.find(),
        this.divisionService.getAll(),
        this.employeeService.getAll(),
        this.deliveryService.getAll({ rs_slip_id: selectedId }),
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
            this.createHttpErrorAndExecHandleError(res, this.listPagePath);
            return;
          }
          // その他エラーの対処
          if (this.createErrorMessage(res) === false) {
            return;
          }
          // 受付タグが必須じゃないステータスコード
          const notRequireCodes = this.getStatusIdForNotRequiredReceptionTag();

          this.rs = res[0].data[0];
          if (notRequireCodes.includes(Number(this.rs.division_status_code))) {
            //console.log("this.receptionTagNotRequired");
            this.receptionTagNotRequired();
          }
          this.deliveries = res[5].data;
          this.setProcessingUnitsFlag(this.rs.processing_units);

          const status_form = {
            status_division_id: String(this.rs.status_division_id),
            reception_employee_id: String(this.rs.reception_employee_id),
            reception_tag: String(this.rs.reception_tag),
            processing_units: String(this.rs.processing_units),
          };

          /* フォーム値格納*/
          this.statusForm.patchValue(status_form);

          const employees = res[4].data;
          // 受付担当者選択肢
          // 社員データセット
          this.employeeSuggests = employees.map((e) => {
            return { value: e.id, text: e.last_name + ' ' + e.first_name };
          });

          //受付タグ
          this.reception_tag = '';

          // 最終更新者のフルネーム作成
          this.updaterFullName =
            this.rs.employee_updated_last_name +
            ' ' +
            this.rs.employee_updated_first_name;

          this.receptionEmployeeFullName =
            this.rs.employee_reception_last_name +
            ' ' +
            this.rs.employee_reception_first_name;

          // 受付日時のフォーマットを調整
          this.receptionDate = new Date(
            this.rs.reception_date
          ).toLocaleString();

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

          // 配送料判定フラグに初期値として0をセット
          this.selectedProductDeliveryChargeFlag =
            this.DELIVERY_CHARGE_FLAG_OFF;

          // 全ての区分を取得
          const divisions = res[3].data;
          // 商品ステータス区分取得
          const productStatusDivisions = divisions.filter((x) => {
            return x.name === divisionConst.RENTAL_PRODUCT_STATUS;
          });

          // 貸出可能なレンタル商品ステータス区分を取得
          const rentalProductStatusRentable = productStatusDivisions.find(
            (x) => {
              return x.value === rentalProductConst.STATUS.RENTABLE;
            }
          );
          if (rentalProductStatusRentable) {
            this.rentalProductStatusRentable = rentalProductStatusRentable;
          }
          this.rentalProductStatusCode = divisions.filter((x) => {
            return x.name === divisionConst.RENTAL_PRODUCT_STATUS;
          });
          /**
           * レンタル商品設定用のdivision_idを取得する
           */
          const dummy = productStatusDivisions.filter((x) => {
            if (x.division_code === rentalProductConst.STATUS_CODE.RESERVED) {
              this.PRODUCT_STATUS_DIVISION_RESERVED = x.id;
            }
            if (x.division_code === rentalProductConst.STATUS_CODE.RENTED) {
              this.PRODUCT_STATUS_DIVISION_RENTED = x.id;
            }
            if (x.division_code === rentalProductConst.STATUS_CODE.RETURNED) {
              this.PRODUCT_STATUS_DIVISION_RETURNED = x.id;
            }
            if (x.division_code === rentalProductConst.STATUS_CODE.CLEANING) {
              this.PRODUCT_STATUS_DIVISION_CLEANING = x.id;
            }

            return;
          });

          // データ公開区分取得
          const rentalProductPublishDivisions = divisions.filter((x) => {
            return x.name === divisionConst.DATA_PERMISSION;
          });
          // レンタル商品公開区分の公開を取得
          const rentalProductDataPermissionPublish =
            rentalProductPublishDivisions.find((x) => {
              return x.value === '公開中';
            });
          if (rentalProductDataPermissionPublish) {
            this.rentalProductDataPermissionPublish =
              rentalProductDataPermissionPublish;
          }

          // 消費税区分選択肢
          const taxDivisions = divisions.filter((x) => {
            return x.name === divisionConst.SALES_TAX;
          });
          this.taxDivisionOptions = taxDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });

          // 配送区分
          const deliveryDivisions = divisions.filter((x) => {
            return x.name === divisionConst.DELIVERY_REQUEST;
          });

          // 配送区分選択肢作成
          const deliveryDivisionOptions = deliveryDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          this.deliveryDivisionOptions = [
            ...this.deliveryDivisionOptions,
            ...deliveryDivisionOptions,
          ];

          // 回収区分
          const collectionDivisions = divisions.filter((x) => {
            return x.name === divisionConst.COLLECTION_REQUEST;
          });

          // 回収区分選択肢作成
          const collectionDivisionOptions = collectionDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          this.collectionDivisionOptions = [
            ...this.collectionDivisionOptions,
            ...collectionDivisionOptions,
          ];
          // 受付票ステータス区分選択肢作成
          const statusDivisions = divisions.filter((x) => {
            return x.name === divisionConst.RENTAL_SLIP_STATUS;
          });

          this.statusDivisionOptions = statusDivisions.map((x) => {
            const notRequired = notRequireCodes.includes(x.division_code);
            if (notRequired) {
              this.reception_tag_require_status_divisions.push(x.id);
            }
            return { value: x.id, text: x.value };
          });
          // console.log("this.reception_tag_require_status_divisions:: ", this.reception_tag_require_status_divisions);
          this.subscriptionStatusDivisionIdUpdate();

          // 精算ステータス区分の精算前ステータスを取得
          const settleStatusDivisions = divisions.filter((x) => {
            return x.name === divisionConst.SETTLE_STATUS;
          });
          const settleStatusBeforeSettle = settleStatusDivisions.find((x) => {
            return (
              x.value === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED
            );
          });
          if (settleStatusBeforeSettle) {
            this.settleStatusDivision = settleStatusBeforeSettle;
          }

          if (
            this.rs &&
            this.rs.division_customer_type_code ===
              Number(this.DIVISION_CUSTOMER_CODE_GENERAL)
          ) {
            const today = new Date();
            const idConfirmationDate = this.rs
              .identification_document_confirmation_date
              ? new Date(
                  this.rs.identification_document_confirmation_date
                ).toLocaleDateString()
              : '';

            // 今日の日付と比較して本人確認書類の確認日が1年以上前の場合は本人確認書類の確認が必要
            // 本人確認書類確認日が空の場合も本人確認書類の確認が必要かどうか
            // true:必要 false:不要
            const isIdConfirmationRequired =
              idConfirmationDate === '' ||
              new Date(idConfirmationDate) <=
                new Date(
                  today.getFullYear() - 1,
                  today.getMonth(),
                  today.getDate()
                );

            this.selectedCustomer = {
              type: Number(this.DIVISION_CUSTOMER_CODE_GENERAL),
              customer_type_code: String(this.rs.customer_type_division_id),
              id: String(this.rs.id),
              fullName: this.rs.last_name + ' ' + this.rs.first_name,
              fullNameKana:
                this.rs.last_name_kana + '' + this.rs.first_name_kana,
              address: this.rs.shipping_address ? this.rs.shipping_address : '',
              tel: this.rs.tel ? this.rs.tel : '',
              identification_document_confirmation_date: this.rs
                .identification_document_confirmation_date
                ? this.rs.identification_document_confirmation_date
                : '',
              idConfirmationDate:
                idConfirmationDate === '' ? '未確認' : idConfirmationDate,
              isIdConfirmationRequired: isIdConfirmationRequired,
            };
            this.idConfirmationDate = isIdConfirmationRequired;

            this.generalFc.identification_document_confirmation_date.patchValue(
              idConfirmationDate
            );

            if (isIdConfirmationRequired === false) {
              this.generalFc.idConfirmationDate_check.patchValue(true);
              this.generalFc.identification_document_confirmation_date.setValue(
                idConfirmationDate
              );
              this.selectedCustomer.identification_document_confirmation_date =
                idConfirmationDate;
              this.selectedCustomer.isIdConfirmationRequired = true;
            } else {
              this.generalFc.idConfirmationDate_check.patchValue(false);
              this.generalFc.identification_document_confirmation_date.setValue(
                ''
              );
              this.selectedCustomer.identification_document_confirmation_date =
                '';
              this.selectedCustomer.isIdConfirmationRequired = false;
            }
          }

          /** 受付表単位コントロール部分ステータス設定*/

          /**貸出・返却　初期値/ */

          // Rental item 判定用
          let rental_length_boolean = res[1].data.length > 0 ? true : false;
          this.isDelivery = this.deliveryDomain.isRentalDelivery(res[1].data);

          // レンタル日が子データに一つでもある場合true;
          let seted_rental_date: boolean = false;
          let seted_rental_rental_employee_id: boolean = false;

          if (rental_length_boolean) {
            const t = res[1].data.map((rental) => {
              rental.scheduled_rental_date = this.dateToString(
                rental.scheduled_rental_date
              );
              rental.rental_date = this.dateToString(rental.rental_date);
              rental.scheduled_return_date = this.dateToString(
                rental.scheduled_return_date
              );
              rental.return_date = this.dateToString(rental.return_date);

              if (rental.rental_date) {
                seted_rental_date = true;
              }
              if (rental.rental_employee_id) {
                seted_rental_rental_employee_id = true;
              }

              return rental;
            });

            if (
              this.rs &&
              this.rs.division_customer_type_code ===
                Number(this.DIVISION_CUSTOMER_CODE_MEMBER)
            ) {
              this.selectedCustomerStatus.type = String(
                this.rs.division_customer_type_code
              );
              this.selectedCustomerStatus.rental_employee_id =
                seted_rental_rental_employee_id;
              this.selectedCustomerStatus.reception_tag = this.rs.reception_tag
                ? true
                : false;
            } else if (
              this.rs &&
              this.rs.division_customer_type_code ===
                Number(this.DIVISION_CUSTOMER_CODE_CLIENT)
            ) {
              this.selectedCustomerStatus.type = String(
                this.rs.division_customer_type_code
              );
              this.selectedCustomerStatus.rental_employee_id =
                seted_rental_rental_employee_id;
              this.selectedCustomerStatus.reception_tag = this.rs.reception_tag
                ? true
                : false;
            } else {
              this.selectedCustomerStatus.type = String(
                this.rs.division_customer_type_code
              );
              this.selectedCustomerStatus.rental_employee_id =
                seted_rental_rental_employee_id;
              this.selectedCustomerStatus.reception_tag = this.rs.reception_tag
                ? true
                : false;
            }

            if (this.is_processing_units === false) {
              // 受付単位
              this.bulkFc.rental_employee_id.valueChanges.subscribe(
                (rental_employee_id) => {
                  this.selectedCustomerStatus.rental_employee_id = true;
                }
              );
            }
            // Rentals
            /**
             * parent data
             */
            this.rentals = res[1].data.filter((x) => {
              // 滞納報告
              if (x.late_return_reported > 0) {
                this.bulk_late_return_reported = x.late_return_reported;
              }

              if (this.returnStringValue(x.rental_employee_id) != '') {
                this.rental_employee = this.returnStringValue(
                  x.rental_employee_id
                );
              }
              if (this.returnStringValue(x.return_employee_id) != '') {
                this.return_employee = this.returnStringValue(
                  x.return_employee_id
                );
              }
              // rental_date の有無()
              if (this.dateToString(x.rental_date) != '') {
                this.boolean_rental_date = true;
              }
              // return_date の有無()
              if (this.dateToString(x.return_date) != '') {
                this.boolean_return_date = true;
              }
              return !x.parent_id;
            });

            /**
             *
             * child data
             */
            this.overdue_rentals = res[1].data.filter((x) => {
              if (this.returnStringValue(x.return_employee_id) != '') {
                this.overdue_return_employee = this.returnStringValue(
                  x.return_employee_id
                );
              }
              // id に基づいたステータスの割り振り
              if (x.late_fee > 0) {
                x.overdue_rentals_status_name = String(
                  this.DIFF_STAUS_DETENTION
                );
                this.overdue_rentals_ad_status = 'late_fee';
              } else if (x.refund_fee && x.refund_fee > 0) {
                x.overdue_rentals_status_name = String(this.DIFF_STAUS_REFUND);
                this.overdue_rentals_ad_status = 'refund_fee';
              }
              // return_dateの有無
              if (this.dateToString(x.return_date) != '') {
                x.return_date = this.sanitizeDate(x.return_date)
                  ? String(this.sanitizeDate(x.return_date))
                  : '';

                this.boolean_receipt_date = true;
              }
              // return_dateのクリーニング

              return x.parent_id;
            });

            /**
             * Start: settig bulkFrom
             *   必要な初期値をセットする(処理単位が受付表単位のときのみ)
             */
            if (this.is_processing_units === false) {
              // set initial datetime
              // set scheduled rental_date return_date
              // レンタル個票登録の日付を取得_連番0
              if (rental_length_boolean) {
                this.rental_date_values['scheduled_rental_date'] = this.rentals[
                  this.SELECT_RENRAL_LIST_ID
                ].scheduled_rental_date
                  ? this.rentals[this.SELECT_RENRAL_LIST_ID]
                      .scheduled_rental_date
                  : '';
                this.rental_date_values['scheduled_return_date'] = this.rentals[
                  this.SELECT_RENRAL_LIST_ID
                ].scheduled_return_date
                  ? this.rentals[this.SELECT_RENRAL_LIST_ID]
                      .scheduled_return_date
                  : '';
                this.rental_date_values['rental_date'] = this.rentals[
                  this.SELECT_RENRAL_LIST_ID
                ].rental_date
                  ? this.rentals[this.SELECT_RENRAL_LIST_ID].rental_date
                  : '';
                this.rental_date_values['return_date'] = this.sanitizeDate(
                  this.rentals[this.SELECT_RENRAL_LIST_ID].return_date
                );
              }

              if (this.overdue_rentals.length > 0) {
                this.diff_date_values['scheduled_rental_date'] =
                  this.overdue_rentals[
                    this.SELECT_RENRAL_LIST_ID
                  ].scheduled_rental_date;
                this.diff_date_values['scheduled_return_date'] =
                  this.overdue_rentals[
                    this.SELECT_RENRAL_LIST_ID
                  ].scheduled_return_date;
                this.diff_date_values['rental_date'] =
                  this.overdue_rentals[this.SELECT_RENRAL_LIST_ID].rental_date;
                this.diff_date_values['return_date'] = this.sanitizeDate(
                  this.overdue_rentals[this.SELECT_RENRAL_LIST_ID].return_date
                );
              }

              // check rental_date
              if (
                this.rental_date_values.rental_date === '' ||
                this.rental_date_values.rental_date === null ||
                this.rental_date_values.rental_date === undefined
              ) {
                this.rentalItemStatus = false;
              } else {
                this.rentalItemStatus = true;
              }
              // set rental_date return_date
              this.bulkFromInitialize(this.rental_date_values);

              // set Rental Return employee_id Controle
              this.setUpRentalReturnEmployee();

              // set Rental Return employee_id Default value
              this.setRentalReturnEmployeeDefaultValue(
                this.rental_employee,
                this.return_employee
              );

              // product_id リストを取得する
              let product_id_list: any = [];
              let product_ids: any = [];

              if (rental_length_boolean) {
                product_id_list = res[1].data.filter((x) => {
                  product_ids.push(x.rental_product_id);
                  return x.rental_product_id;
                });
              }

              const unique_product_ids = Array.from(new Set(product_ids));
              let product_id_list_string = unique_product_ids.join(',');

              // 必要なrentalProduct データを取得しておく
              // 一旦 getAll だが、絞り込み必要
              this.subscription.add(
                forkJoin([
                  this.rentalProductService.getAll({
                    id: product_id_list_string,
                  }),
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
                      this.createHttpErrorAndExecHandleError(
                        res,
                        this.listPagePath
                      );
                      return;
                    }
                    // レスポンスがnull、 undefinedの場合
                    if (res === null || res === undefined) {
                      this.createErrorAndExecHandleError(
                        'レンタル商品のデータ取得に失敗しました。一覧画面へ戻ります。',
                        this.listPagePath
                      );
                      return;
                    }

                    this.ProductData = res[0].data;
                    //this.ProductData.add
                    // return_date への入力の監視(受付表単位)
                    this.checkingTheRentalPeriod(
                      this.ProductData,
                      this.rentals
                    );
                  })
              );
            } else {
              // product_id リストを取得する
              let product_id_list: any = [];
              let product_ids: any = [];

              if (rental_length_boolean) {
                product_id_list = res[1].data.filter((x) => {
                  product_ids.push(x.rental_product_id);
                  return x.rental_product_id;
                });
              }
              const unique_product_ids = Array.from(new Set(product_ids));
              let product_id_list_string = unique_product_ids.join(',');

              // 必要なrentalProduct データを取得しておく
              // 一旦 getAll だが、絞り込み必要
              this.subscription.add(
                forkJoin([
                  this.rentalProductService.getAll({
                    id: product_id_list_string,
                  }),
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
                      this.createHttpErrorAndExecHandleError(
                        res,
                        this.listPagePath
                      );
                      return;
                    }
                    // レスポンスがnull、 undefinedの場合
                    if (res === null || res === undefined) {
                      this.createErrorAndExecHandleError(
                        'レンタル商品のデータ取得に失敗しました。一覧画面へ戻ります。',
                        this.listPagePath
                      );
                      return;
                    }

                    this.ProductData = res[0].data;
                    const tainou = this.overdue_rentals.map((x) => {
                      let yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      let yesterdayDate = yesterday.toDateString();

                      let next_date_scheduled_return_date = new Date(
                        x.scheduled_return_date
                      );
                      next_date_scheduled_return_date.setDate(
                        next_date_scheduled_return_date.getDate() + 1
                      );
                      let next_date =
                        next_date_scheduled_return_date.toDateString();

                      const pr = this.ProductData.map((z) => {
                        let mulych = this.calculateRentalFee(
                          z,
                          String(next_date),
                          String(yesterdayDate)
                        );
                        let a = {
                          price: z.selling_price,
                          pdoduct_id: z.id,
                          calc: mulych,
                        };
                      });
                    });

                    //this.ProductData.add
                    // return_date への入力の監視(受付表単位)
                    this.checkingTheRentalPeriod(
                      this.ProductData,
                      this.rentals
                    );
                  })
              );
            }
            /**
             * End: settig bulkFrom
             */
            /**
             * Start: settig diffFrom
             *   必要な初期値をセットする(処理単位が受付表単位のときのみ)
             */

            if (this.overdue_rentals.length > 0) {
              this.set_overdue_rentals = true;
              this.diffFromInitialize(this.diff_date_values);
              this.setUpDiffEmployee();
              this.setDiffEmployeeDefaultValue(this.overdue_return_employee);
            }

            // 配送があるか確認
            if (this.rentals.length > 0) {
              this.isDeliveryRequested = this.isDeliveryRequestedRentals(
                this.rentals
              );
            }

            // レンタル合計金額を取得
            this.totalAmount = this.getTotalAmount(this.rentals);
            this.overdue_totalAmount = this.getOverdueTotalAmount(
              this.overdue_rentals
            );
            this.overdue_refund_totalAmount = this.getOverdueRefundTotalAmount(
              this.overdue_rentals
            );
          }
          this.common.loading = false;
        })
    );
  }

  updateInitSlip() {
    // レンタル受付票データとレンタル受付票表示に必要な付帯データを取得

    this.subscription.add(
      this.rentalService
        .getAll({ rental_slip_id: this.selectedId })
        .pipe(
          switchMap((rentalResponse: RentalApiResponse) => {
            const rentalData = rentalResponse.data; // ← ここが重要
            console.log(rentalData);
            const productIds = [
              ...new Set(rentalData.map((item) => item.rental_product_id)),
            ];

            return forkJoin([
              this.rsService.find(this.selectedId),
              of(rentalData),
              this.rentalProductService.getAll(productIds),
            ]);
          }),
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (!Array.isArray(res)) {
            // HttpErrorResponse の場合の処理
            this.handleError(res.status, 'エラー', res.message);
            return;
          }
          const [rsData, rentalData, filteredProducts] = res;
          console.log('伝票データ:', rsData);
          console.log('レンタルデータ:', rentalData);
          console.log('該当商品のみ:', filteredProducts);
        })
    );
  }
  /***
   * レスポンスのエラーチェック
   */
  createErrorMessage(res: any) {
    let result = true;
    // レスポンスがnull、 undefinedの場合
    if (res === null || res === undefined) {
      this.createErrorAndExecHandleError(
        'レンタル受付票の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      result = false;
    }
    // レスポンスが配列であり配列の要素が6つあるか
    if (Array.isArray(res) && res.length !== 6) {
      this.createErrorAndExecHandleError(
        'レンタル受付票の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      result = false;
    }
    // レンタル受付票データ取得エラーを確認
    const rsResInvalid = ApiResponseIsInvalid(res[0]);
    if (rsResInvalid) {
      this.createErrorAndExecHandleError(
        'レンタル受付票の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      result = false;
    }
    // レンタル受付票に紐付くレンタルデータ取得エラーを確認
    // ただし、紐付くレンタルデータが0件の場合もあるため0件の場合はエラーにしない
    const rentalResInvalid =
      res[1].data.length === 0 ? false : ApiResponseIsInvalid(res[1]);
    if (rentalResInvalid) {
      this.createErrorAndExecHandleError(
        'レンタル明細の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      result = false;
    }
    // 基本情報データ取得エラーを確認
    const biResInvalid = ApiResponseIsInvalid(res[2]);
    if (biResInvalid) {
      this.createErrorAndExecHandleError(
        '基本情報の取得に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      result = false;
    }
    return result;
  }

  /**
   * 受付表単位　貸出処理
   * 日付はフォームから取得
   */
  handleClickBulkSaveRental() {
    // ローディング処理開始
    this.common.loading = true;

    let bulk_form_data = this.bulkForm.value;
    let rental_data = this.rentals;
    const formVal = this.statusForm.value;

    /**
     * 貸出日 貸出担当者 片方だけの入力はNGとする
     * 双方入っていない場合の保存は、ステータス変更とみなす。
     */
    let isChangeStatus = false;

    if (
      !bulk_form_data.dateGroup?.rental_date &&
      !bulk_form_data.rental_employee_id
    ) {
      console.log('STATUS CHANGE');
      isChangeStatus = true;
      // 貸出予定日・その他ステータスの変更を行う
      // 貸出・返却予定日 変更・レンタル額再計算
      this.rentalSlipRentalStatusChange();

      return;
    }
    /**
     * レンタル時の必須入力チェック
     */

    if (!bulk_form_data.dateGroup?.rental_date && isChangeStatus === false) {
      // 担当者未選択
      alert('貸出日が未選択です');
      this.common.loading = false;
      return;
    }

    if (!bulk_form_data.rental_employee_id && isChangeStatus === false) {
      // 担当者未選択
      alert('貸出担当者が未選択です');
      this.common.loading = false;
      return;
    }

    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      // 身分証明書のチェックがないと登録不可
      alert('本人確認書類の確認が行われていません');
      this.common.loading = false;
      return;
    }

    // 身分証明書のチェックが行われた場合日付を格納
    this.confirmedIdentityVerificationDocuments();

    // Rental < bulkFc merge
    let rental_datas: any = [];
    const t = rental_data.map((rental) => {
      //console.log('update');
      let rental_data: any = {
        id: rental.id,
        parent_id: this.selectedId,
        late_return_reported: bulk_form_data.late_return_reported,
        collection_division_id: rental.collection_division_id,
        delinquency_flag: rental.delinquency_flag,
        delivery_division_id: rental.delivery_division_id,
        rental_date: this._dateToString(
          this.bulkFc.dateGroup.controls.rental_date.value
        ),
        rental_fee: rental.rental_fee,
        return_date: this._dateToString(
          this.bulkFc.dateGroup.controls.return_date.value
        ),
        rental_item_count: rental.rental_item_count,
        rental_product_id: rental.rental_product_id,
        rental_product_name: rental.rental_product_name,
        scheduled_rental_date: this._dateToString(
          bulk_form_data.scheduledDateGroup?.scheduled_rental_date
        ),
        scheduled_return_date: this._dateToString(
          bulk_form_data.scheduledDateGroup?.scheduled_return_date
        ),
        settle_status_division_id: rental.settle_status_division_id,
        rental_employee_id: bulk_form_data.rental_employee_id
          ? bulk_form_data.rental_employee_id
          : '',
        return_employee_id: bulk_form_data.return_employee_id
          ? bulk_form_data.return_employee_id
          : '',
      };
      rental_datas.push(rental_data);
    });

    // RentalSlip のステータス すべて貸出済み
    let division_status_id: any = this.statusDivisionOptions.find((x) => {
      return x.text === rentalSlipConst.STATUS.ALL_RENTED;
    });

    // ポスト用データ作成
    const postData = {
      id: this.selectedId,
      customer_type_division_id: this.rs.customer_type_division_id,
      store_id: this.rs.store_id,
      client_id: this.rs.client_id,
      member_id: this.rs.member_id,
      mobile_number: this.rs.mobile_number,
      shipping_address: this.rs.shipping_address,
      status_division_id: division_status_id.value
        ? division_status_id.value
        : formVal.status_division_id,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
      reception_tag: formVal.reception_tag,
      reception_date: this.rs.reception_date,
      reception_employee_id: formVal.reception_employee_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      processing_units: formVal.processing_units,
    };

    this.action_num = 0;
    this.action_num += rental_data.length;
    this.action_num += this.ProductData.length;

    if (rental_datas.length > 0) {
      for (let index = 0; index < rental_datas.length; index++) {
        this.updateRentalItem(rental_datas[index]);
      }
    }

    //RentalProductのステータス 貸出中に変更
    this.setRentalProductsStatusDivision(this.PRODUCT_STATUS_DIVISION_RENTED);

    // お客様情報を更新する
    let updateCustomerData$: Observable<RentalSlipApiResponse>;
    updateCustomerData$ = this.rsService.update(this.selectedId, postData);

    let doAction = () => {
      // ページロード後、５秒後、10秒後、15秒後...と一定間隔で実行される
      if (this.action_num > 0 && this.action_num == this.act_num) {
        updateCustomerData$.subscribe({
          complete: () => {
            window.location.reload();
          },
        });
      }
    };

    const fetchDataInInterval = () => {
      let timer = setInterval(doAction, 1000);
    };

    fetchDataInInterval();
  }

  rentalSlipRentalStatusChange() {
    /**
     * レンタル時（予定日の変更）
     *  対象：貸出・返却予定日 レンタル料金
     */
    let bulk_form_data = this.bulkForm.value;
    let rental_data = this.rentals;
    const formVal = this.statusForm.value;
    // Rental < bulkFc merge
    let rental_datas: any = [];
    const t = rental_data.map((rental) => {
      const product = this.ProductData.find((x) => {
        return x.id == rental.rental_product_id;
      });

      let new_rental_fee: number | Error = 0;

      if (product) {
        new_rental_fee = this.calculateRentalFee(
          product,
          bulk_form_data.scheduledDateGroup?.scheduled_rental_date,
          bulk_form_data.scheduledDateGroup?.scheduled_return_date
        );
      } else {
        return;
      }

      //console.log('update');
      let rental_data: any = {
        id: rental.id,
        parent_id: this.selectedId,
        late_return_reported: bulk_form_data.late_return_reported,
        collection_division_id: rental.collection_division_id,
        delinquency_flag: rental.delinquency_flag,
        delivery_division_id: rental.delivery_division_id,
        rental_date: bulk_form_data.rental_date
          ? bulk_form_data.rental_date
          : '',
        rental_fee: new_rental_fee,
        return_date: '',
        rental_item_count: rental.rental_item_count,
        rental_product_id: rental.rental_product_id,
        rental_product_name: rental.rental_product_name,
        scheduled_rental_date: this._dateToString(
          bulk_form_data.scheduledDateGroup?.scheduled_rental_date
        ),
        scheduled_return_date: this._dateToString(
          bulk_form_data.scheduledDateGroup?.scheduled_return_date
        ),
        settle_status_division_id: rental.settle_status_division_id,
        rental_employee_id: bulk_form_data.rental_employee_id
          ? bulk_form_data.rental_employee_id
          : '',
        return_employee_id: '',
      };
      rental_datas.push(rental_data);
    });
    // RentalSlip のステータス変更なし
    this.updateAllRentalItems(rental_datas);
  }
  /**
   * 受付表単位のデータを保存する
   * 当日返却・返却
   * 上記でしか呼ばれていない様子
   */
  handleClickBulkSaveReturn() {
    const form_data = this.bulkForm.value;
    let isRefund = false;
    let returnDatString = '';
    let rentalDateString = '';

    //返却日が予定より早い際の返金金額の算出
    if (
      form_data.dateGroup?.return_date &&
      form_data.scheduledDateGroup?.scheduled_return_date
    ) {
      const scheduledReturnDate = new Date(
        form_data.scheduledDateGroup.scheduled_return_date
      ).getTime();

      const returnDate = new Date(form_data.dateGroup.return_date).getTime();
      returnDatString = new Date(
        form_data.dateGroup.return_date
      ).toLocaleDateString();
      rentalDateString = new Date(
        form_data.dateGroup.rental_date
      ).toLocaleDateString();
      if (returnDate < scheduledReturnDate) {
        //返却日が予定より早い
        isRefund = true;
      }
    }

    //// ローディング処理開始
    this.common.loading = true;
    let get_datetime = new Date();

    let bulk_form_data = this.bulkForm.value;
    let rental_data = this.rentals;
    const formVal = this.statusForm.value;
    // console.log(this.addDiffRecord);

    this.bulkFc.dateGroup.controls.return_date.patchValue(get_datetime);

    // Rental < bulkFc merge
    let rental_datas: any = [];
    const t = rental_data.map((rental) => {
      let rental_data: any = {
        id: rental.id,
        parent_id: this.selectedId,
        late_return_reported: bulk_form_data.late_return_reported,
        collection_division_id: rental.collection_division_id,
        delinquency_flag: rental.delinquency_flag,
        delivery_division_id: rental.delivery_division_id,
        rental_date: this._dateToString(
          this.bulkFc.dateGroup.controls.rental_date.value
        ),
        rental_fee: rental.rental_fee,
        return_date: this._dateToString(
          this.bulkFc.dateGroup.controls.return_date.value
        ),
        rental_item_count: rental.rental_item_count,
        rental_product_id: rental.rental_product_id,
        rental_product_name: rental.rental_product_name,
        scheduled_rental_date: this._dateToString(
          bulk_form_data.scheduledDateGroup?.scheduled_rental_date
        ),
        scheduled_return_date: this._dateToString(
          bulk_form_data.scheduledDateGroup?.scheduled_return_date
        ),
        settle_status_division_id: rental.settle_status_division_id,
        rental_employee_id: bulk_form_data.rental_employee_id
          ? bulk_form_data.rental_employee_id
          : '',
        return_employee_id: bulk_form_data.return_employee_id
          ? bulk_form_data.return_employee_id
          : '',
      };
      // 返金が必要な場合の処理
      if (isRefund) {
        let product = this.ProductData.find((x) => {
          return x.id == rental.rental_product_id;
        });
        if (product && rental_data.rental_date && rental_data.return_date) {
          //返却日が予定より早い際の返金金額の算出
          let effective_rental_fee = this.calculateRentalFee(
            product,
            rental_data.rental_date,
            rental_data.return_date
          );
          // 貸出時の金額から差し引き
          // 格納先にrental_feeを追加
          if (
            typeof effective_rental_fee === 'number' &&
            effective_rental_fee > 0
          ) {
            let refund_fee = rental_data.rental_fee - effective_rental_fee;
            rental_data.refund_fee = refund_fee;
          }
        }
      }
      rental_datas.push(rental_data);
    });

    /** Change Product status
     *  return_date が設定されている場合
     *  status : 清掃中
     */
    let status: number = this.PRODUCT_STATUS_DIVISION_CLEANING;
    let division_status_id: any = this.statusDivisionOptions.find((x) => {
      return x.text === this.rs.division_status_value;
    });

    if (
      this.bulkFc.dateGroup.controls.rental_date.value &&
      this.bulkFc.dateGroup.controls.return_date.value
    ) {
      // すべて返却済み
      division_status_id = this.statusDivisionOptions.find((x) => {
        return x.text === rentalSlipConst.STATUS.ALL_RETURNED;
      });
    }

    // ポスト用データ作成
    const postData = {
      id: this.selectedId,
      customer_type_division_id: this.rs.customer_type_division_id,
      store_id: this.rs.store_id,
      client_id: this.rs.client_id,
      member_id: this.rs.member_id,
      mobile_number: this.rs.mobile_number,
      shipping_address: this.rs.shipping_address,
      status_division_id: division_status_id.value
        ? division_status_id.value
        : formVal.status_division_id,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
      reception_tag: formVal.reception_tag,
      reception_date: this.rs.reception_date,
      reception_employee_id: formVal.reception_employee_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      processing_units: formVal.processing_units,
    };

    this.action_num = 0;
    this.action_num += rental_data.length;
    this.action_num += this.ProductData.length;

    if (rental_datas.length > 0) {
      for (let index = 0; index < rental_datas.length; index++) {
        this.updateRentalItem(rental_datas[index]);
      }
    }

    this.setRentalProductsStatusDivision(status);

    // お客様情報を更新する
    let updateCustomerData$: Observable<RentalSlipApiResponse>;
    updateCustomerData$ = this.rsService.update(this.selectedId, postData);

    let doAction = () => {
      // ページロード後、５秒後、10秒後、15秒後...と一定間隔で実行される
      if (this.action_num > 0 && this.action_num == this.act_num) {
        updateCustomerData$.subscribe({
          complete: () => {
            window.location.reload();
          },
        });
      }
    };

    const fetchDataInInterval = () => {
      let timer = setInterval(doAction, 1000);
    };

    fetchDataInInterval();
  }

  setRentalProductsStatusDivision(status_number: number) {
    if (this.ProductData.length > 0) {
      for (let index in this.ProductData) {
        this.ProductData[index].status_division_id = status_number;
        const changeStatus: RentalProductChangeStatus = {
          product_id_list: String(this.ProductData[index].id),
          status_division_id: status_number,
        };
        this.setRentalProductStatusDivisionId(changeStatus);
        this.act_num += 1;
      }
    }
  }

  setRentalProductStatusDivisionId(product_data: RentalProductChangeStatus) {
    this.subscription.add(
      this.rentalProductService
        .update(Number(product_data.product_id_list), product_data)
        //.update(product_data.product_id_list, product_data) // APIだとIDをカンマ区切りでform-dataとして渡す
        .pipe(
          catchError((error) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = true))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラーが発生しました';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message);
            return;
          }
          return;
        })
    );
  }
  /**
   * 受付表単位の 差額処理 データを保存する
   */
  async handleClickDiffSaveButton(today: string | '') {
    // ローディング処理開始
    this.common.loading = true;

    let get_datetime = new Date();
    if (today == 'rental') {
      //console.log(get_datetime);
      this.diffFc.dateGroup.controls.rental_date.patchValue(get_datetime);
    } else if (today == 'return') {
      this.diffFc.dateGroup.controls.return_date.patchValue(get_datetime);
    }

    let diff_form_data = this.diffForm.value;
    let overdue_rentals = this.overdue_rentals;

    // Rental < bulkFc merge

    const t = overdue_rentals.map((rental) => {
      rental.rental_fee = 0; // not price
      rental.return_employee_id = diff_form_data.return_employee_id;
      rental.scheduled_return_date = this._dateToString(
        diff_form_data.scheduledDateGroup?.scheduled_return_date
      );
      rental.return_date = this._dateToString(
        diff_form_data.dateGroup?.return_date
      );
    });
    // 既存のupdateを使用するように変更する

    // save 差額処理時にCreate処理は入り込まない
    if (overdue_rentals.length > 0) {
      for (let index in overdue_rentals) {
        //console.log(overdue_rentals[index]);
        await this.updateRentalItem(overdue_rentals[index], true);
      }
    }
    // reload
    // ローディング処理　updateSlipInfo　内で false 化
    //this.subscription.add(this.updateSlipInfo().subscribe());
    //this.initialization(this.selectedId);
    //this.common.loading = false;
    // reload
    this.subscription.add(
      this.updateSlipInfo().subscribe(() => {
        //this.initialization(this.selectedId);
        //this.common.loading = false;
        window.location.reload();
      })
    );
  }

  onClickBulkFormReset() {
    // Clear input area
    this.getEmployeeByIdFcRental.get_rental_employee_id.patchValue(null);
    this.getEmployeeByIdFcReturn.get_return_employee_id.patchValue(null);
    this.bulkFromInitialize(this.rental_date_values);
  }

  onClickDiffFormReset() {
    // Clear input area
    this.getEmployeeByIdFcDiff.get_return_employee_id.patchValue(null);
    this.diffFromInitialize(this.diff_date_values);
  }

  changeReturnDate() {
    //日付入力のイベント取得
    //console.log('返却日取得');
  }
  /**
   * レンタルアイテム登録
   * @param rentalData
   */
  addRentalItem(rentalData: any) {
    //console.log('add');
    //編集
    this.subscription.add(
      this.rentalService
        .add(rentalData)
        .pipe(
          finalize(() => (this.common.loading = true)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
            return;
          }
          this.act_num += 1;
          return;
        })
    );
  }

  updateAllRentalItems(rental_datas: any[]) {
    if (rental_datas.length > 0) {
      console.log(rental_datas.length);
      const updateObservables$ = rental_datas.map((data) => {
        const rental_data = this.createRentalData(data);
        return this.rentalService.update(rental_data.id, rental_data).pipe(
          catchError((error) => {
            this.handleError(error.status, this.errorModalTitle, error.message);
            return of(null); // エラーでも完了させる
          })
        );
      });
      forkJoin(updateObservables$).subscribe((results) => {
        //this.updateInitSlip();
        // すべての更新が完了した後
        window.location.reload();
        this.common.loading = false;
      });
    }
  }

  createRentalData(rentalData: any, onlyUpdate: boolean = false): any {
    return {
      id: rentalData.id,
      rental_slip_id: this.selectedId,
      late_return_reported: rentalData.late_return_reported,
      collection_division_id: rentalData.collection_division_id,
      delinquency_flag: rentalData.delinquency_flag,
      delivery_division_id: rentalData.delivery_division_id,
      rental_date: rentalData.rental_date,
      rental_fee: rentalData.rental_fee,
      return_date: rentalData.return_date,
      rental_item_count: rentalData.rental_item_count,
      rental_product_id: rentalData.rental_product_id,
      rental_product_name: rentalData.rental_product_name,
      scheduled_rental_date: rentalData.scheduled_rental_date,
      scheduled_return_date: rentalData.scheduled_return_date,
      settle_status_division_id: rentalData.settle_status_division_id,
      rental_employee_id: rentalData.rental_employee_id,
      return_employee_id: rentalData.return_employee_id,
      refund_fee: rentalData.refund_fee ? rentalData.refund_fee : '',
      only_update: String(onlyUpdate),
    };
  }

  updateRentalItem(rentalData: any, onlyUpdate: boolean = false) {
    let rental_data: any = {
      id: rentalData.id,
      rental_slip_id: this.selectedId,
      late_return_reported: rentalData.late_return_reported,
      collection_division_id: rentalData.collection_division_id,
      delinquency_flag: rentalData.delinquency_flag,
      delivery_division_id: rentalData.delivery_division_id,
      rental_date: rentalData.rental_date,
      rental_fee: rentalData.rental_fee,
      return_date: rentalData.return_date,
      rental_item_count: rentalData.rental_item_count,
      rental_product_id: rentalData.rental_product_id,
      rental_product_name: rentalData.rental_product_name,
      scheduled_rental_date: rentalData.scheduled_rental_date,
      scheduled_return_date: rentalData.scheduled_return_date,
      settle_status_division_id: rentalData.settle_status_division_id,
      rental_employee_id: rentalData.rental_employee_id,
      return_employee_id: rentalData.return_employee_id,
      refund_fee: rentalData.refund_fee ? rentalData.refund_fee : '',
      only_update: String(onlyUpdate),
    };
    // 更新処理_rental_slip(postData)
    if ('id' in rental_data) {
      //編集
      this.subscription.add(
        this.rentalService
          .update(rental_data.id, rental_data)
          .pipe(
            finalize(() => (this.common.loading = true)),
            catchError((error) => {
              return of(error);
            })
          )
          .subscribe((res) => {
            if (res instanceof HttpErrorResponse) {
              this.handleError(res.status, this.errorModalTitle, res.message);
              return;
            }
            this.act_num += 1;

            return;
          })
      );
    }
  }
  /**
   * bulk フォームに初期値をセットする
   * @param rental_date_values
   */
  bulkFromInitialize(rental_date_values: any) {
    this.bulkForm.reset(
      {
        rental_employee_id: this.rental_employee,
        return_employee_id: this.return_employee,
        late_return_reported: this.bulk_late_return_reported,
        scheduledDateGroup: {
          scheduled_rental_date: new Date(
            rental_date_values.scheduled_rental_date
          ).toISOString(),
          scheduled_return_date: new Date(
            rental_date_values.scheduled_return_date
          ).toISOString(),
        },
        dateGroup: {
          //  必須項目ではないので値がない場合は空文字をセットしないとエラーになる
          rental_date: rental_date_values.rental_date
            ? new Date(rental_date_values.rental_date).toISOString()
            : '',
          return_date: rental_date_values.return_date
            ? new Date(rental_date_values.return_date).toISOString()
            : '',
        },
      },
      {
        emitEvent: false,
      }
    );
  }

  /**
   * diff フォームに初期値をセットする
   * @param diff_date_values
   */
  diffFromInitialize(diff_date_values: any) {
    this.diffForm.reset(
      {
        rental_employee_id: this.rental_employee,
        return_employee_id: this.return_employee,
        scheduledDateGroup: {
          scheduled_rental_date: diff_date_values.scheduled_rental_date
            ? new Date(diff_date_values.scheduled_rental_date).toISOString()
            : '',
          scheduled_return_date: diff_date_values.scheduled_return_date
            ? new Date(diff_date_values.scheduled_return_date).toISOString()
            : '',
        },
        dateGroup: {
          // 必須項目ではないので値がない場合は空文字をセットしないとエラーになる
          rental_date: diff_date_values.rental_date
            ? new Date(diff_date_values.rental_date).toISOString()
            : '',
          return_date: diff_date_values.return_date
            ? new Date(diff_date_values.return_date).toISOString()
            : '',
        },
      },
      {
        emitEvent: false,
      }
    );
  }

  _dateToString(value: any | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    } else {
      return new Date(value).toLocaleDateString();
    }
  }
  /**
   *
   * @param value 日付
   * @returns value.toLocaleDateString OR ''
   */
  dateToString(value: any): string {
    return value ? new Date(value).toLocaleDateString() : '';
  }
  /**
   * False 判定の変数の中身を文字列で返す
   * @param value :any
   * @returns String
   */
  returnStringValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    } else {
      return String(value);
    }
  }
  /**
   * 商品単体のレンタル料金を算出
   *
   * @param rentalProduct
   * @returns - 税込価格・税抜価格・消費税額のオブジェクト multiplePrices: { priceWithTax: number, priceWithoutTax: number, taxAmount: number }
   */
  calculateSingleItemRentalFee(rental: Rental, rentalProduct: RentalProduct) {
    // レンタル明細が取得できない場合
    if (!rental || Object.keys(rental).length === 0) {
      return null;
    }
    // レンタル商品が取得できない場合
    if (!rentalProduct || Object.keys(rentalProduct).length === 0) {
      return null;
    }

    // 消費税区分を取得する
    const saleTaxDivisionCode = Number(rentalProduct.division_sales_tax_code);
    // 税率と内税・外税のフラグを取得する
    const taxAndTaxIncludedFlag =
      getTaxRateAndTaxIncludedFlag(saleTaxDivisionCode);

    // 端数処理区分を取得する
    const salesFractionDivisionCode = Number(
      rentalProduct.division_sales_fraction_code
    );
    // 端数処理に利用するメソッド名を取得する
    const fractionMethod: RoundingMethod = getFractionMethod(
      salesFractionDivisionCode
    );

    // 税込価格、税抜価格、消費税額を格納する変数
    let multiplePrices;

    // 商品の配送料フラグを取得する
    const deliveryChargeFlag = rentalProduct.delivery_charge_flag;
    // 配送料フラグがオンの場合
    if (deliveryChargeFlag) {
      // レンタル料金を取得する
      const rentalFee = rental.rental_fee;

      // 税込価格、税抜価格、消費税額を取得する
      multiplePrices = calculatePrice(
        rentalFee,
        taxAndTaxIncludedFlag.taxRate,
        taxAndTaxIncludedFlag.isTaxIncluded,
        fractionMethod
      );

      // エラーが返ってきた場合
      if (multiplePrices instanceof Error) {
        return null;
      }

      // 税込価格、税抜価格、消費税額を返す
      return multiplePrices;
    }

    // レンタル商品の売価を取得する
    const sellingPrice = rentalProduct.selling_price;

    // 税込価格、税抜価格、消費税額を取得する
    multiplePrices = calculatePrice(
      sellingPrice,
      taxAndTaxIncludedFlag.taxRate,
      taxAndTaxIncludedFlag.isTaxIncluded,
      fractionMethod
    );

    // エラーが返ってきた場合
    if (multiplePrices instanceof Error) {
      return null;
    }
    // 税込価格、税抜価格、消費税額を返す
    return multiplePrices;
  }

  /**
   * レンタル料金を算出してセットする
   *
   * @param scheduledRentalDate
   * @param scheduledReturnDate
   * @returns
   */
  calculateAndSetRentalFee(
    scheduledRentalDate: string,
    scheduledReturnDate: string
  ) {
    if (!scheduledRentalDate || !scheduledReturnDate) {
      // 期間のどちらかが空の場合レンタル料金へ商品の売価をセット
      this.selectedProductPrice = this.addTargetProduct.selling_price;
      return;
    }

    // 編集モードかどうか判断するフラグ
    const isEditing =
      this.editTarget && Object.keys(this.editTarget).length > 0 ? true : false;

    // フォームコントロールを格納する変数
    let fc;

    // フォームコントロールをモードによって切り替える
    if (isEditing) {
      fc = this.editFc;
    } else {
      fc = this.addFc;
    }

    // ターゲットのレンタル商品を格納する変数
    let targetProduct;

    // モードによってターゲットのレンタル商品を切り替える
    if (isEditing) {
      targetProduct = this.editTargetProduct;
    } else {
      targetProduct = this.addTargetProduct;
    }

    // 商品が選択されていない場合レンタル料金へ0をセット
    if (!targetProduct || Object.keys(targetProduct).length === 0) {
      // レンタル料金へ0をセット
      this.selectedProductPrice = 0;
      return;
    }

    // レンタル明細を格納する変数
    let rental;

    // 配送料金フラグによってレンタル明細を切り替える
    if (targetProduct.delivery_charge_flag) {
      rental = { rental_fee: fc.rental_fee };
    } else {
      rental = { rental_fee: targetProduct.selling_price };
    }

    // 商品が選択されていて期間の両方が入力されている場合
    // 期間の日数を計算してレンタル料金へセット
    // 商品の売価が税抜の場合税込価格を取得する
    // 単体のレンタル料金算出
    const calculatedFee = this.calculateSingleItemRentalFee(
      rental as Rental,
      targetProduct
    );

    // 商品の税抜価格・税込価格・消費税が取得できない場合エラーを表示して一覧画面へ戻る
    if (!calculatedFee) {
      this.createErrorAndExecHandleError(
        'レンタル料金の算出に失敗しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // 貸出予定日の時間を0にした値を格納する変数
    let hoursZeroScheduledRentalDate;

    // 返却予定日の時間を0にした値を格納する変数
    let hoursZeroScheduledReturnDate;

    // レンタル予定日数を取得を取得するために時間を0にする
    const rentalD = new Date(String(scheduledRentalDate)).setHours(0, 0, 0, 0);
    hoursZeroScheduledRentalDate = new Date(rentalD);
    const returnD = new Date(String(scheduledReturnDate)).setHours(0, 0, 0, 0);
    hoursZeroScheduledReturnDate = new Date(returnD);

    // レンタル予定日数を取得
    const rentalDays = daysBetweenDates(
      hoursZeroScheduledRentalDate,
      hoursZeroScheduledReturnDate
    );

    // rentalDaysは日付の差分なので同日返却の場合0が返ってくるような計算になる。結果に1を足して補正する
    const rentalDaysForCalculation = rentalDays + 1;

    // 単品税込額とレンタル泊数からレンタル料金を算出
    let rentalFee = 0;
    if (rentalDaysForCalculation > 1) {
      // レンタルが複数日に渡る場合レンタル料金は基本料金の70%になる
      // 税込価格で計算する
      rentalFee =
        (Number(calculatedFee?.priceWithTax) / 100) *
        70 *
        rentalDaysForCalculation;
    } else {
      rentalFee = Number(calculatedFee?.priceWithTax);
    }

    this.selectedProductPrice = rentalFee;
  }

  /**
   * 追加フォームを閉じて登録処理を呼び出す
   */
  handleClickRentalAddExecutionButton() {
    // 追加フォームを閉じる
    this.addFormIsOpen = false;
    // 登録処理を呼び出す
    this.addOrUpdate('');
  }

  handleClickRentalDiffExecutionButton(typestring: string | '') {
    this.editFormIsOpen = false;
    this.rentalDiffItemUpdate(typestring);
  }

  executeAction() {
    this.addForm.reset();
    this.editForm.reset();
    this.common.loading = false;
    this.isUpdatingRental = false;
    //window.location.reload();
  }

  /**
   *
   */
  checkConfirmationRequired(typestring: string | '', get_datetime: string) {
    if (typestring == 'rental') {
      this.editFc.dateGroup.controls.rental_date.patchValue(get_datetime);

      if (
        this.rs.division_customer_type_code ===
          Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
        this.selectedCustomer.isIdConfirmationRequired === false
      ) {
        // 身分証明書のチェックがないと登録不可
        alert('本人確認書類の確認が行われていません');
        this.common.loading = false;
        return;
      }
      // 身分証明書のチェックが行われた場合日付を格納
      this.confirmedIdentityVerificationDocuments();
    } else if (typestring == 'return') {
      this.editFc.dateGroup.controls.return_date.patchValue(get_datetime);
    }
  }
  setGracePeriodEnd(editFormVal: any) {
    let gracePeriodEnd;
    if (editFormVal.late_return_reported) {
      let dateObj = new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_return_date)
      );
      // 時間を9時に設定
      dateObj.setHours(9, 0, 0, 0);
      // 1日を加算 (24 * 60 * 60 * 1000 ミリ秒)
      let timestampWithOneDayAdded =
        dateObj.getTime() + 1 * 24 * 60 * 60 * 1000;
      // 新しいDateオブジェクトを作成
      gracePeriodEnd = new Date(timestampWithOneDayAdded).toLocaleString();
    }
    return gracePeriodEnd;
  }

  private finalizeUpdate(): void {
    this.editForm.reset();
    this.common.loading = false;
    this.isUpdatingRental = false;
    window.location.reload();
  }
  /**
   * 更新処理(返却)
   */
  rentalItemReturnUpdate() {
    this.common.loading = true;
    let get_datetime = new Date();
    //
    this.checkConfirmationRequired('return', get_datetime.toISOString());
    // 編集モードの場合のフラグ設定
    const isEditing =
      this.editTarget && Object.keys(this.editTarget).length > 0 ? true : false;
    const editFormVal = this.editForm.value;

    // 遅延連絡ありの場合返却予定日の翌日9時を返却リミットへセット
    let rental = this.editTarget;
    let rentalProduct = this.editTargetProduct;
    let rentalFee = rental.rental_fee;
    let gracePeriodEnd = this.setGracePeriodEnd(editFormVal);

    let isRefund = false;
    let returnDatString = '';
    let rentalDateString = '';

    //返却日が予定より早い際の返金金額の算出
    if (
      editFormVal.dateGroup?.return_date &&
      editFormVal.scheduledDateGroup?.scheduled_return_date
    ) {
      const scheduledReturnDate = new Date(
        editFormVal.scheduledDateGroup.scheduled_return_date
      ).getTime();

      const returnDate = new Date(editFormVal.dateGroup.return_date).getTime();
      returnDatString = new Date(
        editFormVal.dateGroup.return_date
      ).toLocaleDateString();
      rentalDateString = new Date(
        editFormVal.dateGroup.rental_date
      ).toLocaleDateString();
      if (returnDate < scheduledReturnDate) {
        //返却日が予定より早い
        isRefund = true;
      }
    }

    /**
     * this.editTarget.id をparentに持つアイテムがないことを確認
     *  parentがない　    == rentalの元データ  Create  onlyUpdate= false
     *  parentがある場合  == 紐づく子データ。   Update  onlyUpdate= true
     *
     */
    let onlyUpdate = false;
    if (this.editTarget.parent_id) {
      // 親がある場合は更新
      onlyUpdate = true;
    }

    // POSTデータを作る
    let postData: any = {};
    postData = {
      id: this.editTarget.id,
      rental_slip_id: this.selectedId,
      rental_product_id: Number(editFormVal.rental_product_id),
      rental_item_count: this.RENTAL_ITEM_COUNT, // 予約数は1で固定
      rental_fee: this.selectedProductDeliveryChargeFlag
        ? editFormVal.rental_fee
        : rentalFee,
      delivery_division_id: Number(editFormVal.delivery_division_id),
      delivery_price: this.DElIVERY_PRICE, // 配送料金は0で固定
      collection_division_id: Number(editFormVal.collection_division_id),
      collection_price: this.COLLECTION_PRICE, // 回収料金は0で固定
      delivery_charge_flag: this.selectedProductDeliveryChargeFlag,
      scheduled_rental_date: new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_rental_date)
      ).toLocaleDateString(),
      scheduled_return_date: new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_return_date)
      ).toLocaleDateString(),
      rental_date: editFormVal.dateGroup?.rental_date
        ? this._dateToString(editFormVal.dateGroup?.rental_date)
        : '',
      return_date: editFormVal.dateGroup?.return_date
        ? this._dateToString(editFormVal.dateGroup?.return_date)
        : '',
      delinquency_flag: 0,
      grace_period_end: gracePeriodEnd ? gracePeriodEnd : '',
      late_fee: Number(editFormVal.late_fee),
      late_return_reported: editFormVal.late_return_reported,
      settle_status_division_id: this.editTarget.settle_status_division_id,
      remarks_1: editFormVal.remarks_1 ? String(editFormVal.remarks_1) : '',
      remarks_2: editFormVal.remarks_2 ? String(editFormVal.remarks_2) : '',
      return_employee_id: editFormVal.return_employee_id
        ? String(editFormVal.return_employee_id)
        : '',
      rental_employee_id: editFormVal.rental_employee_id
        ? String(editFormVal.rental_employee_id)
        : '',
    };

    // 返金が必要な場合の処理
    if (isRefund) {
      if (rentalProduct && postData.rental_date && postData.return_date) {
        //返却日が予定より早い際の返金金額の算出
        let effective_rental_fee = this.calculateRentalFee(
          rentalProduct,
          postData.rental_date,
          postData.return_date
        );
        // 貸出時の金額から差し引き
        if (
          typeof effective_rental_fee === 'number' &&
          effective_rental_fee > 0
        ) {
          let refund_fee = postData.rental_fee - effective_rental_fee;
          postData.refund_fee = refund_fee;
        }
      }
    }

    //
    // 更新処理開始
    //
    let observable$ = this.rentalService
      .update(this.editTarget.id, postData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => {
          // 編集ターゲットを削除
          this.editFormCancel();
        })
      );

    this.subscription.add(
      observable$.subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.isUpdatingRental = false;
          this.createHttpErrorAndExecHandleError(res, this.listPagePath);
          return;
        }
        // レスポンスがnull undefinedか
        if (res === null || res === undefined) {
          this.isUpdatingRental = false;
          this.createErrorAndExecHandleError(
            'レンタル明細の登録に失敗しました。一覧画面へ戻ります。',
            this.listPagePath
          );
          return;
        }

        //Add Product status
        let status: number;
        if (this._dateToString(postData.return_date) == '') {
          status = this.PRODUCT_STATUS_DIVISION_RENTED;
        } else {
          status = this.PRODUCT_STATUS_DIVISION_CLEANING;
        }

        this.updateRentalItem(postData, onlyUpdate);

        if (rentalProduct) {
          const changeStatus: RentalProductChangeStatus = {
            product_id_list: String(rentalProduct.id),
            status_division_id: status,
          };
          this.setRentalProductStatusDivisionId(changeStatus);
        }

        const status_division_id = this.getStatusDivisionId(postData);
        this.statusDivisionIdUpdate(status_division_id.value, () => {
          this.finalizeUpdate();
        });
      })
    );
  }

  updateOneRentalItems(rental_datas: any[]) {
    if (rental_datas.length > 0) {
      console.log(rental_datas.length);
      const updateObservables$ = rental_datas.map((data) => {
        const rental_data = this.createRentalData(data);
        return this.rentalService.update(rental_data.id, rental_data).pipe(
          catchError((error) => {
            this.handleError(error.status, this.errorModalTitle, error.message);
            return of(null); // エラーでも完了させる
          })
        );
      });
      forkJoin(updateObservables$).subscribe((results) => {
        //this.updateInitSlip();
        // すべての更新が完了した後
        window.location.reload();
        this.common.loading = false;
      });
    }
  }

  createOneRentalData(rentalData: any, onlyUpdate: boolean = false): any {
    return {
      id: rentalData.id,
      rental_slip_id: this.selectedId,
      late_return_reported: rentalData.late_return_reported,
      collection_division_id: rentalData.collection_division_id,
      delinquency_flag: rentalData.delinquency_flag,
      delivery_division_id: rentalData.delivery_division_id,
      rental_date: rentalData.rental_date,
      rental_fee: rentalData.rental_fee,
      return_date: rentalData.return_date,
      rental_item_count: rentalData.rental_item_count,
      rental_product_id: rentalData.rental_product_id,
      rental_product_name: rentalData.rental_product_name,
      scheduled_rental_date: rentalData.scheduled_rental_date,
      scheduled_return_date: rentalData.scheduled_return_date,
      settle_status_division_id: rentalData.settle_status_division_id,
      rental_employee_id: rentalData.rental_employee_id,
      return_employee_id: rentalData.return_employee_id,
      refund_fee: rentalData.refund_fee ? rentalData.refund_fee : '',
      only_update: String(onlyUpdate),
    };
  }

  /*
   * 明細単位：貸出
   */
  rentalItemRentalUpdate() {
    this.common.loading = true;
    // 編集モードの場合のフラグ設定
    const isEditing =
      this.editTarget && Object.keys(this.editTarget).length > 0 ? true : false;
    const editFormVal = this.editForm.value;
    // 遅延連絡ありの場合返却予定日の翌日9時を返却リミットへセット
    let rental = this.editTarget;
    let rentalProduct = this.editTargetProduct;
    /**
     * 貸出日 貸出担当者 片方だけの入力はNGとする
     * 双方入っていない場合の保存は、ステータス変更とみなす。
     */
    let isChangeStatus = false;
    if (
      !editFormVal.dateGroup?.rental_date &&
      !editFormVal.rental_employee_id
    ) {
      isChangeStatus = true;
      // 貸出予定日・その他ステータスの変更を行う
      // 貸出・返却予定日 変更・レンタル額再計算
      this.rentalSlipOneRentalStatusChange(editFormVal, rental, rentalProduct);
      return;
    }

    /**
     * レンタル時の必須入力チェック
     */

    if (!editFormVal.dateGroup?.rental_date && isChangeStatus === false) {
      // 担当者未選択
      alert('貸出日が未選択です');
      this.editFormIsOpen = true;
      this.common.loading = false;
      return;
    }

    if (!editFormVal.rental_employee_id && isChangeStatus === false) {
      // 担当者未選択
      alert('貸出担当者が未選択です');
      this.editFormIsOpen = true;
      this.common.loading = false;
      return;
    }

    let get_datetime = new Date();
    this.checkConfirmationRequired('rental', get_datetime.toISOString());
    // POSTデータを作る
    let onlyUpdate = false;
    let rentalFee = rental.rental_fee;
    let gracePeriodEnd = this.setGracePeriodEnd(editFormVal);

    let postData: any = {};
    postData = {
      id: this.editTarget.id,
      rental_slip_id: this.selectedId,
      rental_product_id: Number(editFormVal.rental_product_id),
      rental_item_count: this.RENTAL_ITEM_COUNT, // 予約数は1で固定
      rental_fee: this.selectedProductDeliveryChargeFlag
        ? editFormVal.rental_fee
        : rentalFee,
      delivery_division_id: Number(editFormVal.delivery_division_id),
      delivery_price: this.DElIVERY_PRICE, // 配送料金は0で固定
      collection_division_id: Number(editFormVal.collection_division_id),
      collection_price: this.COLLECTION_PRICE, // 回収料金は0で固定
      delivery_charge_flag: this.selectedProductDeliveryChargeFlag,
      scheduled_rental_date: new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_rental_date)
      ).toLocaleDateString(),
      scheduled_return_date: new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_return_date)
      ).toLocaleDateString(),
      rental_date: editFormVal.dateGroup?.rental_date
        ? this._dateToString(editFormVal.dateGroup?.rental_date)
        : '',
      return_date: '',
      delinquency_flag: 0,
      grace_period_end: gracePeriodEnd ? gracePeriodEnd : '',
      late_fee: '',
      late_return_reported: editFormVal.late_return_reported,
      settle_status_division_id: this.editTarget.settle_status_division_id,
      remarks_1: editFormVal.remarks_1 ? String(editFormVal.remarks_1) : '',
      remarks_2: editFormVal.remarks_2 ? String(editFormVal.remarks_2) : '',
      return_employee_id: editFormVal.return_employee_id
        ? String(editFormVal.return_employee_id)
        : '',
      rental_employee_id: editFormVal.rental_employee_id
        ? String(editFormVal.rental_employee_id)
        : '',
    };
    //
    // 更新処理開始
    //
    let observable$ = this.rentalService
      .update(this.editTarget.id, postData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => {
          // 編集ターゲットを削除
          this.editFormCancel();
        })
      );
    this.subscription.add(
      observable$.subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.isUpdatingRental = false;
          this.createHttpErrorAndExecHandleError(res, this.listPagePath);
          return;
        }
        // レスポンスがnull undefinedか
        if (res === null || res === undefined) {
          this.isUpdatingRental = false;
          this.createErrorAndExecHandleError(
            'レンタル明細の登録に失敗しました。一覧画面へ戻ります。',
            this.listPagePath
          );
          return;
        }
        // レンタルアイテムの更新（貸出）
        this.updateRentalItem(postData, onlyUpdate);

        // レンタル商品の更新(貸出)
        if (rentalProduct) {
          const changeStatus: RentalProductChangeStatus = {
            product_id_list: String(rentalProduct.id),
            status_division_id: this.PRODUCT_STATUS_DIVISION_RENTED,
          };
          this.setRentalProductStatusDivisionId(changeStatus);
        }
        const status_division_id = this.getStatusDivisionId(postData);
        this.statusDivisionIdUpdate(status_division_id.value, () => {
          this.finalizeUpdate();
        });
      })
    );
  }

  rentalSlipOneRentalStatusChange(
    editFormVal: any,
    rental: any,
    rentalProduct: any
  ) {
    /**
     * レンタル時（予定日の変更）
     *  対象：貸出・返却予定日 レンタル料金
     */

    let scheduled_rental_date =
      editFormVal.scheduledDateGroup?.scheduled_rental_date;
    let scheduled_return_date =
      editFormVal.scheduledDateGroup?.scheduled_return_date;
    // Rental < bulkFc merge
    let rental_datas: any = [];
    let new_rental_fee: number | Error = 0;
    if (rentalProduct) {
      new_rental_fee = this.calculateRentalFee(
        rentalProduct,
        this._dateToString(scheduled_rental_date),
        this._dateToString(scheduled_return_date)
      );
    } else {
      return;
    }
    //console.log('update');
    let rental_data: any = {
      id: rental.id,
      parent_id: this.selectedId,
      late_return_reported: rental.late_return_reported,
      collection_division_id: rental.collection_division_id,
      delinquency_flag: rental.delinquency_flag,
      delivery_division_id: rental.delivery_division_id,
      rental_date: '',
      rental_fee: new_rental_fee,
      return_date: '',
      rental_item_count: rental.rental_item_count,
      rental_product_id: rental.rental_product_id,
      rental_product_name: rental.rental_product_name,
      scheduled_rental_date: this._dateToString(scheduled_rental_date),
      scheduled_return_date: this._dateToString(scheduled_return_date),
      settle_status_division_id: rental.settle_status_division_id,
      rental_employee_id: '',
      return_employee_id: '',
    };
    rental_datas.push(rental_data);
    // RentalSlip のステータス変更なし
    this.updateAllRentalItems(rental_datas);
  }
  /**
   * 登録・更新処理両方対応の関数
   */
  addOrUpdate(today: string | '') {
    this.common.loading = true;

    let get_datetime = new Date();
    if (today == 'rental') {
      this.editFc.dateGroup.controls.rental_date.patchValue(
        get_datetime.toISOString()
      );

      if (
        this.rs.division_customer_type_code ===
          Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
        this.selectedCustomer.isIdConfirmationRequired === false
      ) {
        // 身分証明書のチェックがないと登録不可
        alert('本人確認書類の確認が行われていません');
        this.common.loading = false;
        return;
      }
      // 身分証明書のチェックが行われた場合日付を格納
      this.confirmedIdentityVerificationDocuments();
    } else if (today == 'return') {
      this.editFc.dateGroup.controls.return_date.patchValue(
        get_datetime.toISOString()
      );
    }

    // 編集モードの場合のフラグ設定
    const isEditing =
      this.editTarget && Object.keys(this.editTarget).length > 0 ? true : false;

    // 入力値を取得
    const formVal = this.addForm.value;
    const editFormVal = this.editForm.value;

    // 追加・編集対象のレンタル明細を取得
    let rental;
    if (isEditing) {
      rental = this.editTarget;
    } else {
      rental = this.addTarget;
    }

    // 追加・編集対象の商品を取得
    let rentalProduct: RentalProduct;
    if (isEditing) {
      rentalProduct = this.editTargetProduct;
    } else {
      rentalProduct = this.addTargetProduct;
    }

    let rentalFee = rental.rental_fee;

    // POSTデータを作る
    let postData: any = {};

    if (isEditing) {
      // 遅延連絡ありの場合返却予定日の翌日9時を返却リミットへセット
      let gracePeriodEnd;
      if (editFormVal.late_return_reported) {
        let dateObj = new Date(
          String(editFormVal.scheduledDateGroup?.scheduled_return_date)
        );
        // 時間を9時に設定
        dateObj.setHours(9, 0, 0, 0);
        // 1日を加算 (24 * 60 * 60 * 1000 ミリ秒)
        let timestampWithOneDayAdded =
          dateObj.getTime() + 1 * 24 * 60 * 60 * 1000;
        // 新しいDateオブジェクトを作成
        gracePeriodEnd = new Date(timestampWithOneDayAdded).toLocaleString();
      }

      postData = {
        rental_slip_id: this.selectedId,
        rental_product_id: Number(editFormVal.rental_product_id),
        rental_item_count: this.RENTAL_ITEM_COUNT, // 予約数は1で固定
        rental_fee: this.selectedProductDeliveryChargeFlag
          ? editFormVal.rental_fee
          : rentalFee,
        delivery_division_id: Number(editFormVal.delivery_division_id),
        delivery_price: this.DElIVERY_PRICE, // 配送料金は0で固定
        collection_division_id: Number(editFormVal.collection_division_id),
        collection_price: this.COLLECTION_PRICE, // 回収料金は0で固定
        delivery_charge_flag: this.selectedProductDeliveryChargeFlag,
        scheduled_rental_date: new Date(
          String(editFormVal.scheduledDateGroup?.scheduled_rental_date)
        ).toLocaleDateString(),
        scheduled_return_date: new Date(
          String(editFormVal.scheduledDateGroup?.scheduled_return_date)
        ).toLocaleDateString(),
        rental_date: editFormVal.dateGroup?.rental_date
          ? new Date(
              String(editFormVal.dateGroup?.rental_date)
            ).toLocaleString()
          : '',
        return_date: editFormVal.dateGroup?.return_date
          ? new Date(
              String(editFormVal.dateGroup?.return_date)
            ).toLocaleString()
          : '',
        delinquency_flag: 0,
        grace_period_end: gracePeriodEnd ? gracePeriodEnd : '',
        late_fee: Number(editFormVal.late_fee),
        late_return_reported: editFormVal.late_return_reported,
        settle_status_division_id: this.editTarget.settle_status_division_id,
        remarks_1: editFormVal.remarks_1 ? String(editFormVal.remarks_1) : '',
        remarks_2: editFormVal.remarks_2 ? String(editFormVal.remarks_2) : '',
        return_employee_id: editFormVal.return_employee_id
          ? String(editFormVal.return_employee_id)
          : '',
        rental_employee_id: editFormVal.rental_employee_id
          ? String(editFormVal.rental_employee_id)
          : '',
      };
    } else {
      postData = {
        rental_slip_id: this.selectedId,
        rental_product_id: Number(formVal.rental_product_id),
        rental_item_count: this.RENTAL_ITEM_COUNT, // 予約数は1で固定
        rental_fee: this.selectedProductDeliveryChargeFlag
          ? formVal.rental_fee
          : rentalFee,
        delivery_division_id: Number(formVal.delivery_division_id),
        delivery_price: this.DElIVERY_PRICE, // 配送料金は0で固定
        collection_division_id: Number(formVal.collection_division_id),
        collection_price: this.COLLECTION_PRICE, // 回収料金は0で固定
        delivery_charge_flag: this.selectedProductDeliveryChargeFlag,
        scheduled_rental_date: new Date(
          String(formVal.scheduledDateGroup?.scheduled_rental_date)
        ).toLocaleString(),
        scheduled_return_date: new Date(
          String(formVal.scheduledDateGroup?.scheduled_return_date)
        ).toLocaleString(),
        delinquency_flag: 0,
        late_return_reported: 0,
        settle_status_division_id: this.settleStatusDivision.id,
        remarks_1: formVal.remarks_1 ? String(formVal.remarks_1) : '',
        remarks_2: formVal.remarks_2 ? String(formVal.remarks_2) : '',
      };
    }

    // レンタル商品情報更新開始
    this.isUpdatingRental = true;

    // 登録と編集のオブザーバブルを作成
    let observable$ = this.rentalService.add(postData).pipe(
      catchError((error: HttpErrorResponse) => {
        return of(error);
      }),
      finalize(() => {
        // 新規登録ターゲットを削除
        this.addFormCancel();
      })
    );

    if (isEditing) {
      observable$ = this.rentalService
        .update(this.editTarget.id, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => {
            // 編集ターゲットを削除
            this.editFormCancel();
          })
        );
    }

    this.subscription.add(
      observable$.subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.isUpdatingRental = false;
          this.createHttpErrorAndExecHandleError(res, this.listPagePath);
          return;
        }
        // レスポンスがnull undefinedか
        if (res === null || res === undefined) {
          this.isUpdatingRental = false;
          this.createErrorAndExecHandleError(
            'レンタル明細の登録に失敗しました。一覧画面へ戻ります。',
            this.listPagePath
          );
          return;
        }

        //Add Product status
        let status: number;
        if (this._dateToString(postData.return_date) == '') {
          status = this.PRODUCT_STATUS_DIVISION_RENTED;
        } else {
          status = this.PRODUCT_STATUS_DIVISION_CLEANING;
        }

        this.action_num = 0;
        this.action_num += rentalProduct ? 1 : 0;
        this.action_num += this.addDiffRecord.length;
        this.action_num += this.ProductData.length;

        if (postData.length > 0) {
          this.updateRentalItem(postData);
        }
        // add diff rental
        if (this.addDiffRecord.length > 0) {
          this.addRentalItem(this.addDiffRecord[0]);
        }
        if (rentalProduct) {
          const changeStatus: RentalProductChangeStatus = {
            product_id_list: String(rentalProduct.id),
            status_division_id: status,
          };
          this.setRentalProductStatusDivisionId(changeStatus);
          this.act_num += 1;
          this.rsService.setActionNum(this.act_num);
        }
        this.actNumSubscription = this.rsService.actionNum$.subscribe(
          (action_num) => {
            if (action_num > 0 && action_num === this.act_num) {
              // Update Rental Slip
              //全体で借りているアイテム数
              const status_division_id = this.getStatusDivisionId(postData);
              this.statusDivisionIdUpdate(status_division_id.value, () =>
                console.log('Updated')
              );
              this.executeAction();
            } else {
              console.log('check');
            }
          }
        );
      })
    );
  }

  getStatusDivisionId(postData: any) {
    let division_status_id: any = this.statusDivisionOptions.find((x) => {
      return x.text === this.rs.division_status_value;
    });

    if (postData.rental_date && !postData.return_date) {
      //貸出
      const rental_date_num = this.rentals.filter((x) => {
        return x.rental_date != '';
      });

      if (
        this.rentals.length > 0 &&
        rental_date_num.length + 1 >= this.rentals.length
      ) {
        // 全て貸出状態
        division_status_id = this.statusDivisionOptions.find((x) => {
          return x.text === rentalSlipConst.STATUS.ALL_RENTED;
        });
      } else {
        // 一部貸出状態
        division_status_id = this.statusDivisionOptions.find((x) => {
          return x.text === rentalSlipConst.STATUS.PARTIALLY_RENTED;
        });
      }
    } else if (postData.rental_date && postData.return_date) {
      // 返却
      const return_date_num = this.rentals.filter((x) => {
        return x.return_date != '';
      });
      if (
        this.rentals.length > 0 &&
        return_date_num.length + 1 >= this.rentals.length
      ) {
        // 全て返却済み
        division_status_id = this.statusDivisionOptions.find((x) => {
          return x.text === rentalSlipConst.STATUS.ALL_RETURNED;
        });
      } else {
        // 一部返却済み
        division_status_id = this.statusDivisionOptions.find((x) => {
          return x.text === rentalSlipConst.STATUS.PARTIALLY_RETURNED;
        });
      }
    }

    return division_status_id;
  }
  /**
   * 予約を1件削除する
   *
   * @param rentalId
   * @returns
   */
  deleteRental(rentalId: number) {
    // 貸出日の設定があれば削除不可とする
    let rental: any;

    rental = this.rentals.find((x) => {
      return x.id === rentalId;
    });

    // 貸出日の設定があれば削除不可とする
    rental = this.overdue_rentals.find((x) => {
      return x.id === rentalId;
    });

    if (rental?.rental_date) {
      this.createErrorAndExecHandleError(
        '貸出日が設定されたデータのため削除ができません。データの削除が必要な場合はシステム管理者までお問い合わせください。',
        this.listPagePath
      );
      return;
    }

    // モーダルのタイトル
    const modalTitle = 'レンタル' + modalConst.TITLE.DELETE;
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
            // データ更新前にレンタルから削除
            this.rentals = this.rentals.filter((x) => x.id !== rentalId);
            // 更新処理ローディング開始
            this.isUpdatingRental = true;
            // 削除実行
            this.rentalService
              .remove(rentalId)
              .pipe(
                finalize(() => (this.isUpdatingRental = false)),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  this.createErrorAndExecHandleError(
                    'レンタル明細の削除に失敗しました。一覧画面へ戻ります。',
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
                // TODO: レンタル明細を取得し直す
                // this.getCustomerOrders(this.cors.id);
              });
          }
        })
    );
  }

  /**
   * 配送登録ページへ売上タイプと受付票idをクエリパラメータとして渡して遷移させる
   */
  toRegisterDeliverySchedulePage() {
    const salesType = deliveryConst.SALES_TYPE.find((x) => {
      return x.name === deliveryConst.RENTAL;
    });
    this.router.navigate(['delivery/add'], {
      queryParams: { salesType: salesType?.id, slipId: this.selectedId },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.actNumSubscription) {
      this.actNumSubscription.unsubscribe();
    }
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
   * レンタル商品とレンタル期間からレンタル料金を計算する
   */
  calculateRentalFee(
    rentalProduct: RentalProduct,
    scheduledRentalDate: string,
    scheduledReturnDate: string
  ): number | Error {
    // レンタル商品の売価を取得する
    const sellingPrice = rentalProduct.selling_price;

    // 商品の配送料フラグを取得する
    const deliveryChargeFlag = rentalProduct.delivery_charge_flag;
    // 配送料金の場合はレンタル泊数などは影響しないので商品の販売価格を返す
    if (deliveryChargeFlag) {
      return sellingPrice;
    }

    // 消費税区分を取得する
    const saleTaxDivisionCode = Number(rentalProduct.division_sales_tax_code);
    // 税率と内税・外税のフラグを取得する
    const taxAndTaxIncludedFlag =
      getTaxRateAndTaxIncludedFlag(saleTaxDivisionCode);
    // 端数処理区分を取得する
    const salesFractionDivisionCode = Number(
      rentalProduct.division_sales_fraction_code
    );
    // 端数処理に利用するメソッド名を取得する
    const fractionMethod: RoundingMethod = getFractionMethod(
      salesFractionDivisionCode
    );

    // 販売価格から税込価格、税抜価格、消費税額を取得する
    const multiplePrices = calculatePrice(
      sellingPrice,
      taxAndTaxIncludedFlag.taxRate,
      taxAndTaxIncludedFlag.isTaxIncluded,
      fractionMethod
    );

    // エラーが返ってきた場合
    if (multiplePrices instanceof Error) {
      // エラーをスローする
      throw multiplePrices;
    }

    // レンタル予定日数を取得するために時間を0にする
    const rentalD = new Date(String(scheduledRentalDate)).setHours(0, 0, 0, 0);
    const hoursZeroScheduledRentalDate = new Date(rentalD);
    const returnD = new Date(String(scheduledReturnDate)).setHours(0, 0, 0, 0);
    const hoursZeroScheduledReturnDate = new Date(returnD);

    // レンタル予定日数を取得
    const rentalDays = daysBetweenDates(
      hoursZeroScheduledRentalDate,
      hoursZeroScheduledReturnDate
    );

    let taxIncludingPrice = 0;

    // 税込価格の場合は販売価格で計算する
    if (taxAndTaxIncludedFlag.isTaxIncluded) {
      taxIncludingPrice = sellingPrice;
    } else {
      // 税抜価格の場合は税抜価格と消費税を足して計算する
      taxIncludingPrice =
        multiplePrices.priceWithoutTax + multiplePrices.taxAmount;
    }

    // レンタル泊数が0日の場合は販売価格を返す
    if (rentalDays === 0) {
      // ニッシン様の価格まるめの仕様に合わせて販売価格調整して返す
      return roundPrice(taxIncludingPrice);
    }

    // 1泊以上の場合は販売価格から30%割引した価格で提供する
    // 30%割引した価格を計算する
    const discountPrice = taxIncludingPrice * this.discount_price_late;
    // 販売価格から30%割引した価格に泊数+1した値を掛けた価格を取得する
    // 1日分 + 2日以降(30%割引)価格
    const rentalFee = taxIncludingPrice + discountPrice * rentalDays;
    // ニッシン様の価格まるめの仕様に合わせて販売価格調整して返す
    return roundPrice(rentalFee);
  }

  /**
   * レンタル商品IDのサジェストを取得
   * @returns
   */
  getRntalPrice(product_id: String): ApiInput<RentalProductApiResponse> {
    return {
      observable: this.rentalProductService.getAll({
        // 商品IDで検索
        id: product_id,
      }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'rental_price',
    };
  }

  /**
   * 貸出当日ボタンのdisabledチェック(明細単位)
   */
  detailUnitdisabledRentalTodayButton(): boolean {
    let formControlState = false;
    // 基本部分

    if (this.statusForm.invalid) {
      formControlState = true;
    }
    if (this.editForm.invalid) {
      formControlState = true;
    }

    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = true;
    }
    // 明細単位かつrental_employee_idが格納済み
    let unit = this.processingUnits.find((x) => {
      return x.text === '明細単位';
    });

    if (unit?.value !== this.statusFc.processing_units.value) {
      formControlState = true;
    }
    if (!this.editForm.get('rental_employee_id')?.value) {
      formControlState = true;
    }
    /*if(!this.editForm.get('dateGroup.rental_date')?.value ) {
      formControlState = true;
    }*/
    return formControlState;
  }

  /**
   * 貸出ボタンのdisabledチェック(明細単位)
   */
  detailUnitdisabledRentalSaveButton(): boolean {
    let formControlState = false;

    // 基本部分

    if (this.statusForm.invalid) {
      formControlState = true;
    }
    if (this.editForm.invalid) {
      formControlState = true;
    }

    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = true;
    }
    // 明細単位かつrental_employee_idが格納済み
    let unit = this.processingUnits.find((x) => {
      return x.text === '明細単位';
    });

    /*
    if (unit?.value !== this.statusFc.processing_units.value) {
      formControlState = true;
    }*/

    /*if (!this.editForm.get('rental_employee_id')?.value) {
      formControlState = true;
    }*/

    // 日付の格納
    /*if (!this.editForm.get('dateGroup.rental_date')?.value) {
      formControlState = true;
    }*/
    /*
    if(!this.editForm.get('dateGroup.return_date')?.value) {
      formControlState = true;
    }*/

    return formControlState;
  }

  /**
   * 返却ボタンのdisabledチェック(明細単位)
   */
  detailUnitdisabledReturnSaveButton(): boolean {
    let formControlState = false;

    // 基本部分

    if (this.statusForm.invalid) {
      formControlState = true;
    }
    if (this.editForm.invalid) {
      formControlState = true;
    }

    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = true;
    }
    // 明細単位かつrental_employee_idが格納済み
    let unit = this.processingUnits.find((x) => {
      return x.text === '明細単位';
    });
    /*
    if (unit?.value !== this.statusFc.processing_units.value) {
      formControlState = true;
    }*/
    /*
    if (!this.editForm.get('return_employee_id')?.value) {
      formControlState = true;
    }

    // 日付の格納
    if (!this.editForm.get('dateGroup.rental_date')?.value) {
      formControlState = true;
    }

    if (!this.editForm.get('dateGroup.return_date')?.value) {
      formControlState = true;
    }*/

    return formControlState;
  }

  detailUnitdisabledRentalTodayButtonBarcode(): boolean {
    let formControlState = false;
    // 受付票発行済みの場合
    if (this.statusForm.invalid === true) {
      return true;
    }
    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      return true;
    }

    if (this.editForm.invalid) {
      return true;
    }
    return formControlState;
  }
  /**
   * 貸出当日ボタンのdisabledチェック(受付単位)
   * @returns
   */
  disabledRentalTodayButton(): boolean {
    let formControlState = false;

    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = false;
      return true;
    }

    // 受付票発行済みの場合
    if (this.statusForm.invalid === true) {
      return true;
    }
    let bulk_form_data = this.bulkForm.value;
    if (!bulk_form_data.rental_employee_id) {
      formControlState = true;
    }

    return formControlState;
  }

  /**
   * 返却当日ボタンのdisabledチェック
   * @returns
   */
  disabledReturnTodayButton(): boolean {
    let formControlState = false;
    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = true;
      return true;
    }

    if (this.rs.division_status_value !== this.rsConst.STATUS.ACCEPTED) {
      // 受付票発行済みの場合
      if (this.statusForm.invalid === true) {
        return true;
      }
    }
    let bulk_form_data = this.bulkForm.value;
    if (!bulk_form_data.return_employee_id) {
      formControlState = true;
    }

    return formControlState;
  }

  /**
   * 保存ボタンのdisabledチェック
   * @returns
   */
  disabledBulkSaveButton(): boolean {
    let formControlState = false;
    if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = true;
      return true;
    }
    if (this.statusForm.invalid === true) {
      return true;
    }

    /*
    let bulk_form_data = this.bulkForm.value;

    if (
      bulk_form_data.dateGroup?.rental_date &&
      !bulk_form_data.dateGroup?.return_date
    ) {
      formControlState = true;
    }
    
    if (this.rentalItemStatus === false) {
      // 貸出のみ
      if (!bulk_form_data.rental_employee_id) {
        formControlState = true;
      }
    } else {
      // 貸出・返却両方使用可能
      if (
        !bulk_form_data.rental_employee_id ||
        !bulk_form_data.return_employee_id
      ) {
        formControlState = true;
      }
    }
    */
    return formControlState;
  }
  /**
   * 貸出時 保存ボタンのdisabledチェック
   * @returns
   */
  disabledBulkRentalSaveButton(): boolean {
    let formControlState = false;
    /*if (
      this.rs.division_customer_type_code ===
        Number(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL) &&
      this.selectedCustomer.isIdConfirmationRequired === false
    ) {
      formControlState = true;
      return true;
    }*/

    if (this.statusForm.invalid === true) {
      return true;
    }

    /*let bulk_form_data = this.bulkForm.value;
    
    if (!bulk_form_data.dateGroup?.rental_date) {
      formControlState = true;
    }

    if (this.rentalItemStatus === false) {
      // 貸出のみ
      if (!bulk_form_data.rental_employee_id) {
        formControlState = true;
      }
    } else {
      // 貸出・返却両方使用可能
      if (
        !bulk_form_data.rental_employee_id ||
        !bulk_form_data.return_employee_id
      ) {
        formControlState = true;
      }
    }*/

    return formControlState;
  }
  /**
   * 本人確認書類の確認日時を更新する
   * 「本人確認書類を確認しました」ボタンクリック時に実行する
   */
  confirmedIdentityVerificationDocuments() {
    let updateCustomerData$: Observable<RentalSlipApiResponse>;
    // 更新対象のお客様情報を設定する
    const today = new Date().toLocaleString();
    const postData = {
      reception_date: this.rs.reception_date,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
      customer_type_division_id: this.rs.customer_type_division_id,
      reception_employee_id: this.rs.reception_employee_id,
      status_division_id: this.rs.status_division_id,
      store_id: this.rs.store_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      processing_units: this.rs.processing_units,
      mobile_number: this.rs.mobile_number,
      send_sms_flg: this.rs.send_sms_flg,
      last_name: this.rs.last_name,
      first_name: this.rs.first_name,
      last_name_kana: this.rs.last_name_kana,
      first_name_kana: this.rs.first_name_kana,
      shipping_address: this.rs.shipping_address,
      tel: this.rs.tel,
      identification_document_confirmation_date: today,
    };
    // 会員情報を更新するオブザーバー作成する
    updateCustomerData$ = this.rsService.update(this.selectedId, postData);

    // お客様情報を更新する
    this.updateCustomerData(updateCustomerData$);
  }

  /**
   * お客様データを更新する
   * @param updateCustomerData$ - お客様データ更新オブザーバー
   */
  updateCustomerData(updateCustomerData$: Observable<RentalSlipApiResponse>) {
    // ローディング開始
    this.common.loading = true;
    this.subscription.add(
      updateCustomerData$
        .pipe(
          catchError((error) => {
            return of(error);
          }),
          finalize(() => {
            this.common.loading = false;
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラーが発生しました';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message);
            this.common.loading = false;
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        })
    );
  }

  /**
   * アップデートのみの処理
   * @param today 当日日付
   */
  rentalDiffItemUpdate(today: string | '') {
    this.common.loading = true;
    let get_datetime = new Date();
    //
    this.checkConfirmationRequired(today, get_datetime.toISOString());
    // 編集モードの場合のフラグ設定
    const isEditing =
      this.editTarget && Object.keys(this.editTarget).length > 0 ? true : false;
    const editFormVal = this.editForm.value;

    // 遅延連絡ありの場合返却予定日の翌日9時を返却リミットへセット
    let rental = this.editTarget;
    let rentalProduct = this.editTargetProduct;
    let rentalFee = rental.rental_fee;
    let gracePeriodEnd = this.setGracePeriodEnd(editFormVal);

    // POSTデータを作る
    let postData: any = {};
    postData = {
      id: this.editTarget.id,
      rental_slip_id: this.selectedId,
      rental_product_id: Number(editFormVal.rental_product_id),
      rental_item_count: this.RENTAL_ITEM_COUNT, // 予約数は1で固定
      rental_fee: this.selectedProductDeliveryChargeFlag
        ? editFormVal.rental_fee
        : rentalFee,
      delivery_division_id: Number(editFormVal.delivery_division_id),
      delivery_price: this.DElIVERY_PRICE, // 配送料金は0で固定
      collection_division_id: Number(editFormVal.collection_division_id),
      collection_price: this.COLLECTION_PRICE, // 回収料金は0で固定
      delivery_charge_flag: this.selectedProductDeliveryChargeFlag,
      scheduled_rental_date: new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_rental_date)
      ).toLocaleDateString(),
      scheduled_return_date: new Date(
        String(editFormVal.scheduledDateGroup?.scheduled_return_date)
      ).toLocaleDateString(),
      rental_date: editFormVal.dateGroup?.rental_date
        ? this._dateToString(editFormVal.dateGroup?.rental_date)
        : '',
      return_date: editFormVal.dateGroup?.return_date
        ? this._dateToString(editFormVal.dateGroup?.return_date)
        : '',
      delinquency_flag: 0,
      grace_period_end: gracePeriodEnd ? gracePeriodEnd : '',
      late_fee: Number(editFormVal.late_fee),
      late_return_reported: editFormVal.late_return_reported,
      settle_status_division_id: this.editTarget.settle_status_division_id,
      remarks_1: editFormVal.remarks_1 ? String(editFormVal.remarks_1) : '',
      remarks_2: editFormVal.remarks_2 ? String(editFormVal.remarks_2) : '',
      return_employee_id: editFormVal.return_employee_id
        ? String(editFormVal.return_employee_id)
        : '',
      rental_employee_id: editFormVal.rental_employee_id
        ? String(editFormVal.rental_employee_id)
        : '',
      refund_fee: editFormVal.refund_fee ? Number(editFormVal.refund_fee) : 0,
    };

    /**
     * return_date入力チェック
     */
    if (!editFormVal.dateGroup?.return_date) {
      this.createErrorAndExecHandleError(
        '返却日が未入力のため、更新できません。',
        ''
      );
    }

    /**
     *  更新処理開始
     */
    let observable$ = this.rentalService
      .update(this.editTarget.id, postData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => {
          console.log('1. observable$');
          // 編集ターゲットを削除
          this.editFormCancel();
        })
      );

    this.subscription.add(
      observable$.subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.isUpdatingRental = false;
          this.createHttpErrorAndExecHandleError(res, this.listPagePath);
          return;
        }
        // レスポンスがnull undefinedか
        if (res === null || res === undefined) {
          this.isUpdatingRental = false;
          this.createErrorAndExecHandleError(
            'レンタル明細の登録に失敗しました。一覧画面へ戻ります。',
            this.listPagePath
          );
          return;
        }
        /** rentalitemのparentのみ処理 */
        this.updateRentalItem(postData, true);

        this.subscription.add(
          this.updateSlipInfo().subscribe(() => {
            //this.initialization(this.selectedId);
            //this.common.loading = false;
            window.location.reload();
          })
        );
      })
    );
  }

  /**
   * 受付タグが必須解除になるステータスIDを取得
   * 受付済み、 受付票発行済み、 貸出準備完了、 キャンセルは必須解除
   *
   */
  getStatusIdForNotRequiredReceptionTag(): number[] {
    // 受付済み、 受付票発行済み、 貸出準備完了、 キャンセルは必須解除
    return [
      this.rsConst.STATUS_CODE.ACCEPTED,
      this.rsConst.STATUS_CODE.TICKET_ISSUED,
      this.rsConst.STATUS_CODE.READY_FOR_RENTAL,
      this.rsConst.STATUS_CODE.CANCELLED,
    ];
  }

  subscriptionStatusDivisionIdUpdate() {
    // ステータスの変更による受付タグの必須を変更
    this.statusForm.controls.status_division_id.valueChanges.subscribe(
      (value: number) => {
        // console.log("status_division_id:: ", value);
        // console.log("this.reception_tag_require_status_divisions:: ", this.reception_tag_require_status_divisions);
        const notRequired =
          this.reception_tag_require_status_divisions.includes(Number(value));
        if (notRequired) {
          this.receptionTagNotRequired();
        } else {
          this.receptionTagRequired();
        }
      }
    );
  }

  /**
   * 受付タグを必須にする
   */
  receptionTagRequired() {
    this.reception_tag_require = true;
    const ctrl = this.statusForm.controls.reception_tag;
    ctrl.setValidators([Validators.required]);
    ctrl.updateValueAndValidity();
  }

  /**
   * 受付タグの必須を解除する
   */
  receptionTagNotRequired() {
    this.reception_tag_require = false;
    const ctrl = this.statusForm.controls.reception_tag;
    ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }
}
