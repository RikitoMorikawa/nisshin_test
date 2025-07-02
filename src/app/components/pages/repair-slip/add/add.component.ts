import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormGroup,
} from '@angular/forms';
import {
  Subscription,
  catchError,
  filter,
  finalize,
  forkJoin,
  of,
  from,
} from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { Supplier } from 'src/app/models/supplier';
import { Employee } from 'src/app/models/employee';
import { repairSlipConst } from 'src/app/const/repair-slip-const';
import { AuthorService } from 'src/app/services/author.service';
import { ClientService } from 'src/app/services/client.service';
import { StoreService } from 'src/app/services/store.service';
import { MemberService } from 'src/app/services/member.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { DivisionService } from 'src/app/services/division.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { modalConst } from 'src/app/const/modal.const';
import { repairConst } from 'src/app/const/repair.const';
import { Client } from 'src/app/models/client';
import { Member, MemberApiResponse } from 'src/app/models/member';
import { divisionConst } from 'src/app/const/division.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { RepairSlipService } from 'src/app/services/repair-slip.service';
import { ProductService } from 'src/app/services/product.service';
import { SupplierService } from 'src/app/services/supplier.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private rsService: RepairSlipService,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private storeService: StoreService,
    private clientService: ClientService,
    private memberService: MemberService,
    private employeeService: EmployeeService,
    private divisionService: DivisionService,
    private errorService: ErrorService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  private idTypeValidation = [
    Validators.required,
    Validators.pattern(regExConst.NUMERIC_REG_EX),
    Validators.maxLength(11),
  ];

  // 一覧のパス
  listPagePath = '/repair-slip';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '修理受付票新規登録キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '修理受付票新規登録エラー：' + modalConst.TITLE.HAS_ERROR;

  // ログイン中ユーザー名
  authorName!: string;

  // ログイン中ユーザーロール
  authorRole!: string;

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

  // ステータス区分Id
  statusDivisionId!: string;

  // 精算ステータス区分Id
  settleStatusDivisionId!: string;

  // インシデント発生区分Id
  incidentDivisionId!: string;

  // 選択中の修理タイプ
  repairTypeName!: string;

  // エラー文言
  errorConst = errorConst;

  // 修理定数
  repairConst = repairConst;

  // 修理お客様タイプ選択肢
  customerTypes!: SelectOption[];

  // 選択したお客様タイプ
  customerType!: SelectOption;

  // 修理受付票定数
  rsConst = repairSlipConst;

  // 得意先フォームグループ
  clientForm = this.fb.group({
    client_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    name: [''],
    mobile_number: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
  });

  // 会員フォームグループ
  memberForm = this.fb.group({
    api_member_id: [''],
    api_member_tel: [''],
    member_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    name: [''],
    mobile_number: [
      '',
      [
        Validators.required,
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
        //CustomValidators.eitherRequiredValidator('tel', 'mobile_number'),
      ],
    ],
    mobile_number: [
      '',
      [
        Validators.required,
        Validators.maxLength(14),
        Validators.minLength(10),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        //CustomValidators.eitherRequiredValidator('tel', 'mobile_number'),
      ],
    ],
  });

  // 共通フォーム
  form = this.fb.group({
    reception_date: ['', [Validators.required]],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
    customer_type_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    store_id: ['', [Validators.required]],
    reception_employee_id: ['', [Validators.required]],
  });

  // 修理タイプ選択肢
  repairTypeDivisionOptions!: SelectOption[];

  // 配送区分選択肢
  deliveryDivisionOptions!: SelectOption[];

  // 修理ステータス
  repairStatusDivisionOptions!: SelectOption[];

  // 精算区分
  settleStatusDivisionOptions!: SelectOption[];

  // 商品選択肢
  productSuggests!: SelectOption[];

  // 仕入先選択肢
  supplierSuggests!: SelectOption[];

  // 商品
  products!: Product[];

  // 仕入先
  suppliers!: Supplier[];

  // 修理区分(チェックボックス)
  repair_location: boolean[] = [];
  repair_location_num: number = 1;

  // CalcButtonActive
  isActive_calcButton: boolean = false;

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

  /**
   * ログイン中ユーザーの情報をもとに画面表示を初期化する
   * @param author
   */
  initWithAuthorInfo(author: Employee) {
    this.authorName = author.last_name + ' ' + author.first_name;
    this.authorRole = author.role_name ? author.role_name : '';
    this.ctrls.reception_employee_id.patchValue(String(author.id));
    this.ctrls.store_id.patchValue(String(author.store_id));
    this.ctrls.reception_date.patchValue(new Date().toISOString());
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

    // お客様タイプの変更を購読
    this.subscription.add(
      this.ctrls.customer_type_division_id.valueChanges.subscribe((res) => {
        this.selectedCustomerType(res);
      })
    );
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
    // お客様区分選択肢
    const customerTypes = this.setDivisions(
      divisions,
      divisionConst.CUSTOMER_TYPE
    );
    if (customerTypes === false) {
      return false;
    }
    //console.log(this.customerTypes);

    const statusDivisions: SelectOption[] =
      divisions[divisionConst.REPAIR_SLIP_STATUS];
    if (statusDivisions.length > 0) {
      // 取得した選択肢をメンバへセット
      const statusDivision = statusDivisions.find((status) => {
        return status.text === this.rsConst.STATUS.ACCEPTED;
      });

      if (statusDivision === undefined) {
        this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
        return false;
      }
      this.statusDivisionId = String(statusDivision.value);
    } else {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }
    // 修理精算ステータス区分取得
    const settleStatusDivisions: SelectOption[] =
      divisions[divisionConst.SETTLE_STATUS];
    if (settleStatusDivisions.length > 0) {
      // 取得した選択肢をメンバへセット
      const settleStatusDivision = settleStatusDivisions.find((settle) => {
        return (
          settle.text === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED
        );
      });

      if (settleStatusDivision === undefined) {
        this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
        return false;
      }
      this.settleStatusDivisionId = String(settleStatusDivision.value);
    } else {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }

    // インシデントステータス区分取得
    const incidentDivisions: SelectOption[] = divisions[divisionConst.INCIDENT];
    if (incidentDivisions.length > 0) {
      // 取得した選択肢をメンバへセット
      const incidentDivision = incidentDivisions.find((incident) => {
        return (
          incident.text === this.rsConst.INCIDENT_DIVISION.VALUE.NO_INCIDENTS
        );
      });

      if (incidentDivision === undefined) {
        this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
        return false;
      }
      this.incidentDivisionId = String(incidentDivision.value);
    } else {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }

    // 修理タイプ選択肢
    const repairTypeDivisionOptions = this.setDivisions(
      divisions,
      divisionConst.REPAIR_TYPE
    );
    if (repairTypeDivisionOptions === false) {
      return false;
    }

    // 配送区分選択肢
    const deliveryDivisionOptions = this.setDivisions(
      divisions,
      divisionConst.DELIVERY_REQUEST
    );
    if (deliveryDivisionOptions === false) {
      return false;
    }

    // 修理ステータス区分
    const repairStatusDivisions = this.setDivisions(
      divisions,
      divisionConst.REPAIR_STATUS
    );
    if (repairStatusDivisions === false) {
      return false;
    }

    // 修理精算ステータス区分
    const repairSettleStatusDivisions = this.setDivisions(
      divisions,
      divisionConst.SETTLE_STATUS
    );
    if (repairSettleStatusDivisions === false) {
      return false;
    }

    return true;
  }

  private setDivisions(divisions: any, divisionConstValue: any): boolean {
    const selectDivisions: SelectOption[] = divisions[divisionConstValue];
    let selectOptions;
    if (selectDivisions.length > 0) {
      // 取得した選択肢をメンバへセット
      selectOptions = [
        ...[{ value: '', text: '選択してください' }],
        ...selectDivisions,
      ];
    } else {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return false;
    }

    if (divisionConstValue === divisionConst.REPAIR_TYPE) {
      this.repairTypeDivisionOptions = selectOptions;
      return true;
    }

    if (divisionConstValue === divisionConst.CUSTOMER_TYPE) {
      this.customerTypes = selectOptions;
      return true;
    }

    if (divisionConstValue === divisionConst.DELIVERY_REQUEST) {
      this.deliveryDivisionOptions = selectOptions;
      return true;
    }

    if (divisionConstValue === divisionConst.REPAIR_STATUS) {
      this.repairStatusDivisionOptions = selectOptions;
      return true;
    }

    if (divisionConstValue === divisionConst.SETTLE_STATUS) {
      this.settleStatusDivisionOptions = selectOptions;
      return true;
    }

    return true;
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
    if (this.customerType) {
      switch (this.customerType.text) {
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
          this.clientCtrls.client_id.setValue('');
          break;
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
          this.memberCtrls.member_id.setValue('');
          break;
        case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
          const formVal = {
            last_name: '',
            first_name: '',
            tel: '',
            last_name_kana: '',
            first_name_kana: '',
          };
          this.generalForm.patchValue(formVal);
          break;
        default:
          break;
      }
    }
    this.customerType = selectedType;
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
        this.clientService.getAll({ $select: 'id,name,tel' }),
        this.memberService.getAll({ $select: 'id,last_name,first_name' }),
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.productService.getAll({
          $select: 'id,name,product_name',
          limit: 10,
        }),
        this.supplierService.getAll({ $select: 'id,name' }),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            console.log(error);
            return of(error);
          })
        )
        .subscribe((res) => {
          const hasError = this.detectErrors(res, 7);
          if (hasError) {
            return;
          }
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

          // 受付担当者選択肢
          this.employeeSuggests = res[3];

          // ステータス選択肢を生成
          this.generateStatusDivisions(res[4]);

          // 商品選択肢
          this.productSuggests = res[5].data.map((v: any) => {
            const suggests = {
              value: v.id,
              text: v.name,
            };
            return suggests;
          });
          this.products = res[5].data;

          // 仕入れ先選択肢
          this.supplierSuggests = res[6].data.map((v: any) => {
            const suggests = {
              value: v.id,
              text: v.name,
            };
            return suggests;
          });
          this.suppliers = res[6].data;
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
      this.router.navigateByUrl(this.listPagePath);
    }
  }

  /**
   * 登録
   * @param status
   * @param message
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.form.markAsPristine();
    this.clientForm.markAsPristine();
    this.memberForm.markAsPristine();
    this.generalForm.markAsPristine();
    const repairProductForms = this.repairProductForms;
    //console.log(...repairProductForms.value);

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

    const repairs = repairProductForms.value.forms.map((repair: any) => {
      repair.arrival_expected_date = new Date(
        String(repair.arrival_expected_date)
      ).toLocaleString();

      if (repair.taking_out_date != '') {
        repair.taking_out_date = new Date(
          String(repair.taking_out_date)
        ).toLocaleString();
      }
      if (repair.arrival_date != '') {
        repair.arrival_date = new Date(
          String(repair.arrival_date)
        ).toLocaleString();
      }
      if (repair.passing_date != '') {
        repair.passing_date = new Date(
          String(repair.passing_date)
        ).toLocaleString();
      }

      repair.tax_included_quote_selling_price = repair.quote_selling_price;
      return repair;
    });

    // ポストデータ作成
    const postData: { [key: string]: string | any[] | null | undefined } = {
      store_id: formVal.store_id,
      customer_type_division_id: formVal.customer_type_division_id,
      status_division_id: this.statusDivisionId,
      reception_employee_id: formVal.reception_employee_id,
      reception_date: new Date(String(formVal.reception_date)).toLocaleString(),
      settle_status_division_id: this.settleStatusDivisionId,
      incident_division_id: this.incidentDivisionId,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
      repair: [...repairs],
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

        const client_id = this.clientForm.value.client_id;
        const client = this.clients.find((x) => x.id === Number(client_id));

        if (!clientIdExists) {
          this.clientCtrls.client_id.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // ポストデータへ得意先IDをセット
        postData['client_id'] = this.clientForm.value.client_id;
        if (client !== undefined) {
          postData['first_name'] = client.name;
        }
        postData['mobile_number'] = this.clientForm.value.mobile_number;
        break;
      case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        // 会員の値をチェック
        const memberIdExists = this.memberSuggests.some((member) => {
          const memberVal = Number(member.value);
          const memberId = Number(this.memberForm.value.member_id);
          return memberVal === memberId;
        });

        const member_id = this.memberForm.value.member_id;
        const member = this.members.find((x) => x.id === Number(member_id));

        if (!memberIdExists) {
          this.memberCtrls.member_id.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // ポストデータへ会員IDをセット
        postData['member_id'] = member_id;
        if (member !== undefined) {
          postData['first_name'] = member.first_name;
          postData['last_name'] = member.last_name;
        }
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
    // 登録処理
    this.subscription.add(
      this.rsService
        .add(postData)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            console.log(error);
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
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

  // 追加ボタンがおされたときに追加したいフォームを定義しています。returnでFormGroupを返しています。
  get repairForm(): FormGroup {
    return this.fb.group({
      // 修理区分タイプ
      repair_type_division_id: ['', this.idTypeValidation],
      // 研磨枚数
      // polishing_number: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      // 修理状況
      failure_status: ['', [Validators.required, Validators.maxLength(255)]],
      // 修理依頼先
      repair_order_company: ['', [Validators.maxLength(255)]],
      // 修理対象商品のメーカー名
      maker_name: ['', [Validators.maxLength(255)]],
      // 修理対象商品名
      product_name: ['', [Validators.required, Validators.maxLength(255)]],
      api_product_name: [''],
      // 修理対象商品名
      product_id: [
        '',
        [
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 仕入先ID
      supplier_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      // お客様ご予算
      customer_budget: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      // 備考
      remarks: ['', [Validators.maxLength(255)]],
      // 配送区分
      delivery_division_id: ['', this.idTypeValidation],
      // 修理ステータス区分
      repair_status_division_id: ['', this.idTypeValidation],
      // 持出日
      taking_out_date: ['', [Validators.maxLength(255)]],
      // 入荷予定日
      arrival_expected_date: ['', [Validators.maxLength(255)]],
      // 作業工賃原価
      quote_cost: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      // 作業工賃売価
      quote_selling_price: [
        '',
        [Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      // 入荷日
      arrival_date: ['', [Validators.maxLength(255)]],
      // 引渡し日
      passing_date: ['', [Validators.maxLength(255)]],
      // 精算区分
      settle_status_division_id: ['', this.idTypeValidation],
      // 自社修理  自社修理:1 他社修理:0
      in_house_repairs: [1, [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      // 部品原価
      cost_of_parts: ['', [Validators.maxLength(255)]],
    });
  }

  repairProductForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  // FormのOption部分を取り出しています。
  // テンプレートでオプション部分を表示するときやフォームの追加・削除のときに利用します。
  // 型をFormArrayとすることがポイントです
  get repairProductArray(): FormArray {
    return this.repairProductForms.get('forms') as FormArray;
  }

  get repairProductArrayControls() {
    return this.repairProductArray.controls as FormGroup[];
  }

  addRepairProductForm() {
    const repairForm = this.repairForm;

    if (this.ctrls.reception_date.value !== null) {
      const reception_date = new Date(String(this.ctrls.reception_date.value));
      reception_date.setDate(reception_date.getDate() + 7);
      repairForm.controls['arrival_expected_date'].patchValue(reception_date);
    }

    repairForm.controls['supplier_id'].valueChanges.subscribe((id) => {
      const supplier = this.suppliers.find((x) => x.id === Number(id));
      if (supplier && supplier.name) {
        repairForm.controls['repair_order_company'].patchValue(supplier.name);
      }

      // 自社修理の初期値セット(自社修理)
      //repairForm.controls['in_house_repairs'].setValue(1);
    });

    this._setHiddenValue(repairForm);

    this.repairProductArray.push(repairForm);
    this.repair_location.push(true);
  }

  /**
   *
   * 値を暗黙的に設定
   *
   */
  private _setHiddenValue(repairForm: FormGroup): void {
    this._setRepairTypeDivision(repairForm);
    this._setDeliveryDivision(repairForm);
    this._setRepairStatusDivision(repairForm);
    this._setSettleStatusDivision(repairForm);
  }

  /**
   * 修理タイプのセット
   *
   * 研磨がなくなったので修理を強制的にセット
   *
   */
  private _setRepairTypeDivision(repairForm: FormGroup): void {
    const repairTypeDivisions = this.repairTypeDivisionOptions.find((x) => {
      return x.text === this.repairConst.REPAIR_TYPE.REPAIR;
    });
    repairForm.controls['repair_type_division_id'].patchValue(
      repairTypeDivisions?.value
    );
  }

  /**
   * 配送区分のセット
   *
   * 配送がなくなったので「配送なし」を強制的にセット
   *
   */
  private _setDeliveryDivision(repairForm: FormGroup): void {
    const deliveryDivision = this.deliveryDivisionOptions.find((x) => {
      return x.text === this.repairConst.DELIVERY.NO_DELIVERY;
    });
    repairForm.controls['delivery_division_id'].patchValue(
      deliveryDivision?.value
    );
  }

  /**
   * 修理ステータス区分のセット
   *
   * ステータスがなくなったので「修理前」を強制的にセット
   *
   */
  private _setRepairStatusDivision(repairForm: FormGroup): void {
    const repairStatusDivision = this.repairStatusDivisionOptions.find((x) => {
      return x.text === this.repairConst.STATUS.BEFORE_REPAIR;
    });
    repairForm.controls['repair_status_division_id'].patchValue(
      repairStatusDivision?.value
    );
  }

  /**
   * 精算区分のセット
   *
   */
  private _setSettleStatusDivision(repairForm: FormGroup): void {
    const settleStatusDivision = this.settleStatusDivisionOptions.find((x) => {
      return x.text === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED;
    });
    repairForm.controls['settle_status_division_id'].patchValue(
      settleStatusDivision?.value
    );
  }

  // removeAtでインデックスを指定することで、FormArrayのフォームを削除します。
  removeRepairForm(idx: number) {
    this.repairProductArray.removeAt(idx);
    delete this.repair_location[idx];
  }

  getProductIdControl(form: FormGroup) {
    return form?.get('product_id') as FormControl;
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  /**
   * 会員番号サジェスト
   * @returns
   */
  getMemberCdSuggests(): ApiInput<MemberApiResponse> {
    const ctrl = this.memberForm.controls;
    return {
      observable: this.memberService.getAll({
        member_cd: ctrl.api_member_id.value,
      }),
      idField: 'id',
      nameField: 'last_name',
      otherField: 'first_name',
    };
  }

  /**
   * 電話番号サジェスト
   * @returns
   */
  getMemberTelSuggests(): ApiInput<MemberApiResponse> {
    const ctrl = this.memberForm.controls;
    return {
      observable: this.memberService.getAll({
        tel: ctrl.api_member_tel.value,
      }),
      idField: 'id',
      nameField: 'last_name',
      otherField: 'first_name',
    };
  }

  invalidRepairForm(): boolean {
    let invalid = false;
    this.repairProductArrayControls.forEach((_repairForm: any) => {
      if (_repairForm.invalid) {
        invalid = _repairForm.invalid;
      }
    });
    return invalid;
  }

  handleSelectedProductData(repairProductForm: FormGroup, product: Product) {
    //customerOrderForm.tax_included_unit_price.patchValue(product.tax_included_unit_price);
    if (product === undefined) {
      return;
    }
    repairProductForm.controls['product_name'].patchValue(product.name);
    //customerOrderForm.controls['product_name'].patchValue(product.name);
  }

  handleSelectedMemberData(member: Member) {
    this.memberForm.controls['member_id'].patchValue('');
    if (member === undefined) {
      return;
    }
    this.memberForm.controls['member_id'].patchValue(String(member.id));
    this.memberForm.controls['mobile_number'].patchValue(String(member.tel));
  }
  /**
   * 粗利率算出
   */
  grossMarginCalculation(labor_cost: number, repair_location: boolean) {
    let gross_margin = 0;
    if (repair_location) {
      // 30,001以上
      gross_margin = 10;
      if (labor_cost <= 30000) {
        // 30,000以下
        gross_margin = 15;
      }
      if (labor_cost <= 10000) {
        // 5,000以下
        gross_margin = 20;
      }
      if (labor_cost <= 5000) {
        // 5,000以下
        gross_margin = 30;
      }
    } else {
      //3,001円以上
      gross_margin = 30;
      if (labor_cost <= 3000) {
        // 3,000以下
        gross_margin = 35;
      }
      if (labor_cost <= 1000) {
        // 1,000以下
        gross_margin = 40;
      }
    }
    return gross_margin;
  }
  /**
   * 自社修理
   */
  inHouseSellingPriceCalculation(cost_of_parts: number, gross_margin: number) {
    let selling_price = Math.round(
      (cost_of_parts / ((100 - gross_margin) / 100)) * 1.1
    );
    return selling_price;
  }
  /**
   * 外部修理
   */
  externalSellingPriceCalculation(quote_cost: number, gross_margin: number) {
    let selling_price = Math.round(
      (quote_cost / ((100 - gross_margin) / 100)) * 1.1
    );
    return selling_price;
  }
  /**
   * 売価計算クリア
   */
  handleClickClearValueButton(i: number) {
    const forms = this.repairProductArrayControls[i].controls;
    forms['quote_cost'].patchValue('');
    forms['cost_of_parts'].patchValue('');
    forms['quote_selling_price'].patchValue('');
  }
  /**
   * 売価計算
   */
  handleClickCalcButton(i: number) {
    const forms = this.repairProductArrayControls[i].controls;

    let quote_cost = Number(forms['quote_cost'].value);
    if (this.repair_location[i] === true) {
      let cost_of_parts = Number(forms['cost_of_parts'].value);
      let gross_margin = this.grossMarginCalculation(
        cost_of_parts,
        this.repair_location[i]
      );

      forms['quote_selling_price'].patchValue(
        this.inHouseSellingPriceCalculation(cost_of_parts, gross_margin)
      );
    } else {
      let gross_margin = this.grossMarginCalculation(
        quote_cost,
        this.repair_location[i]
      );
      forms['quote_selling_price'].patchValue(
        this.externalSellingPriceCalculation(quote_cost, gross_margin)
      );
    }
  }
  selectRepairLocation(event: any, i: number) {
    const forms = this.repairProductArrayControls[i].controls;
    if (event.target.checked) {
      forms['in_house_repairs'].setValue(1);
      this.repair_location[i] = true;
    } else {
      forms['in_house_repairs'].setValue(0);
      this.repair_location[i] = false;
    }
  }
  /**
   * 得意先から電話番号を抽出する。
   */
  clientChange(client_id: String) {
    const client = this.clients.find((x) => x.id === Number(client_id));
    if (client) {
      this.clientForm.controls.mobile_number.patchValue(client.tel);
    }
  }
}
