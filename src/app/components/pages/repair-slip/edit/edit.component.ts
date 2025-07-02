import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, filter, finalize, forkJoin, of } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { repairSlipConst } from 'src/app/const/repair-slip-const';
import { Client } from 'src/app/models/client';
import { Employee } from 'src/app/models/employee';
import { Member } from 'src/app/models/member';
import { RepairSlip } from 'src/app/models/repair-slip';
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
import { RepairSlipService } from 'src/app/services/repair-slip.service';
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
    private rsService: RepairSlipService,
    private fb: FormBuilder,
    private storeService: StoreService,
    private clientService: ClientService,
    private memberService: MemberService,
    private employeeService: EmployeeService,
    private divisionService: DivisionService,
    private errorService: ErrorService,
    private modalService: ModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // 選択された修理受付票Id
  selectedId!: number;

  repairSlip!: RepairSlip;

  // 一覧のパス
  listPagePath = '/repair-slip';

  // 詳細のパス
  detailPagePath!: string;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '修理受付票更新キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '修理受付票更新エラー：' + modalConst.TITLE.HAS_ERROR;

  // 最終更新者名
  lastUpdater!: string;

  // 社員サジェスト
  employeeSuggests!: SelectOption[];

  // 得意先
  clients!: Client[];

  // 得意先サジェスト
  clientSuggests!: SelectOption[];

  // 会員
  members!: Member[];

  // 会員サジェスト
  memberSuggests!: SelectOption[];

  // 店舗選択肢
  storeSuggests!: SelectOption[];

  divisionConst = divisionConst;

  // ステータス区分選択肢
  statusDivisions!: SelectOption[];

  // 修理精算ステータス区分選択肢
  settleDivisions!: SelectOption[];

  // インシデント発生区分選択肢
  incidentDivisions!: SelectOption[];

  // インシデント発生区分Id
  incidentDivisionId!: string;

  // エラー文言
  errorConst = errorConst;

  // 修理お客様タイプ選択肢
  customerTypes!: SelectOption[];

  // 選択したお客様タイプ
  customerType!: SelectOption;

  // 修理受付票定数
  rsConst = repairSlipConst;

  private idValidators = [
    Validators.required,
    Validators.pattern(regExConst.NUMERIC_REG_EX),
    Validators.maxLength(11),
  ];

  // 得意先フォームグループ
  clientForm = this.fb.group({
    client_id: ['', this.idValidators],
    mobile_number: [
      '',
      [
        Validators.minLength(10),
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
  });

  // 会員フォームグループ
  memberForm = this.fb.group({
    member_id: ['', this.idValidators],
    mobile_number: [
      '',
      [
        Validators.minLength(10),
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
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
    tel: [
      '',
      [
        Validators.maxLength(14),
        Validators.minLength(10),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        CustomValidators.eitherRequiredValidator('tel', 'mobile_number'),
      ],
    ],
    mobile_number: [
      '',
      [
        Validators.maxLength(14),
        Validators.minLength(10),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        CustomValidators.eitherRequiredValidator('tel', 'mobile_number'),
      ],
    ],
  });

  // 共通フォーム
  form = this.fb.group({
    reception_date: ['', [Validators.required]],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
    customer_type_division_id: ['', this.idValidators],
    store_id: ['', this.idValidators],
    reception_employee_id: ['', this.idValidators],
    status_division_id: ['', this.idValidators],
    settle_status_division_id: ['', this.idValidators],
    incident_division_id: ['', this.idValidators],
  });

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
            this.router.navigateByUrl(this.detailPagePath);
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

    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);
    this.detailPagePath = this.listPagePath + '/detail/' + selectedId;

    // 選択肢初期化処理
    this.initOptions(Number(selectedId));
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
   * お客様タイプが変更された場合の処理
   *
   * @param typeId
   * @returns
   */
  selectedCustomerType(typeId: string | null) {
    // 引数が渡ってこない場合
    if (typeId === null) {
      this.handleError(
        400,
        this.errorModalTitle,
        '選択肢取得エラーが発生しました。選択肢が取得できませんでした。'
      );
      return;
    }

    let selectedType = this.customerTypes.find((x) => {
      return String(x.value) === typeId;
    });

    // TODO データが不正なので臨時対応
    if (selectedType === undefined) {
      selectedType = {
        value: this.customerTypes[0].value,
        text: this.customerTypes[0].text,
      } as SelectOption;
      // this.handleError(400, this.errorModalTitle, '選択肢取得エラーが発生しました。不正な値がセットされている可能性があるためシステム管理者へご確認ください。');
      // return;
    }

    // 既に選択したタイプがある場合フォームの値をリセット
    if (this.customerType) {
      switch (this.customerType.text) {
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
          this.clientCtrls.client_id.patchValue('');
          this.clientCtrls.mobile_number.patchValue('');
          break;
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
          this.memberCtrls.member_id.patchValue('');
          this.memberCtrls.mobile_number.patchValue('');
          break;
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
          const formVal = {
            last_name: '',
            first_name: '',
            tel: '',
            mobile_number: '',
            last_name_kana: '',
            first_name_kana: '',
          };
          this.generalForm.patchValue(formVal);
          break;
        default:
          break;
      }
    }

    // 選択したお客様タイプによって初期値をセット
    const rs = this.repairSlip;
    switch (selectedType.text) {
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
        this.clientCtrls.client_id.patchValue(String(rs.client_id));
        this.clientCtrls.mobile_number.patchValue(String(rs.mobile_number));
        break;
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        this.memberCtrls.member_id.patchValue(String(rs.member_id));
        this.memberCtrls.mobile_number.patchValue(String(rs.mobile_number));
        break;
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
        const formVal = {
          last_name: rs.last_name,
          first_name: rs.first_name,
          tel: String(rs.tel),
          mobile_number: String(rs.mobile_number),
          last_name_kana: rs.last_name_kana,
          first_name_kana: rs.first_name_kana,
        };
        this.generalForm.patchValue(formVal);
        break;
      default:
        break;
    }
    this.ctrls.store_id.patchValue(String(rs.store_id));
    this.ctrls.reception_date.patchValue(rs.reception_date);
    this.ctrls.remarks_1.patchValue(
      String(rs.remarks_1) ? String(rs.remarks_1) : ''
    );
    this.ctrls.remarks_2.patchValue(
      String(rs.remarks_2) ? String(rs.remarks_2) : ''
    );

    this.ctrls.reception_employee_id.patchValue(
      String(rs.reception_employee_id)
    );

    this.customerType = selectedType;
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
        this.clientService.getAll(),
        this.memberService.getAll(),
        this.employeeService.getAll(),
        this.divisionService.getAsSelectOptions(),
        this.rsService.find(selectedId),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          console.log('START:未加工データ読み込み');
          console.log(res);
          console.log('END:未加工データ読み込み');

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
          if (res.length !== 6) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // 受付票情報を取得
          this.repairSlip = res[5].data[0];
          const rs = res[5].data[0];

          const rsConst = this.rsConst;
          this.storeSuggests = res[0];
          this.clients = res[1].data;
          // 得意先選択肢
          this.clientSuggests = res[1].data.map((client: Client) => {
            const v = {
              value: client.id,
              text: client.name,
            };
            return v;
          });
          this.members = res[2].data;
          // 会員選択肢
          this.memberSuggests = res[2].data.map((member: Member) => {
            const v = {
              value: member.id,
              text: member.last_name + ' ' + member.first_name,
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

          // 表示区分を取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[4];

          const statusDivisionOptions =
            statusDivisionsRes[divisionConst.REPAIR_SLIP_STATUS];

          // ステータスによって表示する選択肢を変更
          switch (rs.division_status_code) {
            case rsConst.STATUS_CODE.ACCEPTED: // 受付済み
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return String(x.text) === rsConst.STATUS.ACCEPTED;
              });
              break;
            case rsConst.STATUS_CODE.PREPARING_QUOTE: // 見積中
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) === rsConst.STATUS.ACCEPTED ||
                  String(x.text) === rsConst.STATUS.QUOTE_SENT_TO_CUSTOMER ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            case this.rsConst.STATUS_CODE.QUOTE_SENT_TO_CUSTOMER: // お客様へ見積額を連絡済み
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) === rsConst.STATUS.PREPARING_QUOTE ||
                  String(x.text) === rsConst.STATUS.ORDERED_FROM_MANUFACTURER ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            case this.rsConst.STATUS_CODE.ORDERED_FROM_MANUFACTURER: // メーカーへ依頼済み
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) === rsConst.STATUS.REPAIRED ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            case this.rsConst.STATUS_CODE.REPAIRED: // 修理完了
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    rsConst.STATUS.CUSTOMER_NOTIFIED_OF_REPAIR_COMPLETION ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            case this.rsConst.STATUS_CODE
              .CUSTOMER_NOTIFIED_OF_REPAIR_COMPLETION:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) ===
                    rsConst.STATUS.DELIVERED_TO_SHIPPING_CARRIER ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            case this.rsConst.STATUS_CODE.DELIVERED_TO_SHIPPING_CARRIER:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) === rsConst.STATUS.SHIPPED ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            case this.rsConst.STATUS_CODE.SHIPPED:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return (
                  String(x.text) === rsConst.STATUS.DELIVERED ||
                  String(x.text) === rsConst.STATUS.CANCELLED
                );
              });
              break;
            default:
              this.statusDivisions = statusDivisionOptions.filter((x) => {
                return String(x.text) === rsConst.STATUS.ACCEPTED;
              });
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
            value: rs.customer_type_division_id,
            text: String(rs.division_customer_type_value),
          };

          const repairSlip = {
            customer_type_division_id: String(rs.customer_type_division_id),
            store_id: String(rs.store_id),
            client_id: String(rs.client_id),
            member_id: String(rs.member_id),
            last_name: rs.last_name,
            first_name: rs.first_name,
            last_name_kana: rs.last_name_kana,
            first_name_kana: rs.first_name_kana,
            tel: rs.tel,
            mobile_number: rs.mobile_number,
            reception_date: rs.reception_date,
            reception_employee_id: String(rs.reception_employee_id),
            status_division_id: String(rs.status_division_id),
            settle_status_division_id: String(rs.settle_status_division_id),
            incident_division_id: String(rs.incident_division_id),
            remarks_1: rs.remarks_1,
            remarks_2: rs.remarks_2,
          };

          this.form.patchValue(repairSlip, { emitEvent: false });

          this.selectedCustomerType(String(rs.customer_type_division_id));
        })
    );
  }

  /**
   * 更新
   * @param status
   * @param message
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

    // ポストデータ作成
    const postData: { [key: string]: string | null | undefined } = {
      store_id: formVal.store_id,
      customer_type_division_id: formVal.customer_type_division_id,
      status_division_id: formVal.status_division_id,
      reception_employee_id: formVal.reception_employee_id,
      reception_date: new Date(String(formVal.reception_date)).toLocaleString(),
      settle_status_division_id: formVal.settle_status_division_id,
      incident_division_id: formVal.incident_division_id,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
    };

    // お客様タイプによってフォームの値を取得
    switch (this.customerType.text) {
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
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
        // ポストデータへ得意先IDをセット
        postData['client_id'] = this.clientForm.value.client_id;
        postData['mobile_number'] = this.clientForm.value.mobile_number;
        break;
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
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
        postData['mobile_number'] = this.memberForm.value.mobile_number;
        break;
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
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
        // if (
        //   this.generalForm.value.first_name === '' ||
        //   this.generalForm.value.first_name === null ||
        //   this.generalForm.value.first_name === undefined
        // ) {
        //   this.generalCtrls.first_name.setValue('');
        //   // ローディング終了
        //   this.common.loading = false;
        //   return;
        // }
        // 電話番号
        let telValExists = true;
        if (
          this.generalForm.value.tel === '' ||
          this.generalForm.value.tel === null ||
          this.generalForm.value.tel === undefined
        ) {
          telValExists = false;
        }
        // 携帯番号
        let mobileNumberExists = true;
        if (
          this.generalForm.value.mobile_number === '' ||
          this.generalForm.value.mobile_number === null ||
          this.generalForm.value.mobile_number === undefined
        ) {
          mobileNumberExists = false;
        }
        // 電話番号と携帯電話番号のどちらも値がない場合
        if (!telValExists && !mobileNumberExists) {
          this.generalCtrls.tel.setValue('');
          this.generalCtrls.mobile_number.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }

        // ポストデータへ会員IDをセット
        postData['last_name'] = this.generalForm.value.last_name;
        postData['first_name'] = this.generalForm.value.first_name;
        postData['last_name_kana'] = this.generalForm.value.last_name_kana;
        postData['first_name_kana'] = this.generalForm.value.first_name_kana;
        postData['tel'] = this.generalForm.value.tel;
        postData['mobile_number'] = this.generalForm.value.mobile_number;
        break;
      default:
        break;
    }

    console.log('START:更新処理');
    console.log(postData);
    console.log('END:更新処理');
    // 更新処理
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
          console.log('START:subscribe');
          console.log(res);
          console.log('END:subscribe');
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.detailPagePath);
        })
    );
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
      this.router.navigateByUrl(this.detailPagePath);
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
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath,
    });
  }
}
