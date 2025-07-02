import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  finalize,
  distinctUntilChanged,
  forkJoin,
  mergeMap,
  of,
  Subscription,
  filter,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { PriceService } from 'src/app/services/shared/price.service';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { StoreApiResponse } from 'src/app/models/store';
import { StorePriceApiResponse } from 'src/app/models/store-price';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import { ProductService } from 'src/app/services/product.service';
import { StorePriceService } from 'src/app/services/store-price.service';
import { StoreService } from 'src/app/services/store.service';
import { StorePriceCommonService } from '../store-price-common.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { Employee } from 'src/app/models/employee';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { CommonService } from 'src/app/services/shared/common.service';

interface PriceData {
  price: FormControl<string | null>;
  cost: FormControl<string | null>;
  rate: FormControl<string | null>;
}

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit, OnDestroy {
  // 各種変数
  id = this.route.snapshot.params['id'];
  title = this.id ? '店舗売価編集' : '店舗売価新規登録';
  editor?: string;
  prevUrl = '/setting/store-price' + (this.id ? `/detail/${this.id}` : '');
  private subscription = new Subscription();

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '店舗売価詳細編集キャンセル：' + modalConst.TITLE.CANCEL;
  // 詳細画面のパス
  detailPagePath = this.prevUrl;

  // フォーム周りの変数
  form = this.fb.group({
    store_id: ['', Validators.required],
    product_id: ['', Validators.required],
    product_name: ['', Validators.required],
    sales_tax_division_id: ['', Validators.required],
    sales_fraction_division_id: ['', Validators.required],
    gross_profit_rate: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    b_gross_profit_rate: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    c_gross_profit_rate: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    selling_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_selling_price: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    c_selling_price: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    supplier_sales_tax_division_id: ['', Validators.required],
    supplier_sales_fraction_division_id: ['', Validators.required], // tax_fraction に差し替え？
    supplier_cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_supplier_cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    c_supplier_cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
  });
  get ctrls() {
    return this.form.controls;
  }
  options = {
    store: [] as SelectOption[],
    tax_division: [] as SelectOption[],
    tax_fraction_division: [] as SelectOption[],
    supplier_tax_division: [] as SelectOption[],
  };

  // バーコード入力フォーム周りの変数
  product?: Product;

  // 各種定数（テンプレートからの参照用）
  errorConst = errorConst;
  regExConst = regExConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private author: AuthorService,
    private common: CommonService,
    private spcommon: StorePriceCommonService,
    private service: StorePriceService,
    private products: ProductService,
    private stores: StoreService,
    private divisions: DivisionService,
    private modalService: ModalService,
    private priceService: PriceService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 選択肢やサジェストを初期化
    this.initOptions();

    // フォームの変更を購読
    this.subscribeFormChanges();

    // 編集なら店舗売価情報を取得
    if (this.id) {
      // ローディング表示
      this.common.loading = true;

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

      this.service
        .find(this.id)
        .pipe(
          catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
          // 戻り値を元に商品情報を取得
          mergeMap((x) =>
            forkJoin({
              ss: of(x),
              pr: this.products
                .find(x.data[0].product_id)
                .pipe(
                  catchError(
                    this.products.handleErrorModal<ProductApiResponse>()
                  )
                ),
            })
          ),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((x) => {
          const data = x.ss.data[0];
          this.form.patchValue(data as object);

          // 最終更新者をセット
          if (data.employee_updated_last_name) {
            this.editor = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
          }

          // 商品情報の初期値をセット
          this.product = x.pr.data[0];
        });
      return;
    }

    // 新規なら登録者情報を取得・設定
    if (this.author.author) {
      this.setEditorInfo(this.author.author);
    } else {
      this.subscription.add(
        this.author.author$.subscribe((author) => {
          this.setEditorInfo(author);
        })
      );
    }
  }

  /**
   * 登録者（ログインユーザー）情報の設定処理
   * @param author
   */
  setEditorInfo(author: Employee) {
    const authorInfo = author;
    this.editor = authorInfo.last_name + ' ' + authorInfo.first_name;
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * FormControl の不正判定
   * @param ctrl 対象となる FormControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 保存ボタン押下時の処理。
   */
  onClickSave() {
    const value = { ...this.form.value };

    // 各APIをコール
    if (this.id) {
      this.update(value);
    } else {
      this.create(value);
    }
  }

  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    this.form.reset();
    this.product = undefined;
  }

  /**
   * APIから情報を取得して、選択肢項目を設定する。
   */
  private initOptions() {
    // 各APIのオブザーバブルを作成
    const stores$ = this.stores
      .getAll()
      .pipe(catchError(this.stores.handleErrorModal<StoreApiResponse>()));
    const divisions$ = this.divisions
      .getAsSelectOptions()
      .pipe(
        catchError(
          this.stores.handleErrorModal<Record<string, SelectOption[]>>()
        )
      );

    // APIからデータ取得
    this.common.loading = true;
    forkJoin({ stores$, divisions$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        this.options.store = x.stores$.data.map((y) => ({
          value: y.id,
          text: y.name,
        }));
        this.options.tax_division = x.divisions$['商品消費税区分'];
        this.options.tax_fraction_division = x.divisions$['消費税端数区分'];
        this.options.supplier_tax_division = x.divisions$['仕入先消費税区分'];

        Object.values(this.options).map((y) =>
          y.unshift({ value: '', text: '選択してください' })
        );
      });
  }

  /**
   * APIの登録処理を叩き、正常終了後に一覧画面へ遷移させる。
   * @param params APIへ送信するオブジェクト。
   */
  private create(params: object) {
    this.common.loading = true;
    this.service
      .add(params)
      .pipe(
        catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '作成しました') {
          this.spcommon.showSuccessMessage(
            '店舗売価情報が正常に登録されました。'
          );
          this.router.navigateByUrl(this.prevUrl);
        }
      });
  }

  /**
   * APIの更新処理を叩き、正常終了後に詳細画面へ遷移させる。
   * @param params APIへ送信するオブジェクト。
   */
  private update(params: object) {
    this.common.loading = true;
    this.service
      .update(this.id, params)
      .pipe(
        catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '更新しました') {
          this.spcommon.showSuccessMessage(
            '店舗売価情報が正常に更新されました。'
          );
        }
        this.router.navigateByUrl(this.prevUrl);
      });
  }
  /**
   * 絞り込み用結果を取得
   * @returns
   */
  getSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.products.getAll({
        name: this.ctrls.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 商品名サジェスト機能で選択した時に得られるオブジェクトを設定
   * @param product
   */
  handleSelectedRecord(product: Product) {
    this.product = product;
  }

  /**
   * フォームの変更に応じて実行する処理
   */
  subscribeFormChanges() {
    this.subscription.add(
      this.ctrls.product_name.valueChanges.pipe().subscribe((value) => {
        // 商品名が空白の時に前回選択時の商品情報を表示しない
        if (value === '') {
          this.product = undefined;
        }
      })
    );
    this.handleChangePriceData();
  }

  handleChangePriceData() {
    const priceData = this.getPriceData();
    priceData.forEach((x: PriceData) => {
      this.subscribeCostChanges(x);
      this.subscribeRateChanges(x);
      this.subscribePriceChanges(x);
    });
  }

  /**
   * 価格データを取得
   * @returns
   */
  private getPriceData() {
    return [
      {
        price: this.ctrls.selling_price,
        cost: this.ctrls.supplier_cost_price,
        rate: this.ctrls.gross_profit_rate,
      },
      {
        price: this.ctrls.b_selling_price,
        cost: this.ctrls.b_supplier_cost_price,
        rate: this.ctrls.b_gross_profit_rate,
      },
      {
        price: this.ctrls.c_selling_price,
        cost: this.ctrls.c_supplier_cost_price,
        rate: this.ctrls.c_gross_profit_rate,
      },
    ];
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
      const costPrice: number = Number(priceData.cost.value);
      const grossProfitRate: number = Number(priceData.rate.value);
      //const taxCode = this.getTaxCode(Number(this.ctrls.sales_tax_division_id.value));
      const taxCode = this.priceService.getTaxCode(
        this.options.tax_division,
        Number(this.ctrls.sales_tax_division_id.value)
      );
      const sellingPrices: number = this.priceService.getSalesPrice(
        costPrice,
        grossProfitRate,
        taxCode
      );
      // 売価をフォームにセット
      priceData.price.patchValue(String(sellingPrices), { emitEvent: false });
    }
  }

  private handlePriceChanges(price: string | null, priceData: PriceData) {
    if (this.isNullOrUndefinedOrEmpty(price)) {
      // 粗利率を空にする
      priceData.rate.patchValue('', { emitEvent: false });
      priceData.rate.setErrors(['required']);
      return;
    }

    // 仕入先単価が入力されている場合粗利率を計算する
    if (!this.isNullOrUndefinedOrEmpty(priceData.cost.value)) {
      const costPrice: number = Number(priceData.cost.value);
      const salesPrice: number = Number(priceData.price.value);
      const taxCode = this.priceService.getTaxCode(
        this.options.tax_division,
        Number(this.ctrls.sales_tax_division_id.value)
      );

      // const taxCode: number = 1;//this.targetProduct.division_sales_tax_code;
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
      const costPrice: number = Number(priceData.cost.value);
      const grossProfitRate: number = Number(priceData.rate.value);
      const taxCode = this.priceService.getTaxCode(
        this.options.tax_division,
        Number(this.ctrls.sales_tax_division_id.value)
      );
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
   * 値がnullまたはundefinedまたは空文字または0かどうかを判定
   * @param value
   * @returns
   */
  private isNullOrUndefinedOrEmpty(value: any): boolean {
    return (
      value === null || value === undefined || value === '' || value === '0'
    );
  }

  // private getTaxCode(taxDivisionId: number): number {
  //   const index = this.options.tax_division.findIndex(v => v.value === taxDivisionId);
  //   const selectData: any = this.options.tax_division[index];
  //   return selectData.code;
  //   //return this.options.tax_division[index];
  // }
}
