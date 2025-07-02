import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { regExConst } from 'src/app/const/regex.const';
import { ProductApiResponse } from 'src/app/models/product';
import { ProductCustomTagApiResponse } from 'src/app/models/product-custom-tag';
import { SupplierApiResponse } from 'src/app/models/supplier';
import { CustomLargeCategoryService } from 'src/app/services/custom-large-category.service';
import { CustomMediumCategoryService } from 'src/app/services/custom-medium-category.service';
import { CustomSmallCategoryService } from 'src/app/services/custom-small-category.service';
import { DivisionService } from 'src/app/services/division.service';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { ProductCustomTagService } from 'src/app/services/product-custom-tag.service';
import { ProductService } from 'src/app/services/product.service';
import { SmallCategoryService } from 'src/app/services/small-category.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { ApiCallStatus } from '../../template/add-edit/add-edit.component';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { HttpErrorResponse } from '@angular/common/http';
import {} from 'src/app/functions/shared-functions';
import { ProductConst, productConst } from 'src/app/const/product.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit, OnDestroy {
  // seal_price_indication
  seal_price_indication_option: SelectOption[] = [
    { value: '0', text: '表示しない' },
    { value: '1', text: '表示する' },
  ];

  // 定数
  productConst: ProductConst = productConst;
  // 各種パラメータ
  id = this.route.snapshot.params['id'];
  updater = 'データ取得中...';
  authorname = 'データ取得中...';

  private subscription = new Subscription();
  private defaultSelectOption = {
    value: '',
    text: '選択してください',
  } as const;

  // 計算ができない場合のメッセージ
  notAbleToCalcMessage = {
    piece: null as string | null, // バラ
    set: null as string | null, // 小分け
    case: null as string | null, // ケース
  };

  // 区分を格納
  division: Record<string, SelectOption[]> = {};

  // 送信時にフォームの値を修正する関数
  modifyFormValue = () => {
    const value = { ...this.form.value } as any;

    // 粗利率の値をセット（非活性のため出力されない）
    ['gross_profit_rate', 'b_gross_profit_rate', 'c_gross_profit_rate'].forEach(
      (x) => {
        value[x] = this.form.get(x)?.value;
      }
    );

    // カスタムタグの配列から空の要素を除外
    value.product_custom_tag = this.form.value.product_custom_tag?.filter(
      (x) => x.name && x.value
    );
    value.product_custom_tag.forEach((x: any) =>
      !x.custom_tag_id ? delete x.custom_tag_id : ''
    );
    return value;
  };

  // 入力フォーム
  form = this.fb.group({
    image: null,
    image_path: '',
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.NAME_MAX_LENGTH)
        ),
      ],
    ],
    name_kana: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.NAME_KANA_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    supplier_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    supplier_name: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.SUPPLIER_NAME)
        ),
      ],
    ],
    supplier_product_cd: ['', Validators.maxLength(10)],
    supplier_sales_tax_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    supplier_sales_fraction_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    supplier_cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_supplier_cost_price: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    c_supplier_cost_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    standard: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.STANDARD_MAX_LENGTH)
        ),
      ],
    ],
    part_number: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.PART_NUMBER_MAX_LENGTH)
        ),
      ],
    ],
    sales_tax_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    sales_fraction_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    barcode: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.BARCODE_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    b_barcode: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.B_BARCODE_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    c_barcode: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.C_BARCODE_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    quantity: [
      '1',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.QUANTITY_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    b_quantity: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.B_QUANTITY_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    c_quantity: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.C_QUANTITY_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    gross_profit_rate: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_2DIGIT_DECIMAL_REG_EX),
      ],
    ],
    b_gross_profit_rate: [
      '',
      [Validators.pattern(regExConst.NUMERIC_2DIGIT_DECIMAL_REG_EX)],
    ],
    c_gross_profit_rate: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_2DIGIT_DECIMAL_REG_EX),
      ],
    ],
    selling_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    b_selling_price: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    c_selling_price: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    discount_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    unit_division_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    b_unit_division_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    c_unit_division_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    product_division_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    point_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    issuance_warranty_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    large_category_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    medium_category_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    small_category_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    remarks_1: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.REMARKS_1_MAX_LENGTH)
        ),
      ],
    ],
    remarks_2: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.REMARKS_2_MAX_LENGTH)
        ),
      ],
    ],
    remarks_3: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.REMARKS_3_MAX_LENGTH)
        ),
      ],
    ],
    remarks_4: [
      '',
      [
        Validators.maxLength(
          Number(this.productConst.CHARACTER_LIMITS.REMARKS_4_MAX_LENGTH)
        ),
      ],
    ],
    seal_print_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    price_tag_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    ordering_target_barcode: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(
            this.productConst.CHARACTER_LIMITS
              .ORDERING_TARGET_BARCODE_MAX_LENGTH
          )
        ),
      ],
    ],
    regulated_stock_num: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    ordering_point: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    order_lead_time: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
    shelf_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    shelf_col_division_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    custom_large_category_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    custom_medium_category_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    custom_small_category_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    data_permission_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    minimum_order_quantity: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    basic_shipping_fee: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    shipping_surcharge: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    seal_price_indication: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    out_of_service_at: [''],
    product_custom_tag: this.fb.array([
      this.fb.group({
        custom_tag_id: '',
        name: '',
        value: '',
      }),
    ]),
    specified_order_flag: ['0'], // TODO：20230712 バックエンドの対応が終わったら削除する（必須カラムのため、無いとエラーになる）（0はカラム初期値）
  });
  get fc() {
    return this.form.controls;
  }

  // 選択肢周りの変数
  opts = {
    supplier_id: [] as SelectOption[],
    supplier_sales_tax_division_id: [] as SelectOption[],
    supplier_sales_fraction_division_id: [] as SelectOption[],
    sales_tax_division_id: [] as SelectOption[],
    sales_fraction_division_id: [] as SelectOption[],
    discount_division_id: [] as SelectOption[],
    unit_division_id: [] as SelectOption[],
    b_unit_division_id: [] as SelectOption[],
    c_unit_division_id: [] as SelectOption[],
    product_division_id: [] as SelectOption[],
    point_division_id: [] as SelectOption[],
    issuance_warranty_division_id: [] as SelectOption[],
    seal_print_division_id: [] as SelectOption[],
    price_tag_division_id: [] as SelectOption[],
    shelf_division_id: [] as SelectOption[],
    shelf_col_division_id: [] as SelectOption[],
    custom_large_category_id: [] as SelectOption[],
    custom_medium_category_id: [] as SelectOption[],
    custom_small_category_id: [] as SelectOption[],
    data_permission_division_id: [] as SelectOption[],
    large_category_id: [] as SelectOption[],
    medium_category_id: [] as SelectOption[],
    small_category_id: [] as SelectOption[],
    seal_price_indication: [] as SelectOption[],
  };

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private route: ActivatedRoute,
    public common: CommonService,
    public service: ProductService,
    private customTags: ProductCustomTagService,
    private divisions: DivisionService,
    private suppliers: SupplierService,
    private lCates: LargeCategoryService,
    private mCates: MediumCategoryService,
    private sCates: SmallCategoryService,
    private cLCates: CustomLargeCategoryService,
    private cMCates: CustomMediumCategoryService,
    private cSCates: CustomSmallCategoryService
  ) {}

  // ログイン中ユーザー
  author!: Employee;

  // 発注用バーコードフラグ
  // 1: バーコード
  // 2: Bバーコード
  // 3: Cバーコード
  flg_ordering_target_barcode!: number;

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ログイン中ユーザー取得
    if (this.authorService.author) {
      // サービスが保持していれば取得
      this.author = this.authorService.author;
      this.authorname = `${this.author.last_name} ${this.author.first_name}`;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーストリームを購読
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          this.authorname = `${this.author.last_name} ${this.author.first_name}`;
        })
      );
    }

    // 新規登録ならフォームの変更を購読して処理終了
    if (!this.id) {
      this.initOptions();
      this.subscribeFormChanges();
      return;
    }

    // 各APIサービスのオブザーバブルを作成
    const product$ = this.service
      .find(this.id)
      .pipe(catchError(this.service.handleErrorModal<ProductApiResponse>()));

    const customTags$ = this.customTags
      .getRelatedCustomTags(this.id)
      .pipe(
        catchError(
          this.customTags.handleErrorModal<ProductCustomTagApiResponse>()
        )
      );

    // APIコール
    this.common.loading = true;
    forkJoin({ ps: product$, ct: customTags$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        const product = x.ps.data[0];
        if (product.barcode === product.ordering_target_barcode) {
          this.flg_ordering_target_barcode = 1;
        }
        if (product.b_barcode === product.ordering_target_barcode) {
          this.flg_ordering_target_barcode = 2;
        }
        if (product.c_barcode === product.ordering_target_barcode) {
          this.flg_ordering_target_barcode = 3;
        }
        this.initOptions(product);
        this.form.patchValue(product as object, { emitEvent: false });
        this.form.controls.image_path.setValue(product.image_path); // image_pathは別途値を割り当てないと表示されなかった
        this.updater = `${product.employee_updated_last_name} ${product.employee_updated_first_name}`;

        // 発注用JANのチェックボックス表示を反映させるため、時間差で再設定
        this.fc.ordering_target_barcode.reset();
        setTimeout(() => {
          this.fc.ordering_target_barcode.patchValue(
            product.ordering_target_barcode
          );
        }, 1);

        // カスタムタグのフォームを生成して値をセット
        const tags = x.ct.data;
        if (tags.length) {
          this.fc.product_custom_tag.clear(); // 初期設定のフォームを削除
        }
        tags.map((y) =>
          this.fc.product_custom_tag.push(
            this.fb.group({
              custom_tag_id: y.custom_tag_id + '',
              name: y.custom_tag_name,
              value: y.custom_tag_value,
            })
          )
        );

        // フォームの変更を購読
        this.subscribeFormChanges();
      });

    // 売価を自動計算できない時のメッセージを初期化
    this.notAbleToCalcMessage = {
      piece: null,
      set: null,
      case: null,
    };
  }

  changeOrderingTargetBarcode(flg: number, barcode: string | null): void {
    if (this.flg_ordering_target_barcode !== flg) {
      return;
    }
    this.fc.ordering_target_barcode.patchValue(barcode);
  }

  setOrderingTargetBarcode(flg: number, barcode: string | null): void {
    this.flg_ordering_target_barcode = flg;
    this.fc.ordering_target_barcode.patchValue(barcode);
  }

  /**
   *  商品区分廃番選択時にフォームに値追加
   */
  getValue(event: Event): void {
    let targ_value = (event.target as HTMLSelectElement).value;
    const waste_number = this.opts.product_division_id.find((x: any) => {
      return x.text === this.productConst.PRODUCT_DIVISION.VALUE.WASTE_NUMBER;
    });
    let date = new Date();
    let today = date.toLocaleString();

    if (Number(targ_value) == waste_number?.value) {
      this.fc.out_of_service_at.setValue(today);
    } else {
      this.fc.out_of_service_at.setValue('');
    }
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 編集テンプレのステータス変更に応じた処理
   * @param status 編集テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    this.common.loading = !!status;
  }

  /**
   * 各APIから情報を取得して、選択肢項目を設定する。
   */
  private initOptions(product?: any) {
    let filterMedium = {};
    let filterSmall = {};
    let filterCustomMedium = {};
    let filterCustomSmall = {};
    if (product !== undefined) {
      filterMedium = { large_category_id: product.large_category_id };
      filterSmall = { medium_category_id: product.medium_category_id };
      if (product.custom_large_category_id !== '') {
        filterCustomMedium = {
          custom_large_category_id: product.custom_large_category_id,
        };
      }
      if (product.custom_medium_category_id !== '') {
        filterCustomSmall = {
          custom_medium_category_id: product.custom_medium_category_id,
        };
      }
    }
    // { medium_category_id: 58 }
    // 各APIのオブザーバブルを作成
    const divisions$ = this.divisions
      .getAsSelectOptions()
      .pipe(
        catchError(
          this.divisions.handleErrorModal<Record<string, SelectOption[]>>()
        )
      );
    const lCates$ = this.lCates
      .getAsSelectOptions()
      .pipe(catchError(this.lCates.handleErrorModal<SelectOption[]>()));
    const mCates$ = this.mCates
      .getAsSelectOptions(filterMedium)
      .pipe(catchError(this.mCates.handleErrorModal<SelectOption[]>()));
    const sCates$ = this.sCates
      .getAsSelectOptions(filterSmall)
      .pipe(catchError(this.sCates.handleErrorModal<SelectOption[]>()));
    const cLCates$ = this.cLCates
      .getAsSelectOptions()
      .pipe(catchError(this.cLCates.handleErrorModal<SelectOption[]>()));
    const cMCates$ = this.cMCates
      .getAsSelectOptions(filterCustomMedium)
      .pipe(catchError(this.cMCates.handleErrorModal<SelectOption[]>()));
    const cSCates$ = this.cSCates
      .getAsSelectOptions(filterCustomSmall)
      .pipe(catchError(this.cSCates.handleErrorModal<SelectOption[]>()));

    // APIコール
    this.common.loading = true;
    forkJoin({
      div: divisions$,
      lc: lCates$,
      mc: mCates$,
      sc: sCates$,
      cl: cLCates$,
      cm: cMCates$,
      cs: cSCates$,
    })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        this.division = x.div;
        // 区分周り
        type Key = keyof typeof this.opts;
        const names: { name: Key; name_jp: string }[] = [
          {
            name: 'supplier_sales_tax_division_id',
            name_jp: '仕入先消費税区分',
          },
          {
            name: 'supplier_sales_fraction_division_id',
            name_jp: '消費税端数区分',
          },
          { name: 'sales_tax_division_id', name_jp: '商品消費税区分' },
          { name: 'sales_fraction_division_id', name_jp: '消費税端数区分' },
          { name: 'discount_division_id', name_jp: '値引き区分' },
          { name: 'unit_division_id', name_jp: '単位区分' },
          { name: 'b_unit_division_id', name_jp: '単位区分' },
          { name: 'c_unit_division_id', name_jp: '単位区分' },
          { name: 'product_division_id', name_jp: '商品区分' },
          { name: 'point_division_id', name_jp: 'ポイント区分' },
          { name: 'issuance_warranty_division_id', name_jp: '保証書発行区分' },
          { name: 'seal_print_division_id', name_jp: 'ラベルシール印刷区分' },
          { name: 'price_tag_division_id', name_jp: 'ポップシール区分' },
          { name: 'shelf_division_id', name_jp: '陳列棚区分' },
          { name: 'shelf_col_division_id', name_jp: '陳列棚列区分' },
          { name: 'data_permission_division_id', name_jp: 'データ公開区分' },
        ];
        names.forEach(
          ({ name, name_jp }) => (this.opts[name] = [...x.div[name_jp]])
        );

        // その他選択肢項目
        this.opts.large_category_id = x.lc;
        this.opts.medium_category_id = x.mc;
        this.opts.small_category_id = x.sc;
        this.opts.custom_large_category_id = x.cl;
        this.opts.custom_medium_category_id = x.cm;
        this.opts.custom_small_category_id = x.cs;

        // 初期値を設定
        Object.values(this.opts).forEach((value) =>
          value.unshift(this.defaultSelectOption)
        );
        if (product == undefined) {
          this.fc.seal_price_indication.patchValue('1');
        } else {
          this.fc.seal_price_indication.patchValue(
            product.seal_price_indication
          );
        }
      });
  }

  /**
   * リアルタイムサジェストの選択値変更時に発火するイベント
   * @param id
   * @returns
   */
  onIdValueChanges(id: string) {
    if (id === '' || id === null || id === undefined) {
      this.fc.supplier_sales_tax_division_id.setValue('');
      this.fc.supplier_sales_fraction_division_id.setValue('');
      this.fc.supplier_id.setValue('', { emitEvent: false });
      return;
    }
    this.common.loading = true;
    // 仕入先の変更に応じた処理
    this.subscription.add(
      this.suppliers
        .find(Number(id))
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.common.loading = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.suppliers.handleErrorModal<HttpErrorResponse>()(res);
            return;
          }
          const supplier = res.data[0];
          this.fc.supplier_sales_tax_division_id.setValue(
            supplier?.sales_tax_division_id + ''
          );
          this.fc.supplier_sales_fraction_division_id.setValue(
            supplier?.sales_fraction_division_id + ''
          );
          this.common.loading = false;
        })
    );
  }

  getSupplier(id: string): Observable<void | HttpErrorResponse> {
    if (id === null || id === undefined || id === '') {
      this.fc.supplier_sales_tax_division_id.setValue('');
      this.fc.supplier_sales_fraction_division_id.setValue('');
      this.fc.supplier_name.setValue('', { emitEvent: false });
      return of();
    }
    this.common.loading = true;
    return this.suppliers.find(Number(id)).pipe(
      map((res: SupplierApiResponse) => {
        const supplier = res.data[0];
        this.fc.supplier_sales_tax_division_id.setValue(
          supplier?.sales_tax_division_id + ''
        );
        this.fc.supplier_sales_fraction_division_id.setValue(
          supplier?.sales_fraction_division_id + ''
        );
        this.fc.supplier_name.setValue(supplier?.name, { emitEvent: false });
        this.common.loading = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.common.loading = false;
        return this.suppliers.handleErrorModal<HttpErrorResponse>()(error);
      })
    );
  }

  /**
   * フォームの変更に応じて行う処理を設定する。
   */
  private subscribeFormChanges() {
    // 仕入先idの変更に応じた処理
    // リアルタイムサジェストでidが変更された場合は、onIdValueChanges()が発火する
    // idが直接変更された場合は、こちらが発火する
    this.subscription.add(
      this.fc.supplier_id.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          // filter((value) => !!value),
          // 前のリクエストをキャンセルして新しいリクエストを実行する
          switchMap((value) => this.getSupplier(String(value)))
        )
        .subscribe()
    );

    // 親項目の変更に伴って選択肢項目を差し替える処理を設定
    const settings = [
      // 大分類→中分類
      {
        control: this.fc.large_category_id,
        observable: (value: string) =>
          this.mCates
            .getAsSelectOptions({ large_category_id: Number(value) })
            .pipe(catchError(this.mCates.handleErrorModal<SelectOption[]>())),
        subscribe: (options: SelectOption[]) => {
          this.opts.medium_category_id = options;
          this.fc.medium_category_id.patchValue('');
          this.fc.small_category_id.patchValue('');
        },
      },
      // 中分類→小分類
      {
        control: this.fc.medium_category_id,
        observable: (value: string) =>
          this.sCates
            .getAsSelectOptions({ medium_category_id: Number(value) })
            .pipe(catchError(this.sCates.handleErrorModal<SelectOption[]>())),
        subscribe: (options: SelectOption[]) =>
          (this.opts.small_category_id = options),
      },
      // カスタム大分類→カスタム中分類
      {
        control: this.fc.custom_large_category_id,
        observable: (value: string) =>
          this.cMCates
            .getAsSelectOptions({ custom_large_category_id: Number(value) })
            .pipe(catchError(this.cMCates.handleErrorModal<SelectOption[]>())),
        subscribe: (options: SelectOption[]) => {
          this.opts.custom_medium_category_id = options;
          this.fc.small_category_id.patchValue('');
          this.fc.custom_medium_category_id.patchValue('');
        },
      },
      // カスタム中分類→カスタム小分類
      {
        control: this.fc.custom_medium_category_id,
        observable: (value: string) =>
          this.cSCates
            .getAsSelectOptions({ custom_medium_category_id: Number(value) })
            .pipe(catchError(this.cSCates.handleErrorModal<SelectOption[]>())),
        subscribe: (options: SelectOption[]) =>
          (this.opts.custom_small_category_id = options),
      },
    ];

    // 順次購読処理を登録
    settings.forEach((x) => {
      const subs = x.control.valueChanges
        .pipe(
          distinctUntilChanged(), // 前回から変更なしなら何もしない
          tap(() => (this.common.loading = true)),
          switchMap((value) =>
            x.observable(value + '').pipe(
              // APIコールへスイッチ
              finalize(() => (this.common.loading = false)),
              finalize(() => this.setDisabled())
            )
          ),
          tap((res) => res.unshift(this.defaultSelectOption))
        )
        .subscribe((res) => x.subscribe(res));
      // サブスクリプションに登録
      this.subscription.add(subs);
    });

    // 商品消費税区分（売上）を購読、変更に応じた処理
    this.subscription.add(
      this.fc.sales_tax_division_id.valueChanges.pipe().subscribe(() => {
        // 売価をリセット（再計算のし忘れがないように）
        this.fc.selling_price.setValue('');
        this.fc.b_selling_price.setValue('');
        this.fc.c_selling_price.setValue('');
        // 計算不能エラーメッセージを格納
        this.setNotAbleToCalcMessage('バラ');
        this.setNotAbleToCalcMessage('小分け');
        this.setNotAbleToCalcMessage('ケース');
      })
    );
    // バラ仕入単価の変更を購読
    this.subscription.add(
      this.fc.supplier_cost_price.valueChanges.subscribe(() =>
        this.setNotAbleToCalcMessage('バラ')
      )
    );
    // バラ粗利率の変更を購読
    this.subscription.add(
      this.fc.gross_profit_rate.valueChanges.subscribe(() =>
        this.setNotAbleToCalcMessage('バラ')
      )
    );
    // 小分け仕入単価の変更を購読
    this.subscription.add(
      this.fc.b_supplier_cost_price.valueChanges.subscribe(() =>
        this.setNotAbleToCalcMessage('小分け')
      )
    );
    // 小分け粗利率の変更を購読
    this.subscription.add(
      this.fc.b_gross_profit_rate.valueChanges.subscribe(() =>
        this.setNotAbleToCalcMessage('小分け')
      )
    );
    // ケース仕入単価の変更を購読
    this.subscription.add(
      this.fc.c_supplier_cost_price.valueChanges.subscribe(() =>
        this.setNotAbleToCalcMessage('ケース')
      )
    );
    // ケース粗利率の変更を購読
    this.subscription.add(
      this.fc.c_gross_profit_rate.valueChanges.subscribe(() =>
        this.setNotAbleToCalcMessage('ケース')
      )
    );

    // 項目の活性状態を変更
    this.setDisabled();
  }

  /**
   * 親子関係にあるSELECT項目の活性/非活性を切り替える。
   */
  private setDisabled() {
    [
      { parent: this.fc.large_category_id, child: this.fc.medium_category_id },
      { parent: this.fc.medium_category_id, child: this.fc.small_category_id },
      {
        parent: this.fc.custom_large_category_id,
        child: this.fc.custom_medium_category_id,
      },
      {
        parent: this.fc.custom_medium_category_id,
        child: this.fc.custom_small_category_id,
      },
    ].forEach(({ parent, child }) =>
      parent.value === ''
        ? child.disable({ emitEvent: false })
        : child.enable({ emitEvent: false })
    );
  }

  /**
   * 絞り込み用結果を取得
   * @returns
   */
  getSuggests(): ApiInput<SupplierApiResponse> {
    return {
      observable: this.suppliers.getAll({
        name: this.fc.supplier_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 原価計算が可能かどうか判定し、不可であればエラーメッセージを設定する
   * @param unit
   * @returns
   */
  setNotAbleToCalcMessage(unit: string) {
    if (this.fc.sales_tax_division_id.value === '') {
      this.notAbleToCalcMessage.piece =
        '商品消費税区分（売上用）が選択されていません。値を選択してください。';
      this.notAbleToCalcMessage.set =
        '商品消費税区分（売上用）が選択されていません。値を選択してください。';
      this.notAbleToCalcMessage.case =
        '商品消費税区分（売上用）が選択されていません。値を選択してください。';
      return;
    }
    switch (unit) {
      case 'バラ':
        if (
          this.fc.supplier_cost_price.value === '' &&
          this.fc.gross_profit_rate.value === ''
        ) {
          this.notAbleToCalcMessage.piece =
            '仕入単価と粗利率が空白です。値を入力してください。';
        } else if (this.fc.supplier_cost_price.value === '') {
          this.notAbleToCalcMessage.piece =
            '仕入単価が空白です。値を入力してください。';
        } else if (this.fc.gross_profit_rate.value === '') {
          this.notAbleToCalcMessage.piece =
            '粗利率が空白です。値を入力してください。';
        } else {
          this.notAbleToCalcMessage.piece = null;
        }
        break;
      case '小分け':
        if (
          this.fc.b_supplier_cost_price.value === '' &&
          this.fc.b_gross_profit_rate.value === ''
        ) {
          this.notAbleToCalcMessage.set =
            '仕入単価と粗利率が空白です。値を入力してください。';
        } else if (this.fc.b_supplier_cost_price.value === '') {
          this.notAbleToCalcMessage.set =
            '仕入単価が空白です。値を入力してください。';
        } else if (this.fc.b_gross_profit_rate.value === '') {
          this.notAbleToCalcMessage.set =
            '粗利率が空白です。値を入力してください。';
        } else {
          this.notAbleToCalcMessage.set = null;
        }
        break;
      case 'ケース':
        if (
          this.fc.c_supplier_cost_price.value === '' &&
          this.fc.c_gross_profit_rate.value === ''
        ) {
          this.notAbleToCalcMessage.case =
            '仕入単価と粗利率が空白です。値を入力してください。';
        } else if (this.fc.c_supplier_cost_price.value === '') {
          this.notAbleToCalcMessage.case =
            '仕入単価が空白です。値を入力してください。';
        } else if (this.fc.c_gross_profit_rate.value === '') {
          this.notAbleToCalcMessage.case =
            '粗利率が空白です。値を入力してください。';
        } else {
          this.notAbleToCalcMessage.case = null;
        }
        break;
    }
  }

  /**
   * 売価を計算ボタン押下時の処理
   * 計算式： (仕入単価/(1-粗利率))*商品消費税区分(売上用)
   *  → 計算後に丸め処理
   * @param unit バラ、小分け、ケース
   * @returns
   */
  handleClickCalcButton(unit: string) {
    // 計算不能状態なら戻す
    this.setNotAbleToCalcMessage(unit);
    switch (unit) {
      case 'バラ':
        if (this.notAbleToCalcMessage.piece !== null) {
          return;
        }
        break;
      case '小分け':
        if (this.notAbleToCalcMessage.set !== null) {
          return;
        }
        break;
      case 'ケース':
        if (this.notAbleToCalcMessage.case !== null) {
          return;
        }
        break;
      default:
        // バラ・小分け・ケース以外は戻す
        return;
    }

    let salesTaxDivisionCalcValue; // 消費税区分の計算用変数
    // 税率を計算用の値に変換
    switch (String(this.fc.sales_tax_division_id.value)) {
      // 外税10％
      case '28':
        salesTaxDivisionCalcValue = 1.1;
        break;
      // 外税8％
      case '31':
        salesTaxDivisionCalcValue = 1.08;
        break;
      // 非課税 内税8％ 内税10％
      default:
        salesTaxDivisionCalcValue = 1;
        break;
    }

    // 税込み売価の計算（丸め前）
    let tempSellingPrice;
    switch (unit) {
      case 'バラ':
        tempSellingPrice =
          (Number(this.fc.supplier_cost_price.value) /
            (1 - Number(this.fc.gross_profit_rate.value) / 100)) *
          salesTaxDivisionCalcValue;
        break;
      case '小分け':
        tempSellingPrice =
          (Number(this.fc.b_supplier_cost_price.value) /
            (1 - Number(this.fc.b_gross_profit_rate.value) / 100)) *
          salesTaxDivisionCalcValue;
        break;
      case 'ケース':
        tempSellingPrice =
          (Number(this.fc.c_supplier_cost_price.value) /
            (1 - Number(this.fc.c_gross_profit_rate.value) / 100)) *
          salesTaxDivisionCalcValue;
        break;
    }

    // 売価の丸め計算（丸め後）
    let sellingPrice;
    switch (true) {
      // ～3000円未満 → 小数点第一位で四捨五入
      case tempSellingPrice < 3000:
        sellingPrice = Math.round(tempSellingPrice);
        break;
      // 10000円未満 → 一の位で四捨五入
      case tempSellingPrice < 10000:
        sellingPrice = Math.round(tempSellingPrice / 10) * 10;
        break;
      // 10000円以上 → 十の位で四捨五入
      default:
        sellingPrice = Math.round(tempSellingPrice / 100) * 100;
        break;
    }

    // 計算した売価を設定
    switch (unit) {
      case 'バラ':
        this.fc.selling_price.setValue(String(sellingPrice));
        break;
      case '小分け':
        this.fc.b_selling_price.setValue(String(sellingPrice));
        break;
      case 'ケース':
        this.fc.c_selling_price.setValue(String(sellingPrice));
        break;
    }
  }

  /**
   * クリアボタンが押されたときの処理
   * 値をクリアしたあと、注意惹起にエラーメッセージを表示するためにtouchedにする
   * （必須のエラーが表示される）
   * @param unit バラ、小分け、ケース
   */
  handleClickClearValueButton(unit: string) {
    switch (unit) {
      case 'バラ':
        this.fc.selling_price.setValue('');
        this.fc.selling_price.markAllAsTouched();
        break;
      case '小分け':
        this.fc.b_selling_price.setValue('');
        // 必須ではないのでtouchedにしない
        break;
      case 'ケース':
        this.fc.c_selling_price.setValue('');
        this.fc.c_selling_price.markAsTouched();
        break;
    }
  }
}
