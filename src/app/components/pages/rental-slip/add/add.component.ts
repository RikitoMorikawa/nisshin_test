import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  combineLatest,
  filter,
  finalize,
  forkJoin,
  map,
  of,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { rentalSlipConst } from 'src/app/const/rental-slip.const';
import { rentalProductConst } from 'src/app/const/rental-product.const';
import { generalConst } from 'src/app/const/general.const';
import { deliveryConst } from 'src/app/const/delivery.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { Client, ClientApiResponse } from 'src/app/models/client';
import { Employee } from 'src/app/models/employee';
import { Member, MemberApiResponse } from 'src/app/models/member';
import { AuthorService } from 'src/app/services/author.service';
import { ClientService } from 'src/app/services/client.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { MemberService } from 'src/app/services/member.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import {
  FormService,
  RentalAddFormInitialValueType,
} from 'src/app/services/rental-slip/form.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SmallCategoryService } from 'src/app/services/small-category.service';
import { StoreService } from 'src/app/services/store.service';
import { LargeCategory } from 'src/app/models/large-category';
import { MediumCategory } from 'src/app/models/medium-category';
import { SmallCategory } from 'src/app/models/small-category';
import { RentalProductService } from 'src/app/services/rental-product.service';
import { ApiInput } from 'src/app/components/molecules/search-suggest-container/search-suggest-container.component';
import {
  RentalProduct,
  RentalProductApiResponse,
} from 'src/app/models/rental-product';
import { RentalService } from 'src/app/services/rental.service';
import { Rental } from 'src/app/models/rental';
import {
  ReservationStatusBody,
  ReservationStatusHeader,
  createReservationStatusHeader,
  generateBodyData,
  mapProductsToRentals,
} from 'src/app/functions/rental-functions';
import {
  RoundingMethod,
  calculatePrice,
  daysBetweenDates,
  getFractionMethod,
  getTaxRateAndTaxIncludedFlag,
  roundPrice,
} from 'src/app/functions/shared-functions';
import { RentalSlipService } from 'src/app/services/rental-slip.service';
import { RentalSlip } from 'src/app/models/rental-slip';
import { CommonService } from 'src/app/services/shared/common.service';
import { BulkAddComponent } from '../../master/product/bulk-add/bulk-add.component';
import {
  flattingFormValue,
  convertToJpDate,
} from '../../../../functions/shared-functions';
import { Division } from 'src/app/models/division';
import { DivisionIdService } from 'src/app/services/shared/divisionid.service';
import { RentalSlipApiResponse } from '../../../../models/rental-slip';

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
  shipping_address?: string;
  status_division_id: number;
  incident_division_id: number;
  settle_status_division_id: number;
  customer_type_division_id: number;
  rental: any[];
  send_sms_flg?: number;
  processing_units?: number;
  // 以下プロパティはオプショナルです
  member_id?: number;
  client_id?: number;
  last_name?: string;
  first_name?: string;
  last_name_kana?: string;
  first_name_kana?: string;
  tel?: string;
  identification_document_confirmation_date?: string;
};

