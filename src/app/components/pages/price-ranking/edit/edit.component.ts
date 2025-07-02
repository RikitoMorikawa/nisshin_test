import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subscription,
  catchError,
  distinctUntilChanged,
  filter,
  forkJoin,
  of,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { PriceService } from 'src/app/services/shared/price.service';
import {
  RoundingMethod,
  calculatePrice,
  getFractionMethod,
  getTaxRateAndTaxIncludedFlag,
  isParameterInvalid,
  roundPrice,
} from 'src/app/functions/shared-functions';
import { Employee } from 'src/app/models/employee';
import { PriceRanking } from 'src/app/models/price_ranking';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PriceRankingService } from 'src/app/services/price-ranking.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { StoreService } from 'src/app/services/store.service';
import { CommonService } from 'src/app/services/shared/common.service';

interface PriceData {
  price: FormControl<string | null>;
  cost: FormControl<string | null>;
  rate: FormControl<string | null>;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private priceRankingService: PriceRankingService,
    private storeService: StoreService,
    private divisionService: DivisionService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authorService: AuthorService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    public common: CommonService,
    private priceService: PriceService
  ) {}

  // 購読を格納
  private subscription = new Subscription();

  // 登録者
  updater!: string;

  // ログイン中ユーザー
  author!: Employee;

  // 選択されたランク価格ID
  selectedId!: number;

  // ランク価格オブジェクト
  priceRanking!: PriceRanking;

  // 一覧ページのパス
  listPagePath = '/setting/price-ranking';

  // 詳細ページのパス
  detailPagePath!: string;

  // 設定一覧のパス
  settingMenuPath = '/setting';

  // キャンセルのモーダルのタイトル
  cancelModalTitle = 'ランク価格編集キャンセル：' + modalConst.TITLE.CANCEL;

  // 店舗選択肢
  storeOptions!: SelectOption[];

  // ランク価格区分選択肢
  priceRankingDivisionOptions!: SelectOption[];

  // 消費税区分選択肢
  salesTaxDivisionOptions!: SelectOption[];

  // 消費税端数区分選択肢
  salesFractionDivisionOptions!: SelectOption[];

  // 仕入先消費税区分選択肢
  supplierSalesTaxDivisionOptions!: SelectOption[];

  // 仕入先販売端数区分選択肢
  supplierSalesFractionDivisionOptions!: SelectOption[];

  // 消費税区分
  salesTaxDivisionId!: number;

  // 消費税端数区分
  salesFractionDivisionId!: number;

  // 仕入先消費税区分
  supplierSalesTaxDivisionId!: number;

  // 仕入先消費税端数区分
  supplierSalesTaxFractionDivisionId!: number;

  // 仕入先消費税端数区分
  supplierTaxFractionMethod!: RoundingMethod;

  // 消費税端数区分
  taxFractionMethod!: RoundingMethod;

  // 仕入先消費税率と税込・税抜のフラグ
  supplierTaxRateAndTaxIncludedFlag!: {
    taxRate: number;
    isTaxIncluded: boolean;
  };

  // 消費税率と税込・税抜のフラグ
  taxRateAndTaxIncludedFlag!: {
    taxRate: number;
    isTaxIncluded: boolean;
  };

  // エラー定数
  errorConst = errorConst;

  // 正規表現定数
  regExConst = regExConst;

  // 商品が選択されているかどうか
  isProductSelected = false;

  // フォーム周りの変数
  form = this.fb.group({
    rank_division_id: ['', [Validators.required]],
    store_id: ['', Validators.required],
    supplier_cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_supplier_cost_price: [''],
    c_supplier_cost_price: [''],
    gross_profit_rate: [''],
    b_gross_profit_rate: [''],
    c_gross_profit_rate: [''],
    selling_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_selling_price: [''],
    c_selling_price: [''],
  });

  // フォームコントロールのゲッター
  get fc() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // ログイン中ユーザーを取得して登録者に格納
    if (this.authorService.author) {
      this.author = this.authorService.author;
      this.updater = this.author.last_name + ' ' + this.author.first_name;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          this.updater = this.author.last_name + ' ' + this.author.first_name;
        })
      );
    }

    // 購読を格納
    this.subscription.add(
      // キャンセルのモーダルを購読
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // 実行確認のモーダルじゃなければスルー
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    // ランク価格IDを取得
    const selectedId = this.route.snapshot.params['id'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);

    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        'パラメータ取得エラー',
        'パスパラメータが取得できませんでした。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }
    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);

    // 詳細ページのパスをセット
    this.detailPagePath = this.listPagePath + '/detail/' + this.selectedId;

    // 初期化処理
    this.initialization(this.selectedId);

    // 価格データの変更を監視
    this.handleChangePriceData();
  }

  /**
   * フォームの状態管理
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
   * 初期化処理
   */
  initialization(id: number) {
    this.common.loading = true;

    this.subscription.add(
      forkJoin([
        this.storeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.priceRankingService.find(id),
      ])
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.common.loading = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました。';
            this.handleError(res.status, title, message, this.detailPagePath);
            return;
          }

          // 取得した店舗選択肢をセット
          const storeOptions = res[0];
          this.storeOptions = [
            { value: '', text: '選択してください' },
            ...storeOptions,
          ];

          // 取得した消費税区分選択肢をセット
          const salesTaxDivisionOptions = res[1]['商品消費税区分'];
          this.salesTaxDivisionOptions = [
            { value: '', text: '選択してください' },
            ...salesTaxDivisionOptions,
          ];

          // 取得した消費税端数区分選択肢をセット
          const salesTaxFractionDivisionOptions = res[1]['消費税端数区分'];
          this.salesFractionDivisionOptions = [
            { value: '', text: '選択してください' },
            ...salesTaxFractionDivisionOptions,
          ];

          // 取得した仕入先消費税区分選択肢をセット
          const supplierSalesTaxDivisionOptions = res[1]['仕入先消費税区分'];
          this.supplierSalesTaxDivisionOptions = [
            { value: '', text: '選択してください' },
            ...supplierSalesTaxDivisionOptions,
          ];

          // 取得した仕入先販売端数区分選択肢をセット
          const supplierSalesFractionDivisionOptions = res[1]['販売端数区分'];
          this.supplierSalesFractionDivisionOptions = [
            { value: '', text: '選択してください' },
            ...supplierSalesFractionDivisionOptions,
          ];

          // 取得したランク価格区分選択肢をセット
          const priceRankingDivisionOptions =
            res[1][divisionConst.PRICE_RANKING];
          this.priceRankingDivisionOptions = [
            { value: '', text: '選択してください' },
            ...priceRankingDivisionOptions,
          ];

          // 取得したランク価格オブジェクトをセット
          this.priceRanking = res[2].data[0];

          // 消費財区分・端数区分をセット
          this.salesTaxDivisionId = this.priceRanking.sales_tax_division_id;
          this.salesFractionDivisionId =
            this.priceRanking.sales_fraction_division_id;
          this.supplierSalesTaxDivisionId =
            this.priceRanking.supplier_sales_tax_division_id;
          this.supplierSalesTaxFractionDivisionId =
            this.priceRanking.supplier_sales_fraction_division_id;

          // 仕入先消費税端数区分
          this.supplierTaxFractionMethod = getFractionMethod(
            Number(this.priceRanking.division_supplier_sales_fraction_code)
          );
          // 消費税端数区分
          this.taxFractionMethod = getFractionMethod(
            Number(this.priceRanking.division_sales_fraction_code)
          );

          // 仕入先消費税区分コードから税率と税込・税抜のフラグを生成
          this.supplierTaxRateAndTaxIncludedFlag = getTaxRateAndTaxIncludedFlag(
            Number(this.priceRanking.division_supplier_sales_tax_code)
          );

          // 消費税区分コードから税率と税込・税抜のフラグを生成
          this.taxRateAndTaxIncludedFlag = getTaxRateAndTaxIncludedFlag(
            Number(this.priceRanking.division_sales_tax_code)
          );

          // フォームの値をセット
          this.form.reset(this.priceRanking as object, { emitEvent: false });

          // ローディング終了
          this.common.loading = false;
        })
    );
  }

  /**
   * 価格データを取得
   * @returns
   */
  private getPriceData() {
    return [
      {
        price: this.fc.selling_price,
        cost: this.fc.supplier_cost_price,
        rate: this.fc.gross_profit_rate,
      },
      {
        price: this.fc.b_selling_price,
        cost: this.fc.b_supplier_cost_price,
        rate: this.fc.b_gross_profit_rate,
      },
      {
        price: this.fc.c_selling_price,
        cost: this.fc.c_supplier_cost_price,
        rate: this.fc.c_gross_profit_rate,
      },
    ];
  }

  /**
   * 値がnullまたはundefinedまたは空文字または0かどうかを判定
   * @param value
   * @returns
   */
  private isNullOrUndefinedOrEmpty(value: any): boolean {
    return (
      value === null || value === undefined || value === '' || value === '0'
    );
  }

  /**
   * 仕入単価の税込・税抜金額を算出
   * @param cost
   * @returns
   */
  private getCostPrices(cost: string | null) {
    // 仕入単価の税込・税抜金額を算出
    const costPrices = calculatePrice(
      Number(cost),
      this.supplierTaxRateAndTaxIncludedFlag.taxRate,
      this.supplierTaxRateAndTaxIncludedFlag.isTaxIncluded,
      this.supplierTaxFractionMethod
    );
    return costPrices;
  }

  /**
   * 税抜売価から税込売価を算出
   * @param sellingPrice 税抜売価
   */
  private getSellingPrices(
    sellingPriceWithoutTax: number,
    isTaxIncluded: boolean
  ) {
    // 税抜売価から税込売価を算出
    const sellingPrices = calculatePrice(
      sellingPriceWithoutTax,
      this.taxRateAndTaxIncludedFlag.taxRate,
      isTaxIncluded,
      this.taxFractionMethod
    );
    return sellingPrices;
  }

  /**
   * 仕入単価の変更を購読
   * @param priceData
   */
  private subscribeCostChanges(priceData: PriceData) {
    const costValueChanges = priceData.cost.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((cost) => {
        this.handleCostChanges(cost, priceData);
      });
    this.subscription.add(costValueChanges);
  }

  /**
   * 仕入単価の変更をハンドリングするロジック
   * @param cost
   * @param priceData
   */
  private handleCostChanges(cost: string | null, priceData: PriceData) {
    // 仕入単価が入力されていない場合
    if (this.isNullOrUndefinedOrEmpty(cost)) {
      // 粗利率と売価を空にする
      priceData.rate.patchValue('', { emitEvent: false });
      priceData.price.patchValue('', { emitEvent: false });
      // バラの売価の場合のみエラーをセット
      if (priceData.price === this.fc.selling_price) {
        priceData.price.setErrors({ required: true });
        this.fc.selling_price.markAsTouched();
      }
      return;
    }

    // 粗利率が入力されている場合売価を計算する
    if (!this.isNullOrUndefinedOrEmpty(priceData.rate.value)) {
      // 仕入単価の税込・税抜金額を算出
      // const costPrices = this.getCostPrices(cost);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (costPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     'ランク価格エラー',
      //     costPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }
      // // 粗利率を小数に変換
      // const profit = Number(priceData.rate.value) / 100;
      // // 税抜仕入単価と粗利率から税抜売価を算出
      // const sellingPrice = costPrices.priceWithoutTax / (1 - profit);

      // // 税抜売価から税込売価を算出
      // const sellingPrices = this.getSellingPrices(sellingPrice, false);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (sellingPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     'ランク価格エラー',
      //     sellingPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }
      const costPrice: number = Number(priceData.cost.value);
      const grossProfitRate: number = Number(priceData.rate.value);
      const taxCode: number = Number(this.priceRanking.division_sales_tax_code);
      const sellingPrices: number = this.priceService.getSalesPrice(
        costPrice,
        grossProfitRate,
        taxCode
      );
      // 売価をフォームにセット
      priceData.price.patchValue(String(sellingPrices), { emitEvent: false });
    }
  }

  /**
   * 粗利率の変更を購読
   * @param priceData
   */
  private subscribeRateChanges(priceData: PriceData) {
    const rateValueChanges = priceData.rate.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((rate) => {
        this.handleRateChanges(rate, priceData);
      });
    this.subscription.add(rateValueChanges);
  }

  /**
   * 粗利率の変更をハンドリングするロジック
   * @param rate
   * @param priceData
   * @returns
   */
  private handleRateChanges(rate: string | null, priceData: PriceData) {
    // 粗利率が入力されていない場合
    if (this.isNullOrUndefinedOrEmpty(rate)) {
      // 売価を空にする
      priceData.price.patchValue('', { emitEvent: false });
      // バラの売価の場合のみエラーをセット
      if (priceData.price === this.fc.selling_price) {
        priceData.price.setErrors({ required: true });
        this.fc.selling_price.markAsTouched();
      }
      return;
    }
    // 粗利率が0~99の範囲外の場合
    if (Number(rate) > 99 || Number(rate) < 0) {
      priceData.rate.patchValue('', { emitEvent: false });
      priceData.rate.setErrors(['required']);
      return;
    }
    // 仕入単価が入力されている場合売価を計算する
    if (!this.isNullOrUndefinedOrEmpty(priceData.cost.value)) {
      // 仕入単価の税込・税抜金額を算出
      // const costPrices = this.getCostPrices(priceData.cost.value);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (costPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     'ランク価格エラー',
      //     costPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }
      // // 粗利率を小数に変換
      // const profit = Number(rate) / 100;
      // // 税抜仕入単価と粗利率から税抜売価を算出
      // const sellingPrice = costPrices.priceWithoutTax / (1 - profit);
      // // 税抜売価から税込売価を算出
      // const sellingPrices = this.getSellingPrices(sellingPrice, false);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (sellingPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     'ランク価格エラー',
      //     sellingPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }
      const costPrice: number = Number(priceData.cost.value);
      const grossProfitRate: number = Number(priceData.rate.value);
      const taxCode: number = Number(this.priceRanking.division_sales_tax_code);
      const sellingPrices: number = this.priceService.getSalesPrice(
        costPrice,
        grossProfitRate,
        taxCode
      );
      // 売価をフォームにセット
      priceData.price.patchValue(String(sellingPrices), { emitEvent: false });
    }
  }

  /**
   * 売価の変更を購読
   * @param priceData
   */
  private subscribePriceChanges(priceData: PriceData) {
    const priceValueChanges = priceData.price.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((price) => {
        this.handlePriceChanges(price, priceData);
      });
    this.subscription.add(priceValueChanges);
  }

  private handlePriceChanges(price: string | null, priceData: PriceData) {
    // 売価の変更をハンドリングするロジック
    // 売価が入力されていない場合
    if (this.isNullOrUndefinedOrEmpty(price)) {
      // 粗利率を空にする
      priceData.rate.patchValue('', { emitEvent: false });
      return;
    }
    const roundedPrice = roundPrice(Number(price));
    priceData.price.patchValue(String(roundedPrice), { emitEvent: false });

    // 仕入先単価が入力されている場合粗利率を計算する
    if (!this.isNullOrUndefinedOrEmpty(priceData.cost.value)) {
      // 仕入単価の税込・税抜金額を算出
      // const costPrices = this.getCostPrices(priceData.cost.value);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (costPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     'ランク価格エラー',
      //     costPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }

      // // 税込売価から税込売価を算出
      // const sellingPrices = this.getSellingPrices(roundedPrice, true);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (sellingPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     'ランク価格エラー',
      //     sellingPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }

      // // 粗利率 = (売価 - 仕入単価) / 売価 × 100%
      // const profit =
      //   ((sellingPrices.priceWithoutTax - costPrices.priceWithoutTax) /
      //     sellingPrices.priceWithoutTax) *
      //   100;

      // // 粗利率が0~99の範囲外の場合
      // if (profit > 99 || profit < 0) {
      //   priceData.rate.patchValue('', { emitEvent: false });
      //   return;
      // }
      const costPrice: number = Number(priceData.cost.value);
      const salesPrice: number = Number(priceData.price.value);
      const taxCode: number = Number(this.priceRanking.division_sales_tax_code);
      const grossProfitRate: number = this.priceService.getGrossProfitRate(
        costPrice,
        salesPrice,
        taxCode
      );

      // 粗利率をフォームにセット
      priceData.rate.patchValue(String(Math.round(grossProfitRate)), {
        emitEvent: false,
      });
    }
  }

  /**
   * フォームの変更を監視する
   */
  handleChangePriceData() {
    // 価格の入力に応じた粗利率の変更
    const priceData = this.getPriceData();
    // 入力の変更を購読する処理を作成
    priceData.forEach((x: PriceData) => {
      this.subscribeCostChanges(x);
      this.subscribeRateChanges(x);
      this.subscribePriceChanges(x);
    });
  }

  /**
   * キャンセル処理
   */
  handleClickCancelLink() {
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
   * リセット処理
   */
  handleClickResetButton() {
    this.form.reset(this.priceRanking as object, { emitEvent: false });
  }

  handleClickSaveButton() {
    const formValue = this.form.value;
    // フォームにない必須項目を追加
    // 必須項目がない場合はデフォルト値として区分の最初の値をセット
    const postData = {
      ...formValue,
      product_id: this.priceRanking.product_id,
      sales_tax_division_id: this.salesTaxDivisionId
        ? this.salesTaxDivisionId
        : this.salesTaxDivisionOptions[1].value,
      sales_fraction_division_id: this.salesFractionDivisionId
        ? this.salesFractionDivisionId
        : this.salesFractionDivisionOptions[1].value,
      supplier_sales_tax_division_id: this.supplierSalesTaxDivisionId
        ? this.supplierSalesTaxDivisionId
        : this.supplierSalesTaxDivisionOptions[1].value,
      supplier_sales_fraction_division_id: this
        .supplierSalesTaxFractionDivisionId
        ? this.supplierSalesTaxFractionDivisionId
        : this.supplierSalesFractionDivisionOptions[1].value,
    };
    this.common.loading = true;
    this.subscription.add(
      this.priceRankingService
        .update(this.selectedId, postData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.common.loading = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました。';
            this.handleError(res.status, title, message, this.detailPagePath);
            return;
          }
          this.common.loading = false;
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.detailPagePath);
        })
    );
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
    redirectPath: string
  ) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title
        ? 'ランク価格エラー：' + title + ' ' + modalConst.TITLE.HAS_ERROR
        : 'ランク価格エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * コンポーネント破棄時の処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
