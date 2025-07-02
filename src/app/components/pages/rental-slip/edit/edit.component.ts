import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  finalize,
  forkJoin,
  map,
  of,
  take,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { rentalSlipConst } from 'src/app/const/rental-slip.const';
import { rentalProductConst } from 'src/app/const/rental-product.const';
import { generalConst } from 'src/app/const/general.const';
import { deliveryConst } from 'src/app/const/delivery.const';
import { Client, ClientApiResponse } from 'src/app/models/client';
import { Employee } from 'src/app/models/employee';
import { Member, MemberApiResponse } from 'src/app/models/member';
import { RentalSlip } from 'src/app/models/rental-slip';
import { AuthorService } from 'src/app/services/author.service';
import { ClientService } from 'src/app/services/client.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { MemberService } from 'src/app/services/member.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { RentalSlipService } from 'src/app/services/rental-slip.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { StoreService } from 'src/app/services/store.service';

import { LargeCategoryService } from 'src/app/services/large-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { SmallCategoryService } from 'src/app/services/small-category.service';
import { LargeCategory } from 'src/app/models/large-category';
import { MediumCategory } from 'src/app/models/medium-category';
import { SmallCategory } from 'src/app/models/small-category';

import {
  RoundingMethod,
  calculatePrice,
  daysBetweenDates,
  getFractionMethod,
  getTaxRateAndTaxIncludedFlag,
  roundPrice,
} from 'src/app/functions/shared-functions';
import {
  FormService,
  RentalAddFormInitialValueType,
} from 'src/app/services/rental-slip/form.service';
import {
  ReservationStatusBody,
  ReservationStatusHeader,
  createReservationStatusHeader,
  generateBodyData,
  mapProductsToRentals,
} from 'src/app/functions/rental-functions';

import { ApiInput } from 'src/app/components/molecules/search-suggest-container/search-suggest-container.component';

import { RentalProductService } from 'src/app/services/rental-product.service';
import {
  RentalProduct,
  RentalProductApiResponse,
} from 'src/app/models/rental-product';

import { RentalService } from 'src/app/services/rental.service';
import { Rental } from 'src/app/models/rental';
import { DivisionIdService } from 'src/app/services/shared/divisionid.service';
import { recalculationRentalFee } from '../detail/detail.component';

type RentalEditAddFormInitialValueType = {
  id?: number;
  rental_product_id: number;
  rental_product_name: string; // 一覧表示用
  rental_date: string; // 貸出日
  rental_item_count: number; // レンタル個数
  delinquency_flag: number; // 延滞フラグ
  selling_price: number; // 一覧表示用
  division_status_value: string; // 一覧表示用
  rental_fee?: number;
  delivery_division_id?: number;
  collection_division_id?: number;
  scheduledDateGroup?: {
    scheduled_rental_date?: string;
    scheduled_return_date?: string;
  };
  remarks_1?: string;
  remarks_2?: string;
};

