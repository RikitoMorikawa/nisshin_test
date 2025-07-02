import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
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
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { deliveryConst } from 'src/app/const/delivery.const';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { repairSlipConst } from 'src/app/const/repair-slip-const';
import { repairConst } from 'src/app/const/repair.const';
import { phoneNumberFormatter } from 'src/app/functions/shared-functions';
import { postalCodeFormatter } from 'src/app/functions/shared-functions';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { BasicInformation } from 'src/app/models/basic-information';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { Supplier } from 'src/app/models/supplier';
import { Repair } from 'src/app/models/repair';
import { RepairSlip } from 'src/app/models/repair-slip';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { DivisionService } from 'src/app/services/division.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ProductService } from 'src/app/services/product.service';
import { RepairSlipService } from 'src/app/services/repair-slip.service';
import { RepairService } from 'src/app/services/repair.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private errorService: ErrorService,
    private rsService: RepairSlipService,
    private repairService: RepairService,
    private biService: BasicInformationService,
    private productService: ProductService,
    private divisionService: DivisionService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private fb: FormBuilder,
    private router: Router,
    private common: CommonService,
    private supplierService: SupplierService
  ) {}

  // 選択中の修理受付票
  rs!: RepairSlip;

  // 選択中の修理受付票に紐付く修理
  repairs!: Repair[];

  private subscription = new Subscription();

  errorModalTitle = '修理受付票詳細エラー：' + modalConst.TITLE.HAS_ERROR;

  // barcodeへ渡す値
  barcodeValue!: string;

  // 一覧画面のパス
  listPagePath = '/repair-slip';

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

  // 修理受付票定数
  rsConst = repairSlipConst;

  // 会社基本情報
  basicInformation!: BasicInformation;

  // 連結された会社住所
  companyAddress?: string;

  // ハイフン入り会社電話番号
  companyTel?: string;

  // ハイフン入り会社FAX番号
  companyFax?: string;

  // ハイフン入り会社郵便番号
  companyPostalCode?: string;

  // 修理タイプ選択肢
  repairTypeDivisionOptions!: SelectOption[];

  // 選択中の修理タイプ
  repairTypeName!: string;

  // 配送区分選択肢
  deliveryDivisionOptions!: SelectOption[];

  // 精算ステータス区分選択肢
  settleStatusDivisionOptions!: SelectOption[];

  // ステータス区分選択肢
  statusDivisionOptions!: SelectOption[];

  // 受付票ステータス区分選択肢
  slipStatusDivisionOptions!: SelectOption[];

  // 商品選択肢
  productSuggests!: SelectOption[];

  // 仕入先選択肢
  supplierSuggests!: SelectOption[];

  // 商品
  products!: Product[];
  // 仕入れ先
  suppliers!: Supplier[];

  // 編集中修理個票データ
  editTarget!: Repair;

  // 修理区分(チェックボックス)
  repair_location: boolean[] = [];
  repair_location_value: string[] = [];
  activeform_location_value!: string | null;

  // 修理定数
  repairConst = repairConst;

  // 追加フォーム表示フラグ
  addFormIsOpen = false;

  // 編集フォーム表示フラグ
  editFormIsOpen = false;

  // 商品追加・更新・削除実行時にテーブル下に表示されるローディング用フラグ
  isUpdatingRepairList = false;
  tmpProduct = true;

  errorConst = errorConst;

  // 配送希望が含まれているかどうかのフラグ
  isDeliveryRequested = false;

  private idTypeValidation = [
    Validators.required,
    Validators.pattern(regExConst.NUMERIC_REG_EX),
    Validators.maxLength(11),
  ];

  statusForm = this.fb.group({
    status_division_id: ['', this.idTypeValidation],
  });

  // 商品追加用リアクティブフォームとバリデーションの設定
  addForm = this.fb.group({
    // 修理区分タイプ
    repair_type_division_id: ['', this.idTypeValidation],
    // 研磨枚数
    polishing_number: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 故障状況
    failure_status: ['', [Validators.required, Validators.maxLength(255)]],
    // 研磨または修理対象品名
    api_product_name: [''],
    product_name: ['', [Validators.required, Validators.maxLength(255)]],
    // 商品マスタから商品を取得できる場合商品IDを設定
    product_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    // 仕入先ID
    supplier_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 修理対象商品のメーカー名
    maker_name: ['', [Validators.maxLength(255)]],
    // 修理依頼先
    repair_order_company: ['', Validators.maxLength(255)],
    // お客様予算
    customer_budget: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 備考
    remarks: ['', [Validators.maxLength(255)]],
    // 配送区分
    delivery_division_id: ['', this.idTypeValidation],
    // 持出日
    taking_out_date: ['', [Validators.maxLength(255)]],
    // 入荷予定日
    arrival_expected_date: ['', [Validators.maxLength(255)]],
    // 作業工賃原価
    quote_cost: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 作業工賃売価
    quote_selling_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 自社修理 フラグ　自社修理:1 他社修理:0
    in_house_repairs: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 部品原価
    cost_of_parts: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 入荷日
    arrival_date: ['', [Validators.maxLength(255)]],
    // 引渡し日
    passing_date: ['', [Validators.maxLength(255)]],
    is_in_house_repairs: [false],
    // 税込み価格
    tax_included_quote_selling_price: [''],
  });

  // 修理編集用リアクティブフォームとバリデーションの設定
  editForm = this.fb.group({
    // 修理区分タイプ
    repair_type_division_id: ['', this.idTypeValidation],
    // 研磨枚数
    polishing_number: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
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
    tmp_product_id: [''],
    tmp_product_name: [''],
    product_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    // 仕入先ID
    supplier_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // お客様ご予算
    customer_budget: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 備考
    remarks: ['', [Validators.maxLength(255)]],
    // 配送区分
    delivery_division_id: ['', this.idTypeValidation],
    // 持出日
    taking_out_date: ['', [Validators.maxLength(255)]],
    // 作業工賃原価
    quote_cost: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 作業工賃売価
    quote_selling_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 自社修理 フラグ　自社修理:1 他社修理:0
    in_house_repairs: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 部品原価
    cost_of_parts: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    // 入荷日
    arrival_date: ['', [Validators.maxLength(255)]],
    // 入荷予定日
    arrival_expected_date: ['', [Validators.maxLength(255)]],
    // 引き渡し日
    passing_date: ['', [Validators.maxLength(255)]],
    // 精算区分
    settle_status_division_id: ['', this.idTypeValidation],
    // inq id
    inq_id: [''],
    is_in_house_repairs: [false],
    // 税込み価格
    tax_included_quote_selling_price: [''],
  });

  get statusFc() {
    return this.statusForm.controls;
  }

  get addFc() {
    return this.addForm.controls;
  }

  /**
   * 登録フォームの値を全てリセットする
   * 無限ループにならないようemitEvent: falseを設定
   */
  private resetAddForm() {
    this.addForm.reset(
      {
        // 修理区分タイプ
        repair_type_division_id: '',
        // 研磨枚数
        polishing_number: '',
        // 故障状況
        failure_status: '',
        // 研磨または修理対象品名
        product_name: '',
        // 商品マスタから商品を取得できる場合商品IDを設定
        product_id: '',
        // 仕入先ID
        supplier_id: '',
        // 修理対象商品のメーカー名
        maker_name: '',
        // 修理依頼先
        repair_order_company: '',
        // お客様予算
        customer_budget: '',
        // 備考
        remarks: '',
        // 配送区分
        delivery_division_id: '',
        // 持出日
        taking_out_date: '',
        // 入荷予定日
        arrival_expected_date: '',
        // 作業工賃原価
        quote_cost: '',
        // 作業工賃売価
        quote_selling_price: '',
        // 自社修理フラグ
        in_house_repairs: '',
        // 部品原価
        cost_of_parts: '',
        // 入荷日
        arrival_date: '',
        // 引渡し日
        passing_date: '',
        // 税込み価格
        tax_included_quote_selling_price: '',
      },
      { emitEvent: false }
    );
    const reception_date = new Date(String(this.rs.reception_date));
    reception_date.setDate(reception_date.getDate() + 7);
    this.addFc.arrival_expected_date.patchValue(reception_date.toISOString());
    this.addForm.controls.is_in_house_repairs.patchValue(true);
    this.addForm.controls.in_house_repairs.patchValue('1');
  }

  get editFc() {
    return this.editForm.controls;
  }

  /**
   * 編集フォームの値を全てリセットする
   * 無限ループにならないようemitEvent: falseを設定
   */
  private resetEditForm() {
    this.editForm.reset(
      {
        // 修理区分タイプ
        repair_type_division_id: '',
        // 研磨枚数
        polishing_number: '',
        // 修理状況
        failure_status: '',
        // 修理依頼先
        repair_order_company: '',
        // 修理対象商品のメーカー名
        maker_name: '',
        // 修理対象商品名
        product_name: '',
        // 修理対象商品名
        product_id: '',
        // 仕入先ID
        supplier_id: '',
        // お客様ご予算
        customer_budget: '',
        // 備考
        remarks: '',
        // 配送区分
        delivery_division_id: '',
        // 持出日
        taking_out_date: '',
        // 作業工賃原価
        quote_cost: '',
        // 作業工賃売価
        quote_selling_price: '',
        // 自社修理フラグ
        in_house_repairs: '',
        // 部品原価
        cost_of_parts: '',
        // 入荷日
        arrival_date: '',
        // 入荷予定日
        arrival_expected_date: '',
        // 引き渡し日
        passing_date: '',
        inq_id: '',
        is_in_house_repairs: false,
        // 税込み価格
        tax_included_quote_selling_price: '',
      },
      { emitEvent: false }
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

  ngOnInit(): void {
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

    // barcodeへ渡す値をセット
    this.barcodeValue =
      this.rsConst.CALLED_NUMBER_PREFIX +
      selectedId.toString().padStart(11, '0');

    // 取得したパスパラメータをメンバへセット
    this.editPagePath = this.listPagePath + '/edit/' + selectedId;

    this.addFc.repair_type_division_id.valueChanges.subscribe((type) => {
      const selectedOption = this.repairTypeDivisionOptions.find((x) => {
        return Number(x.value) === Number(type);
      });

      this.repairTypeName = repairConst.REPAIR_TYPE.REPAIR;

      // // 修理タイプによって必須バリデーションを追加する
      // if (this.repairTypeName === repairConst.REPAIR_TYPE.POLISHING) {
      //   // 研磨枚数へ必須バリデーションを追加
      //   this.addFc.polishing_number.addValidators([Validators.required]);
      //   // 故障状況の必須バリデーションを削除
      //   this.addFc.failure_status.removeValidators([Validators.required]);
      //   // バリデータが適用された後、コントロールのバリデーション状態を更新
      //   this.addFc.polishing_number.updateValueAndValidity();
      // } else if (this.repairTypeName === repairConst.REPAIR_TYPE.REPAIR) {
      //   // 故障状況へ必須バリデーションを追加
      this.addFc.failure_status.addValidators([Validators.required]);
      //   // 研磨枚数の必須バリデーションを削除
      this.addFc.polishing_number.removeValidators([Validators.required]);
      //   // バリデータが適用された後、コントロールのバリデーション状態を更新
      this.addFc.failure_status.updateValueAndValidity();
      // }

      this.resetAddForm();
      this.addFc.repair_type_division_id.patchValue(type, { emitEvent: false });
    });

    // 登録フォームで商品マスタから商品が選択された場合品名input要素に商品名を入れる
    //this.addFc.product_id.valueChanges.subscribe((id) => {
    //  const product = this.products.find((x) => x.id === Number(id));
    //  if (product && product.name) {
    //    this.addFc.product_name.patchValue(product.name);
    //  }
    //});

    // 初期化処理実行
    this.initialization(Number(selectedId));
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
   * ステータスを取得する関数
   *
   * @param statusCode - ステータスを指定するためのコード
   * @returns - 引数で指定したステータスを返す
   */
  getStatusValue(statusCode: number) {
    // typeof指定のためローカル変数へ格納
    const rsConst = this.rsConst;
    // STATUSを指定するためのキーを引数を利用して取得
    const statusKey = Object.keys(rsConst.STATUS)[
      statusCode
    ] as keyof typeof rsConst.STATUS;
    return rsConst.STATUS[statusKey];
  }

  /**
   * 修理の配列を受け取り、配送の予定があるかどうかを返す
   * @param repairs
   * @returns - boolean 配送あり: true 配送なし: false
   */
  isDeliveryRequestedRepairs(repairs: Repair[]): boolean {
    return repairs.some(
      (repair) =>
        repair.division_delivery_value ===
        this.rsConst.DELIVERY_DIVISION.VALUE.DELIVERY_INCLUDED
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

    // 修理受付票データと修理受付票表示に必要な付帯データを取得
    this.subscription.add(
      forkJoin([
        this.rsService.find(selectedId),
        this.repairService.getAll({ repair_slip_id: selectedId }),
        this.biService.find(),
        this.productService.getAll({
          $select: 'id,name,product_name',
          limit: 100,
        }),
        this.divisionService.getAll(),
        this.supplierService.getAll({ $select: 'id,name' }),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // エラーレスポンスが変えてきた場合
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
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // レスポンスが配列であり配列の要素が5つあるか
          if (Array.isArray(res) && res.length !== 6) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // 修理受付票データ取得エラーを確認
          const rsResInvalid = ApiResponseIsInvalid(res[0]);
          if (rsResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // 修理受付票に紐付く修理データ取得エラーを確認
          // ただし、紐付く修理データが0件の場合もあるため0件の場合はエラーにしない
          const repairResInvalid =
            res[1].data.length === 0 ? false : ApiResponseIsInvalid(res[1]);
          if (repairResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // 基本情報データ取得エラーを確認
          const biResInvalid = ApiResponseIsInvalid(res[2]);
          if (biResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // 修理受付票を変数へ格納
          this.rs = res[0].data[0];
          // 最終更新者のフルネーム作成
          this.updaterFullName =
            this.rs.employee_updated_last_name +
            ' ' +
            this.rs.employee_updated_first_name;

          this.receptionEmployeeFullName =
            this.rs.employee_reception_last_name +
            ' ' +
            this.rs.employee_reception_first_name;
          this.receptionDate = new Date(
            this.rs.reception_date
          ).toLocaleString();

          // 紐付く修理
          this.repairs = res[1].data;
          if (this.repairs.length > 0) {
            this.isDeliveryRequested = this.isDeliveryRequestedRepairs(
              this.repairs
            );
          }
          // チェックボックス値
          for (let i in this.repairs) {
            if (this.repairs[i].in_house_repairs === 1) {
              this.repair_location.push(true);
            } else {
              this.repair_location.push(false);
            }
          }

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

          // 区分の選択肢作成開始
          // 区分の初期値
          const defaultOption = [{ value: '', text: '選択してください' }];
          // 修理タイプ選択肢
          const repairTypeDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.REPAIR_TYPE;
          });
          const repairTypeDivisionOptions = repairTypeDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          this.repairTypeDivisionOptions = [
            ...defaultOption,
            ...repairTypeDivisionOptions,
          ];
          // 配送区分
          const deliveryDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.DELIVERY_REQUEST;
          });
          const deliveryDivisionOptions = deliveryDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          this.deliveryDivisionOptions = [
            ...defaultOption,
            ...deliveryDivisionOptions,
          ];
          // 精算区分
          const settleStatusDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.SETTLE_STATUS;
          });
          this.settleStatusDivisionOptions = settleStatusDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          // 修理ステータス区分
          const statusDivisions = res[4].data.filter(
            (x) => x.name === divisionConst.REPAIR_STATUS
          );
          this.statusDivisionOptions = statusDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          // 修理受付票ステータス区分
          const slipStatusDivisions = res[4].data.filter((x) => {
            return x.name === divisionConst.REPAIR_SLIP_STATUS;
          });
          // コード順に並び替え
          slipStatusDivisions.sort((a, b) => a.division_code - b.division_code);
          this.slipStatusDivisionOptions = slipStatusDivisions.map((x) => {
            return { value: x.id, text: x.value };
          });
          this.statusForm.reset({
            status_division_id: String(this.rs.status_division_id),
          });
          this._setSupplier(res[5]);
        })
    );
  }

  /**
   * 修理受付票のステータスを更新する
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
      last_name: this.rs.last_name,
      first_name: this.rs.first_name,
      last_name_kana: this.rs.last_name_kana,
      first_name_kana: this.rs.first_name_kana,
      tel: this.rs.tel,
      mobile_number: this.rs.mobile_number,
      reception_date: this.rs.reception_date,
      reception_employee_id: this.rs.reception_employee_id,
      status_division_id: formVal.status_division_id,
      settle_status_division_id: this.rs.settle_status_division_id,
      incident_division_id: this.rs.incident_division_id,
      remarks_1: this.rs.remarks_1,
      remarks_2: this.rs.remarks_2,
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

          // 表示用データを更新する
          this.subscription.add(this.updateSlipInfo().subscribe());

          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        })
    );
  }

  /**
   * 選択中の受付票idで受付票と紐付く修理を取得するObservableを返却する
   * @returns Observable CustomerOrderReceptionSlipService.find(), CustomerOrderService.getAll()
   */
  updateSlipInfo(): Observable<any> {
    this.common.loading = true;
    // Return the Observable directly
    return forkJoin([
      this.rsService.find(this.selectedId),
      this.repairService.getAll({ repair_slip_id: this.selectedId }),
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

        // 修理受付票取得エラーを確認
        const repairSlipResInvalid =
          res[0].data.length === 0 ? false : ApiResponseIsInvalid(res[0]);
        if (repairSlipResInvalid) {
          this.handleError(
            400,
            this.errorModalTitle,
            modalConst.BODY.HAS_ERROR
          );
          return;
        }
        // 取得したデータをメンバへセット
        this.rs = res[0].data[0];

        this.statusForm.reset({
          status_division_id: String(this.rs.status_division_id),
        });
        // 修理受付票に紐付く修理データ取得エラーを確認
        const repairResInvalid =
          res[1].data.length === 0 ? false : ApiResponseIsInvalid(res[1]);
        if (repairResInvalid) {
          this.handleError(
            400,
            this.errorModalTitle,
            modalConst.BODY.HAS_ERROR
          );
          return;
        }
        // 取得したデータをメンバへセット
        this.repairs = res[1].data;
        if (this.repairs.length > 0) {
          this.isDeliveryRequested = this.isDeliveryRequestedRepairs(
            this.repairs
          );
        }
        this.common.loading = false;
      })
    );
  }

  /**
   * 修理対象商品の追加ボタンがクリックされた時の処理
   */
  addFormOpen() {
    this.addFormIsOpen = true;
    this._setHiddenValue();
  }

  /**
   * 修理商品追加フォームのキャンセルボタン対応
   * フォームをリセットする
   */
  addFormCancel() {
    this.addFormIsOpen = false;
    this.resetAddForm();
    this.repairTypeName = '';
  }

  /**
   * 追加フォームを閉じて登録処理を呼び出す
   */
  handleClickRepairAddExecutionButton() {
    // 登録処理を呼び出す
    this.registerOrRenew();
    // 追加フォームを閉じる
    this.addFormIsOpen = false;
  }

  /**
   * 修理対象商品レコードの各行にある編集ボタンがクリックされた時の処理
   */
  editFormOpen(targetItem: Repair, inq: number) {
    let targ_index: number = inq;
    this.editFormIsOpen = true;
    this.common.loading = true;
    this.editTarget = targetItem;
    const selectedOption = this.repairTypeDivisionOptions.find((x) => {
      return (
        Number(x.value) === Number(this.editTarget.repair_type_division_id)
      );
    });
    if (selectedOption) {
      this.repairTypeName = selectedOption.text;
    }
    //this.editForm.controls.product_name.setValue(this.editTarget.product_name);
    //this.editForm.controls.product_name.patchValue(this.editTarget.product_name);
    this._editFormReset(targ_index);
    this.tmpProduct = false;
    if (
      targetItem.product_product_name !== undefined &&
      targetItem.product_product_name !== ''
    ) {
      const product = {
        value: String(targetItem.product_id),
        text: targetItem.product_product_name,
      };
      this.productSuggests.push(product);
      this.tmpProduct = true;
    }
    // console.log('this.editForm Open');
    this.common.loading = false;

    // console.log(this.editForm);
  }

  /**
   * 修理商品編集フォームのキャンセルボタン対応
   * フォームをリセットする
   */
  editFormCancel() {
    this.editTarget = <Repair>{};
    this.editFormIsOpen = false;
    this.resetEditForm();
    this.repairTypeName = '';
  }

  handleClickRepairEditExecutionButton() {
    // 編集フォームを閉じる
    this.editFormIsOpen = false;
    // 更新処理を呼び出す
    this.registerOrRenew();
  }

  registerOrRenew() {
    // テーブル下のローディング開始
    this.common.loading = true;
    // 編集モードの場合のフラグ設定
    const isEditing =
      this.editTarget && Object.keys(this.editTarget).length > 0 ? true : false;

    // ボタンを非活性にする
    if (isEditing) {
      this.editForm.markAsPristine();
    } else {
      this.addForm.markAsPristine();
    }

    // フォームのデータを取得
    let formVal = this.addForm.value;
    if (isEditing) {
      formVal = this.editForm.value;
      if (this.editForm.controls.is_in_house_repairs.value) {
        this.activeform_location_value = '1';
        formVal.quote_cost = '';
      } else {
        this.activeform_location_value = '0';
        formVal.cost_of_parts = '';
      }
    }
    this._formatDate(formVal);

    // 精算ステータス区分取得
    const settleStatusDivision = this.settleStatusDivisionOptions.find((x) => {
      return x.text === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED;
    });

    // ステータス区分取得
    const statusDivision = this.statusDivisionOptions.find((x) => {
      return x.text === this.repairConst.STATUS.BEFORE_REPAIR;
    });

    // フォームの値以外で送信する必要がある項目
    const remainingItemValuesForAddForm = {
      repair_slip_id: this.selectedId,
      settle_status_division_id: settleStatusDivision?.value,
      tax_included_quote_selling_price: formVal.quote_selling_price,
    };
    const remainingItemValuesForEditForm = {
      repair_slip_id: this.selectedId,
      tax_included_quote_selling_price: formVal.quote_selling_price,
    };

    // POSTデータ作成
    const addPostData = { ...formVal, ...remainingItemValuesForAddForm };
    const editPostData = { ...formVal, ...remainingItemValuesForEditForm };

    // 登録または編集のオブザーバブルを作成
    let observable$ = this.repairService.add(addPostData).pipe(
      catchError((error: HttpErrorResponse) => {
        return of(error);
      }),
      finalize(() => this.resetAddForm())
    );
    if (isEditing) {
      observable$ = this.repairService
        .update(this.editTarget.id, editPostData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => {
            // 編集ターゲットを削除
            this.editTarget = <Repair>{};
            this.resetEditForm();
          })
        );
    }
    // 登録または更新処理開始
    this.subscription.add(
      observable$.subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.common.loading = false;
          const title = res.error ? res.error.title : errorConst.ERROR;
          this.handleError(res.status, title, res.error.message);
          return;
        }
        // レスポンスがnull undefinedか
        if (res === null || res === undefined) {
          this.common.loading = false;
          this.handleError(
            400,
            this.errorModalTitle,
            modalConst.BODY.HAS_ERROR
          );
          return;
        }

        // テーブル下のローディング終了
        this.common.loading = false;

        const purpose: FlashMessagePurpose = 'success';
        this.flashMessageService.setFlashMessage(res.message, purpose, 15000);

        // 表示用データを更新する
        this.subscription.add(this.updateSlipInfo().subscribe());
      })
    );
  }

  /**
   * 各レコードで削除ボタンがクリックされた場合の処理
   * @param id 修理ID
   */
  deleteRepair(id: number) {
    // 配送業者に引き渡し済みの場合はエラーモーダルを表示
    if (
      this.rs.division_status_code >
      this.rsConst.STATUS_CODE.DELIVERED_TO_SHIPPING_CARRIER
    ) {
      this.handleError(
        422,
        this.rsConst.ERROR.CANNOT_BE_DELETED,
        this.rsConst.ERROR.ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE
      );
      return;
    }

    // モーダルのタイトル
    const modalTitle = '修理' + modalConst.TITLE.DELETE;
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
            // データ更新前に修理から削除
            this.repairs = this.repairs?.filter((x) => x.id !== id);
            // 更新処理ローディング開始
            this.isUpdatingRepairList = true;
            // 削除実行
            this.repairService
              .remove(id)
              .pipe(
                finalize(() => (this.isUpdatingRepairList = false)),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  const errorTitle: string = res.error
                    ? res.error.title
                    : 'エラーが発生しました。';
                  this.handleError(res.status, errorTitle, res.message);
                  return;
                }
                const flashMessagePurpose: FlashMessagePurpose = 'success';
                this.flashMessageService.setFlashMessage(
                  res.message,
                  flashMessagePurpose,
                  15000
                );
                this.subscription.add(this.updateSlipInfo().subscribe());
              });
          }
        })
    );
  }

  deleteRepairItem(id: number) {
    // 削除実行
    this.repairService
      .remove(id)
      .pipe(
        finalize(() => (this.isUpdatingRepairList = false)),
        catchError((error: HttpErrorResponse) => {
          return of(error);
        })
      )
      .subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          const errorTitle: string = res.error
            ? res.error.title
            : 'エラーが発生しました。';
          this.handleError(res.status, errorTitle, res.message);
          return;
        }
        this.subscription.add(this.updateSlipInfo().subscribe());
      });
  }

  /**
   * 削除リンククリック時の処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = '修理受付票' + modalConst.TITLE.DELETE;
    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'danger';
    let repair_id_lists = [];

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
          ) // 削除モーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 修理受付票_削除処理を購読
            this.rsService
              .remove(this.selectedId)
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
                  const errorTitle: string = res.error
                    ? res.error.title
                    : 'エラーが発生しました。';
                  this.handleError(res.status, errorTitle, res.message);
                  return;
                }

                // Repair 修理個票リスト取得
                if (this.repairs) {
                  /* 紐づく修理個票番号をリストで取得 */
                  repair_id_lists = this.repairs.map((obj) => {
                    return obj.id;
                  });
                  //修理個票_削除処理
                  for (let item of repair_id_lists) {
                    if (!item) {
                      continue;
                    }
                    this.deleteRepairItem(item);
                  }
                }

                const flashMessagePurpose: FlashMessagePurpose = 'success';
                this.flashMessageService.setFlashMessage(
                  res.message,
                  flashMessagePurpose,
                  15000
                );
                this.router.navigateByUrl(this.listPagePath);
              });
          }
        })
    );
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   *
   * 暗黙的に値を設定
   *
   */
  private _setHiddenValue(): void {
    this._setRepairTypeDivision();
    this._setDeliveryDivision();
  }

  /**
   * 修理タイプのセット
   *
   * フォームで入力していた値を
   * 研磨がなくなったので修理を強制的にセット
   *
   */
  private _setRepairTypeDivision(): void {
    if (this.repairTypeDivisionOptions === undefined) {
      return;
    }
    const repairTypeDivisions = this.repairTypeDivisionOptions.find((x) => {
      return x.text === this.repairConst.REPAIR_TYPE.REPAIR;
    });
    if (repairTypeDivisions?.value === undefined) {
      return;
    }
    this.addFc.repair_type_division_id.patchValue(
      String(repairTypeDivisions?.value)
    );
  }

  /**
   * 配送区分のセット
   *
   * フォームで入力していた値を
   * 配送がなくなったので「配送なし」を強制的にセット
   *
   */
  private _setDeliveryDivision(): void {
    if (this.deliveryDivisionOptions === undefined) {
      return;
    }

    const deliveryDivision = this.deliveryDivisionOptions.find((x) => {
      return x.text === this.repairConst.DELIVERY.NO_DELIVERY;
    });
    if (deliveryDivision?.value === undefined) {
      return;
    }

    this.addFc.delivery_division_id.patchValue(String(deliveryDivision?.value));
  }

  private _setSupplier(res: any): void {
    // 仕入れ先選択肢
    this.supplierSuggests = res.data.map((v: any) => {
      const suggests = {
        value: v.id,
        text: v.name,
      };
      return suggests;
    });
    this.suppliers = res.data;
  }

  /**
   *
   * 日付データをデータ登録用に整形
   *
   */
  private _formatDate(formVal: any): void {
    if (formVal.taking_out_date !== '') {
      formVal.taking_out_date = new Date(
        formVal.taking_out_date
      ).toLocaleString();
    }
    if (formVal.arrival_date !== '') {
      formVal.arrival_date = new Date(formVal.arrival_date).toLocaleString();
    }
    if (formVal.arrival_expected_date !== '') {
      formVal.arrival_expected_date = new Date(
        formVal.arrival_expected_date
      ).toLocaleString();
    }
    if (formVal.passing_date !== '') {
      formVal.passing_date = new Date(formVal.passing_date).toLocaleString();
    }
  }

  private _editFormReset(i: number): void {
    let supplierId = '';
    if (String(this.editTarget.supplier_id) != '') {
      supplierId = String(this.editTarget.supplier_id);
    }
    this.tmpProduct = true;

    let is_in_house_repairs: boolean = false;
    this.activeform_location_value = '0';

    if (this.editTarget.in_house_repairs === 1) {
      is_in_house_repairs = true;
      this.activeform_location_value = '1';
    }

    this.editForm.reset(
      {
        // 修理区分タイプ
        repair_type_division_id: String(
          this.editTarget.repair_type_division_id
        ),
        // 研磨枚数
        polishing_number: String(this.editTarget.polishing_number),
        // 修理状況
        failure_status: this.editTarget.failure_status,
        // 修理依頼先
        repair_order_company: this.editTarget.repair_order_company,
        // 修理対象商品のメーカー名
        maker_name: this.editTarget.maker_name,
        // 修理対象商品名
        product_name: this.editTarget.product_name,
        tmp_product_name: this.editTarget.product_name,
        // 修理対象商品id
        product_id: String(this.editTarget.product_id),
        tmp_product_id: String(this.editTarget.product_id),
        // 仕入先ID
        supplier_id: supplierId,
        // お客様ご予算
        customer_budget: String(this.editTarget.customer_budget),
        // 備考
        remarks: this.editTarget.remarks,
        // 配送区分
        delivery_division_id: String(this.editTarget.delivery_division_id),
        // 持出日
        taking_out_date: this.editTarget.taking_out_date,
        // 作業工賃原価
        quote_cost: String(this.editTarget.quote_cost),
        // 部品原価
        cost_of_parts: String(this.editTarget.cost_of_parts),
        // 作業工賃売価
        quote_selling_price: String(this.editTarget.quote_selling_price),
        // 入荷日
        arrival_date: this.editTarget.arrival_date,
        // 入荷予定日
        arrival_expected_date: this.editTarget.arrival_expected_date,
        // 引き渡し日
        passing_date: this.editTarget.passing_date,
        // 精算ステータス区分
        settle_status_division_id: String(
          this.editTarget.settle_status_division_id
        ),
        in_house_repairs: String(this.editTarget.in_house_repairs),
        is_in_house_repairs: is_in_house_repairs,
        inq_id: String(i),
      },
      { emitEvent: false }
    );

    /* 初期値設定*/
    this.editForm.controls.in_house_repairs.patchValue(
      String(this.editTarget.in_house_repairs)
    );
    if (this.editTarget.in_house_repairs === 1) {
      this.editForm.controls.is_in_house_repairs.patchValue(true);
    } else {
      this.editForm.controls.is_in_house_repairs.patchValue(false);
    }
  }

  onClickProduct() {
    this.tmpProduct = !this.tmpProduct;
  }

  handleSelectedProductData(repairProductForm: any, product: Product) {
    //customerOrderForm.tax_included_unit_price.patchValue(product.tax_included_unit_price);
    if (product === undefined) {
      return;
    }
    repairProductForm.product_name.patchValue(product.name);
    //customerOrderForm.controls['product_name'].patchValue(product.name);
  }

  /**
   * 粗利率算出
   */
  grossMarginCalculation(labor_cost: number, repair_location: boolean | null) {
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

  selectRepairLocation(event: any, form: any) {
    if (event.target.checked) {
      form.in_house_repairs.value = 1;
      this.activeform_location_value = '1';
      form.is_in_house_repairs.value = true;
    } else {
      form.in_house_repairs.value = 0;
      this.activeform_location_value = '0';
      form.is_in_house_repairs.value = false;
    }
  }
  handleClickCalcButton() {
    const forms = this.editForm.controls;
    let quote_cost: number = Number(forms['quote_cost'].value);
    let is_in_house_repairs: boolean | null = forms.is_in_house_repairs.value;

    if (is_in_house_repairs === true) {
      let cost_of_parts = forms.cost_of_parts.value
        ? Number(forms.cost_of_parts.value)
        : 0;
      let gross_margin = this.grossMarginCalculation(
        cost_of_parts,
        is_in_house_repairs
      );
      forms.quote_selling_price.patchValue(
        String(this.inHouseSellingPriceCalculation(cost_of_parts, gross_margin))
      );
    } else {
      let gross_margin = this.grossMarginCalculation(
        quote_cost,
        is_in_house_repairs
      );
      forms.quote_selling_price.patchValue(
        String(this.externalSellingPriceCalculation(quote_cost, gross_margin))
      );
    }
  }
}
