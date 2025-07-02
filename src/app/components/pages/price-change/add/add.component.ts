import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subscription,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
} from 'rxjs';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { PriceService } from 'src/app/services/shared/price.service';
import {
  RoundingMethod,
  calculatePrice,
  getFractionMethod,
  getTaxRateAndTaxIncludedFlag,
  roundPrice,
} from 'src/app/functions/shared-functions';
import { Employee } from 'src/app/models/employee';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PriceChangeService } from 'src/app/services/price-change.service';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { CommonService } from 'src/app/services/shared/common.service';

interface PriceData {
  price: FormControl<string | null>;
  cost: FormControl<string | null>;
  rate: FormControl<string | null>;
}

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private priceChangeService: PriceChangeService,
    private authorService: AuthorService,
    private supplierService: SupplierService,
    private errorService: ErrorService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private priceService: PriceService,
    public common: CommonService
  ) {}

  subscription = new Subscription();

  // 登録者
  updater!: string;

  // ログイン中ユーザー
  author!: Employee;

  // 一覧ページのパス
  listPagePath = '/setting/price-change';

  // 設定一覧のパス
  settingMenuPath = '/setting';

  cancelModalTitle = '価格変更登録キャンセル：' + modalConst.TITLE.CANCEL;

  // 価格変更対象商品
  targetProduct!: Product;

  // 価格変更対象商品選択中フラグ
  isDuringProductSelection = false;

  // 仕入先消費税端数区分
  supplierTaxFractionMethod!: RoundingMethod;

  // 消費税端数区分
  taxFractionMethod!: RoundingMethod;

  supplierTaxRateAndTaxIncludedFlag!: {
    taxRate: number;
    isTaxIncluded: boolean;
  };

  taxRateAndTaxIncludedFlag!: {
    taxRate: number;
    isTaxIncluded: boolean;
  };

  // エラー定数
  errorConst = errorConst;

  // 正規表現定数
  regExConst = regExConst;

  // フォーム
  form = this.fb.group({
    product_id: ['', [Validators.required]],
    product_name: [''],
    supplier_sales_tax_division_id: ['', [Validators.required]],
    sales_tax_division_id: ['', [Validators.required]],
    cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_cost_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    c_cost_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    gross_profit_rate: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    b_gross_profit_rate: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    c_gross_profit_rate: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    selling_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_selling_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    c_selling_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    scheduled_price_change_date: ['', [Validators.required]],
  });

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
          //take(1), // 1回のみ実行
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
   * 価格データを取得
   * @returns
   */
  private getPriceData() {
    return [
      {
        price: this.fc.selling_price,
        cost: this.fc.cost_price,
        rate: this.fc.gross_profit_rate,
      },
      {
        price: this.fc.b_selling_price,
        cost: this.fc.b_cost_price,
        rate: this.fc.b_gross_profit_rate,
      },
      {
        price: this.fc.c_selling_price,
        cost: this.fc.c_cost_price,
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
      priceData.rate.setErrors(['required']);
      priceData.price.patchValue('', { emitEvent: false });
      priceData.price.setErrors(['required']);
      return;
    }

    // 粗利率が入力されている場合売価を計算する
    if (!this.isNullOrUndefinedOrEmpty(priceData.rate.value)) {
      // // 仕入単価の税込・税抜金額を算出
      // const costPrices = this.getCostPrices(cost);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (costPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     '価格変更エラー',
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
      //     '価格変更エラー',
      //     sellingPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }

      const costPrice: number = Number(priceData.cost.value);
      const grossProfitRate: number = Number(priceData.rate.value);
      const taxCode: number = this.targetProduct.division_sales_tax_code;
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
      priceData.price.setErrors(['required']);
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
      // // 仕入単価の税込・税抜金額を算出
      // const costPrices = this.getCostPrices(priceData.cost.value);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (costPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     '価格変更エラー',
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
      //     '価格変更エラー',
      //     sellingPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }
      const costPrice: number = Number(priceData.cost.value);
      const grossProfitRate: number = Number(priceData.rate.value);
      const taxCode: number = this.targetProduct.division_sales_tax_code;
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
      priceData.rate.setErrors(['required']);
      return;
    }
    const roundedPrice = roundPrice(Number(price));
    priceData.price.patchValue(String(roundedPrice), { emitEvent: false });

    // 仕入先単価が入力されている場合粗利率を計算する
    if (!this.isNullOrUndefinedOrEmpty(priceData.cost.value)) {
      // // 仕入単価の税込・税抜金額を算出
      // const costPrices = this.getCostPrices(priceData.cost.value);
      // // 税込・税抜金額が取得できなかった場合エラーをセット
      // if (costPrices instanceof Error) {
      //   this.handleError(
      //     500,
      //     '価格変更エラー',
      //     costPrices.message,
      //     this.listPagePath
      //   );
      //   return;
      // }

      const costPrice: number = Number(priceData.cost.value);
      const salesPrice: number = Number(priceData.price.value);
      const taxCode: number = this.targetProduct.division_sales_tax_code;
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
   * 商品名のサジェストを取得
   * @returns
   */
  getProductSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.fc.product_name.value,
        $select: 'id,name',
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 商品選択決定ボタンクリック時の処理
   * @returns
   */
  handleClickProductSelectedButton() {
    const id = this.fc.product_id.value;
    if (id === null || id === undefined || id === '') {
      this.targetProduct = {} as Product;
      this.form.reset();
      this.isDuringProductSelection = false;
      return;
    }
    this.common.loading = true;
    this.subscription.add(
      this.productService
        .find(Number(id))
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.common.loading = false;
            return of(error);
          }),
          switchMap((productResponse) => {
            if (productResponse instanceof HttpErrorResponse) {
              return of(productResponse);
            }
            const targetProduct = productResponse.data[0];
            return this.supplierService.find(targetProduct.supplier_id).pipe(
              map((supplierResponse) => ({
                targetProduct,
                supplier: supplierResponse.data[0],
              })),
              catchError((error: HttpErrorResponse) => {
                this.common.loading = false;
                return of(error);
              })
            );
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました。';
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }
          this.targetProduct = res.targetProduct;
          this.form.patchValue(
            {
              product_id: String(this.targetProduct.id),
              product_name: this.targetProduct.name,
              supplier_sales_tax_division_id: String(
                this.targetProduct.supplier_sales_tax_division_id
              ),
              sales_tax_division_id: String(
                this.targetProduct.sales_tax_division_id
              ),
              cost_price: String(this.targetProduct.supplier_cost_price),
              b_cost_price: String(this.targetProduct.b_supplier_cost_price),
              c_cost_price: String(this.targetProduct.c_supplier_cost_price),
              gross_profit_rate: String(this.targetProduct.gross_profit_rate),
              b_gross_profit_rate: String(
                this.targetProduct.b_gross_profit_rate
              ),
              c_gross_profit_rate: String(
                this.targetProduct.c_gross_profit_rate
              ),
              selling_price: String(this.targetProduct.selling_price),
              b_selling_price: String(this.targetProduct.b_selling_price),
              c_selling_price: String(this.targetProduct.c_selling_price),
            },
            { emitEvent: false }
          );

          // 仕入先消費税端数区分
          this.supplierTaxFractionMethod = getFractionMethod(
            this.targetProduct.division_supplier_sales_fraction_code
          );
          // 消費税端数区分
          this.taxFractionMethod = getFractionMethod(
            this.targetProduct.division_sales_fraction_code
          );

          // 仕入先消費税区分コードから税率と税込・税抜のフラグを生成
          this.supplierTaxRateAndTaxIncludedFlag = getTaxRateAndTaxIncludedFlag(
            this.targetProduct.division_supplier_sales_tax_code
          );

          // 消費税区分コードから税率と税込・税抜のフラグを生成
          this.taxRateAndTaxIncludedFlag = getTaxRateAndTaxIncludedFlag(
            this.targetProduct.division_sales_tax_code
          );

          this.common.loading = false;
          this.isDuringProductSelection = true;
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
   * キャンセルリンククリック時の処理
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
      this.router.navigateByUrl(this.listPagePath);
    }
  }

  /**
   * 登録ボタンクリック時の処理
   */
  handleClickSaveButton() {
    this.common.loading = true;
    const data = {
      product_id: this.fc.product_id.value,
      supplier_sales_tax_division_id:
        this.fc.supplier_sales_tax_division_id.value,
      sales_tax_division_id: this.fc.sales_tax_division_id.value,
      cost_price: this.fc.cost_price.value,
      b_cost_price: this.fc.b_cost_price.value,
      c_cost_price: this.fc.c_cost_price.value,
      gross_profit_rate: this.fc.gross_profit_rate.value,
      b_gross_profit_rate: this.fc.b_gross_profit_rate.value,
      c_gross_profit_rate: this.fc.c_gross_profit_rate.value,
      selling_price: this.fc.selling_price.value,
      b_selling_price: this.fc.b_selling_price.value,
      c_selling_price: this.fc.c_selling_price.value,
      scheduled_price_change_date: new Date(
        String(this.fc.scheduled_price_change_date.value)
      ).toLocaleDateString(),
    };
    this.subscription.add(
      this.priceChangeService
        .add(data)
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
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }
          this.common.loading = false;
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
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath: string
  ) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '価格変更エラー：' + title + ' ' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
