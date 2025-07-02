import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { customerOrderReceptionSlipConst } from 'src/app/const/customer-order-reception-slip.const';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Client } from 'src/app/models/client';
import { CustomerOrderReceptionSlip } from 'src/app/models/customer-order-reception-slip';
import { Employee } from 'src/app/models/employee';
import { Member } from 'src/app/models/member';
import { ClientService } from 'src/app/services/client.service';
import { CustomerOrderReceptionSlipService } from 'src/app/services/customer-order-reception-slip.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { MemberService } from 'src/app/services/member.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private corsService: CustomerOrderReceptionSlipService,
    private employeeService: EmployeeService,
    private storeService: StoreService,
    private clientService: ClientService,
    private memberService: MemberService,
    private divisionService: DivisionService,
    private modalService: ModalService,
    private errorService: ErrorService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  // 一覧のパス
  listPagePath = '/customer-order-reception-slip';

  // 詳細画面のパス
  detailPagePath!: string;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '客注受付票編集キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '客注受付票編集エラー：' + modalConst.TITLE.HAS_ERROR;

  // 最終更新者名
  lastUpdater!: Employee;

  // 最終更新者名
  lastUpdaterName!: string;

  // 最新更新者ロール
  lastUpdaterRole!: string;

  // 選択中客注受付伝票
  cors!: CustomerOrderReceptionSlip;

  // 受付・見積担当者選択肢
  employeeSuggests!: SelectOption[];

  // 得意先
  clients!: Client[];

  // 得意先選択肢
  clientSuggests!: SelectOption[];

  // 得意先ID
  clientId!: number;

  // 選択中客注受付票のID
  selectedId!: number;

  // 会員
  members!: Member[];

  // 会員選択肢
  memberSuggests!: SelectOption[];

  // 店舗選択肢
  storeSuggests!: SelectOption[];

  // 配送希望区分選択肢
  deliveryDivisions!: SelectOption[];

  // ステータス選択肢
  statusDivisions!: SelectOption[];
  // ステータス表示用
  status_dividion_text!: string;

  // 精算ステータス区分選択肢
  settleDivisions!: SelectOption[];

  // インシデントステータス区分選択肢
  incidentDivisions!: SelectOption[];

  // 客注お客様タイプ選択肢
  customerTypes!: SelectOption[];

  // 選択したお客様タイプ
  customerType!: SelectOption;

  corsConst = customerOrderReceptionSlipConst;

  // エラー文言
  errorConst = errorConst;

  // 区分定数
  divisionConst = divisionConst;

  // 得意先フォームグループ
  clientForm = this.fb.group({
    client_id: ['', [Validators.required]],
  });

  // 会員フォームグループ
  memberForm = this.fb.group({
    member_id: ['', [Validators.required]],
  });

  // 一般フォームグループ
  generalForm = this.fb.group({
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
  });

  // 共通フォーム
  form = this.fb.group({
    status_division_id: ['', [Validators.required]],
    customer_type_division_id: ['', [Validators.required]],
    store_id: ['', [Validators.required]],
    reception_employee_id: ['', [Validators.required]],
    reception_date: ['', [Validators.required]],
    shipping_address: ['', [Validators.maxLength(255)]],
    settle_status_division_id: ['', [Validators.required]],
    incident_division_id: ['', [Validators.required]],
    quotation_employee_id: [''],
    quotation_date: [''],
    quotation_expiration_date: [''],
    tel: [
      '',
      [
        Validators.required,
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
  });

  // remarks_(num) 表示:true || 非表示:false
  show_remark: boolean = false;

  get clientCtrls() {
    return this.clientForm.controls;
  }

  get memberCtrls() {
    return this.memberForm.controls;
  }

  get generalCtrls() {
    return this.generalForm.controls;
  }

  get ctrls() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // customerTypeがundefinedの場合エラーになるため初期値をセット
    this.customerType = { value: '', text: '' };

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
            this.router.navigate([this.detailPagePath], {
              queryParams: { clientId: this.clientId },
            });
          }
        })
    );

    // お客様タイプの変更を購読
    this.subscription.add(
      this.ctrls.customer_type_division_id.valueChanges.subscribe((res) => {
        this.selectedCustomerType(res);
      })
    );

    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];
    //const clientId = this.activatedRoute.snapshot.queryParams['clientId'];

    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);
    //const supplierIdIsInvalid = this.isParameterInvalid(clientId);

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

    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);
    //this.clientId = Number(clientId);
    this.detailPagePath = this.listPagePath + '/detail/' + selectedId;

    // 選択肢初期化処理
    this.initOptions(Number(selectedId));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
      return String(x.value) === typeId;
    });

    if (selectedType === undefined) {
      this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
      return;
    }

    // 既に選択したタイプがある場合フォームの値をリセット
    switch (this.customerType.text) {
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
        const clientformVal = {
          client_id: '',
        };
        this.clientForm.patchValue(clientformVal);
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        this.memberCtrls.member_id.setValue('');
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
        const formVal = {
          last_name: '',
          first_name: '',
          last_name_kana: '',
          first_name_kana: '',
        };
        this.generalForm.patchValue(formVal);
        break;
      default:
        break;
    }

    // 選択したお客様タイプによって初期値をセット
    const cors = this.cors;
    switch (selectedType.text) {
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
        const clientformVal = {
          client_id: String(cors.client_id),
        };
        this.clientForm.patchValue(clientformVal);
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        this.memberCtrls.member_id.setValue(String(cors.member_id));
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
        const formVal = {
          last_name: cors.last_name,
          first_name: cors.first_name,
          last_name_kana: cors.last_name_kana,
          first_name_kana: cors.first_name_kana,
        };
        this.generalForm.patchValue(formVal);
        break;
      default:
        break;
    }
    this.ctrls.tel.setValue(String(cors.tel));
    this.ctrls.store_id.setValue(String(cors.store_id));
    this.ctrls.quotation_employee_id.setValue(
      String(cors.quotation_employee_id)
    );
    this.ctrls.quotation_employee_id.patchValue(
      String(cors.quotation_employee_id)
    );

    this.customerType = selectedType;
  }

  /**
   * 選択肢初期化処理
   *
   * @param selectedId
   */
  initOptions(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    // 発注書データと発注書に紐付く発注商品データを取得
    this.subscription.add(
      forkJoin([
        this.corsService.find(selectedId),
        this.employeeService.getAll(),
        this.storeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.memberService.getAll({ $select: 'id,last_name,first_name' }),
        this.clientService.getAll(),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
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
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }
          // レスポンスの配列の要素が6あるか
          if (res.length !== 6) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          this.cors = res[0].data[0];
          const cors = res[0].data[0];

          // employeeServiceのレスポンスをチェック
          const employeesIsInvalid = ApiResponseIsInvalid(res[1]);
          if (employeesIsInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }

          const employees = res[1].data;

          // 最終更新者のフルネーム作成
          const lastUpdater = employees.find((e) => {
            return e.id === cors.updated_id;
          });

          if (lastUpdater) {
            this.lastUpdater = lastUpdater;
          }

          // 社員データセット
          this.employeeSuggests = employees.map((e) => {
            return { value: e.id, text: e.last_name + ' ' + e.first_name };
          });

          // 店舗データセット
          this.storeSuggests = res[2];

          // 表示区分を取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[3];

          // 会員
          this.members = res[4].data;
          // 会員選択肢
          this.memberSuggests = res[4].data.map((member: Member) => {
            const v = {
              value: member.id,
              text: member.last_name + ' ' + member.first_name,
            };
            return v;
          });

          // 得意先
          this.clients = res[5].data;
          // 得意先選択肢
          this.clientSuggests = res[5].data.map((client: Client) => {
            const v = {
              value: client.id,
              text: client.name,
            };
            return v;
          });

          const statusDivisionOptions =
            statusDivisionsRes[
              divisionConst.CUSTOMER_ORDER_RECEPTION_SLIP_STATUS
            ];

          // ステータスによって表示する選択肢を変更
          switch (cors.division_status_code) {
            case this.corsConst.STATUS_CODE.ACCEPTED:
              break;
            case this.corsConst.STATUS_CODE.QUOTATION_CREATED:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.ACCEPTED ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS
                      .QUOTATION_UNDER_REVIEW ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            case this.corsConst.STATUS_CODE.QUOTATION_UNDER_REVIEW:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.ACCEPTED ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.QUOTATION_SENT ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            case this.corsConst.STATUS_CODE.QUOTATION_SENT:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.ORDER_RECEIVED ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            case this.corsConst.STATUS_CODE.ORDER_RECEIVED:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CONTACTED_CUSTOMER ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            case this.corsConst.STATUS_CODE.CONTACTED_CUSTOMER:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS
                      .DELIVERED_TO_CARRIER ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            case this.corsConst.STATUS_CODE.DELIVERED_TO_CARRIER:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.PRODUCT_IN_TRANSIT ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            case this.corsConst.STATUS_CODE.PRODUCT_IN_TRANSIT:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.DELIVERED ||
                  String(x.text) ===
                    customerOrderReceptionSlipConst.STATUS.CANCELLED
                );
              });
              break;
            default:
              break;
          }

          const settleDivisions =
            statusDivisionsRes[divisionConst.SETTLE_STATUS];
          this.settleDivisions = settleDivisions;

          const incidentDivisionOptions =
            statusDivisionsRes[divisionConst.INCIDENT];
          this.incidentDivisions = incidentDivisionOptions;

          const customerTypes = statusDivisionsRes[divisionConst.CUSTOMER_TYPE];
          this.customerTypes = customerTypes;

          this.customerType = {
            value: cors.customer_type_division_id,
            text: cors.division_customer_type_value,
          };

          const customerOrderReceptionSlip = {
            client_id: String(cors.client_id),
            member_id: String(cors.member_id),
            last_name: cors.last_name,
            first_name: cors.first_name ? cors.first_name : '',
            store_id: String(cors.store_id),
            status_division_id: String(cors.status_division_id),
            customer_type_division_id: String(cors.customer_type_division_id),
            shipping_address: cors.shipping_address,
            settle_status_division_id: String(cors.settle_status_division_id),
            incident_division_id: String(cors.incident_division_id),
            tel: String(cors.tel),
            remarks_1: cors.remarks_1,
            remarks_2: cors.remarks_2,
            reception_date: cors.reception_date,
            reception_employee_id: String(cors.reception_employee_id),
            quotation_date: cors.quotation_date,
            quotation_pdf_path: cors.quotation_pdf_path,
            quotation_expiration_date: cors.quotation_expiration_date,
            quotation_employee_id: String(cors.quotation_employee_id),
          };

          // 現状のステータス表示
          const st = statusDivisionOptions.filter((x: any) => {
            return x.code === cors.division_status_code;
          });
          this.status_dividion_text = st[0].text;

          this.form.patchValue(customerOrderReceptionSlip);

          this.ctrls.settle_status_division_id.patchValue(
            String(cors.settle_status_division_id)
          );
          this.ctrls.incident_division_id.patchValue(
            String(cors.incident_division_id)
          );

          // 見積もり担当者のデフォルト値を設定-> 受付担当者
          if (cors.quotation_employee_id) {
            this.ctrls.quotation_employee_id.patchValue(
              String(cors.quotation_employee_id)
            );
          } else {
            this.ctrls.quotation_employee_id.patchValue(
              String(cors.reception_employee_id)
            );
          }

          console.log(this.cors);
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
  clearQuotationDate(): void {
    this.ctrls.quotation_date.setValue(''); // 入力を空にする
  }

  clearQuotationExpirationDate(): void {
    this.ctrls.quotation_expiration_date.setValue(''); // 入力を空にする
  }

  /**
   * 更新処理
   *
   * @returns
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.form.markAsPristine();
    this.clientForm.markAsPristine();
    this.memberForm.markAsPristine();
    this.generalForm.markAsPristine();

    // ローディング開始
    this.common.loading = true;

    const formVal = this.form.value;

    // お客様タイプの値チェック
    const customerTypeIdExists = this.customerTypes.some((type) => {
      const customerTypeVal = Number(type.value);
      const customerTypeId = Number(formVal.customer_type_division_id);
      return customerTypeVal === customerTypeId;
    });
    if (!customerTypeIdExists) {
      this.ctrls.customer_type_division_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 受付担当者の値チェック
    const employeeIdExists = this.employeeSuggests.some((employee) => {
      const employeeVal = Number(employee.value);
      const employeeId = Number(formVal.reception_employee_id);
      return employeeVal === employeeId;
    });
    if (!employeeIdExists) {
      this.ctrls.reception_employee_id.setValue('');
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
      this.ctrls.store_id.setValue('');
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
      this.ctrls.reception_date.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }
    // 見積もり日、処理
    let quotation_date = '';
    if (formVal.quotation_date) {
      quotation_date = new Date(
        String(formVal.quotation_date)
      ).toLocaleDateString();
    }

    // 見積有効期限、処理
    let quotation_expiration_date = '';
    if (formVal.quotation_expiration_date) {
      quotation_expiration_date = new Date(
        String(formVal.quotation_expiration_date)
      ).toLocaleDateString();
    }

    // ポストデータ作成
    const postData: { [key: string]: string | null | undefined } = {
      store_id: formVal.store_id,
      customer_type_division_id: formVal.customer_type_division_id,
      status_division_id: formVal.status_division_id,
      reception_employee_id: formVal.reception_employee_id,
      reception_date: new Date(
        String(formVal.reception_date)
      ).toLocaleDateString(),
      shipping_address: formVal.shipping_address,
      settle_status_division_id: formVal.settle_status_division_id,
      incident_division_id: formVal.incident_division_id,
      quotation_date: quotation_date,
      quotation_employee_id: formVal.quotation_employee_id,
      quotation_expiration_date: quotation_expiration_date,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
    };

    // お客様タイプによってフォームの値を取得
    switch (this.customerType.text) {
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
        // 得意先の値をチェック
        const clientIdExists = this.clientSuggests.some((client) => {
          const clientVal = Number(client.value);
          const clientId = Number(this.clientForm.value.client_id);
          return clientVal === clientId;
        });
        if (!clientIdExists) {
          this.clientCtrls.client_id.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // 電話番号
        if (
          this.ctrls.tel.value === '' ||
          this.ctrls.tel.value === null ||
          this.ctrls.tel.value === undefined
        ) {
          this.ctrls.tel.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // ポストデータへ得意先IDと電話番号をセット
        postData['client_id'] = this.clientForm.value.client_id;
        postData['tel'] = this.ctrls.tel.value;
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        // 会員の値をチェック
        const memberIdExists = this.memberSuggests.some((member) => {
          const memberVal = Number(member.value);
          const memberId = Number(this.memberForm.value.member_id);
          return memberVal === memberId;
        });
        if (!memberIdExists) {
          this.memberCtrls.member_id.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // ポストデータへ会員IDをセット
        postData['member_id'] = this.memberForm.value.member_id;
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
        // 姓
        if (
          this.generalForm.value.last_name === '' ||
          this.generalForm.value.last_name === null ||
          this.generalForm.value.last_name === undefined
        ) {
          this.generalCtrls.last_name.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // 名
        /* if (
          this.generalForm.value.first_name === '' ||
          this.generalForm.value.first_name === null ||
          this.generalForm.value.first_name === undefined
        ) {
          this.generalCtrls.first_name.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }*/
        // 電話番号
        if (
          this.ctrls.tel.value === '' ||
          this.ctrls.tel.value === null ||
          this.ctrls.tel.value === undefined
        ) {
          this.ctrls.tel.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // ポストデータへ会員IDをセット
        postData['last_name'] = this.generalForm.value.last_name;
        postData['first_name'] = this.generalForm.value.first_name
          ? this.generalForm.value.first_name
          : '';
        postData['last_name_kana'] = this.generalForm.value.last_name_kana
          ? this.generalForm.value.last_name_kana
          : '';
        postData['first_name_kana'] = this.generalForm.value.first_name_kana
          ? this.generalForm.value.first_name_kana
          : '';
        postData['tel'] = this.ctrls.tel.value;
        break;
      default:
        break;
    }

    // 登録処理
    this.subscription.add(
      this.corsService
        .update(this.selectedId, postData)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const message = `\n${res.error.message}\n${res.message}`;
            this.handleError(res.status, this.errorModalTitle, message);
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.listPagePath);
        })
    );
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
      this.router.navigate([this.detailPagePath], {
        queryParams: { clientId: this.clientId },
      });
    }
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
}