// お客様タイプ 会員・得意先
type CustomerType = 'member' | 'client';
type CustomerTypes = {
  value: string;
  display: string;
  division_id: number;
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

// レンタル商品取得制限タイプ
type RentalProductAcquisitionType = 'all' | 'reservable';

// 分類階層
type CategoryLevel = 'large' | 'medium' | 'small';

// レンタル受付票登録用データ型
type RentalSlipPostDataType = {
  store_id: number;
  reception_employee_id: number;
  reception_date: string;
  remarks_1: string;
  remarks_2: string;
  mobile_number: string;
  shipping_address: string;
  status_division_id: number;
  incident_division_id: number;
  settle_status_division_id: number;
  customer_type_division_id: number;
  member_id?: number; // このプロパティはオプショナルです
  client_id?: number; // このプロパティはオプショナルです
  rental: any[];
  send_sms_flg?: number;
  processing_units?: number;
};

type initDate = {
  bulkScheduledDateGroup?: {
    bulk_scheduled_rental_date?: string;
    bulk_scheduled_return_date?: string;
  };
};
export type EmployeeFormType = {
  rental_employee_id: FormControl;
  return_employee_id: FormControl;
};

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param fb
   * @param authorService
   * @param modalService
   * @param router
   * @param storeService
   * @param clientService
   * @param memberService
   * @param employeeService
   * @param divisionService
   * @param errorService
   * @param rsService
   * @param flashMessageService
   */
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private authorService: AuthorService,
    private modalService: ModalService,
    private router: Router,
    private storeService: StoreService,
    private clientService: ClientService,
    private memberService: MemberService,
    private employeeService: EmployeeService,
    private divisionService: DivisionService,
    private errorService: ErrorService,
    private rsService: RentalSlipService,
    private flashMessageService: FlashMessageService,
    private activatedRoute: ActivatedRoute,
    private common: CommonService,
    private largeCategoryService: LargeCategoryService,
    private mediumCategoryService: MediumCategoryService,
    private smallCategoryService: SmallCategoryService,
    private rentalProductService: RentalProductService,
    private rentalService: RentalService,
    private dIService: DivisionIdService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // レンタル・滞納・返金額 2日目移行の価格割合
  discount_price_late: number = 1;

  idConfirmationDate: boolean = false;

  // 選択中のレンタル受付票
  rentalSlip!: RentalSlip;

  // 一覧のパス
  listPagePath = '/rental-slip';
  errorHasOccurred = false;

  // 選択中のID
  selectedId!: number;
  processingUnit!: any;
  processingUnitValue!: string;
  // 詳細画面のパス
  detailPagePath!: string;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = 'レンタル受付票編集キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = 'レンタル受付票編集エラー：' + modalConst.TITLE.HAS_ERROR;

  rentalDivisionListName = 'レンタル商品ステータス区分';

  // 最終更新者ユーザー名
  lastUpdater!: string;

  // 受付票ステータス選択肢
  statusDivisions!: SelectOption[];

  // 社員サジェスト
  employeeSuggests!: SelectOption[];

  // 社員サジェスト
  _employeeSuggests!: SelectOption[];

  // 得意先
  clients!: Client[];
  _clientsColumn: string =
    'id,name,name_kana,province,locality,street_address,other_address,tel';

  // 得意先サジェスト
  clientSuggests!: SelectOption[];

  // 会員
  members!: Member[];
  _membersColumn: string =
    'id,last_name,first_name,last_name_kana,first_name_kana,province,locality,street_address,other_address,tel,identification_document_confirmation_date';

  // 会員サジェスト
  memberSuggests!: SelectOption[];

  // 店舗選択肢
  storeSuggests!: SelectOption[];

  // ステータス区分Id
  statusDivisionId!: string;

  // 精算ステータス区分Id
  settleStatusDivisionId!: string;

  // インシデント発生区分Id
  incidentDivisionId!: string;

  // インシデント発生区分選択肢
  incidentDivisions!: SelectOption[];

  // 精算区分選択肢
  settleDivisions!: SelectOption[];

  // エラー文言
  errorConst = errorConst;

  divisionConst = divisionConst;

  // レンタル受付票定数
  rsConst = rentalSlipConst;
  // レンタル受付票お客様タイプ区分が会員の場合の初期値の定数
  RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER!: number;
  // レンタル受付票お客様タイプ区分が得意先の場合の初期値の定数
  RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT!: number;

  // 貸出中
  RENTED = rentalProductConst.STATUS.RENTED;
  // 貸出可能
  RENTABLE = rentalProductConst.STATUS.RENTABLE;
  // 得意先フォームグループ
  clientForm = this.fb.group({
    client_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    shipping_address: ['', [Validators.maxLength(255)]],
  });

  // 会員フォームグループ
  memberForm = this.fb.group({
    member_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    shipping_address: ['', [Validators.maxLength(255)]],
  });
  generalForm = this.fb.group({
    //以下一般ユーザー
    last_name: ['', [Validators.required, Validators.maxLength(255)]],
    first_name: ['', [Validators.maxLength(255)]],
    last_name_kana: [
      '',
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    first_name_kana: [
      '',
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    shipping_address: ['', [Validators.maxLength(255)]],
    tel: [
      '',
      [
        Validators.required,
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    identification_document_confirmation_date: ['', [Validators.required]],
  });

  // 共通フォーム
  commonForm = this.fb.group({
    reception_date: ['', [Validators.required]],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
    customer_type_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    store_id: ['', [Validators.required]],
    reception_employee_id: ['', [Validators.required]],
    status_division_id: [
      Validators.required,
      Validators.pattern(regExConst.NUMERIC_REG_EX),
    ],
    settle_status_division_id: [
      Validators.required,
      Validators.pattern(regExConst.NUMERIC_REG_EX),
    ],
    incident_division_id: [
      Validators.required,
      Validators.pattern(regExConst.NUMERIC_REG_EX),
    ],
    mobile_number: [
      '',
      [
        Validators.minLength(10),
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    send_sms_flg: [''],
    processing_units: [''],
    idConfirmationDate: [''],
  });

  // レンタル受付票に紐付くレンタル明細
  rentals!: Rental[];
  overdue_rentals!: Rental[];

  // お客様タイプ選択肢
  customerTypes!: SelectOption[];
  customerTypes_!: any[];

  // お客様タイプ定数
  MEMBER: CustomerType = 'member';
  CLIENT: CustomerType = 'client';

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

  // 選択中のお客様情報
  selectedCustomer!: SelectedCustomerType;
  // 選択したお客様タイプ
  customerType!: any;

  /*
   * set default
   * 選択中のお客様タイプ 初期値は会員を設定
   * フロントのフォームの出し入れに使用します
   */
  selectedCustomerCode!: string;

  // SMS送信の有無
  selectedSMS: number = 0;

  // 選択中の会員・得意先情報
  selectedMember!: Member;
  selectedClient!: Client;

  identificationIsChecked: boolean = false;
  // 一般免許書確認
  // SMS送信の有無
  idCheckedDateTime: number = 0;
  // 会員・得意先サジェスト表示フラグ デフォルトは会員サジェストを表示
  showMemberSuggest: boolean = false;
  showClientSuggest: boolean = false;

  // 処理単位定数
  ONEBYONE: string = 'ONEBYONE';
  BULK: string = 'BULK';
  PROCESSINGUNIT_ONEBYONE_VALUE = 1;
  PROCESSINGUNIT_BULK_VALUE = 0;

  // 処理単位デフォルト値
  processingUnitsDefaultValue: number = 0;
  processingUnitsPostValue: number = 0;
  // 処理単位Processing Units
  processingUnits: {
    processing_units_id: number;
    value: string;
    display: string;
  }[] = [
    {
      processing_units_id: this.PROCESSINGUNIT_ONEBYONE_VALUE,
      value: this.ONEBYONE,
      display: '明細単位',
    },
    {
      processing_units_id: this.PROCESSINGUNIT_BULK_VALUE,
      value: this.BULK,
      display: '受付票単位',
    },
  ];
  // 選択中のお客様タイプ 初期値は会員を設定
  selectedprocessingUnits: string = this.ONEBYONE;
  // 会員・得意先サジェスト表示フラグ デフォルトは会員サジェストを表示
  showOnebyoneSuggest: boolean = true;
  showBulkSuggest: boolean = true;

  smsIsChecked: boolean = false;

  // 貸出担当 rental.rental_employee_id に格納
  rental_employee!: String;

  // 返却担当 rental.return_employee_id に格納
  return_employee!: String;

  //担当者コントロール
  rentalEmployeeForms = this.fb.group({
    rental_employee_id: [''],
    return_employee_id: [''],
  });

  // レンタル受付票フォーム作成
  rentalSlipForm = this.formService.createRentalSlipForm(this.fb);

  initialDate: initDate = {
    bulkScheduledDateGroup: {
      bulk_scheduled_rental_date: new Date().toISOString(),
      bulk_scheduled_return_date: new Date().toISOString(),
    },
  };

  rentalDateForms: FormGroup = this.fb.group({
    bulkScheduledDateGroup: this.fb.group({
      bulk_scheduled_rental_date: [
        new Date(
          String(
            this.initialDate['bulkScheduledDateGroup']
              ?.bulk_scheduled_rental_date
          )
        ),
      ],
      bulk_scheduled_return_date: [
        new Date(
          String(
            this.initialDate['bulkScheduledDateGroup']
              ?.bulk_scheduled_return_date
          )
        ),
      ],
    }),
  });

  getScheduledRentalDateControl(form: FormGroup) {
    return form
      .get('scheduledDateGroup')
      ?.get('scheduled_rental_date') as FormControl;
  }

  getScheduledReturnDateControl(form: FormGroup) {
    return form
      .get('scheduledDateGroup')
      ?.get('scheduled_return_date') as FormControl;
  }

  getBulkScheduledRentalDateControl() {
    return this.rentalDateForms
      .get('bulkScheduledDateGroup')
      ?.get('bulk_scheduled_rental_date') as FormControl;
  }

  getBulkScheduledReturnDateControl() {
    return this.rentalDateForms
      .get('bulkScheduledDateGroup')
      ?.get('bulk_scheduled_return_date') as FormControl;
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  // edit 展開時にオープンする作業担当者区分判定用
  // 開きっぱなしでよいので true
  rentalItemStatus: boolean = true;

  /**
   * 貸出担当者をidを指定して取得しフォームに設定する
   * @param id 受付担当者id
   * @returns
   */
  getEmployeeByIdRental(id: string) {
    this.employeeSuggests.find((x) => {
      if (Number(x.value) === Number(id)) {
        this.rentalEc.rental_employee_id.patchValue(x.value);
        this.rental_employee = String(x.value);
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
        this.rentalEc.return_employee_id.patchValue(x.value);
        this.return_employee = String(x.value);
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
   * SMSボタン押下
   */
  onCheckSmsSend(event: any) {
    if (event.target.checked) {
      this.smsIsChecked = true;
      this.selectedSMS = 1;
    } else {
      this.smsIsChecked = false;
      this.selectedSMS = 0;
    }
  }

  get clientCtrls() {
    return this.clientForm.controls;
  }

  get memberCtrls() {
    return this.memberForm.controls;
  }

  get commonFc() {
    return this.commonForm.controls;
  }

  get generalFc() {
    return this.generalForm.controls;
  }

  get rentalDateFormsControls() {
    return this.rentalDateForms.controls;
  }

  get rentalEc(): EmployeeFormType {
    return this.rentalEmployeeForms.controls;
  }

  rentalAddForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  get rentalAddFormArray() {
    return this.rentalAddForms.get('forms') as FormArray;
  }

  get rentalAddFormArrayControls() {
    return this.rentalAddFormArray.controls as FormGroup[];
  }

  // 配送区分選択肢
  deliveryDivisionOptions!: SelectOption[];
  // 回収区分選択肢
  collectionDivisionOptions!: SelectOption[];

  // 配送依頼区分の配送なしを定数として保持する
  // TODO: 都度区分テーブルから取得して設定するか検討が必要
  DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY!: number;

  // 回収依頼区分の回収なしを定数として保持する
  // TODO: 都度区分テーブルから取得して設定するか検討が必要
  COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION!: number;

  rentalProductsData?: RentalProduct[];

  deleteSelectedRentalProductModal(index: number) {
    this.saveModal(() => {
      this.deleteSelectedRentalProduct(index);
    });
  }
  /**
   * 選択済みのレンタル商品を削除する
   */
  deleteSelectedRentalProduct(index: number) {
    /**
     * remove forms[i]
     */
    let isset_id = this.rentalAddFormArray.controls[index].value;
    if ('id' in isset_id) {
      // DBから削除する
      this.deleteRentalProduct(isset_id.id);
      // 配列から削除
      this.rentalAddFormArray.removeAt(index);
    } else {
      this.rentalAddFormArray.removeAt(index);
    }
    //
  }

  /**
   * id指定された、レンタル商品をrental tableから削除する
   */
  deleteRentalProduct(id: number) {
    // 削除処理
    this.common.loading = true;
    this.subscription.add(
      this.rentalService
        .remove(id)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              this.errorModalTitle,
              res.message,
              this.detailPagePath
            );
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.common.loading = false;
        })
    );
  }
  // 検索して取得したデータを格納する
  productSearchResults!: RentalProduct[];

  /**
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(
    formControl: FormControl | AbstractControl | null | undefined
  ): boolean {
    if (formControl === null || formControl === undefined) {
      return false;
    }
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  /**
   * 表示開始日が無効な値になっているか確認する
   * 設定していなければアラートを表示してtrueを返す
   * @returns boolean true: 表示開始日が空 false: 表示開始日が設定されている
   */
  validateDisplayStartDate(): boolean {
    // 表示開始日が設定されていなければアラートを表示して処理を終了する
    if (this.displayStartDateFc.display_start_date.value === '') {
      alert('表示開始日を設定してください');
      return true;
    }
    return false;
  }

  // 分類スライドメニュー
  largeCategories!: LargeCategory[];
  mediumCategories!: MediumCategory[];
  smallCategories!: SmallCategory[];

  // 分類メニュー開閉フラグ
  isCategoryMenuOpen = false;

  // トップレベルの分類かどうか
  isLargeCategory = true;

  // 分類レベル 初期値は大分類
  currentCategoryLevel: CategoryLevel = 'large';

  // 分類データ
  currentCategoryData!: LargeCategory[] | MediumCategory[] | SmallCategory[];

  // 分類タイトル
  categoryTitle = {
    large: '大分類',
    medium: '中分類',
    small: '小分類',
  };

  // 商品ID検索フォームのサジェスト表示フラグ
  showProductIdSuggest: boolean = false;
  // 商品名検索フォームのサジェスト表示フラグ
  showProductNameSuggest: boolean = false;

  /**
   * 分類メニュー開閉
   */
  toggleCategoryMenu() {
    if (this.validateDisplayStartDate()) {
      return;
    }
    this.isCategoryMenuOpen = !this.isCategoryMenuOpen;
    this.currentCategoryLevel = 'large';
    this.currentCategoryData = this.largeCategories;
    this.isLargeCategory = true;
  }
  /**
   * 商品名検索フォームのサジェスト表示切り替え
   * @returns
   */
  toggleProductNameSuggest() {
    // 表示開始日が指定されていない場合は処理を終了する
    if (this.validateDisplayStartDate()) {
      return;
    }
    // 商品検索フォームのサジェスト表示フラグを切り替える
    this.showProductNameSuggest = !this.showProductNameSuggest;
  }
  /**
   * 商品ID検索フォームのサジェスト表示切り替え
   * @returns
   */
  toggleProductIdSuggest() {
    if (this.validateDisplayStartDate()) {
      return;
    }
    this.showProductIdSuggest = !this.showProductIdSuggest;
  }

  // レンタル商品のstatus_division_idの貸出可能idを定数として保持する
  // TODO: 都度区分テーブルから取得して設定するか検討が必要
  RENTAL_PRODUCT_STATUS_DIVISION_ID_RENTABLE!: number;

  // レンタル商品の公開フラグの公開を定数として保持する
  // TODO: 都度区分テーブルから取得して設定するか検討が必要
  RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC!: number;

  // ----------------
  // レンタル商品の予約状況関連
  // ----------------

  // 予約状況取得期間定数
  // 予約状況を取得・表示する期間は表示開始日からこの日数分
  RESERVATION_STATUS_PERIOD: number = 21;

  // 予約状況一覧のヘッダー
  reservationStatusHeader: ReservationStatusHeader[] = [];

  // 予約状況一覧のボディ
  reservationStatusBody: ReservationStatusBody[][] = [];

  // 商品選択タイプ定数
  RENTAL_PRODUCT_ACQUISITION_ALL: RentalProductAcquisitionType = 'all';
  RENTAL_PRODUCT_ACQUISITION_RESERVABLE: RentalProductAcquisitionType =
    'reservable';

  // 選択中の商品選択タイプ 初期値は全てを設定
  selectedRentalProductAcquisitionType: RentalProductAcquisitionType =
    this.RENTAL_PRODUCT_ACQUISITION_ALL;

  // 商品選択タイプラジオボタンの選択肢
  rentalProductAcquisitionTypes: {
    value: RentalProductAcquisitionType;
    display: string;
  }[] = [
    { value: this.RENTAL_PRODUCT_ACQUISITION_ALL, display: '全商品' },
    {
      value: this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE,
      display: '予約可能な商品のみ',
    },
  ];
  // 全て・予約可能な商品のみ選択ラジオボタンイベント対応
  onRentalProductAcquisitionTypeRadioChange(event: Event) {
    const rentalProductAcquisitionType = (event.target as HTMLInputElement)
      .value;
    this.selectedRentalProductAcquisitionType =
      rentalProductAcquisitionType as RentalProductAcquisitionType;
  }
  // 商品の検索方法や絞り込み状態に応じてその他の検索方法などをリセットする
  resetProductSearch() {
    // 商品検索フォームのサジェストをリセットする
    this.productSuggestForm.reset();

    // 商品検索フォームのサジェスト結果をリセットする
    this.productSearchResults = [];
    // 商品検索フォームのサジェスト結果をリセットする
    this.productSearchResults = [];
    // 商品検索フォームのサジェスト結果をリセットする
  }

  /**
   * 表示開始日指定フォーム
   */
  displayStartDateForm = this.fb.group({
    display_start_date: ['', [Validators.required]],
  });

  /**
   * 表示開始日指定フォームのゲッター
   */
  get displayStartDateFc() {
    return this.displayStartDateForm.controls;
  }
  /**
   * 商品検索フォーム
   */
  productSuggestForm = this.fb.group({
    id: ['', [Validators.required]],
    product_name: [''],
  });

  /**
   * 商品検索フォームのゲッター
   */
  get productFc() {
    return this.productSuggestForm.controls;
  }

  /**
   * レンタル受付票フォームのゲッター
   * @returns レンタル受付票フォームのコントロール
   */
  get rentalSlipFc() {
    return this.rentalSlipForm.controls;
  }

  /**
   * 商品名検索フォームのサジェストを取得する
   * @returns
   */
  getProductNameFormSuggests(): ApiInput<RentalProductApiResponse> {
    const params: { [key: string]: string | number | null } = {
      // 商品名で検索
      name: this.productFc.product_name.value,
      // 公開フラグが公開の商品のみを取得するように設定する
      data_permission_division_id:
        this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC,
    };

    if (
      this.selectedRentalProductAcquisitionType ===
      this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE
    ) {
      // paramsへ予約可能な商品のみを取得するように設定する
      params['status_division_id'] =
        this.RENTAL_PRODUCT_STATUS_DIVISION_ID_RENTABLE;
    }
    return {
      observable: this.rentalProductService.getAll({ ...params }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }

  // 精算区分
  settleStatusDivisionOptions!: SelectOption[];

  // ステータス区分
  statusDivisionOptions!: SelectOption[];

  // インシデント区分
  incidentDivisionOptions!: SelectOption[];

  ngOnInit(): void {
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

    // お客様タイプの変更を購読
    // タイプ別サジェスト値決項目の反映

    this.subscription.add(
      this.commonFc.customer_type_division_id.valueChanges.subscribe((res) => {
        this.selectedCustomerType(res);
      })
    );

    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];

    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);

    // パラメータがエラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        this.errorModalTitle,
        'パラメータがエラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // 貸出予定日のサジェスト
    let rental_date: FormControl = this.getBulkScheduledRentalDateControl();
    let return_date: FormControl = this.getBulkScheduledReturnDateControl();
    this.subscription.add(
      rental_date?.valueChanges.subscribe((res) => {
        if (res) {
          return_date.patchValue(res);
        }
      })
    );

    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);
    this.detailPagePath = this.listPagePath + '/detail/' + selectedId;

    // 選択肢初期化処理
    this.initOptions(Number(selectedId));
    this.initOptionsContinue();
  }

  /**
   * お客様タイプが変更された場合の処理
   *
   * @param typeId
   * @returns
   */

  selectedCustomerType(typeId: string | null) {
    // 引数が渡ってこない場合
    if (typeId === null) {
      this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
      return;
    }

    const selectedType = this.customerTypes.find((x) => {
      return String(x.value) === String(typeId);
    });

    if (selectedType === undefined) {
      this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
      return;
    }

    this.customerType = selectedType;
    this.selectedCustomerCode = String(this.customerType.code);

    // テンプレートで出し入れしているタイプ別 選択肢イベント

    if (this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_MEMBER) {
      this.memberCtrls.member_id.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
          const selectedClient: any = this.memberSuggests.find(
            (member) => String(member.value) === String(value)
          );
          if (selectedClient && selectedClient.data) {
            this.onMemberNameSuggestDataSelected(selectedClient.data);
            return;
          }
        });
    } else if (
      this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_CLIENT
    ) {
      // 選択データ取得
      this.clientCtrls.client_id.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
          const selectedClient: any = this.clientSuggests.find(
            (client) => String(client.value) === String(value)
          );

          if (selectedClient && selectedClient.data) {
            this.onClientNameSuggestDataSelected(selectedClient.data);
            return;
          }
        });
    }
  }

  /**
   * 会員・得意先選択ラジオボタンの選択に応じてお客様情報とフォームをリセットする
   */
  resetCustomerInfo() {
    let type_value!: number;
    const rs = this.rentalSlip;

    this.selectedCustomer = {
      type: type_value,
      customer_type_code: this.selectedCustomerCode,
      id: '',
      fullName: '',
      fullNameKana: '',
      address: '',
      tel: '',
      idConfirmationDate: '',
      isIdConfirmationRequired: true,
      identification_document_confirmation_date: '',
    };
    // 選択中以外のサジェストフォームの値とレンタル受付票フォームをリセットする
    if (this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_MEMBER) {
      //this.clientFc.client_name.patchValue('', { emitEvent: true });
      //this.clientFc.id.patchValue('');

      this.clientCtrls.client_id.setValue('');
      this.commonFc.mobile_number.setValue('');
      let target_data: any = this.members.find((x: Member) => {
        return x.id === rs.member_id;
      });
      this.onMemberNameSuggestDataSelected(target_data);
      this.rentalSlipFc.customerTypeGroup.controls.member_id.setValue(
        rs.member_id
      );
      this.selectedCustomer.type = Number(
        rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER
      );
      this.memberCtrls.shipping_address.setValue(String(rs.shipping_address));
    } else if (
      this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_CLIENT
    ) {
      //this.memberFc.full_name.patchValue('', { emitEvent: true });
      //this.memberFc.id.patchValue('');
      this.rentalSlipFc.customerTypeGroup.controls.member_id.patchValue('');
      this.memberCtrls.member_id.setValue('');
      this.commonFc.mobile_number.setValue('');
      let target_data: any = this.clients.find((x: Client) => {
        return x.id === rs.client_id;
      });
      this.onClientNameSuggestDataSelected(target_data);
      this.rentalSlipFc.customerTypeGroup.controls.client_id.setValue(
        rs.client_id
      );
      this.selectedCustomer.type = Number(
        rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT
      );
      this.clientCtrls.shipping_address.setValue(String(rs.shipping_address));
    } else if (
      this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_GENERAL
    ) {
      this.selectedCustomer.type = Number(
        rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL
      );
      this.generalFc.shipping_address.setValue(String(rs.shipping_address));
    }
    this.commonFc.store_id.setValue(String(rs.store_id));

    this.commonFc.remarks_1.setValue(String(rs.remarks_1));
    this.commonFc.remarks_2.setValue(String(rs.remarks_2));
    this.commonFc.reception_date.setValue(rs.reception_date);
    this.commonFc.reception_employee_id.setValue(
      String(rs.reception_employee_id)
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * お客様タイプが変更された場合の処理
   *
   * @param typeId
   * @returns
   */

  /*
  selectedCustomerType(typeId: string | null) {
    console.log("selectedCustomerType called")
    console.log(typeId)
    // 引数が渡ってこない場合
    if (typeId === null) {
      this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
      return;
    }
    console.log(this.customerTypes)
    const selectedType = this.customerTypes.find((x) => {
      return String(x.value) === String(typeId);
    });
    console.log(selectedType)

    if (selectedType === undefined) {
      this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
      return;
    }

    // 既に選択したタイプがある場合フォームの値をリセット
    if (this.customerType) {
      switch (this.customerType.text) {
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
          this.clientCtrls.client_id.setValue('');
          //this.clientCtrls.mobile_number.setValue('');
          break;
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
          this.memberCtrls.member_id.setValue('');
          //this.memberCtrls.mobile_number.setValue('');
          break;
        default:
          break;
      }
    }

    // 選択したお客様タイプによって初期値をセット
    const rs = this.rentalSlip;
    switch (selectedType.text) {
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
        this.clientCtrls.client_id.setValue(String(rs.client_id));
        //this.clientCtrls.mobile_number.setValue(String(rs.mobile_number));
        break;
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        this.memberCtrls.member_id.setValue(String(rs.member_id));
        //this.memberCtrls.mobile_number.setValue(String(rs.mobile_number));
        break;
      default:
        break;
    }
    //this.ctrls.store_id.setValue(String(rs.store_id));
    this.customerType = selectedType;
    //this.ctrls.shipping_address.setValue(String(rs.shipping_address));
    //this.ctrls.remarks_1.setValue(String(rs.remarks_1));
    //this.ctrls.remarks_2.setValue(String(rs.remarks_2));
    //this.ctrls.reception_date.setValue(rs.reception_date);
    //this.ctrls.reception_employee_id.setValue(String(rs.reception_employee_id));
    
  }*/

  getRentalProducts(rental_product_id: number) {
    this.common.loading = true;
    let observable$ = this.rentalProductService.getAll({
      id: rental_product_id,
    });
    this.subscription.add(
      this.rentalProductService
        .find(rental_product_id)
        .pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse) {
              return of(error);
            }
            return of(null);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラーが発生しました';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message);
            this.common.loading = false;
            return;
          }
          if (res === null) {
            alert('商品データの取得に失敗しました');
            return;
          }
          if (res.totalItems > 0) {
            return;
          } else {
            alert('商品データが見つかりませんでした');
          }
        })
    );
  }
  /**
   * 選択肢初期化処理
   */
  initOptions(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    // 選択肢作成
    this.subscription.add(
      forkJoin([
        this.storeService.getAsSelectOptions(),
        this.clientService.getAll({ $select: this._clientsColumn, limit: 100 }),
        this.memberService.getAll({ $select: this._membersColumn, limit: 100 }),
        //this.memberService.getAll({ limit: 100 }),
        this.employeeService.getAll(),
        this.divisionService.getAsSelectOptions(),
        this.rsService.find(selectedId),
        this.largeCategoryService.getAll(),
        this.mediumCategoryService.getAll(),
        this.smallCategoryService.getAll(),
        this.rentalService.getAll({ rental_slip_id: this.selectedId }),
        // this.rentalProductService.getAll(),
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
          // レスポンスの配列の要素が resLength 個あるか
          if (res.length !== 10) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          this.rentalSlip = res[5].data[0];
          const rs = res[5].data[0];

          const rsConst = this.rsConst;
          this.storeSuggests = res[0];
          this.clients = res[1].data;

          // 得意先選択肢
          this.clientSuggests = res[1].data.map((client: Client) => {
            const v = {
              value: client.id,
              text: client.name,
              data: client,
            };
            return v;
          });
          this.members = res[2].data;
          // 会員選択肢
          this.memberSuggests = res[2].data.map((member: Member) => {
            const v = {
              value: member.id,
              text: member.last_name + ' ' + member.first_name,
              data: member,
            };
            return v;
          });

          const employees = res[3].data;

          // 最終更新者のフルネーム作成
          const lastUpdater = employees.find((e: Employee) => {
            return e.id === rs.updated_id;
          });

          if (lastUpdater) {
            this.lastUpdater =
              lastUpdater.last_name + ' ' + lastUpdater.first_name;
          }

          // 受付担当者選択肢
          // 社員データセット
          this.employeeSuggests = employees.map((e: Employee) => {
            return { value: e.id, text: e.last_name + ' ' + e.first_name };
          });

          // 受付担当者選択肢
          this._employeeSuggests = res[3].data;

          const divisions = res[4];

          // 大分類を取得
          this.largeCategories = res[6].data;
          this.currentCategoryData = this.largeCategories;

          // 中分類を取得
          this.mediumCategories = res[7].data;

          // 小分類を取得
          this.smallCategories = res[8].data;
          this.setHasChildren();

          // 表示開始日の初期値を設定
          this.displayStartDateFc.display_start_date.patchValue(
            new Date().toISOString()
          );
          this._setDivisions(divisions);
          this._setHiddenValue();
          // 初期値セット
          const selected_type = this.customerTypes_.find((x) => {
            return x.value === rs.customer_type_division_id;
          });
          this.selectedCustomerCode = String(selected_type.code);

          // 表示区分を取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[4];
          const statusDivisionOptions =
            statusDivisionsRes[divisionConst.RENTAL_SLIP_STATUS];

          // ステータスによって表示する選択肢を変更
          this.setStatusDivisions(rsConst, statusDivisionOptions, rs);

          // タイプセット
          this.commonFc.customer_type_division_id.patchValue(
            rs.customer_type_division_id
          );

          //this.rentals = res[9].data;

          /**
           * parent data
           *
           */
          this.rentals = res[9].data.filter((x: Rental) => {
            if (x.rental_employee_id) {
              this.rental_employee = String(x.rental_employee_id);
            }
            if (x.return_employee_id) {
              this.return_employee = String(x.return_employee_id);
            }
            return !x.parent_id;
          });
          /**
           * child data
           */
          this.overdue_rentals = res[9].data.filter((x: Rental) => {
            if (x.rental_employee_id) {
              this.rental_employee = String(x.rental_employee_id);
            }
            if (x.return_employee_id) {
              this.return_employee = String(x.return_employee_id);
            }
            return x.parent_id;
          });

          //表示用に成形
          // set forms
          let status_division_tax_codes: any =
            statusDivisionsRes[divisionConst.SALES_TAX];
          let status_sales_fraction_code =
            statusDivisionsRes[divisionConst.SALES_FRACTION];

          // レンタル商品を取得するためのレンタル商品IDリストを作成
          let product_id_list: any = [];
          let product_ids: any = [];

          product_id_list = res[9].data.filter((x: any) => {
            product_ids.push(x.rental_product_id);
            return x.rental_product_id;
          });
          console.log('product_id_list:', product_id_list);
          console.log('product_ids:', product_ids);
          // console.log("unique_product_ids:", unique_product_ids);
          // レンタル商品を取得

          this.initRentalAddForm(product_ids, status_division_tax_codes);
          // const RentalProductsData: RentalProduct[] = res[10].data;

          // for (let itemform in this.rentals) {
          //   // レンタル商品を取得
          //   let item: any = RentalProductsData.filter((x) => {
          //     return x.id === this.rentals[itemform].rental_product_id;
          //   });
          //   let tax_code: any = status_division_tax_codes.find((x: any) => {
          //     return x.code === item[0].division_sales_tax_code;
          //   });

          //   let lentitem = {
          //     division_status_code: item[0].division_status_code,
          //     division_status_name: item[0].division_status_name,
          //     division_status_value: item[0].division_status_value,
          //     rental_product: item[0],
          //     division_sales_tax_code: tax_code.division_sales_tax_code,
          //     division_sales_tax_name: tax_code.division_sales_tax_name,
          //     division_sales_tax_value: tax_code.division_sales_tax_value,
          //     selling_price: item[0].selling_price,
          //   };
          //   this.setRentalAddForm({ ...this.rentals[itemform], ...lentitem });
          // }

          // 精算ステータス区分
          const settleDivisions =
            statusDivisionsRes[divisionConst.SETTLE_STATUS];
          this.settleDivisions = settleDivisions;

          // インシデント発生区分
          const incidentDivisionOptions =
            statusDivisionsRes[divisionConst.INCIDENT];
          this.incidentDivisions = incidentDivisionOptions;

          // お客様タイプ区分

          // ステータス区分をセット
          this.statusDivisionId = rs.status_division_id;

          // ステータス選択肢を生成
          this.generateStatusDivisions(res[4]);

          let filter_processingUnits: any = this.processingUnits.filter((x) => {
            let unit_number = 0;
            if (rs.processing_units) {
              unit_number = 1;
            }
            return x.processing_units_id === unit_number;
          });

          this.processingUnit = filter_processingUnits[0];
          this.processingUnitValue = filter_processingUnits[0].value;
          this.selectedprocessingUnits = this.processingUnitValue;

          this.toggleProcessingUnits();
          const commonFormData = {
            store_id: String(rs.store_id),
            customer_type_division_id: String(rs.customer_type_division_id),
            shipping_address: rs.shipping_address,
            status_division_id: rs.status_division_id,
            remarks_1: rs.remarks_1,
            remarks_2: rs.remarks_2,
            reception_date: rs.reception_date,
            mobile_number: rs.mobile_number,
            reception_employee_id: String(rs.reception_employee_id),
            settle_status_division_id: rs.settle_status_division_id,
            incident_division_id: rs.incident_division_id,
            send_sms_flg: rs.send_sms_flg,
            processing_units: this.processingUnit.processing_units_id,
          };
          /* フォーム値格納*/
          this.commonForm.patchValue(commonFormData);

          if (
            this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_MEMBER
          ) {
            this.selectedCustomer = {
              type: Number(
                this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER
              ),
              customer_type_code: this.selectedCustomerCode,
              id: String(rs.id),
              fullName: rs.fullName,
              fullNameKana: rs.fullNameKana,
              address: rs.address,
              tel: rs.tel ? rs.tel : '',
              idConfirmationDate: '',
              isIdConfirmationRequired: true,
              identification_document_confirmation_date: '',
            };

            const memberFormData = {
              member_id: String(rs.member_id),
            };
            this.memberForm.patchValue(memberFormData);
            let target_data: any = this.members.find((x: Member) => {
              return x.id === rs.member_id;
            });
            this.onMemberNameSuggestDataSelected(target_data);
            // 選択データ取得
          } else if (
            this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_CLIENT
          ) {
            this.selectedCustomer = {
              type: Number(
                this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT
              ),
              customer_type_code: this.selectedCustomerCode,
              id: String(rs.id),
              fullName: rs.fullName,
              fullNameKana: rs.fullNameKana,
              address: rs.address,
              tel: rs.tel ? rs.tel : '',
              idConfirmationDate: '',
              isIdConfirmationRequired: true,
              identification_document_confirmation_date: '',
            };

            const clientFormData = {
              client_id: String(rs.client_id),
            };
            this.clientForm.patchValue(clientFormData);
            let target_data: any = this.clients.find((x: Client) => {
              return x.id === rs.client_id;
            });
            // 初期値取得
            this.onClientNameSuggestDataSelected(target_data);
          } else {
            const generalFormData = {
              last_name: rs.last_name,
              first_name: rs.first_name,
              last_name_kana: rs.last_name_kana,
              first_name_kana: rs.first_name_kana,
              tel: rs.tel,
              identification_document_confirmation_date:
                rs.identification_document_confirmation_date,
              shipping_address: rs.shipping_address,
            };
            this.generalForm.patchValue(generalFormData);

            this.selectedCustomer = {
              type: Number(
                this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT
              ),
              customer_type_code: this.selectedCustomerCode,
              id: String(rs.id),
              fullName:
                this.generalFc.last_name.value +
                ' ' +
                this.generalFc.first_name.value,
              fullNameKana:
                this.generalFc.last_name_kana.value +
                '' +
                this.generalFc.first_name_kana.value,
              address: this.generalFc.shipping_address.value
                ? this.generalFc.shipping_address.value
                : '',
              tel: this.generalFc.tel.value ? this.generalFc.tel.value : '',
              identification_document_confirmation_date: this.generalFc
                .identification_document_confirmation_date.value
                ? this.generalFc.identification_document_confirmation_date.value
                : '',
              idConfirmationDate: '',
              isIdConfirmationRequired: true,
            };
          }

          if (rs.send_sms_flg == 1) {
            this.smsIsChecked = true;
            this.selectedSMS = 1;
          } else {
            this.smsIsChecked = false;
            this.selectedSMS = 0;
          }

          //this.clientCtrls.client_id.patchValue(String(rs.client_id));
          //this.memberCtrls.member_id.patchValue(String(rs.member_id));

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
                  this.getEmployeeByIdReturn(value);
                }
              )
            );
          }
          /* 初期値がある場合セット*/
          if (this.rental_employee) {
            this.getEmployeeByIdRental(String(this.rental_employee));
          }
          if (this.return_employee) {
            this.getEmployeeByIdReturn(String(this.return_employee));
          }
        })
    );
  }

  initRentalAddForm(
    product_ids: number[] = [],
    status_division_tax_codes: any
  ) {
    const unique_product_ids = Array.from(new Set(product_ids));
    const product_id_list_string = unique_product_ids.join(',');
    this.subscription.add(
      forkJoin({
        retntalProducts: this.rentalProductService.getAll({
          id: product_id_list_string,
        }),
      })
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // エラーレスポンスが返ってきた場合
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
          const RentalProductsData: RentalProduct[] = res.retntalProducts.data;

          for (let itemform in this.rentals) {
            // レンタル商品を取得
            let item: any = RentalProductsData.filter((x) => {
              return x.id === this.rentals[itemform].rental_product_id;
            });
            let tax_code: any = status_division_tax_codes.find((x: any) => {
              return x.code === item[0].division_sales_tax_code;
            });

            let lentitem = {
              division_status_code: item[0].division_status_code,
              division_status_name: item[0].division_status_name,
              division_status_value: item[0].division_status_value,
              rental_product: item[0],
              division_sales_tax_code: tax_code.division_sales_tax_code,
              division_sales_tax_name: tax_code.division_sales_tax_name,
              division_sales_tax_value: tax_code.division_sales_tax_value,
              selling_price: item[0].selling_price,
            };
            this.setRentalAddForm({ ...this.rentals[itemform], ...lentitem });
          }
        })
    );
  }

  initOptionsContinue() {
    // 選択肢作成
    this.subscription.add(
      forkJoin({
        //additionalMembers: this.memberService.getAll({ $select: "id,last_name,first_name,province,locality,street_address,other_address" }),
        additionalMembers: this.memberService.getAll({
          $select: this._membersColumn,
        }),
        additionalClients: this.clientService.getAll({
          $select: this._clientsColumn,
        }),
      })
        .pipe(
          finalize(() => console.log('dummy')),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
            return;
          }
          this.mergeMember(res.additionalMembers.data);
          this.mergeClient(res.additionalClients.data);
        })
    );
  }

  mergeMember(additionalMembers: Member[]): void {
    const existingMemberIds = this.members.map((member) => member.id);
    const newMembers = additionalMembers.filter(
      (member: Member) => !existingMemberIds.includes(member.id)
    );

    // membersをマージ
    this.members = [...this.members, ...newMembers];

    // memberSuggestsも新しいメンバーを追加
    const newMemberSuggests = newMembers.map((member: Member) => ({
      value: member.id,
      text: member.last_name + ' ' + member.first_name,
      data: member,
    }));

    this.memberSuggests = [...this.memberSuggests, ...newMemberSuggests];
  }

  mergeClient(additionalClients: Client[]): void {
    const existingClientIds = this.clients.map((client) => client.id);
    const newClients = additionalClients.filter(
      (client: Client) => !existingClientIds.includes(client.id)
    );

    // clientsをマージ
    this.clients = [...this.clients, ...newClients];

    // memberSuggestsも新しいメンバーを追加
    const newClientSuggests = newClients.map((client: Client) => ({
      value: client.id,
      text: client.name,
      data: client,
    }));

    this.clientSuggests = [...this.clientSuggests, ...newClientSuggests];
  }

  setStatusDivisions(
    rsConst: any,
    statusDivisionOptions: SelectOption[],
    rs: any
  ) {
    switch (rs.division_status_code) {
      case rsConst.STATUS_CODE.ACCEPTED: // 受付済み
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return (
            String(x.text) === rsConst.STATUS.CANCELLED ||
            String(x.text) === rsConst.STATUS.TICKET_ISSUED
          );
        });
        break;
      case rsConst.STATUS_CODE.TICKET_ISSUED: // 受付票発行済み
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return (
            String(x.text) === rsConst.STATUS.ACCEPTED ||
            String(x.text) === rsConst.STATUS.READY_FOR_RENTAL ||
            String(x.text) === rsConst.STATUS.CANCELLED
          );
        });
        break;
      case this.rsConst.STATUS_CODE.READY_FOR_RENTAL: // 貸出準備完了
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return (
            String(x.text) === rsConst.STATUS.PARTIALLY_RENTED ||
            String(x.text) === rsConst.STATUS.ALL_RENTED ||
            String(x.text) === rsConst.STATUS.CANCELLED
          );
        });
        break;
      case this.rsConst.STATUS_CODE.PARTIALLY_RENTED: // 一部貸出中
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.ALL_RENTED;
        });
        break;
      case this.rsConst.STATUS_CODE.ALL_RENTED: // 全て貸出中
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.ALL_RENTED;
        });
        break;
      case this.rsConst.STATUS_CODE.PARTIALLY_RETURNED: // 一部返却済み
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.PARTIALLY_RETURNED;
        });
        break;
      case this.rsConst.STATUS_CODE.PARTIALLY_OVERDUE: // 一部延滞中
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.PARTIALLY_OVERDUE;
        });
        break;
      case this.rsConst.STATUS_CODE.ALL_OVERDUE:
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.ALL_OVERDUE;
        });
        break;
      case this.rsConst.STATUS_CODE.ALL_RETURNED:
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.ALL_RETURNED;
        });
        break;
      case this.rsConst.STATUS_CODE.CANCELLED:
        this.statusDivisions = statusDivisionOptions.filter((x) => {
          return String(x.text) === rsConst.STATUS.CANCELLED;
        });
        break;
      default:
        break;
    }
    this.statusDivisions = [
      ...[{ value: rs.status_division_id, text: rs.division_status_value }],
      ...this.statusDivisions,
    ];
  }
  /**
   * 会員サジェストの結果から選択した場合の処理
   * @param data
   */
  onMemberNameSuggestDataSelected(data: any) {
    console.log('onMemberNameSuggestDataSelected called');
    console.log(data);
    // 選択中のお客様情報を保持する
    if (data === undefined) {
      this.selectedCustomer = {
        type: Number(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT),
        customer_type_code: this.selectedCustomerCode,
        id: '',
        fullName: '',
        fullNameKana: '',
        address: '',
        tel: '',
        idConfirmationDate: '',
        isIdConfirmationRequired: true,
        identification_document_confirmation_date: '',
      };
      return;
    }
    const fullName = data.last_name + ' ' + data.first_name;
    let fullNameKana = '';
    if (data.last_name_kana) {
      if (data.first_name_kana) {
        fullNameKana = data.last_name_kana + ' ' + data.first_name_kana;
      } else {
        fullNameKana = data.last_name_kana;
      }
    } else {
      if (data.first_name_kana) {
        fullNameKana = data.first_name_kana;
      }
    }
    const province = data.province ? data.province : '';
    const locality = data.locality ? data.locality : '';
    const streetAddress = data.street_address ? data.street_address : '';
    const otherAddress = data.other_address ? data.other_address : '';
    const address = province + locality + streetAddress + otherAddress;
    const today = new Date();
    const idConfirmationDate = data.identification_document_confirmation_date
      ? new Date(
          data.identification_document_confirmation_date
        ).toLocaleDateString()
      : '';

    // 今日の日付と比較して本人確認書類の確認日が1年以上前の場合は本人確認書類の確認が必要
    // 本人確認書類確認日が空の場合も本人確認書類の確認が必要
    const isIdConfirmationRequired =
      idConfirmationDate === '' ||
      new Date(idConfirmationDate) <=
        new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    this.selectedMember = data;

    this.selectedCustomer = {
      type: Number(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER),
      customer_type_code: this.selectedCustomerCode,
      id: String(data.id),
      fullName: fullName,
      fullNameKana: fullNameKana,
      address: address,
      tel: data.tel ? data.tel : '',
      identification_document_confirmation_date: '',
      idConfirmationDate:
        idConfirmationDate === '' ? '未確認' : idConfirmationDate,
      isIdConfirmationRequired: isIdConfirmationRequired,
    };
    if (isIdConfirmationRequired) {
      this.idConfirmationDate = true;
    } else {
      this.idConfirmationDate = false;
    }
    this.memberCtrls.member_id.patchValue(String(data.id), {
      emitEvent: false,
    });
  }
  /**
   * 得意先サジェストの結果から選択した場合の処理
   * @param data
   */
  onClientNameSuggestDataSelected(data: any) {
    if (data === undefined) {
      this.selectedCustomer = {
        type: Number(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT),
        customer_type_code: this.selectedCustomerCode,
        id: '',
        fullName: '',
        fullNameKana: '',
        address: '',
        tel: '',
        idConfirmationDate: '',
        isIdConfirmationRequired: true,
        identification_document_confirmation_date: '',
      };
      return;
    }
    // 選択中のお客様情報を保持する
    const province = data.province ? data.province : '';
    const locality = data.locality ? data.locality : '';
    const streetAddress = data.street_address ? data.street_address : '';
    const otherAddress = data.other_address ? data.other_address : '';
    const address = province + locality + streetAddress + otherAddress;
    const today = new Date();
    this.selectedCustomer = {
      type: Number(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT),
      customer_type_code: this.selectedCustomerCode,
      id: String(data.id),
      fullName: data.name,
      fullNameKana: data.name_kana,
      address: address,
      tel: data.tel ? data.tel : '',
      idConfirmationDate: '',
      isIdConfirmationRequired: true,
      identification_document_confirmation_date: '',
    };
    this.clientCtrls.client_id.patchValue(String(data.id), {
      emitEvent: false,
    });
  }
  // 会員検索フォームのサジェストを取得する
  getMemberFormNameSuggests() {
    console.log('getMemberFormNameSuggests called');
    console.log(this.rentalSlipFc);
    let fullName = this.rentalSlipFc.customerTypeGroup.controls.full_name.value;
    if (fullName === null) {
      fullName = '';
    }
    // 半角スペースまたは全角スペースで分割
    const [lastName, ...firstNameParts] = fullName.split(/\s|\u3000/);
    const firstName = firstNameParts.join(' ');
    return {
      observable: this.memberService.getAll({
        // 姓・名で検索
        last_name: lastName,
        first_name: firstName,
      }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'last_name',
      textAttachColumn: 'first_name',
    };
  }
  /**
   * 得意先検索フォームのサジェストを取得する
   * @returns
   */
  getClientFormNameSuggests() {
    return {
      observable: this.clientService.getAll({
        name: this.rentalSlipFc.customerTypeGroup.controls.client_name.value,
      }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }
  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }

  /**
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel() {
    // 入力があった場合はモーダルを表示
    if (!this.commonForm.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPagePath);
    }
  }

  /**
   * 更新
   * @param status
   * @param message
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.commonForm.markAsPristine();
    this.clientForm.markAsPristine();
    this.memberForm.markAsPristine();
    this.errorHasOccurred = false;

    // ローディング開始
    this.common.loading = true;

    const formVal = this.commonForm.value;
    console.log(this.rentalDateForms);
    const rentals = this.rentalAddForms.value.forms.map((rental: any) => {
      rental.rental_item_count = 1;
      rental.delinquency_flag = 0;
      //rental.rental_date = new Date().toLocaleString();

      if (this.showBulkSuggest) {
        let dates: any = this.rentalDateFormsControls['bulkScheduledDateGroup'];
        rental.scheduled_rental_date =
          dates.value.bulk_scheduled_rental_date.toLocaleString();
        rental.scheduled_return_date =
          dates.value.bulk_scheduled_return_date.toLocaleString();
      } else {
        rental.scheduled_rental_date = new Date(
          String(rental.scheduledDateGroup.scheduled_rental_date)
        ).toLocaleString();
        rental.scheduled_return_date = new Date(
          String(rental.scheduledDateGroup.scheduled_return_date)
        ).toLocaleString();
      }

      rental.settle_status_division_id = String(
        formVal.settle_status_division_id
      );
      //this._setSettleStatusDivisionId(rental);
      if (this.rental_employee) {
        rental.rental_employee_id = this.rental_employee;
      }
      if (this.return_employee) {
        rental.return_employee_id = this.return_employee;
      }
      return rental;
    });

    // 受付担当者の値チェック
    const employeeIdExists = this.employeeSuggests.some((employee) => {
      const employeeVal = Number(employee.value);
      const employeeId = Number(formVal.reception_employee_id);
      return employeeVal === employeeId;
    });
    if (!employeeIdExists) {
      this.commonFc.reception_employee_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 店舗の値チェック
    const storeIdExists = this.storeSuggests.some((store) => {
      const storeVal = Number(store.value);
      const storeId = Number(formVal.store_id);
      return storeVal === storeId;
    });
    if (!storeIdExists) {
      this.commonFc.store_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 受付日の値チェック
    if (
      formVal.reception_date === null ||
      formVal.reception_date === undefined ||
      formVal.reception_date === ''
    ) {
      this.commonFc.reception_date.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // ポストデータ作成
    let postData: { [key: string]: string | null | undefined } = {
      reception_date: new Date(String(formVal.reception_date)).toLocaleString(),
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
      customer_type_division_id: formVal.customer_type_division_id,
      reception_employee_id: formVal.reception_employee_id,
      status_division_id: this.statusDivisionId,
      store_id: formVal.store_id,
      settle_status_division_id: String(formVal.settle_status_division_id),
      incident_division_id: String(formVal.incident_division_id),
      processing_units: String(this.processingUnitsPostValue),
      mobile_number: String(this.commonFc.mobile_number.value),
      send_sms_flg: String(this.selectedSMS),
    };

    /* お客様タイプによってフォームの値を取得*/
    switch (this.selectedCustomerCode) {
      case String(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.CLIENT):
        // ポストデータへ得意先IDをセット
        postData['client_id'] = String(this.clientCtrls.client_id.value);
        postData['shipping_address'] = String(
          this.clientCtrls.shipping_address.value
        );
        break;
      case String(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.MEMBER):
        // ポストデータへ会員IDをセット
        postData['member_id'] = String(this.memberCtrls.member_id.value);
        postData['shipping_address'] = String(
          this.memberCtrls.shipping_address.value
        );
        break;
      case String(this.rsConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL):
        postData['first_name'] = String(this.generalFc.first_name.value);
        postData['last_name'] = String(this.generalFc.last_name.value);
        postData['first_name_kana'] = String(
          this.generalFc.first_name_kana.value
        );
        postData['last_name_kana'] = String(
          this.generalFc.last_name_kana.value
        );
        postData['shipping_address'] = String(
          this.generalFc.shipping_address.value
        );
        postData['tel'] = String(this.generalFc.tel.value);
        postData['identification_document_confirmation_date'] = new Date(
          String(this.generalFc.identification_document_confirmation_date.value)
        ).toLocaleString();

        break;

      default:
        break;
    }

    /* 更新処理 rental_slip*/
    if (rentals.length > 0) {
      for (let index in rentals) {
        this.updateRentalItem(rentals[index]);
      }
    }

    // rental の add update

    // 更新処理_rental_slip(postData)
    this.subscription.add(
      this.rsService
        .update(this.selectedId, postData)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              this.errorModalTitle,
              res.message,
              this.detailPagePath
            );
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          if (this.errorHasOccurred) {
            this.commonForm.markAsDirty();
            this.memberForm.markAsDirty();
            this.clientForm.markAsDirty();
            return;
          }
          this.router.navigateByUrl(this.detailPagePath);
        })
    );
  }

  updateRentalItem(rentalData: any) {
    const rental_data: any = {
      rental_slip_id: this.selectedId,
      late_return_reported: 0,
      collection_division_id: rentalData.collection_division_id,
      delinquency_flag: rentalData.delinquency_flag,
      delivery_division_id: rentalData.delivery_division_id,
      remarks_1: rentalData.remarks_1,
      remarks_2: rentalData.remarks_2,
      rental_date: rentalData.rental_date ? rentalData.rental_date : '',
      rental_fee: rentalData.rental_fee,
      rental_item_count: rentalData.rental_item_count,
      rental_product_id: rentalData.rental_product_id,
      rental_product_name: rentalData.rental_product_name,
      scheduled_rental_date: rentalData.scheduled_rental_date,
      scheduled_return_date: rentalData.scheduled_return_date,
      selling_price: rentalData.selling_price,
      settle_status_division_id: rentalData.settle_status_division_id,
    };

    // 更新処理_rental_slip(postData)
    if ('id' in rentalData) {
      //編集
      this.subscription.add(
        this.rentalService
          .update(rentalData.id, rental_data)
          .pipe(
            finalize(() => (this.common.loading = false)),
            catchError((error) => {
              return of(error);
            })
          )
          .subscribe((res) => {
            if (res instanceof HttpErrorResponse) {
              const message = `${res.message}\n\n${res.error.message}`;
              this.handleError(
                res.status,
                this.errorModalTitle,
                message,
                this.detailPagePath
              );
              return;
            }
            return;
          })
      );
    } else {
      // 新規登録
      this.subscription.add(
        this.rentalService
          .add(rental_data)
          .pipe(
            finalize(() => (this.common.loading = false)),
            catchError((error) => {
              return of(error);
            })
          )
          .subscribe((res) => {
            if (res instanceof HttpErrorResponse) {
              const message = `${res.error.message}\n\n${res.message}`;
              this.handleError(
                res.status,
                this.errorModalTitle,
                message
                // this.detailPagePath
              );
              return;
            }
            return;
          })
      );
    }
  }
  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath?: string
  ) {
    this.errorHasOccurred = true;
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * 受付単位サジェスト表示フラグを切り替える
   */
  toggleProcessingUnits() {
    if (this.selectedprocessingUnits === this.ONEBYONE) {
      this.showOnebyoneSuggest = !this.showOnebyoneSuggest;
      this.showBulkSuggest = false;
      this.showOnebyoneSuggest = true;
      this.processingUnitsPostValue = 1;
    } else {
      this.showBulkSuggest = !this.showBulkSuggest;
      this.showBulkSuggest = true;
      this.showOnebyoneSuggest = false;
      this.processingUnitsPostValue = 0;

      let bulk_rental_date = '';
      let bulk_return_date = '';

      this.rentals.map((rental: Rental) => {
        bulk_rental_date = this.formatDateToYMDLocal(
          String(rental.scheduled_rental_date)
        );

        bulk_return_date = this.formatDateToYMDLocal(
          String(rental.scheduled_return_date)
        );

        if (this.initialDate['bulkScheduledDateGroup']) {
          this.initialDate[
            'bulkScheduledDateGroup'
          ].bulk_scheduled_rental_date = new Date(
            String(bulk_rental_date)
          ).toLocaleString();
          this.initialDate[
            'bulkScheduledDateGroup'
          ].bulk_scheduled_return_date = new Date(
            String(bulk_return_date)
          ).toLocaleString();
        }

        this.getBulkScheduledRentalDateControl().setValue(
          this.formatToYMD(bulk_rental_date)
        );
        this.getBulkScheduledReturnDateControl().setValue(
          this.formatToYMD(bulk_return_date)
        );
      });
    }
  }

  formatToYMD(dateString: string): string {
    return dateString.split('T')[0];
  }

  /**
   * 処理単位のラジオボタンが変更されたときの処理
   * @param event
   */
  onProcessingUnitsRadioChange(event: Event) {
    const selectedprocessingUnit = (event.target as HTMLInputElement).value;
    this.selectedprocessingUnits = selectedprocessingUnit;
    //フロント表示の変更
    this.toggleProcessingUnits();
    if (this.showOnebyoneSuggest === false) {
      console.log('toggleProcessingUnits');
      let bulk_rental_date = '';
      let bulk_return_date = '';
      console.log(this.rentals);

      this.rentalDateFormsControls[
        'bulkScheduledDateGroup'
      ].value.bulk_scheduled_rental_date = new Date(
        String(
          this.initialDate['bulkScheduledDateGroup']?.bulk_scheduled_rental_date
        )
      ).toLocaleString();
      this.rentalDateFormsControls[
        'bulkScheduledDateGroup'
      ].value.bulk_scheduled_return_date = new Date(
        String(
          this.initialDate['bulkScheduledDateGroup']?.bulk_scheduled_return_date
        )
      ).toLocaleString();

      /**
       * 明細単位設定がある場合は
       * 受付表日時に書き換える
       */
      let rental_date: FormControl = this.getBulkScheduledRentalDateControl();
      let return_date: FormControl = this.getBulkScheduledReturnDateControl();
      for (let itemform in this.rentalAddFormArray.controls) {
        this.rentalAddFormArray.controls[itemform].value['scheduledDateGroup'][
          'scheduled_rental_date'
        ] = new Date(String(rental_date.value)).toISOString();
        this.rentalAddFormArray.controls[itemform]
          .get('scheduledDateGroup')
          ?.get('scheduled_rental_date')
          ?.setValue(new Date(String(rental_date.value)).toISOString());
        this.rentalAddFormArray.controls[itemform].value['scheduledDateGroup'][
          'scheduled_return_date'
        ] = new Date(String(return_date.value)).toISOString();
        this.rentalAddFormArray.controls[itemform]
          .get('scheduledDateGroup')
          ?.get('scheduled_return_date')
          ?.setValue(new Date(String(return_date.value)).toISOString());
      }
    }
  }

  /**
   * レンタル追加フォームを追加する
   * @param rentalProduct
   * @returns
   */
  setRentalAddForm(rentalProduct: any) {
    let dateobj = {
      scheduled_rental_date: new Date(
        rentalProduct.scheduled_rental_date
      ).toISOString(),
      scheduled_return_date: new Date(
        rentalProduct.scheduled_return_date
      ).toISOString(),
    };

    //受付表単位の場合のscheduled_rental_date　scheduled_return_date
    if (this.showOnebyoneSuggest === false) {
      let rental_date: FormControl = this.getBulkScheduledRentalDateControl();
      let return_date: FormControl = this.getBulkScheduledReturnDateControl();

      dateobj = {
        scheduled_rental_date: new Date(
          String(rental_date.value)
        ).toISOString(),
        scheduled_return_date: new Date(
          String(return_date.value)
        ).toISOString(),
      };
    }

    /*division value  */
    // this.formService.createRentalAddFormへ渡す第2引数を受け取ったrentalProductで生成する
    const initialValues: any = {
      id: rentalProduct.id,
      rental_product_id: rentalProduct.rental_product_id,
      rental_product_name: rentalProduct.rental_product_name,
      selling_price: rentalProduct.rental_product.selling_price,
      division_status_value: `${rentalProduct.division_status_value}`,
      delivery_division_id: this.DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY,
      collection_division_id: this.COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION,
      rental_item_count: 1,
      delinquency_flag: 0,
      rental_fee: rentalProduct.rental_fee,
      rental_date: new Date().toISOString(),
      scheduledDateGroup: dateobj,
      division_sales_tax_code:
        rentalProduct.rental_product.division_sales_tax_code,
      division_sales_tax_name:
        rentalProduct.rental_product.division_sales_tax_name,
      division_sales_tax_value:
        rentalProduct.rental_product.division_sales_tax_value,
      division_sales_fraction_code:
        rentalProduct.rental_product.division_sales_fraction_code,
      delivery_charge_flag: rentalProduct.rental_product.delivery_charge_flag,
    };

    // レンタル追加フォームを生成する
    const rentalAddForm = this.formService.createRentalEditAddForm(this.fb);

    // for onrbyone
    // レンタル追加フォームの貸出予定日と返却予定日の変更を購読する
    const scheduledRentalDate$ = rentalAddForm.get(
      'scheduledDateGroup.scheduled_rental_date'
    )?.valueChanges;
    const scheduledReturnDate$ = rentalAddForm.get(
      'scheduledDateGroup.scheduled_return_date'
    )?.valueChanges;

    if (scheduledRentalDate$ && scheduledReturnDate$) {
      this.subscription.add(
        combineLatest([scheduledRentalDate$, scheduledReturnDate$]).subscribe(
          ([rentalDate, returnDate]) => {
            rentalAddForm.patchValue({
              rental_fee: this.calculateRentalFee(
                rentalProduct,
                rentalDate,
                returnDate
              ),
            });
          }
        )
      );
    }
    // 貸出予定日と返却予定日を現在日付に設定する
    const rentalDate = new Date().toISOString();
    const returnDate = new Date().toISOString();
    // レンタル料金を計算する
    const rentalFee = this.calculateRentalFee(
      rentalProduct,
      rentalDate,
      returnDate
    );

    // エラーが返ってきた場合
    if (rentalFee instanceof Error) {
      // アラートを表示する
      alert(rentalFee.message);
      // 処理を終了する
      return;
    }
    // レンタル料金を初期値に設定する
    initialValues.rental_fee = rentalFee;
    // レンタル追加フォームに初期値を設定する
    rentalAddForm.patchValue(initialValues);

    // レンタル追加フォームをフォーム配列に追加する
    this.rentalAddFormArray.push(rentalAddForm);
  }

  /**
   * レンタル追加フォームを追加する
   * @param rentalProduct
   * @returns
   */
  addRentalAddForm(rentalProduct: RentalProduct) {
    let dateobj = {
      scheduled_rental_date: new Date().toISOString(),
      scheduled_return_date: new Date().toISOString(),
    };

    //受付表単位の場合のscheduled_rental_date　scheduled_return_date
    if (this.showOnebyoneSuggest === false) {
      let rental_date: FormControl = this.getBulkScheduledRentalDateControl();
      let return_date: FormControl = this.getBulkScheduledReturnDateControl();

      dateobj = {
        scheduled_rental_date: new Date(
          String(rental_date.value)
        ).toISOString(),
        scheduled_return_date: new Date(
          String(return_date.value)
        ).toISOString(),
      };
    }

    // this.formService.createRentalAddFormへ渡す第2引数を受け取ったrentalProductで生成する
    const initialValues: RentalAddFormInitialValueType = {
      rental_product_id: rentalProduct.id,
      rental_product_name: rentalProduct.name,
      selling_price: rentalProduct.selling_price,
      division_status_value: `${rentalProduct.division_status_value}`,
      delivery_division_id: this.DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY,
      collection_division_id: this.COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION,
      rental_item_count: 1,
      delinquency_flag: 0,
      rental_fee: rentalProduct.selling_price,
      rental_date: new Date().toISOString(),
      scheduledDateGroup: dateobj,
    };

    // レンタル追加フォームを生成する
    const rentalAddForm = this.formService.createRentalAddForm(this.fb);
    // for onrbyone
    // レンタル追加フォームの貸出予定日と返却予定日の変更を購読する
    const scheduledRentalDate$ = rentalAddForm.get(
      'scheduledDateGroup.scheduled_rental_date'
    )?.valueChanges;
    const scheduledReturnDate$ = rentalAddForm.get(
      'scheduledDateGroup.scheduled_return_date'
    )?.valueChanges;

    if (scheduledRentalDate$ && scheduledReturnDate$) {
      this.subscription.add(
        combineLatest([scheduledRentalDate$, scheduledReturnDate$]).subscribe(
          ([rentalDate, returnDate]) => {
            rentalAddForm.patchValue({
              rental_fee: this.calculateRentalFee(
                rentalProduct,
                rentalDate,
                returnDate
              ),
            });
          }
        )
      );
    }

    // 貸出予定日と返却予定日を現在日付に設定する
    const rentalDate = new Date().toISOString();
    const returnDate = new Date().toISOString();
    // レンタル料金を計算する
    const rentalFee = this.calculateRentalFee(
      rentalProduct,
      rentalDate,
      returnDate
    );
    // エラーが返ってきた場合
    if (rentalFee instanceof Error) {
      // アラートを表示する
      alert(rentalFee.message);
      // 処理を終了する
      return;
    }
    // レンタル料金を初期値に設定する
    initialValues.rental_fee = rentalFee;
    // レンタル追加フォームに初期値を設定する
    rentalAddForm.patchValue(initialValues);
    // レンタル追加フォームをフォーム配列に追加する
    this.rentalAddFormArray.push(rentalAddForm);
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
   * 商品検索フォームで商品が選択された場合の処理
   * @param id
   */
  onProductSuggestIdChange(id: string) {}

  onProductSuggestDataSelected(rentalProduct: RentalProduct) {
    this.reservationStatusBody = [];
    // 購読管理に格納
    this.subscription.add(
      this.getSelectedRentalProductsAndReservationStatus(
        rentalProduct
      ).subscribe((res) => {
        if (res) {
          // 商品識別用バーコードが同じ商品データとその商品の予約状況を取得する
          const rentalProducts = res.rentalProducts;
          const rentals = res.rentals;
          this.createReservationStatusList(rentalProducts, rentals);
        }
      })
    );
  }

  /**
   * 選択した商品データとその商品の予約状況を取得する
   * @param data RentalProduct 商品データ
   */
  getSelectedRentalProductsAndReservationStatus(rentalProduct: RentalProduct) {
    // 表示開始日から3週間後の日付を取得する
    const displayStartDate = new Date(
      String(this.displayStartDateFc.display_start_date.value)
    );
    const displayEndDate = new Date(
      String(this.displayStartDateFc.display_start_date.value)
    );
    displayEndDate.setDate(
      displayStartDate.getDate() + this.RESERVATION_STATUS_PERIOD
    );

    // ローディング開始
    this.common.loading = true;

    const params: { [key: string]: string | number | null } = {
      product_barcode: rentalProduct.product_barcode,
      // 公開フラグが公開の商品のみを取得するように設定する
      data_permission_division_id:
        this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC,
    };

    if (
      this.selectedRentalProductAcquisitionType ===
      this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE
    ) {
      // paramsへ予約可能な商品のみを取得するように設定する
      params['status_division_id'] =
        this.RENTAL_PRODUCT_STATUS_DIVISION_ID_RENTABLE;
    }

    let start = displayStartDate.toLocaleDateString() + ' 00:00:00';
    let end = displayEndDate.toLocaleDateString() + ' 00:00:00';
    const rental_params = {
      rental_product_id: rentalProduct.id,
      schedulfrom_created_ated_rental_date: start,
      to_created_at: end,
    };

    //this.rentalService.getAll({
    //  product_barcode: rentalProduct.product_barcode,
    //  // TODO: 登録日で期間を指定しているが貸出予定日で期間を指定するか検討した方がいいかも
    //  from_created_at: displayStartDate.toLocaleString(),
    //  to_created_at: displayEndDate.toLocaleString(),
    //})

    return forkJoin([
      this.rentalProductService.getAll({ ...params }),
      this.rentalService.getAll({ ...rental_params }),
    ]).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          const title = error.error
            ? error.error.title
            : 'エラーが発生しました';
          const message = error.error ? error.error.message : error.message;
          this.handleError(error.status, title, message);
        }
        return of(null);
      }),
      map((res) => {
        this.common.loading = false;
        if (res) {
          return {
            rentalProducts: res[0].data,
            rentals: res[1].data,
          };
        }
        return null;
      }),
      finalize(() => (this.common.loading = false))
    );
  }

  /**
   * createReservationStatusHeader - 予約状況一覧のデータを作成する
   * @param rentalProducts - RentalProduct[] 商品データ
   * @param rentals - Rental[] 予約データ
   */
  createReservationStatusList(
    rentalProducts: RentalProduct[],
    rentals: Rental[]
  ) {
    // 表示開始日から3週間後の日付を取得する
    const displayStartDate = new Date(
      String(this.displayStartDateFc.display_start_date.value)
    );

    const combinedRentals = mapProductsToRentals(rentalProducts, rentals);

    this.reservationStatusHeader = createReservationStatusHeader(
      displayStartDate,
      this.RESERVATION_STATUS_PERIOD
    );

    const t: any = generateBodyData(
      //this.reservationStatusBody = generateBodyData(
      combinedRentals,
      rentalProducts,
      displayStartDate,
      this.RESERVATION_STATUS_PERIOD
    );

    // 蓄積反映 更新
    t.forEach((item: any) => {
      this.reservationStatusBody.push(item);
    });
  }

  /**
   * 分類に応じたレンタル商品を取得する
   * @param categoryId - 分類のid
   */
  getRentalProductsByCategory(categoryId: number) {
    this.common.loading = true;
    let observable$;
    if (this.currentCategoryLevel === 'large') {
      observable$ = this.rentalProductService.getAll({
        large_category_id: categoryId,
        data_permission_division_id:
          this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC,
      });
    } else if (this.currentCategoryLevel === 'medium') {
      observable$ = this.rentalProductService.getAll({
        medium_category_id: categoryId,
        data_permission_division_id:
          this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC,
      });
    } else {
      observable$ = this.rentalProductService.getAll({
        small_category_id: categoryId,
        data_permission_division_id:
          this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC,
      });
    }
    this.subscription.add(
      observable$
        .pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse) {
              return of(error);
            }
            return of(null);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラーが発生しました';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message);
            this.common.loading = false;
            return;
          }
          if (res === null) {
            alert('商品データの取得に失敗しました');
            return;
          }
          if (res.totalItems > 0) {
            let rentalProducts: RentalProduct[] = res.data;
            rentalProducts.forEach((rentalProduct) => {
              this.onProductSuggestDataSelected(rentalProduct);
            });
          } else {
            alert('商品データが見つかりませんでした');
          }
        })
    );
  }

  /**
   * 分類メニューをドリルダウンする
   * @param id - 分類のid
   */
  drillDownMenu(id: number, hasChildren: boolean | undefined) {
    // カテゴリーレベルが大分類の場合
    if (this.currentCategoryLevel === 'large') {
      // hasChildrenがfalseの場合は大分類に属するレンタル商品を取得する
      if (!hasChildren) {
        this.getRentalProductsByCategory(id);
        return;
      }
      // isLargeCategoryをfalseにする
      this.isLargeCategory = false;
      // currentCategoryLevelを中分類に変更する
      this.currentCategoryLevel = 'medium';
      // 引数のidで中分類を絞り込む
      this.currentCategoryData = this.mediumCategories.filter(
        (x) => x.large_category_id === id
      );
      // カテゴリーレベルが中分類の場合
    } else if (this.currentCategoryLevel === 'medium') {
      // hasChildrenがfalseの場合は中分類に属するレンタル商品を取得する
      if (!hasChildren) {
        this.getRentalProductsByCategory(id);
        return;
      }
      // isLargeCategoryをfalseにする
      this.isLargeCategory = false;
      // currentCategoryLevelを小分類に変更する
      this.currentCategoryLevel = 'small';
      // 引数のidで小分類を絞り込む
      this.currentCategoryData = this.smallCategories.filter(
        (x) => x.medium_category_id === id
      );
    } else {
      // カテゴリーレベルが小分類の場合は小分類に属するレンタル商品を取得する
      this.getRentalProductsByCategory(id);
      return;
    }
  }

  /**
   * 分類メニューをドリルアップする
   */
  drillUpMenu() {
    // カテゴリーレベルが大分類の場合は処理を終了する
    if (this.currentCategoryLevel === 'large') {
      return;
    }
    // カテゴリーレベルが中分類の場合
    if (this.currentCategoryLevel === 'medium') {
      // isLargeCategoryをtrueにする
      this.isLargeCategory = true;
      // currentCategoryLevelを大分類に変更する
      this.currentCategoryLevel = 'large';
      // currentCategoryDataを大分類に変更する
      this.currentCategoryData = this.largeCategories;
      // カテゴリーレベルが小分類の場合
    } else if (this.currentCategoryLevel === 'small') {
      // isLargeCategoryをfalseにする
      this.isLargeCategory = false;
      // currentCategoryLevelを中分類に変更する
      this.currentCategoryLevel = 'medium';
      // currentCategoryDataを中分類に変更する
      this.currentCategoryData = this.mediumCategories;
    }
  }

  /**
   * 大分類と中分類にhas_childrenを設定する
   */
  setHasChildren() {
    const hasChildrenLargeCategory = this.largeCategories.map((x) => {
      const mediumCategories = this.mediumCategories.filter(
        (y) => y.large_category_id === x.id
      );
      if (mediumCategories.length > 0) {
        x.has_children = true;
      } else {
        x.has_children = false;
      }
      return x;
    });
    this.largeCategories = hasChildrenLargeCategory;
    const hasChildrenMediumCategory = this.mediumCategories.map((x) => {
      const smallCategories = this.smallCategories.filter(
        (y) => y.medium_category_id === x.id
      );
      if (smallCategories.length > 0) {
        x.has_children = true;
      } else {
        x.has_children = false;
      }
      return x;
    });
    this.mediumCategories = hasChildrenMediumCategory;
    const hasChildrenSmallCategory = this.smallCategories.map((x) => {
      x.has_children = false;
      return x;
    });
    this.smallCategories = hasChildrenSmallCategory;
  }

  /**
   * 商品ID検索フォームのサジェストを取得する
   * @returns
   */
  getProductIdFormSuggests(): ApiInput<RentalProductApiResponse> {
    const params: { [key: string]: string | number | null } = {
      // 商品名で検索
      id: this.productFc.id.value,
      // 公開フラグが公開の商品のみを取得するように設定する
      data_permission_division_id:
        this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC,
    };

    if (
      this.selectedRentalProductAcquisitionType ===
      this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE
    ) {
      // paramsへ予約可能な商品のみを取得するように設定する
      params['status_division_id'] =
        this.RENTAL_PRODUCT_STATUS_DIVISION_ID_RENTABLE;
    }
    return {
      observable: this.rentalProductService.getAll({ ...params }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'id',
      textAttachColumn: 'name',
    };
  }

  /**
   * チェックボックスがチェックされた時の処理
   */
  onCheckboxChange(event: Event, rentalProduct: RentalProduct | string) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked && typeof rentalProduct !== 'string') {
      this.addRentalAddForm(rentalProduct);
    } else if (!checked && typeof rentalProduct !== 'string') {
      let lists = this.rentalAddFormArray.value;
      let rentalAddFormArray_num;
      for (let i = 0; i < lists.length; i++) {
        if (rentalProduct.id === lists[i].rental_product_id) {
          rentalAddFormArray_num = i;
        }
      }
      if (
        rentalAddFormArray_num != undefined ||
        rentalAddFormArray_num != null
      ) {
        this.deleteSelectedRentalProduct(rentalAddFormArray_num);
      }
    }
  }

  private getDivisions(divisions: any, divisionConstValue: any): any[] {
    const selectDivisions: SelectOption[] = divisions[divisionConstValue];
    if (selectDivisions.length < 1) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
    }

    return [...[{ value: '', text: '選択してください' }], ...selectDivisions];
  }

  private _setDivisions(divisions: any): void {
    // レンタル受付票お客様タイプ区分が会員の場合の初期値の定数
    //RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER: number = 150;
    // レンタル受付票お客様タイプ区分が得意先の場合の初期値の定数
    //RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT: number = 149;

    // レンタル受付票お客様タイプ区分が会員の場合の初期値の定数
    this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.CUSTOMER_TYPE,
        rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.MEMBER
      );

    // レンタル受付票お客様タイプ区分が得意先の場合の初期値の定数
    this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.CUSTOMER_TYPE,
        rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.CLIENT
      );

    // レンタル商品のstatus_division_idの貸出可能idを定数として保持する
    // TODO: 都度区分テーブルから取得して設定するか検討が必要
    //RENTAL_PRODUCT_STATUS_DIVISION_ID_RENTABLE: number = 179;
    this.RENTAL_PRODUCT_STATUS_DIVISION_ID_RENTABLE =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.RENTAL_PRODUCT_STATUS,
        rentalProductConst.STATUS_CODE.RENTABLE
      );

    // レンタル商品の公開フラグの公開を定数として保持する
    // TODO: 都度区分テーブルから取得して設定するか検討が必要
    //RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC: number = 52
    // 上記 -> 187 レンタル用は187だけど指示に従う;
    this.RENTAL_PRODUCT_DATA_PERMISSION_DIVISION_ID_PUBLIC =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.DATA_PERMISSION,
        generalConst.DATA_PERMISSION.CODE.PUBLIC
      );

    // 配送依頼区分の配送なしを定数として保持する
    // TODO: 都度区分テーブルから取得して設定するか検討が必要
    //DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY: number = 133;

    this.DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.DELIVERY_REQUEST,
        deliveryConst.DELIVERY_REQUEST.CODE.NO_DELIVERY
      );

    // 回収依頼区分の回収なしを定数として保持する
    // TODO: 都度区分テーブルから取得して設定するか検討が必要
    //COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION: number = 177;
    this.COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.COLLECTION_REQUEST,
        deliveryConst.COLLECTION_REQUEST.CODE.NO_COLLECTION
      );

    this.settleStatusDivisionOptions = this.getDivisions(
      divisions,
      divisionConst.SETTLE_STATUS
    );
    this.incidentDivisionOptions = this.getDivisions(
      divisions,
      divisionConst.INCIDENT
    );
    this.statusDivisionOptions = this.getDivisions(
      divisions,
      divisionConst.RENTAL_SLIP_STATUS
    );

    this.customerTypes = this.getDivisionSelectOption(
      divisions,
      divisionConst.CUSTOMER_TYPE
    );

    this.customerTypes_ = this.getDivisions(
      divisions,
      divisionConst.CUSTOMER_TYPE
    );
  }

  private getDivisionSelectOption(
    divisions: any,
    divisionConstValue: any
  ): any[] {
    const selectDivisions: SelectOption[] = divisions[divisionConstValue];
    if (selectDivisions.length < 1) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
    }

    return [...[{ value: '', text: '選択してください' }], ...selectDivisions];
  }

  simpleFormControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  private _setHiddenValue(): void {
    this._setStatusDivisionId(this.commonFc);
    this._setIncidentDivisionId(this.commonFc);
    this._setSettleStatusDivisionId(this.commonFc);
  }

  private _setStatusDivisionId(form: any): void {
    const statusDivision = this.statusDivisionOptions.find((x) => {
      return x.text === this.rsConst.STATUS.ACCEPTED;
    });

    //this.RENTAL_SLIP_INITIAL_STATUS_ACCEPTED 受付済み
    form.status_division_id.patchValue(statusDivision?.value);
  }

  private _setIncidentDivisionId(form: any): void {
    const incidentDivision = this.incidentDivisionOptions.find((x) => {
      return x.text === this.rsConst.INCIDENT_DIVISION.VALUE.NO_INCIDENTS;
    });
    //this.RENTAL_SLIP_INITIAL_INCIDENT_DIVISION_NO_INCIDENTS
    form.incident_division_id.patchValue(incidentDivision?.value);
  }

  private _setSettleStatusDivisionId(form: any): void {
    const settleStatusDivision = this.settleStatusDivisionOptions.find((x) => {
      return x.text === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED;
    });
    form.settle_status_division_id.patchValue(settleStatusDivision?.value);
  }

  /**
   * 区分を生成する
   * @param divisions - 区分
   * @returns
   */
  generateStatusDivisions(divisions: any): boolean {
    // 区分が取得できなかった場合
    if (divisions === null || divisions === undefined) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }

    if (divisions[divisionConst.DELIVERY_REQUEST].length === 0) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }

    if (divisions[divisionConst.COLLECTION_REQUEST].length === 0) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }

    // 配送依頼区分をメンバへセット
    this.deliveryDivisionOptions = divisions[divisionConst.DELIVERY_REQUEST];
    // 回収依頼区分をメンバへセット
    this.collectionDivisionOptions =
      divisions[divisionConst.COLLECTION_REQUEST];
    return true;
  }

  /**
   * 本人確認書類の確認日時を更新する
   * 「本人確認書類を確認しました」ボタンクリック時に実行する
   */
  confirmedIdentityVerificationDocuments() {
    // TODO: モーダルで対応する？
    // 本人確認書類を確認し更新を実行するか確認する
    const isConfirm = confirm(
      '本人確認書類を確認しましたか？\n更新を実行します。この処理は取り消せません。'
    );

    // 本人確認書類を確認し更新を実行しない場合は処理を終了する
    if (!isConfirm) {
      return;
    }

    // お客様タイプによって更新するオブザーバーを格納する変数
    let updateCustomerData$: Observable<MemberApiResponse>;

    // お客様タイプによって更新対象のモデルを格納する変数
    //let targetCustomer: Member | Client;

    if (
      this.selectedCustomer.customer_type_code ===
      this.DIVISION_CUSTOMER_CODE_MEMBER
    ) {
      // 会員の場合
      // 会員情報が取得できているか確認する
      if (
        this.selectedMember === undefined ||
        this.selectedMember === null ||
        Object.keys(this.selectedMember).length === 0
      ) {
        // TODO: モーダルなど適切なエラー処理をする
        alert('お客様情報が取得できませんでした');
        return;
      }
      // 更新対象のお客様情報を設定する
      const today = new Date().toLocaleString();
      const postData = {
        member_cd: this.selectedMember.member_cd,
        last_name: this.selectedMember.last_name,
        first_name: this.selectedMember.first_name,
        last_name_kana: this.selectedMember.last_name_kana,
        first_name_kana: this.selectedMember.first_name_kana,
        postal_code: this.selectedMember.postal_code,
        province: this.selectedMember.province,
        locality: this.selectedMember.locality,
        street_address: this.selectedMember.street_address,
        other_address: this.selectedMember.other_address,
        tel: this.selectedMember.tel,
        mail: this.selectedMember.mail,
        point: this.selectedMember.point,
        status_division_id: this.selectedMember.status_division_id,
        remarks_1: this.selectedMember.remarks_1,
        remarks_2: this.selectedMember.remarks_2,
        identification_document_confirmation_date: today,
      };
      this.selectedMember.identification_document_confirmation_date = today;
      // 会員情報を更新するオブザーバー作成する
      updateCustomerData$ = this.memberService.update(
        this.selectedMember.id,
        postData
      );
    } else {
      // お客様タイプが不正な場合
      // TODO: モーダルなど適切なエラー処理をする
      alert('お客様情報が取得できませんでした');
      return;
    }

    // お客様情報を更新する
    this.updateCustomerData(updateCustomerData$);
  }

  /**
   * お客様データを更新する
   * @param updateCustomerData$ - お客様データ更新オブザーバー
   */
  updateCustomerData(
    updateCustomerData$: Observable<MemberApiResponse | ClientApiResponse>
  ) {
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
          if (
            this.selectedCustomer.customer_type_code ===
            this.DIVISION_CUSTOMER_CODE_MEMBER
          ) {
            this.onMemberNameSuggestDataSelected(this.selectedMember);
          } else if (
            this.selectedCustomer.customer_type_code ===
            this.DIVISION_CUSTOMER_CODE_CLIENT
          ) {
            this.onClientNameSuggestDataSelected(this.selectedClient);
          }

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        })
    );
  }
  onCheckId(event: any) {
    const today = new Date().toLocaleString();
    if (event.target.checked) {
      this.identificationIsChecked = true;
      this.idCheckedDateTime = 1;
      this.generalFc.identification_document_confirmation_date.setValue(today);
    } else {
      this.identificationIsChecked = false;
      this.idCheckedDateTime = 0;
      this.generalFc.identification_document_confirmation_date.setValue('');
    }
  }

  saveModal(callback: () => void) {
    // モーダルのタイトル
    const modalTitle = '削除しますがよろしいですか？';
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

  formatDateToYMDLocal(dateString: string): string {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
