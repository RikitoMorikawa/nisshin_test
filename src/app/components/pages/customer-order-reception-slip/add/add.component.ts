import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  map,
  of,
  Subscription,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { Client } from 'src/app/models/client';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { AuthorService } from 'src/app/services/author.service';
import { ClientService } from 'src/app/services/client.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { customerOrderReceptionSlipConst } from 'src/app/const/customer-order-reception-slip.const';
import { customerOrderConst } from 'src/app/const/customer-order.const';
import { DivisionService } from 'src/app/services/division.service';
import { divisionConst } from 'src/app/const/division.const';
import { StoreService } from 'src/app/services/store.service';
import { MemberService } from 'src/app/services/member.service';
import {
  Member,
  MemberApiResponse,
  MemberSuggestsApiResponse,
} from 'src/app/models/member';
import { CustomerOrderReceptionSlipService } from 'src/app/services/customer-order-reception-slip.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { regExConst } from 'src/app/const/regex.const';
import { Employee } from 'src/app/models/employee';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { CommonService } from 'src/app/services/shared/common.service';
import { ProductService } from 'src/app/services/product.service';
import { Division } from 'src/app/models/division';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   *
   * @param fb
   * @param modalService
   * @param router
   * @param authorService
   * @param clientService
   * @param memberService
   * @param employeeService
   * @param corsService
   * @param storeService
   * @param errorService
   * @param divisionService
   * @param flashMessageService
   */
  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private authorService: AuthorService,
    private clientService: ClientService,
    private memberService: MemberService,
    private employeeService: EmployeeService,
    private corsService: CustomerOrderReceptionSlipService,
    private storeService: StoreService,
    private errorService: ErrorService,
    private divisionService: DivisionService,
    private flashMessageService: FlashMessageService,
    private productService: ProductService,
    private common: CommonService
  ) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  unit_division_list: any[] = [];
  // 一覧のパス
  listPagePath = '/customer-order-reception-slip';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '客注受付票新規登録キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '客注受付票新規登録エラー：' + modalConst.TITLE.HAS_ERROR;

  // ログイン中ユーザー名
  authorName!: string;

  // ログイン中ユーザーロール
  authorRole!: string;

  // 受付・見積担当者選択肢
  employeeSuggests!: SelectOption[];

  // 配送依頼区分選択肢
  deliveryDivisionOptions!: SelectOption[];
  // = [
  //   { value: '', text: generalConst.PLEASE_SELECT },
  // ];

  // 選択中得意先
  selectedClient?: Client;

  // 選択中会員
  selectedMember?: Member;

  // 店舗選択肢
  storeSuggests!: SelectOption[];

  // 客注伝票 ステータス区分Id
  statusDivisionId!: string;

  // 客注 ステータス区分Id
  customerOrderStatusDivisionId!: string;

  // 客注伝票 精算区分Id
  settleStatusDivisionId!: string;

  // 客注 精算区分Id
  customerOrderSettleStatusDivisionId!: string;

  // インシデント区分Id
  incidentDivisionId!: string;

  // エラー文言
  errorConst = errorConst;

  // 客注お客様タイプ選択肢
  customerTypes!: SelectOption[];

  // 選択したお客様タイプ
  customerType!: SelectOption;

  // 受付票関連定数
  corsConst = customerOrderReceptionSlipConst;

  coConst = customerOrderConst;
  totalAmountIncludingTax!: number;

  // 商品追加フォームで商品番号で指定するか商品名で指定するかのフラグ
  selectionTypeIsProductId = true;

  // 得意先フォームグループ
  clientForm = this.fb.group({
    client_id: ['', [Validators.required]],
    name: [''],
  });

  // 会員フォームグループ
  memberForm = this.fb.group({
    member_id: ['', [Validators.required]],
    first_name: [''],
    last_name: [''],
    member_cd: [''],
    member_tel: [''],
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
    customer_type_division_id: ['', [Validators.required]],
    store_id: ['', [Validators.required]],
    reception_employee_id: ['', [Validators.required]],
    reception_date: ['', [Validators.required]],
    quotation_employee_id: ['', [Validators.required]],
    shipping_address: ['', [Validators.maxLength(255)]],
    total_amount_including_tax: [''],
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

  // 商品区分 特注品判別
  DIVISION_PRODUCT_CODE_SPECIAL_ORDER: number = 2;

  get clientFc() {
    return this.clientForm.controls;
  }

  get memberFc() {
    return this.memberForm.controls;
  }

  get generalFc() {
    return this.generalForm.controls;
  }

  get fc() {
    return this.form.controls;
  }

  initWithAuthorInfo(author: Employee) {
    this.authorName = author.last_name + ' ' + author.first_name;
    this.authorRole = author.role_name ? author.role_name : '';
    this.fc.reception_employee_id.patchValue(String(author.id));
    this.fc.quotation_employee_id.patchValue(String(author.id));
    this.fc.store_id.patchValue(String(author.store_id));
    this.fc.reception_date.patchValue(new Date().toISOString());
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
      this.fc.customer_type_division_id.valueChanges.subscribe((res) => {
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
        case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
          const clientformVal = {
            client_id: '',
            name: '',
          };
          this.clientForm.patchValue(clientformVal);
          break;
        case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
          this.memberFc.member_id.setValue('');
          this.memberFc.member_tel.setValue('');
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
    }
    this.customerType = selectedType;
  }

  /**
   * 得意先名サジェスト
   * @returns
   */
  getClientNameSuggests() {
    return {
      observable: this.clientService.getAll({
        name: this.clientFc.name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 得意先名サジェスト選択時に得意先名オブジェクトをセット
   * @param client
   */
  handleSelectedClientNameData(client: Client) {
    this.selectedClient = client;
    if (client.name !== undefined) {
      //this.clientFc['name'].patchValue(client.name);
    }
  }

  handleSelectedProductData(customerOrderForm: FormGroup, product: Product) {
    //customerOrderForm.tax_included_unit_price.patchValue(product.tax_included_unit_price);
    if (product === undefined) {
      return;
    }
    // 特注判断のための変数に値格納
    if (
      product.division_product_code === this.DIVISION_PRODUCT_CODE_SPECIAL_ORDER
    ) {
      customerOrderForm.controls['special_order'].patchValue(true);
    } else {
      customerOrderForm.controls['special_order'].patchValue(false);
    }

    customerOrderForm.controls['basic_shipping_fee'].patchValue(
      product.basic_shipping_fee
    );

    customerOrderForm.controls['tax_included_unit_price'].patchValue(
      product.selling_price
    );
    customerOrderForm.controls['supplier_name'].patchValue(
      product.supplier_name
    );
    customerOrderForm.controls['supplier_id'].patchValue(
      Number(product.supplier_id)
    );

    /**
     * ID 選択時 product_nameをセットする
     */
    if (
      this.getFormControlTypeValue(
        customerOrderForm,
        'selectionTypeIsProductId'
      ).value
    ) {
      customerOrderForm.controls['product_name'].patchValue(product.name);
    }

    // 原価格納
    //customerOrderForm.controls['cost_price'].patchValue(product.name);

    //取得した product の最小単位(バラ)を、フォームの単位に自動差し込み
    let division_code = this.unit_division_list.find((x) => {
      return x.code === product.division_unit_code;
    });
    // append unit.value
    customerOrderForm.controls['unit'].patchValue(division_code.text);

    // 原価（仕入れ値を取得）
    // (最小単位)
    customerOrderForm.controls['cost_price'].patchValue(
      product.supplier_cost_price
    );
  }

  /**
   * 会員電話番号サジェスト
   * @returns
   */
  getMemberTelSuggests(): ApiInput<MemberSuggestsApiResponse> {
    return {
      observable: this.memberService
        .getAll({ tel: this.memberFc.member_tel.value })
        .pipe(
          map((response) => {
            return {
              ...response,
              data: response.data.map((member) => ({
                ...member,
                fullName: `${member.last_name} ${member.first_name}`,
              })),
            };
          })
        ),
      idField: 'id',
      nameField: 'fullName', // 加工したfullNameを使用
    };
  }
  /**
   * 会員番号サジェスト
   * @returns
   */
  getMemberCdSuggests(): ApiInput<MemberApiResponse> {
    return {
      observable: this.memberService.getAll({
        member_cd: this.memberFc.member_cd.value,
      }),
      idField: 'id',
      nameField: 'member_cd',
    };
  }

  /**
   * 会員番号サジェスト選択時に会員番号オブジェクトをセット
   * @param member
   */
  handleSelectedMemberCdData(member: Member) {
    this.selectedMember = member;
    this.memberFc['member_tel'].setValue('');
    if (member.first_name !== undefined) {
      this.memberFc['first_name'].setValue(member.first_name);
    }
    if (member.last_name !== undefined) {
      this.memberFc['last_name'].setValue(member.last_name);
    }
    if (member.tel !== undefined) {
      this.fc.tel.setValue(member.tel);
    }
  }

  /**
   * 会員電話番号サジェスト選択時に会員電話番号オブジェクトをセット
   * @param member
   */
  handleSelectedMemberTelData(member: Member) {
    this.selectedMember = member;
    // cd 検索結果をクリア
    this.fc['tel'].setValue('');
    this.memberFc['member_cd'].setValue('');

    if (member.tel !== undefined) {
      this.fc['tel'].setValue(member.tel);
    }
    if (member.member_cd !== undefined) {
      this.memberFc['member_id'].setValue(String(member.id));
    }
    if (member.first_name !== undefined) {
      this.memberFc['first_name'].setValue(member.first_name);
    }
    if (member.last_name !== undefined) {
      this.memberFc['last_name'].setValue(member.last_name);
    }
  }

  /**
   * 選択肢初期化
   */
  initOptions() {
    // ローディング開始
    this.common.loading = true;

    // サジェスト用選択肢取得
    this.subscription.add(
      forkJoin([
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
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
          // レスポンスの配列の要素が5つあるか
          if (res.length !== 3) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // 受付・見積担当者選択肢
          this.employeeSuggests = res[0];

          this._setDivisionData(res[1]);
          this._setHiddenValue(res[1]);

          // 単位区分のオブジェクト
          this.unit_division_list = res[1][divisionConst.UNIT];

          // 店舗選択肢
          this.storeSuggests = res[2];
        })
    );
  }

  /**
   * データ保存処理
   * フォームデータをapiへpost
   * @returns
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.form.markAsPristine();
    this.clientForm.markAsPristine();
    this.memberForm.markAsPristine();
    this.generalForm.markAsPristine();

    // this.customerOrderArrayControls.forEach(customer_order => {
    //   customer_order.removeControl('selectionTypeIsProductId');
    // });
    const [total_amount_including_tax, customer_orders] =
      this._getCustomerOrders();

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
      this.fc.customer_type_division_id.setValue('');
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
      this.fc.reception_employee_id.setValue('');
      this.fc.quotation_employee_id.setValue('');
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
      this.fc.store_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 受付日の値チェック
    if (this.isFalseValue(formVal.reception_date)) {
      this.fc.reception_date.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // ポストデータ作成
    const postData: { [key: string]: string | any[] | null | undefined } = {
      store_id: formVal.store_id,
      customer_type_division_id: formVal.customer_type_division_id,
      status_division_id: this.statusDivisionId,
      reception_employee_id: formVal.reception_employee_id,
      quotation_employee_id: formVal.reception_employee_id,
      reception_date: new Date(
        String(formVal.reception_date)
      ).toLocaleDateString(),
      quotation_expiration_date: formVal.quotation_expiration_date
        ? new Date(formVal.quotation_expiration_date).toLocaleDateString()
        : '',
      settle_status_division_id: this.settleStatusDivisionId,
      incident_division_id: this.incidentDivisionId,
      shipping_address: formVal.shipping_address,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
      customer_order: [...customer_orders],
    };

    if (this.totalAmountIncludingTax !== undefined) {
      postData['total_amount_including_tax'] = String(
        this.totalAmountIncludingTax
      );
    }

    // お客様タイプによってフォームの値を取得
    switch (this.customerType.text) {
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
        // ポストデータへ得意先IDをセット
        postData['client_id'] = this.clientForm.value.client_id;
        postData['first_name'] = this.clientForm.value.name;
        postData['tel'] = this.fc.tel.value;
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
        // ポストデータへ会員IDをセット
        postData['member_id'] = this.memberForm.value.member_id;
        postData['first_name'] = this.memberForm.value.first_name;
        postData['last_name'] = this.memberForm.value.last_name;
        postData['tel'] = this.fc.tel.value;
        break;
      case this.corsConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL:
        // 姓
        if (this.isFalseValue(this.generalForm.value.last_name)) {
          this.generalFc.last_name.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // 名
        if (this.isFalseValue(this.generalForm.value.first_name)) {
          this.generalFc.first_name.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // 電話番号
        if (this.isFalseValue(this.fc.tel.value)) {
          this.fc.tel.setValue('');
          // ローディング終了
          this.common.loading = false;
          return;
        }
        // ポストデータへ会員IDをセット
        postData['last_name'] = this.generalForm.value.last_name;
        postData['first_name'] = this.generalForm.value.first_name;
        postData['last_name_kana'] = this.generalForm.value.last_name_kana;
        postData['first_name_kana'] = this.generalForm.value.first_name_kana;
        postData['tel'] = this.fc.tel.value;
        break;
      default:
        break;
    }
    // 登録処理
    this.subscription.add(
      this.corsService
        .add(postData)
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
              `\nPostData::${JSON.stringify(postData, null, 2)}\n${
                res.error.message
              }\n${res.message}`
            );
            //this.handleError(res.status, this.errorModalTitle, `\n${res.error.message}\n${res.message}`);
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(
            '登録しました',
            purpose,
            15000
          );
          const primary_id = res.data;
          // redirect detail
          let detail_page_url =
            this.listPagePath + '/detail/' + String(primary_id);
          this.router.navigateByUrl(detail_page_url);
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
      redirectPath: this.listPagePath,
    });
  }

  customerOrderForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  // 追加ボタンがおされたときに追加したいフォームを定義しています。returnでFormGroupを返しています。
  get customerOrderForm(): FormGroup {
    const form = this.fb.group({
      product_id: ['', [Validators.required]], // 商品ID
      supplier_id: ['', [Validators.required]], // 仕入先ID
      supplier_name: ['', [Validators.maxLength(255)]], // 仕入先 POST時削除
      product_name: ['', [Validators.maxLength(255)]], // 商品名
      custom_name: ['', [Validators.maxLength(255)]], // 変更した場合の商品名
      quantity: [
        1,
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ], // 数量
      unit: ['', [Validators.required]], // 単位
      remarks: ['', [Validators.maxLength(255)]], // 備考
      cost_price: [''], // 原価
      total_cost_price: [''], // 原価合計
      delivery_division_id: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ], // 配送区分
      basic_shipping_fee: [''], //仕入れ単価(原価とする)
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
      // POST時削除
      selectionTypeIsProductId: true,
    });

    /*this.subscription.add(
      form.controls.product_id.valueChanges.subscribe((id) => {
        this.subscribeAddFormProductIdValueChanges(form, id);
      })
    );*/

    // 数量変更を購読
    this.subscription.add(
      form.controls.quantity.valueChanges.subscribe((x) => {
        this.calculateAddFormTaxIncludedAmount(form, String(x));
      })
    );
    // 単価変更を購読
    this.subscription.add(
      form.controls.tax_included_unit_price.valueChanges.subscribe((x) => {
        this.calculateAddFormTaxIncludedQuantityAmount(form, x);
      })
    );
    // 原価変更を購読
    this.subscription.add(
      form.controls.cost_price.valueChanges.subscribe((x) => {
        this.calculateAddFormCostPriceQuantityAmount(form, x);
      })
    );

    this._setDefaultValue(form);
    // カスタム名変更を購読
    return form;
  }

  get customerOrderArray(): FormArray {
    return this.customerOrderForms.get('forms') as FormArray;
  }

  get customerOrderArrayControls() {
    return this.customerOrderArray.controls as FormGroup[];
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
    const customerOrderForm = this.customerOrderForm;
    this.customerOrderArray.push(customerOrderForm);
  }

  // removeAtでインデックスを指定することで、FormArrayのフォームを削除します。
  removeCustomerOrderForm(idx: number) {
    this.customerOrderArray.removeAt(idx);
  }

  /**
   * 客注追加・編集時に商品IDと商品名で入力を切り替える
   */
  setSelectionType(customerOrderForm: FormGroup) {
    // フラグ反転
    const boolValue =
      !customerOrderForm.controls['selectionTypeIsProductId'].value;
    // フォームクリア
    customerOrderForm.reset({ product_id: '', quantity: 1 });
    customerOrderForm.controls['selectionTypeIsProductId'].patchValue(
      boolValue
    );
    this._setDefaultValue(customerOrderForm);
  }

  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProductIdSuggests(form: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        id: form.controls['product_id'].value, //this.fc.product_name.value,
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
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 区分データのセット
   */
  private _setDivisionData(res: any): void {
    const blankValue = { value: '', text: '選択してください' };
    this.customerTypes = this._getDivisionDataToSelectOptions(
      res,
      divisionConst.CUSTOMER_TYPE,
      blankValue
    );
    this.deliveryDivisionOptions = this._getDivisionDataToSelectOptions(
      res,
      divisionConst.DELIVERY_REQUEST,
      blankValue
    );
  }

  /**
   * 区分データをSelect Optionにセット
   */
  private _getDivisionDataToSelectOptions(
    res: any,
    constData: any,
    blankValue: any = null
  ): any {
    const divisions: SelectOption[] = res[constData];

    if (divisions.length < 1) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return;
    }

    if (blankValue == null) {
      return divisions;
    }

    return [...[blankValue], ...divisions];
  }

  /**
   * 暗黙的値の設定
   * 新規登録時にはフォームから設定しない値を設定する
   */
  private _setHiddenValue(res: any): void {
    const statusDivisionId = this._getHiddenValue(
      res,
      divisionConst.CUSTOMER_ORDER_RECEPTION_SLIP_STATUS,
      this.corsConst.STATUS.ACCEPTED
    );
    if (statusDivisionId !== undefined) {
      this.statusDivisionId = statusDivisionId;
    }

    const settleStatusDivisionId = this._getHiddenValue(
      res,
      divisionConst.SETTLE_STATUS,
      this.corsConst.SETTLE_STATUS_DIVISION.VALUE.BEFORE_PAYMENT
    );
    if (settleStatusDivisionId !== undefined) {
      this.settleStatusDivisionId = settleStatusDivisionId;
      this.customerOrderSettleStatusDivisionId = settleStatusDivisionId;
    }
    const incidentDivisionId = this._getHiddenValue(
      res,
      divisionConst.INCIDENT,
      this.corsConst.INCIDENT_DIVISION.VALUE.NO_INCIDENTS
    );

    const InsidentDivisionId = this._getHiddenValue(
      res,
      divisionConst.INCIDENT,
      this.corsConst.INCIDENT_DIVISION.VALUE.NO_INCIDENTS
    );
    this.incidentDivisionId = String(InsidentDivisionId);
    const customerOrderStatusDivisionId = this._getHiddenValue(
      res,
      divisionConst.CUSTOMER_ORDER_STATUS,
      this.coConst.STATUS.BEFORE_PLACING_AN_ORDER
    );
    if (customerOrderStatusDivisionId !== undefined) {
      this.customerOrderStatusDivisionId = customerOrderStatusDivisionId;
    }
  }

  /**
   * 暗黙的値の取得
   */
  private _getHiddenValue(
    res: any,
    constData: any,
    divisionText: string
  ): string | undefined {
    // 客注受付票ステータス区分取得
    const divisions: SelectOption[] = res[constData];
    if (divisions.length < 1) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return undefined;
    }

    // 取得した選択肢をメンバへセット
    const division = divisions.find((status) => {
      return status.text === divisionText;
    });

    if (division === undefined) {
      this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
      return undefined;
    }
    return String(division.value);
  }

  /**
   * 商品IDから商品を検索
   */
  subscribeAddFormProductIdValueChanges(form: any, id: string | null) {
    if (id === null) {
      return;
    }
    const product = this.productService.find(Number(id));
    product.subscribe(
      (res) => {
        const data = res.data[0];
        /*form.controls.tax_included_unit_price.setValue(
          String(data.selling_price)
        );*/
        form.controls.product_name.setValue(data.name);
        form.controls.supplier_name.setValue(data.supplier_name);
      },
      (error) => {
        console.log('error');
        console.log(error);
      }
    );
  }

  calculateAddFormTaxIncludedAmount(form: any, argQuantity: string | null) {
    if (argQuantity === null) {
      return;
    }
    const quantity = Number(argQuantity);

    const taxIncludedUnitPrice = Number(
      form.controls.tax_included_unit_price.value
    );

    const cost_price = Number(form.controls.cost_price.value);

    const customUnitPrice = Number(form.controls.custom_unit_price.value);
    const amount = customUnitPrice
      ? quantity * customUnitPrice
      : quantity * taxIncludedUnitPrice;

    const total_cost_price = cost_price * quantity;

    form.controls.tax_included_amount.setValue(String(amount));
    form.controls.total_cost_price.setValue(String(total_cost_price));
  }
  calculateAddFormTaxIncludedQuantityAmount(
    form: any,
    tax_included_unit_price: string | null
  ) {
    if (tax_included_unit_price === null) {
      return;
    }
    const quantity = Number(form.controls.quantity.value);

    const taxIncludedUnitPrice = Number(tax_included_unit_price);

    const cost_price = Number(form.controls.cost_price.value);

    const customUnitPrice = Number(form.controls.custom_unit_price.value);
    const amount = customUnitPrice
      ? quantity * customUnitPrice
      : quantity * taxIncludedUnitPrice;

    const total_cost_price = cost_price * quantity;

    form.controls.tax_included_amount.setValue(String(amount));
    form.controls.total_cost_price.setValue(String(total_cost_price));
  }
  calculateAddFormCostPriceQuantityAmount(
    form: any,
    cost_prices: string | null
  ) {
    if (cost_prices === null) {
      return;
    }
    const quantity = Number(form.controls.quantity.value);

    const taxIncludedUnitPrice = Number(
      form.controls.tax_included_unit_price.value
    );

    const cost_price = Number(cost_prices);

    const customUnitPrice = Number(form.controls.custom_unit_price.value);
    const amount = customUnitPrice
      ? quantity * customUnitPrice
      : quantity * taxIncludedUnitPrice;

    const total_cost_price = cost_price * quantity;

    form.controls.tax_included_amount.setValue(String(amount));
    form.controls.total_cost_price.setValue(String(total_cost_price));
  }

  /**
   * 初期値の設定
   */
  private _setDefaultValue(form: FormGroup): void {
    //form.controls['unit'].patchValue('個');

    const defaultDeliveryId = this.deliveryDivisionOptions.find(
      (divison) =>
        divison.text == this.corsConst.DELIVERY_DIVISION.VALUE.NO_DELIVERY
    );
    if (defaultDeliveryId !== undefined) {
      form.controls['delivery_division_id'].patchValue(defaultDeliveryId.value);
    }
  }

  /**
   * 登録する明細データの取得
   *
   */
  private _getCustomerOrders() {
    const customerOrderForms = this.customerOrderForms;
    let total_amount_including_tax = null;
    const customer_orders = customerOrderForms.value.forms.map(
      (customer_order: any) => {
        customer_order.status_division_id = this.customerOrderStatusDivisionId;
        customer_order.settle_status_division_id =
          this.customerOrderSettleStatusDivisionId;
        //total_amount_including_tax
        delete customer_order.selectionTypeIsProductId;
        delete customer_order.supplier_name;
        // console.log(this.totalAmountIncludingTax);

        customer_order.cost_price = customer_order.cost_price
          ? Number(customer_order.cost_price)
          : '';
        customer_order.total_cost_price = customer_order.total_cost_price
          ? Number(customer_order.total_cost_price)
          : '';
        customer_order.remarks = customer_order.remarks
          ? customer_order.remarks
          : '';

        if (this.isNotFalseValue(customer_order.custom_name)) {
          customer_order.product_name = customer_order.custom_name;
        }
        if (this.isNotFalseValue(customer_order.custom_unit_price)) {
          customer_order.tax_included_unit_price =
            customer_order.custom_unit_price;
        }

        if (this.totalAmountIncludingTax === undefined) {
          this.totalAmountIncludingTax = Number(
            customer_order.tax_included_amount
          );
          return customer_order;
        }
        this.totalAmountIncludingTax += Number(
          customer_order.tax_included_amount
        );

        return customer_order;
      }
    );

    return [total_amount_including_tax, customer_orders];
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

  clearQuotationDate(): void {
    this.fc.quotation_expiration_date.setValue(''); // 入力を空にする
  }
}
