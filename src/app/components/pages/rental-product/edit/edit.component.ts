import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subscription,
  catchError,
  debounce,
  debounceTime,
  filter,
  finalize,
  forkJoin,
  of,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { LargeCategory } from 'src/app/models/large-category';
import { MediumCategory } from 'src/app/models/medium-category';
import { RentalProduct } from 'src/app/models/rental-product';
import { SmallCategory } from 'src/app/models/small-category';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { RentalProductService } from 'src/app/services/rental-product.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SmallCategoryService } from 'src/app/services/small-category.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private errorService: ErrorService,
    private fb: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private authorService: AuthorService,
    private storeService: StoreService,
    private divisionService: DivisionService,
    private lcService: LargeCategoryService,
    private mcService: MediumCategoryService,
    private scService: SmallCategoryService,
    private rpService: RentalProductService,
    private flashMessageService: FlashMessageService,
    private activatedRoute: ActivatedRoute,
    private common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // 編集対象商品のID
  selectedId!: number;

  rp!: RentalProduct;

  // 一覧のパス
  listPagePath = '/rental-slip/rental-product';

  // 詳細画面のパス
  detailPagePath!: string;

  // 最終更新者ユーザー名
  lastUpdater!: string;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = 'レンタル商品編集キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = 'レンタル商品編集エラー：' + modalConst.TITLE.HAS_ERROR;

  // 消費税区分選択肢
  salesTaxDivisionOptions!: SelectOption[];

  // 消費税端数区分選択肢
  salesFractionDivisionOptions!: SelectOption[];

  // ステータス区分選択肢
  statusDivisionOptions!: SelectOption[];

  // 商品区分選択肢
  productDivisionOptions!: SelectOption[];

  // 公開区分選択肢
  dataPermissionDivisionOptions!: SelectOption[];

  // 値引区分選択肢
  discountDivisionOptions!: SelectOption[];

  // ポイント区分選択肢
  pointDivisionOptions!: SelectOption[];

  // 配送料金フラグ選択肢
  deliveryChargeFlagOptions: SelectOption[] = [
    { value: 0, text: '設定しない' },
    { value: 1, text: '設定する' },
  ];

  // 大分類サジェスト
  largeCategorySuggests!: SelectOption[];
  // 大分類
  largeCategories!: LargeCategory[];

  // 中分類サジェスト
  mediumCategorySuggests!: SelectOption[];
  // 中分類
  mediumCategories!: MediumCategory[];

  // 小分類サジェスト
  smallCategorySuggests!: SelectOption[];
  // 小分類
  smallCategories!: SmallCategory[];

  // 店舗選択肢
  storeSuggests!: SelectOption[];

  // エラー文言
  errorConst = errorConst;

  // 消費税区分の値を保持
  tempSalesTaxDivisionId!: string;

  // 原価計算が可能かどうかのエラーメッセージ
  notAbleToCalcMessage: string | null = null;

  // フォーム
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    name_kana: [
      '',
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    store_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    product_barcode: ['', [Validators.required, Validators.maxLength(14)]],
    barcode: ['', [Validators.required, Validators.maxLength(14)]],
    standard: ['', [Validators.maxLength(255)]],
    cost_price: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
    sales_tax_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    sales_fraction_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    gross_profit_rate: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
    selling_price: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(1),
      ],
    ],
    delivery_charge: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
        Validators.min(0),
      ],
    ],
    status_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    product_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    data_permission_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    delivery_charge_flag: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    discount_division_id: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(11),
      ],
    ],
    point_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    large_category_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    medium_category_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    small_category_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    image: null,
    image_path: ['', [Validators.maxLength(255)]],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
    remarks_3: ['', [Validators.maxLength(255)]],
    remarks_4: ['', [Validators.maxLength(255)]],
  });

  get fc() {
    return this.form.controls;
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
   * コンポーネントの初期化処理
   * @returns
   */
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
        this.detailPagePath
      );
      return;
    }

    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);
    this.detailPagePath = this.listPagePath + '/detail/' + selectedId;

    // 粗利率の変更を購読
    this.subscription.add(
      this.fc.gross_profit_rate.valueChanges.subscribe(() =>
        this.isAbleToCalc()
      )
    );

    // 売価の変更を購読
    this.subscription.add(
      this.fc.selling_price.valueChanges.subscribe(() => this.isAbleToCalc())
    );

    // 消費税区分の変更を購読
    this.subscription.add(
      this.fc.sales_tax_division_id.valueChanges.subscribe((value) => {
        if (value) {
          this.tempSalesTaxDivisionId = value;
        }
        // 売価をリセット（再計算のし忘れがないように）
        this.fc.cost_price.setValue('', { emitEvent: false });
      })
    );

    // 大分類の変更を購読
    this.subscription.add(
      this.fc.large_category_id.valueChanges.subscribe((res) => {
        if (this.rp) {
          this.largeCategoryChangesDependencyResolution(Number(res));
        }
      })
    );

    // 中分類の変更を購読
    this.subscription.add(
      this.fc.medium_category_id.valueChanges.subscribe((res) => {
        if (this.rp) {
          this.mediumCategoryChangesDependencyResolution(Number(res));
        }
      })
    );

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
   * 原価を計算ボタンが押された場合の処理
   * @returns
   */
  handleClickCalcButton() {
    // 粗利率の値チェック
    if (this.fc.gross_profit_rate.value === null) {
      return;
    } else {
      if (isNaN(Number(this.fc.gross_profit_rate.value))) {
        return;
      }
    }
    // 粗利率が100％以上だった場合、原価を0にする
    if (Number(this.fc.gross_profit_rate.value) >= 100) {
      this.fc.cost_price.patchValue('0', { emitEvent: false });
      return;
    }

    // 売価の値チェック
    if (this.fc.selling_price.value === null) {
      return;
    } else {
      if (isNaN(Number(this.fc.selling_price.value))) {
        return;
      }
    }
    // 消費税区分IDを計算用に変換
    let salesTaxDivisionCalc; // 消費税区分の計算用変数
    // フォームの値（String）で初期化していて、APIからはNumberで入ってくるのでキャストしないと初期値のまま計算できない
    if (
      Number(this.tempSalesTaxDivisionId) === 28 || // 外税10%
      Number(this.tempSalesTaxDivisionId) === 30 || // 非課税
      Number(this.tempSalesTaxDivisionId) === 31 // 外税8%
    ) {
      salesTaxDivisionCalc = 1;
    } else if (Number(this.tempSalesTaxDivisionId) === 29) {
      // 内税10%
      salesTaxDivisionCalc = 1.1;
    } else if (Number(this.tempSalesTaxDivisionId) === 32) {
      // 内税8%
      salesTaxDivisionCalc = 1.08;
    } else {
      return;
    }
    // 原価 = (売価/消費税区分の税率)*(1-粗利率)
    const costPrice =
      (Number(this.fc.selling_price.value) / salesTaxDivisionCalc) *
      (1 - Number(this.fc.gross_profit_rate.value) * 0.01);
    // テーブルでの定義がintなので、小数点以下一桁で四捨五入
    this.fc.cost_price.patchValue(costPrice.toFixed(0), { emitEvent: false });
  }

  /**
   * 「値をクリア」ボタンが押された場合の処理
   * 値をクリアしたあと、注意惹起にエラーメッセージを表示するためにtouchedにする
   * （必須のエラーが表示される）
   */
  handleClickClearValueButton() {
    this.fc.cost_price.setValue('');
    this.fc.cost_price.markAllAsTouched();
    this.fc.gross_profit_rate.reset('');
    this.fc.gross_profit_rate.markAllAsTouched();
    this.fc.selling_price.reset('');
    this.fc.selling_price.markAllAsTouched();
  }

  /**
   * 原価計算が可能かどうか判定し、エラーメッセージを設定する
   * @returns
   */
  isAbleToCalc() {
    if (
      this.fc.gross_profit_rate.value === '' &&
      this.fc.selling_price.value === ''
    ) {
      this.notAbleToCalcMessage =
        '粗利と売価が空白です。値を入力してください。';
    } else if (this.fc.gross_profit_rate.value === '') {
      this.notAbleToCalcMessage = '粗利が空白です。値を入力してください。';
    } else if (this.fc.selling_price.value === '') {
      this.notAbleToCalcMessage = '売価が空白です。値を入力してください。';
    } else {
      this.notAbleToCalcMessage = null;
    }
  }

  /**
   * 大分類が変更された場合に中分類・小分類の値を初期化し中分類の選択肢を再生成する
   * @param largeCategoryId - 大分類ID
   */
  private largeCategoryChangesDependencyResolution(largeCategoryId: number) {
    if (Number.isNaN(largeCategoryId)) {
      alert(
        '選択した大分類の取得に失敗しました。画面の再読み込みが必要な可能性があります。'
      );
      return;
    }
    // 中分類の値をリセット
    this.fc.medium_category_id.reset('');
    // 小分類の値をリセット
    this.fc.small_category_id.reset('');
    // 選択された大分類に紐付く中分類を抽出し中分類選択肢へセット
    this.mediumCategorySuggests = this.mediumCategories.flatMap(
      (x: MediumCategory) => {
        if (x.large_category_id === largeCategoryId) {
          return [{ text: x.name, value: x.id }];
        }
        return [];
      }
    );
  }

  /**
   * 中分類が変更された場合に小分類の値を初期化し小分類の選択肢を再生成する
   * @param mediumCategoryId - 中分類ID
   */
  private mediumCategoryChangesDependencyResolution(mediumCategoryId: number) {
    if (Number.isNaN(mediumCategoryId)) {
      alert(
        '選択した大分類の取得に失敗しました。画面の再読み込みが必要な可能性があります。'
      );
      return;
    }
    // 小分類の値をリセット
    this.fc.small_category_id.reset('');
    // 選択された中分類に紐付く小分類を抽出し小分類選択肢へセット
    this.smallCategorySuggests = this.smallCategories.flatMap(
      (x: SmallCategory) => {
        if (x.medium_category_id === mediumCategoryId) {
          return [{ text: x.name, value: x.id }];
        }
        return [];
      }
    );
  }

  /**
   * 初期化処理
   */
  private initialization(productId: number) {
    // ローディング開始
    this.common.loading = true;

    // 選択肢作成
    this.subscription.add(
      forkJoin([
        this.storeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.lcService.getAll(),
        this.mcService.getAll(),
        this.scService.getAll(),
        this.rpService.find(productId),
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
          if (res.length !== 6) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // 店舗選択肢をセット
          this.storeSuggests = res[0];

          // 全ての区分を取得
          const divisionsRes: Record<string, SelectOption[]> = res[1];
          /* 全ての区分の選択肢をセット */
          // 消費税区分選択肢をセット
          this.salesTaxDivisionOptions = divisionsRes[divisionConst.SALES_TAX];
          // 消費税端数区分選択肢をセット
          this.salesFractionDivisionOptions =
            divisionsRes[divisionConst.MAIN_SALES_TAX_FRACTION];
          // 値引区分選択肢をセット
          this.discountDivisionOptions = divisionsRes[divisionConst.DISCOUNT];
          // ポイント区分選択肢をセット
          this.pointDivisionOptions = divisionsRes[divisionConst.POINT];
          // ステータス区分選択肢をセット
          this.statusDivisionOptions =
            divisionsRes[divisionConst.RENTAL_PRODUCT_STATUS];
          // 商品区分選択肢をセット
          this.productDivisionOptions = divisionsRes[divisionConst.PRODUCT];
          // 公開区分選択肢をセット
          this.dataPermissionDivisionOptions =
            divisionsRes[divisionConst.DATA_PERMISSION];

          // 大分類選択肢をセット
          this.largeCategorySuggests = res[2].data.map((x: LargeCategory) => {
            return { text: x.name, value: x.id };
          });
          // 大分類を保持
          this.largeCategories = res[2].data;
          // 中分類を保持
          this.mediumCategories = res[3].data;
          // 小分類を保持
          this.smallCategories = res[4].data;

          // 選択中のレンタル商品を取得
          const rp = res[5].data[0];

          // 最終更新者をセット
          this.lastUpdater =
            rp.employee_updated_last_name +
            ' ' +
            rp.employee_updated_first_name;

          // 大分類をセット
          this.fc.large_category_id.patchValue(String(rp.large_category_id), {
            emitEvent: false,
          });
          // 大分類の変更を通知
          this.largeCategoryChangesDependencyResolution(rp.large_category_id);
          // 中分類をセット
          this.fc.medium_category_id.patchValue(String(rp.medium_category_id), {
            emitEvent: false,
          });
          // 中分類の変更を通知
          this.mediumCategoryChangesDependencyResolution(rp.medium_category_id);
          // 小分類をセット
          this.fc.small_category_id.patchValue(String(rp.small_category_id), {
            emitEvent: false,
          });

          console.log(rp);
          // 選択中のレンタル商品の値でフォームを更新
          this.form.patchValue({
            name: rp.name,
            name_kana: rp.name_kana,
            store_id: rp.store_id,
            product_barcode: rp.product_barcode,
            barcode: rp.barcode,
            standard: rp.standard,
            cost_price: rp.cost_price,
            sales_tax_division_id: rp.sales_tax_division_id,
            sales_fraction_division_id: rp.sales_fraction_division_id,
            gross_profit_rate: rp.gross_profit_rate,
            selling_price: rp.selling_price,
            delivery_charge: rp.delivery_charge,
            status_division_id: rp.status_division_id,
            product_division_id: rp.product_division_id,
            data_permission_division_id: rp.data_permission_division_id,
            delivery_charge_flag: rp.delivery_charge_flag,
            discount_division_id: rp.discount_division_id,
            point_division_id: rp.point_division_id,
            image_path: rp.image_path,
            remarks_1: rp.remarks_1,
            remarks_2: rp.remarks_2,
            remarks_3: rp.remarks_3,
            remarks_4: rp.remarks_4,
          });
          // ここで個別に入れないと、APIから取得した値が格納されない…
          this.form.controls.cost_price.setValue(rp.cost_price);

          this.rp = res[5].data[0];
          this.fc.store_id.patchValue(String(rp.store_id));
          // 消費税区分の値を一時的に保持
          if (this.fc.sales_tax_division_id.value) {
            this.tempSalesTaxDivisionId = this.fc.sales_tax_division_id.value;
          }
        })
    );
  }

  /**
   * キャンセルボタンが押された場合の処理
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
   * 更新処理
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.form.markAsPristine();

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.form.value;

    // ポストデータ作成
    const postData: { [key: string]: string | null | undefined } = {
      name: formVal.name,
      name_kana: formVal.name_kana,
      store_id: formVal.store_id,
      product_barcode: formVal.product_barcode,
      barcode: formVal.barcode,
      standard: formVal.standard,
      cost_price: formVal.cost_price,
      sales_tax_division_id: formVal.sales_tax_division_id,
      sales_fraction_division_id: formVal.sales_fraction_division_id,
      gross_profit_rate: formVal.gross_profit_rate,
      selling_price: formVal.selling_price,
      delivery_charge: formVal.delivery_charge,
      status_division_id: formVal.status_division_id,
      product_division_id: formVal.product_division_id,
      data_permission_division_id: formVal.data_permission_division_id,
      delivery_charge_flag: formVal.delivery_charge_flag,
      discount_division_id: formVal.discount_division_id,
      point_division_id: formVal.point_division_id,
      large_category_id: formVal.large_category_id,
      medium_category_id: formVal.medium_category_id,
      small_category_id: formVal.small_category_id,
      image: formVal.image,
      image_path: formVal.image_path,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
      remarks_3: formVal.remarks_3,
      remarks_4: formVal.remarks_4,
    };

    // 配送料金の時は他の金額は0にする
    if (formVal.delivery_charge_flag) {
      postData['cost_price'] = '0';
      postData['gross_profit_rate'] = '0';
      postData['selling_price'] = '0';
      postData['delivery_charge'] = '0';
    }

    // 更新処理
    this.subscription.add(
      this.rpService
        .update(this.selectedId, postData)
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
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.detailPagePath);
        })
    );
  }

  /**
   * クリアボタンが押された場合の処理
   */
  handleClickClearButton() {
    // ページを再読み込み
    window.location.reload();
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  private handleError(
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

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