type initDate = {
  bulkScheduledDateGroup?: {
    bulk_scheduled_rental_date?: string;
    bulk_scheduled_return_date?: string;
  };
};
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private modalService: ModalService,
    private router: Router,
    private storeService: StoreService,
    private clientService: ClientService,
    private memberService: MemberService,
    private employeeService: EmployeeService,
    private divisionService: DivisionService,
    private errorService: ErrorService,
    private formService: FormService,
    private flashMessageService: FlashMessageService,
    private largeCategoryService: LargeCategoryService,
    private mediumCategoryService: MediumCategoryService,
    private smallCategoryService: SmallCategoryService,
    private rentalProductService: RentalProductService,
    private rentalService: RentalService,
    private rentalSlipService: RentalSlipService,
    private common: CommonService,
    private dIService: DivisionIdService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // レンタル・滞納・返金額 2日目移行の価格割合
  discount_price_late: number = 1;

  idConfirmationDate: boolean = false;
  // 一覧のパス
  listPagePath = '/rental-slip';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle =
    'レンタル予約受付規登録キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle =
    'レンタル予約受付新規登録エラー：' + modalConst.TITLE.HAS_ERROR;

  // ログイン中ユーザー名
  authorName!: string;

  // ログイン中ユーザーロール
  authorRole!: string;

  // 配送区分選択肢
  deliveryDivisionOptions!: SelectOption[];

  // 回収区分選択肢
  collectionDivisionOptions!: SelectOption[];

  // 社員サジェスト
  employeeSuggests!: SelectOption[];

  // 店舗選択肢
  storeSuggests!: SelectOption[];

  // エラー文言
  errorConst = errorConst;

  // 精算区分
  settleStatusDivisionOptions!: SelectOption[];

  // ステータス区分
  statusDivisionOptions!: SelectOption[];

  // インシデント区分
  incidentDivisionOptions!: SelectOption[];

  // レンタル受付票定数
  rsConst = rentalSlipConst;

  // 貸出中
  RENTED = rentalProductConst.STATUS.RENTED;
  // 貸出可能
  RENTABLE = rentalProductConst.STATUS.RENTABLE;
  // ----------------
  // 予約受付票関連
  // ----------------

  // レンタル受付票ステータスの初期値の定数
  RENTAL_SLIP_INITIAL_STATUS_ACCEPTED!: number;
  // レンタル受付票インシデント区分の初期値の定数
  RENTAL_SLIP_INITIAL_INCIDENT_DIVISION_NO_INCIDENTS!: number;
  // レンタル受付票精算区分の初期値の定数
  RENTAL_SLIP_INITIAL_SETTLE_STATUS_DIVISION_UNSETTLED!: number;
  // レンタル受付票お客様タイプ区分が会員の場合の初期値の定数
  RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER!: number;
  // レンタル受付票お客様タイプ区分が得意先の場合の初期値の定数
  RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT!: number;
  // レンタル受付票お客様タイプ区分が一般の場合の初期値の定数
  RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_GENERAL!: number;

  //フォーム共通
  // 共通フォーム
  commonForm = this.fb.group({
    customer_type_division_id: ['', [Validators.required]],
    store_id: ['', [Validators.required]],
    reception_employee_id: ['', [Validators.required]],
    reception_date: ['', [Validators.required]],
    mobile_number: ['', [Validators.maxLength(20)]],
    send_sms_flg: [''],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
    status_division_id: ['', [Validators.required]],
    settle_status_division_id: ['', [Validators.required]],
    incident_division_id: ['', [Validators.required]],
    idConfirmationDate: [''],
  });
  clientForm = this.fb.group({
    client_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    client_name: [''],
    shipping_address: ['', [Validators.maxLength(255)]],
  });
  memberForm = this.fb.group({
    api_member_cd: [''],
    api_member_tel: [''],
    member_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    full_name: [''],
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
    tel: [
      '',
      [
        Validators.required,
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    shipping_address: ['', [Validators.maxLength(255)]],
    identification_document_confirmation_date: [''],
    idConfirmationDate_check: [''],
  });

  // レンタル受付票フォーム作成

  initialDate: initDate = {
    bulkScheduledDateGroup: {
      bulk_scheduled_rental_date: new Date().toISOString(),
      bulk_scheduled_return_date: new Date().toISOString(),
    },
  };

  // プロダクトのリスト格納
  product_id_list: number[] = [];
  update_product_item: RentalProduct[] = [];
  //プロダクトのステータス
  //予約済み
  PRODUCT_STATUS_DIVISION_RESERVED!: number;
  //貸し出し中
  PRODUCT_STATUS_DIVISION_LENDING!: number;
  // 返却済み
  PRODUCT_STATUS_DIVISION_RETURNED!: number;

  /**
   * レンタル受付票フォームのゲッター
   * @returns レンタル受付票フォームのコントロール
   */
  get commonFc() {
    return this.commonForm.controls;
  }
  get clientFc() {
    return this.clientForm.controls;
  }
  get memberFc() {
    return this.memberForm.controls;
  }
  get generalFc() {
    return this.generalForm.controls;
  }
  // 受付担当者id検索用フォーム
  getReceptionEmployeeByIdForm = this.fb.group({
    get_reception_employee_by_id: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
  });

  // 受付担当者id検索フォームのゲッター
  get getEmployeeByIdFc() {
    return this.getReceptionEmployeeByIdForm.controls;
  }

  // 選択中のお客様情報
  selectedCustomer!: SelectedCustomerType;
  // 選択したお客様タイプ
  customerType!: any;

  // 選択中の会員・得意先情報
  selectedMember!: Member;
  selectedClient!: Client;

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
  /*
   * set default
   * 選択中のお客様タイプ 初期値は会員を設定
   * フロントのフォームの出し入れに使用します
   */
  selectedCustomerCode!: string;

  // お客様タイプラジオボタンの選択肢
  customerTypes!: SelectOption[];

  // 処理単位定数
  ONEBYONE: string = 'onebyone';
  BULK: string = 'bulk';
  PROCESSINGUNIT_ONEBYONE_VALUE = 0;
  PROCESSINGUNIT_BULK_VALUE = 1;

  // 処理単位デフォルト値
  processingUnitsDefaultValue: number = 0;
  processingUnitsPostValue: number = 0;
  // 処理単位Processing Units
  processingUnits: { value: string; display: string; id: number }[] = [
    { value: this.ONEBYONE, display: '明細単位', id: 1 },
    { value: this.BULK, display: '受付票単位', id: 0 },
  ];
  // 選択中の処理単位タイプ 初期値は受付票単位を設定
  selectedprocessingUnits: string = this.BULK;

  // 会員・得意先サジェスト表示フラグ デフォルトは会員サジェストを表示
  showOnebyoneSuggest: boolean = false;
  showBulkSuggest: boolean = true;

  smsIsChecked: boolean = false;
  // SMS送信の有無
  selectedSMS: number = 0;

  identificationIsChecked: boolean = false;
  // 一般免許書確認
  // SMS送信の有無
  idCheckedDateTime: number = 0;

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

  get rentalDateFormsControls() {
    return this.rentalDateForms.controls;
  }

  /**
   * 会員・得意先選択に応じてお客様情報のフォームをリセットする
   */
  resetCustomerInfo() {
    let type_value!: number;
    if (this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_MEMBER) {
      this.resetClientForm();
      this.resetGeneralFrom();
      type_value = Number(rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER);
    } else if (
      this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_CLIENT
    ) {
      this.resetMemberForm();
      this.resetGeneralFrom();
      type_value = Number(rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT);
    } else if (
      this.selectedCustomerCode === this.DIVISION_CUSTOMER_CODE_GENERAL
    ) {
      this.resetClientForm();
      this.resetMemberForm();
      type_value = Number(rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL);
    }

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
    };
  }

  resetMemberForm() {
    this.memberSFc.full_name.patchValue('', { emitEvent: true });
    this.memberSFc.id.patchValue('');
    this.memberFc.member_id.patchValue('');
    this.memberFc.shipping_address.patchValue('');
  }
  resetClientForm() {
    this.clientSFc.client_name.patchValue('', { emitEvent: true });
    this.clientSFc.id.patchValue('');
    this.clientFc.client_id.patchValue('');
    this.clientFc.shipping_address.patchValue('');
  }
  resetGeneralFrom() {
    this.generalFc.first_name.patchValue('');
    this.generalFc.first_name_kana.patchValue('');
    this.generalFc.last_name.patchValue('');
    this.generalFc.last_name_kana.patchValue('');
    this.generalFc.tel.patchValue('');
    this.generalFc.shipping_address.patchValue('');
    this.commonFc.mobile_number.patchValue('');
    this.commonFc.idConfirmationDate.patchValue('');
    this.idConfirmationDate = false;
    this.generalFc.idConfirmationDate_check.patchValue('');
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
      this.generalFc.idConfirmationDate_check.setValue('');
    }
  }
  /**
   * 会員・得意先選択ラジオボタンイベント対応
   * @param event
  onCustomerRadioChange(event: Event) {
    const selectedCustomerType = (event.target as HTMLInputElement).value;
    this.selectedCustomerType = selectedCustomerType as CustomerType;

    // 選択中以外のサジェストフォームの値とレンタル受付票の会員IDまたは得意先IDをリセットする
    this.resetCustomerInfo();
    this.toggleCustomerSuggest();
  } */

  onProcessingUnitsRadioChange(event: Event) {
    const selectedprocessingUnit = (event.target as HTMLInputElement).value;
    this.selectedprocessingUnits = selectedprocessingUnit;
    //フロント表示の変更
    this.toggleProcessingUnits();
    if (this.showOnebyoneSuggest === false) {
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
   * 処理単位タイプ　表示フラグを切り替える
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
    }
  }

  // 会員検索用フォーム
  memberSuggestForm = this.fb.group({
    id: ['', [Validators.required]],
    full_name: [''],
  });

  // 会員検索フォームのゲッター
  get memberSFc() {
    return this.memberSuggestForm.controls;
  }

  // 得意先検索用フォーム
  clientSuggestForm = this.fb.group({
    id: ['', [Validators.required]],
    client_name: [''],
  });

  // 得意先検索フォームのゲッター
  get clientSFc() {
    return this.clientSuggestForm.controls;
  }

  // 会員検索フォームのサジェストを取得する
  getMemberFormNameSuggests() {
    let fullName = this.memberFc.full_name.value;
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
   * 会員名のサジェストを取得
   * @returns
   */
  getMemberSuggests(): any {
    //getMemberSuggests(): any {
    const member_id = Number(this.memberFc.api_member_cd.value);
    return {
      observable: this.memberService.getAll({
        member_cd: member_id,
      }),
      idField: 'id',
      nameField: 'member_cd',
    };
  }
  /**
   * 会員名のサジェストを取得
   * @returns
   */
  getMemberTelSuggests(): any {
    //getMemberSuggests(): any {
    const member_tel = Number(this.memberFc.api_member_tel.value);
    return {
      observable: this.memberService.getAll({ tel: member_tel }),
      idField: 'id',
      nameField: 'last_name',
      otherField: 'first_name',
    };
  }
  onMemberIdSuggestDataSelected(data: Member) {
    // 選択中のお客様情報を保持する
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

    this.selectedCustomer = {
      type: Number(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER),
      customer_type_code: this.DIVISION_CUSTOMER_CODE_MEMBER,
      id: String(data.id),
      fullName: fullName,
      fullNameKana: fullNameKana,
      address: address,
      tel: data.tel ? data.tel : '',
      idConfirmationDate:
        idConfirmationDate === '' ? '未確認' : idConfirmationDate,
      isIdConfirmationRequired: isIdConfirmationRequired,
    };
    if (isIdConfirmationRequired) {
      this.idConfirmationDate = true;
    } else {
      this.idConfirmationDate = false;
    }

    this.selectedMember = data;
    this.selectedClient = {} as Client;
    // 得意先IDをリセットする
    this.clientFc.client_id.patchValue('');
    // 会員IDをフォームに設定する
    this.memberFc.member_id.patchValue(String(data.id));

    this.commonFc.customer_type_division_id.patchValue(
      String(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER)
    );
  }
  /**
   * 会員サジェストの結果から選択した場合の処理
   * @param data
   */
  onMemberNameSuggestDataSelected(data: Member) {
    // 選択中のお客様情報を保持する
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

    this.selectedCustomer = {
      type: Number(rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER),
      customer_type_code: this.DIVISION_CUSTOMER_CODE_MEMBER,
      id: String(data.id),
      fullName: fullName,
      fullNameKana: fullNameKana,
      address: address,
      tel: data.tel ? data.tel : '',
      idConfirmationDate:
        idConfirmationDate === '' ? '未確認' : idConfirmationDate,
      isIdConfirmationRequired: isIdConfirmationRequired,
    };

    this.selectedMember = data;
    this.selectedClient = {} as Client;

    // 得意先IDをリセットする
    this.clientFc.client_id.patchValue('');
    // 会員IDをフォームに設定する
    this.memberFc.member_id.patchValue(String(data.id));

    this.commonFc.customer_type_division_id.patchValue(
      String(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER)
    );
  }

  /**
   * 得意先検索フォームのサジェストを取得する
   * @returns
   */
  getClientFormNameSuggests() {
    return {
      observable: this.clientService.getAll({
        name: this.clientFc.client_name.value,
      }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
  }

  /**
   * 得意先サジェストの結果から選択した場合の処理
   * @param data
   */
  onClientNameSuggestDataSelected(data: Client) {
    // 選択中のお客様情報を保持する
    const province = data.province ? data.province : '';
    const locality = data.locality ? data.locality : '';
    const streetAddress = data.street_address ? data.street_address : '';
    const otherAddress = data.other_address ? data.other_address : '';
    const address = province + locality + streetAddress + otherAddress;
    const today = new Date();

    const idConfirmationDate = '';

    this.selectedCustomer = {
      type: Number(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT),
      customer_type_code: this.DIVISION_CUSTOMER_CODE_CLIENT,
      id: String(data.id),
      fullName: data.name,
      fullNameKana: data.name_kana,
      address: address,
      tel: data.tel ? data.tel : '',
      idConfirmationDate:
        idConfirmationDate === '' ? '未確認' : idConfirmationDate,
      isIdConfirmationRequired: false,
    };
    this.selectedClient = data;
    this.selectedMember = {} as Member;

    // 会員IDをリセットする
    this.memberFc.member_id.patchValue('');
    // 得意先IDをフォームに設定する
    this.clientFc.client_id.patchValue(String(data.id));
    // division_id をセットする
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
    // 格納しているプロダクトの結果をリセット
    this.update_product_item = [];
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

  // 商品名検索フォームのサジェスト表示フラグ
  showProductNameSuggest: boolean = false;

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

  /**
   * 選択済みのレンタル商品を削除する
   */
  deleteSelectedRentalProduct(index: number) {
    this.rentalAddFormArray.removeAt(index);
    delete this.update_product_item[index];
  }

  // 検索して取得したデータを格納する
  productSearchResults!: RentalProduct[];

  /**
   * 商品名検索フォームのサジェスト表示切り替え
   * @returns
   */
  toggleProductNameSuggest() {
    this.reservationStatusBody = [];
    // 表示開始日が指定されていない場合は処理を終了する
    if (this.validateDisplayStartDate()) {
      return;
    }
    // 商品検索フォームのサジェスト表示フラグを切り替える
    this.showProductNameSuggest = !this.showProductNameSuggest;
  }

  // 商品ID検索フォームのサジェスト表示フラグ
  showProductIdSuggest: boolean = false;

  /**
   * 商品ID検索フォームのサジェスト表示切り替え
   * @returns
   */
  toggleProductIdSuggest() {
    this.reservationStatusBody = [];
    if (this.validateDisplayStartDate()) {
      return;
    }
    this.showProductIdSuggest = !this.showProductIdSuggest;
  }

  // レンタル商品のstatus_division_idの貸出可能idを定数として保持する
  PRODUCT_STATUS_DIVISION_RENTABLE!: number;
  // レンタル商品の公開フラグの公開を定数として保持する
  DATA_PERMISSION_DIVISION_ID_PUBLIC!: number;
  // 配送依頼区分の配送なしを定数として保持する
  DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY!: number;
  // 回収依頼区分の回収なしを定数として保持する
  COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION!: number;

  /**
   * 商品名検索フォームのサジェストを取得する
   * @returns
   */
  getProductNameFormSuggests(): ApiInput<RentalProductApiResponse> {
    const params: { [key: string]: string | number | null } = {
      // 商品名で検索
      name: this.productFc.product_name.value,
      // 公開フラグが公開の商品のみを取得するように設定する
      data_permission_division_id: this.DATA_PERMISSION_DIVISION_ID_PUBLIC,
    };

    if (
      this.selectedRentalProductAcquisitionType ===
      this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE
    ) {
      // paramsへ予約可能な商品のみを取得するように設定する
      params['status_division_id'] = this.PRODUCT_STATUS_DIVISION_RENTABLE;
    }
    return {
      observable: this.rentalProductService.getAll({ ...params }),
      // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
      valueTargetColumn: 'id',
      textTargetColumn: 'name',
    };
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
      data_permission_division_id: this.DATA_PERMISSION_DIVISION_ID_PUBLIC,
    };

    if (
      this.selectedRentalProductAcquisitionType ===
      this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE
    ) {
      // paramsへ予約可能な商品のみを取得するように設定する
      params['status_division_id'] = this.PRODUCT_STATUS_DIVISION_RENTABLE;
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
   * 商品検索フォームで商品が選択された場合の処理
   * @param id
   */
  onProductSuggestIdChange(id: string) {}

  onProductSuggestDataSelected(rentalProduct: RentalProduct, index?: number) {
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
          this.createReservationStatusList(rentalProducts, rentals, index);
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
      data_permission_division_id: this.DATA_PERMISSION_DIVISION_ID_PUBLIC,
    };

    if (
      this.selectedRentalProductAcquisitionType ===
      this.RENTAL_PRODUCT_ACQUISITION_RESERVABLE
    ) {
      // paramsへ予約可能な商品のみを取得するように設定する
      params['status_division_id'] = this.PRODUCT_STATUS_DIVISION_RENTABLE;
    }

    let start = displayStartDate.toLocaleDateString() + ' 00:00:00';
    let end = displayEndDate.toLocaleDateString() + ' 00:00:00';
    const rental_params = {
      //product_barcode: rentalProduct.product_barcode,
      rental_product_id: rentalProduct.id,
      // TODO: 登録日で期間を指定しているが貸出予定日で期間を指定するか検討した方がいいかも
      //from_created_at: displayStartDate.toLocaleString(),
      //to_created_at: displayEndDate.toLocaleString(),
      schedulfrom_created_ated_rental_date: start,
      to_created_at: end,
    };

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
    rentals: Rental[],
    index?: number
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
      console.log(item);
      if (index == undefined) {
        this.reservationStatusBody.push(item);
        return;
      }
      this.reservationStatusBody[index] = item;
    });
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

  // ----------------
  // 分類メニュー関連
  // ----------------

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

  /**
   * 分類メニュー開閉
   */
  toggleCategoryMenu() {
    this.reservationStatusBody = [];
    if (this.validateDisplayStartDate()) {
      return;
    }
    this.isCategoryMenuOpen = !this.isCategoryMenuOpen;
    this.currentCategoryLevel = 'large';
    this.currentCategoryData = this.largeCategories;
    this.isLargeCategory = true;
  }

  /**
   * 分類に応じたレンタル商品を取得する
   * @param categoryId - 分類のid
   */
  getRentalProductsByCategory(categoryId: number) {
    this.reservationStatusBody = [];
    this.common.loading = true;
    let observable$;
    if (this.currentCategoryLevel === 'large') {
      observable$ = this.rentalProductService.getAll({
        large_category_id: categoryId,
        data_permission_division_id: this.DATA_PERMISSION_DIVISION_ID_PUBLIC,
      });
    } else if (this.currentCategoryLevel === 'medium') {
      observable$ = this.rentalProductService.getAll({
        medium_category_id: categoryId,
        data_permission_division_id: this.DATA_PERMISSION_DIVISION_ID_PUBLIC,
      });
    } else {
      observable$ = this.rentalProductService.getAll({
        small_category_id: categoryId,
        data_permission_division_id: this.DATA_PERMISSION_DIVISION_ID_PUBLIC,
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
            rentalProducts.forEach((rentalProduct, index) => {
              console.log(rentalProduct);
              console.log(index);
              this.onProductSuggestDataSelected(rentalProduct, index);
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

  rentalAddForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  get rentalAddFormArray() {
    return this.rentalAddForms.get('forms') as FormArray;
  }

  get rentalAddFormArrayControls() {
    return this.rentalAddFormArray.controls as FormGroup[];
  }

  getInitialDate(): any {
    return new Date().toISOString();
  }

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
    // product データを取得変数に格納
    this.update_product_item.push(rentalProduct);

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
      rental_date: '',
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
   * ログイン中ユーザーの情報をもとに画面表示を初期化する
   * @param author
   */
  initWithAuthorInfo(author: Employee) {
    this.authorName = author.last_name + ' ' + author.first_name;
    this.authorRole = author.role_name ? author.role_name : '';
    this.commonFc.reception_employee_id.patchValue(String(author.id));
    this.commonFc.store_id.patchValue(String(author.store_id));
    this.commonFc.reception_date.patchValue(new Date().toISOString());
  }

  /**
   * 受付担当者をidを指定して取得しフォームに設定する
   * @param id 受付担当者id
   * @returns
   */
  getEmployeeById(id: string) {
    this.employeeSuggests.find((x) => {
      if (Number(x.value) === Number(id)) {
        this.commonFc.reception_employee_id.patchValue(String(x.value));
      }
    });
  }

  ngOnInit(): void {
    // ログイン中ユーザー取得処理
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.initWithAuthorInfo(this.authorService.author);
      // 選択肢初期化処理
      this.initOptions();
    } else {
      // authorServiceに値がない場合
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.initWithAuthorInfo(author);
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

    this.subscription.add(
      // 社員IDで社員を取得する要素の値を購読
      this.getEmployeeByIdFc.get_reception_employee_by_id.valueChanges.subscribe(
        (value) => {
          if (value === null || value === undefined || value === '') {
            return;
          }
          this.getEmployeeById(value);
        }
      )
    );

    this.resetCustomerInfo();

    // お客様タイプの変更を購読
    this.subscription.add(
      this.commonFc.customer_type_division_id.valueChanges.subscribe((res) => {
        this.selectedCustomerType(res);
      })
    );

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
  }

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

  simpleFormControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  /**
   * Httpリクエストのエラーを検出する
   * @param res Httpリクエストの返り値
   * @param resLength 返り値の個数
   * @returns
   */
  detectErrors(res: any, resLength: number): boolean {
    if (res instanceof HttpErrorResponse) {
      this.handleError(res.status, this.errorModalTitle, res.message);
      return true;
    }
    // レスポンスがnull undefinedか
    if (res === null || res === undefined) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return true;
    }
    // レスポンスの配列の要素が resLength 個あるか
    if (res.length !== resLength) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return true;
    }

    return false;
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
   * 選択肢初期化処理
   */
  initOptions() {
    // ローディング開始
    this.common.loading = true;

    // 選択肢作成
    this.subscription.add(
      forkJoin([
        this.storeService.getAsSelectOptions(),
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.largeCategoryService.getAll(),
        this.mediumCategoryService.getAll(),
        this.smallCategoryService.getAll(),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          const hasError = this.detectErrors(res, 6);
          if (hasError) {
            return;
          }
          this.storeSuggests = res[0];

          // 受付担当者選択肢
          this.employeeSuggests = res[1];
          const divisions = res[2];

          // ステータス選択肢を生成
          this.generateStatusDivisions(res[2]);

          // 大分類を取得
          this.largeCategories = res[3].data;
          this.currentCategoryData = this.largeCategories;

          // 中分類を取得
          this.mediumCategories = res[4].data;

          // 小分類を取得
          this.smallCategories = res[5].data;
          this.setHasChildren();

          // 表示開始日の初期値を設定
          this.displayStartDateFc.display_start_date.patchValue(
            new Date().toISOString()
          );
          this._setDivisions(divisions);
          this._setHiddenValue();

          // レンタル受付票フォームのステータス区分へ初期値を設定
          this.commonFc.status_division_id.patchValue(
            String(this.RENTAL_SLIP_INITIAL_STATUS_ACCEPTED)
          );
          // レンタル受付票フォームのインシデント発生区分へ初期値を設定
          this.commonFc.incident_division_id.patchValue(
            String(this.RENTAL_SLIP_INITIAL_INCIDENT_DIVISION_NO_INCIDENTS)
          );
          // レンタル受付票フォームの精算ステータス区分へ初期値を設定
          this.commonFc.settle_status_division_id.patchValue(
            String(this.RENTAL_SLIP_INITIAL_SETTLE_STATUS_DIVISION_UNSETTLED)
          );
        })
    );

    /**
     * 受付表単位に応じた日付割付
     */
    let rental_date: FormControl = this.getBulkScheduledRentalDateControl();
    rental_date?.valueChanges.subscribe((x) => {
      for (let itemform in this.rentalAddFormArray.controls) {
        this.rentalAddFormArray.controls[itemform].value['scheduledDateGroup'][
          'scheduled_rental_date'
        ] = x;
        this.rentalAddFormArray.controls[itemform]
          .get('scheduledDateGroup')
          ?.get('scheduled_rental_date')
          ?.setValue(x);
      }
    });

    let return_date: FormControl = this.getBulkScheduledReturnDateControl();
    return_date?.valueChanges.subscribe((x) => {
      for (let itemform in this.rentalAddFormArray.controls) {
        this.rentalAddFormArray.controls[itemform].value['scheduledDateGroup'][
          'scheduled_return_date'
        ] = x;
        this.rentalAddFormArray.controls[itemform]
          .get('scheduledDateGroup')
          ?.get('scheduled_return_date')
          ?.setValue(x);
      }
    });

    // レンタル追加フォームの貸出予定日と返却予定日の変更を購読する
    // const scheduledRentalDate$ = this.rentalDateForms.get(
    //   'scheduledDateGroup.bulk_scheduled_rental_date'
    // )?.valueChanges;
    // const scheduledReturnDate$ = this.rentalDateForms.get(
    //   'scheduledDateGroup.bulk_scheduled_return_date'
    // )?.valueChanges;
    this.commonFc.send_sms_flg;
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
      this.router.navigateByUrl(this.listPagePath);
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
      // redirectPath: this.listPagePath,
    });
  }

  /**
   * レンタル受付票を登録する
   */
  registerRentalSlip() {
    // PROCESSINGUNIT_ONEBYONE_VALUE = 0
    // └ 追加処理なし
    // PROCESSINGUNIT_BULK_VALUE = 1
    // └ 日付データは他フォームから取得

    // rental_product ステータス変更

    const rentals = this.rentalAddForms.value.forms.map((rental: any) => {
      rental.rental_item_count = 1;
      rental.delinquency_flag = 0;
      rental.rental_date = '';
      rental.settle_status_division_id =
        this.RENTAL_SLIP_INITIAL_SETTLE_STATUS_DIVISION_UNSETTLED;
      rental.scheduled_rental_date = new Date(
        String(rental.scheduledDateGroup.scheduled_rental_date)
      ).toLocaleString();
      rental.scheduled_return_date = new Date(
        String(rental.scheduledDateGroup.scheduled_return_date)
      ).toLocaleString();
      rental.settle_status_division_id =
        this.commonFc.settle_status_division_id.value;
      //this._setSettleStatusDivisionId(rental);
      this.product_id_list.push(rental.rental_product_id);
      return rental;
    });

    const postData: RentalSlipPostDataType = {
      store_id: Number(this.commonFc.store_id.value),
      reception_employee_id: Number(this.commonFc.reception_employee_id.value),
      reception_date: new Date(
        String(this.commonFc.reception_date.value)
      ).toLocaleString(),
      remarks_1: this.commonFc.remarks_1.value
        ? this.commonFc.remarks_1.value
        : '',
      remarks_2: this.commonFc.remarks_2.value
        ? this.commonFc.remarks_2.value
        : '',
      mobile_number: this.commonFc.mobile_number.value
        ? this.commonFc.mobile_number.value
        : '',
      status_division_id: Number(this.commonFc.status_division_id.value),
      incident_division_id: Number(this.commonFc.incident_division_id.value),
      settle_status_division_id: Number(
        this.commonFc.settle_status_division_id.value
      ),
      customer_type_division_id: Number(
        this.commonFc.customer_type_division_id.value
      ),
      rental: [...rentals],
      send_sms_flg: this.selectedSMS,
      processing_units: this.processingUnitsPostValue,
      shipping_address: '',
    };

    /**
     * お客様タイプ区分のチェック
     */
    const createPostDataValid = this.createPostDataWithCustomerType(postData);
    console.log('2120 postData:: ', postData);
    if (createPostDataValid === false) {
      return;
    }
    console.log('2124 postData:: ', postData);

    // ローディング開始
    this.common.loading = true;
    this.commonForm.markAsPristine();
    this.clientForm.markAsPristine();
    this.memberForm.markAsPristine();

    this.subscription.add(
      this.rentalSlipService
        .add(postData)
        .pipe(
          catchError((error) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラーが発生しました';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message);
            this.common.loading = false;
            this.commonForm.markAsDirty();
            this.memberForm.markAsDirty();
            this.clientForm.markAsDirty();
            return;
          }
          // データ取得時に保存済みの商品情報から
          // ステータスの変更を行う
          this.setProductItemStatus(this.PRODUCT_STATUS_DIVISION_RESERVED);
          //登録データのid取得
          let nav_url = this.listPagePath + '/detail/' + String(res.message);
          this.router.navigateByUrl(nav_url);
        })
    );
  }

  /** 登録データのid取得
   * 受付日時(10s以内)・電話番号・受付担当社・受付済みステータス
   * **/
  getLastAddRentalSlip(postData: RentalSlipPostDataType) {
    let pram = {
      customer_type_division_id: postData.customer_type_division_id,
      incident_division_id: postData.incident_division_id,
      member_id: postData.member_id,
      mobile_number: postData.mobile_number,
      processing_units: postData.processing_units,
      reception_date: postData.reception_date,
      reception_employee_id: postData.reception_employee_id,
      settle_status_division_id: postData.settle_status_division_id,
      shipping_address: postData.shipping_address,
      store_id: postData.store_id,
    };
    this.subscription.add(
      this.rentalSlipService
        .getAll(pram)
        .pipe(
          catchError((error) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          this.common.loading = false;
          if (res.data[0].id) {
            if (res.data[0].id) {
              let nav_url =
                this.listPagePath + '/detail/' + String(res.data[0].id);
              this.router.navigateByUrl(nav_url);
            } else {
              this.router.navigateByUrl(this.listPagePath);
            }
          }
        })
    );
  }

  setProductItemStatus(target_status: number): boolean {
    if (this.update_product_item.length == 0) {
      return false;
    }
    for (let i in this.update_product_item) {
      this.update_product_item[i].status_division_id = target_status;
      this.updateProductItemStatus(this.update_product_item[i]);
    }
    return true;
  }
  /** product status change*/
  updateProductItemStatus(product_data: RentalProduct) {
    this.subscription.add(
      this.rentalProductService
        .update(product_data.id, product_data)
        .pipe(
          catchError((error) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラーが発生しました';
            const message = res.error ? res.error.message : res.message;
            this.handleError(res.status, title, message);
            return;
          }
        })
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

  private _setDivisions(divisions: any[]): void {
    /**
     * 定数をセットする
        RENTAL_SLIP_INITIAL_STATUS_ACCEPTED: number = 167;
        RENTAL_SLIP_INITIAL_INCIDENT_DIVISION_NO_INCIDENTS: number = 147;
        RENTAL_SLIP_INITIAL_SETTLE_STATUS_DIVISION_UNSETTLED: number = 136;
        RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER: number = 150;
        RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT: number = 149;
     */
    //console.log(divisions)

    // レンタル受付票ステータスの初期値の定数 test:167
    this.RENTAL_SLIP_INITIAL_STATUS_ACCEPTED = this.dIService.getDivisionid(
      divisions,
      divisionConst.RENTAL_SLIP_STATUS,
      rentalSlipConst.STATUS_CODE.ACCEPTED
    );

    // レンタル受付票精算区分の初期値の定数 test:147
    this.RENTAL_SLIP_INITIAL_SETTLE_STATUS_DIVISION_UNSETTLED =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.SETTLE_STATUS,
        rentalSlipConst.SETTLE_STATUS_DIVISION.CODE.UNSETTLED
      );

    // レンタル受付票インシデント区分の初期値の定数
    this.RENTAL_SLIP_INITIAL_INCIDENT_DIVISION_NO_INCIDENTS =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.INCIDENT,
        rentalSlipConst.INCIDENT_DIVISION.CODE.NO_INCIDENTS
      );

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

    // レンタル受付票ステータスの初期値の定数
    this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_GENERAL =
      this.dIService.getDivisionid(
        divisions,
        divisionConst.CUSTOMER_TYPE,
        rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL
      );

    /**
     * レンタル商品
     */

    //レンタル可

    // レンタル商品のstatus_division_idの貸出可能idを定数として保持する
    this.PRODUCT_STATUS_DIVISION_RENTABLE = this.dIService.getDivisionid(
      divisions,
      divisionConst.RENTAL_PRODUCT_STATUS,
      rentalProductConst.STATUS_CODE.RENTABLE
    );
    console.log(this.PRODUCT_STATUS_DIVISION_RENTABLE);
    //予約済み
    this.PRODUCT_STATUS_DIVISION_RESERVED = this.dIService.getDivisionid(
      divisions,
      divisionConst.RENTAL_PRODUCT_STATUS,
      rentalProductConst.STATUS_CODE.RESERVED
    );
    //貸し出し中
    this.PRODUCT_STATUS_DIVISION_LENDING = this.dIService.getDivisionid(
      divisions,
      divisionConst.RENTAL_PRODUCT_STATUS,
      rentalProductConst.STATUS_CODE.RENTED
    );
    // 返却済み
    this.PRODUCT_STATUS_DIVISION_RETURNED = this.dIService.getDivisionid(
      divisions,
      divisionConst.RENTAL_PRODUCT_STATUS,
      rentalProductConst.STATUS_CODE.RETURNED
    );

    // レンタル商品の公開フラグの公開を定数として保持する
    // TODO: 都度区分テーブルから取得して設定するか検討が必要
    //DATA_PERMISSION_DIVISION_ID_PUBLIC: number = 52;

    this.DATA_PERMISSION_DIVISION_ID_PUBLIC = this.dIService.getDivisionid(
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

    //console.log(this.RENTAL_SLIP_INITIAL_STATUS_ACCEPTED + ": number = 167");
    //console.log(this.RENTAL_SLIP_INITIAL_INCIDENT_DIVISION_NO_INCIDENTS + ": number = 147");
    //console.log(this.RENTAL_SLIP_INITIAL_SETTLE_STATUS_DIVISION_UNSETTLED + ": number = 136");
    //console.log(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER + ": number = 150");
    //console.log(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT + ": number = 149");
    //console.log(this.PRODUCT_STATUS_DIVISION_RENTABLE + ": number = 179");
    //console.log(this.PRODUCT_STATUS_DIVISION_RESERVED + ": number = 180");
    //console.log(this.PRODUCT_STATUS_DIVISION_LENDING + ": number = 181");
    //console.log(this.PRODUCT_STATUS_DIVISION_RETURNED + ": number = 182");
    //console.log(this.DATA_PERMISSION_DIVISION_ID_PUBLIC + ": number = 52");
    //console.log(this.DELIVERY_REQUEST_DIVISION_ID_NO_DELIVERY + ": number = 133");
    //console.log(this.COLLECTION_REQUEST_DIVISION_ID_NO_COLLECTION + ": number = 177");

    this.settleStatusDivisionOptions = this.getDivisionSelectOption(
      divisions,
      divisionConst.SETTLE_STATUS
    );
    this.incidentDivisionOptions = this.getDivisionSelectOption(
      divisions,
      divisionConst.INCIDENT
    );
    this.statusDivisionOptions = this.getDivisionSelectOption(
      divisions,
      divisionConst.RENTAL_SLIP_STATUS
    );
    this.customerTypes = this.getDivisionSelectOption(
      divisions,
      divisionConst.CUSTOMER_TYPE
    );
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
   * 得意先名サジェスト
   * @returns
   */
  getClientSuggests() {
    return {
      observable: this.clientService.getAll({
        name: this.clientFc.client_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * お客様タイプ区分によって、postデータを作成する
   * @param postData
   */
  createPostDataWithCustomerType(postData: RentalSlipPostDataType): boolean {
    if (
      this.commonFc.customer_type_division_id.value ===
      String(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_MEMBER)
    ) {
      postData['member_id'] = Number(this.memberFc.member_id.value);
      postData['shipping_address'] = this.memberFc.shipping_address.value
        ? this.memberFc.shipping_address.value
        : '';
      postData['tel'] = this.selectedMember.tel ? this.selectedMember.tel : '';
    } else if (
      this.commonFc.customer_type_division_id.value ===
      String(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_CLIENT)
    ) {
      postData['client_id'] = Number(this.clientFc.client_id.value);
      postData['shipping_address'] = this.clientFc.shipping_address.value
        ? this.clientFc.shipping_address.value
        : '';
      postData['tel'] = this.selectedClient.tel ? this.selectedClient.tel : '';
    } else if (
      this.commonFc.customer_type_division_id.value ===
      String(this.RENTAL_SLIP_INITIAL_CUSTOMER_TYPE_DIVISION_GENERAL)
    ) {
      postData['identification_document_confirmation_date'] = this.generalFc
        .identification_document_confirmation_date.value
        ? this.generalFc.identification_document_confirmation_date.value
        : '';

      postData['first_name'] = this.generalFc.first_name.value
        ? this.generalFc.first_name.value
        : '';
      postData['first_name_kana'] = this.generalFc.first_name_kana.value
        ? this.generalFc.first_name_kana.value
        : '';
      postData['last_name'] = this.generalFc.last_name.value
        ? this.generalFc.last_name.value
        : '';
      postData['last_name_kana'] = this.generalFc.last_name_kana.value
        ? this.generalFc.last_name_kana.value
        : '';
      postData['tel'] = this.generalFc.tel.value
        ? this.generalFc.tel.value
        : '';
      postData['shipping_address'] = this.generalFc.shipping_address.value
        ? this.generalFc.shipping_address.value
        : '';
    } else {
      // お客様タイプ区分が未選択の場合はアラートを表示して処理を終了する
      alert('お客様タイプ区分が未選択です');
      return false;
    }
    return true;
  }
}
