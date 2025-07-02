import { Component, OnInit } from '@angular/core';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { provinces } from 'src/app/models/province';
import { SupplierApiResponse } from 'src/app/models/supplier';
import { SupplierCustomTagApiResponse } from 'src/app/models/supplier-custom-tag';
import { DivisionService } from 'src/app/services/division.service';
import { SupplierCustomTagService } from 'src/app/services/supplier-custom-tag.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { ApiCallStatus } from '../../template/add-edit/add-edit.component';
import { SupplierConst, supplierConst } from 'src/app/const/supplier.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit {
  // 定数
  supplierConst: SupplierConst = supplierConst;
  errorConst = errorConst;
  // 各種パラメータ
  id = this.route.snapshot.params['id'];
  updater = 'データ取得中...';
  authorname = 'データ取得中...';
  apiService = this.service;

  // 送信時にフォームの値を修正する関数
  modifyFormValue = () => {
    const value = { ...this.form.value } as any;

    // パスワードを FormGroup から単一の値へ
    value.password ? (value.password = value.password?.password) : '';

    // カスタムタグの配列から空の要素を除外
    value.supplier_custom_tag = this.form.value.supplier_custom_tag?.filter(
      (x) => x.name && x.value
    );
    value.supplier_custom_tag.forEach((x: any) =>
      !x.custom_tag_id ? delete x.custom_tag_id : ''
    );
    return value;
  };

  // フォーム周りの変数
  form = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.NAME_MAX_LENGTH)
        ),
      ],
    ],
    name_kana: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.NAME_KANA_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    pic_name: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.PIC_NAME_MAX_LENGTH)
        ),
      ],
    ],
    pic_name_kana: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.PIC_NAME_KANA_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    postal_code: [
      '',
      [
        Validators.required,
        Validators.minLength(
          Number(this.supplierConst.CHARACTER_LIMITS.POSTAL_CODE_MIN_LENGTH)
        ),
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.POSTAL_CODE_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    province: ['', [Validators.required]],
    locality: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.LOCALITY_MAX_LENGTH)
        ),
      ],
    ],
    street_address: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.STREET_ADDRESS_MAX_LENGTH)
        ),
      ],
    ],
    other_address: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.OTHER_ADDRESS_MAX_LENGTH)
        ),
      ],
    ],
    mail: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.MAIL_MAX_LENGTH)
        ),
      ],
    ],
    tel: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.TEL_MAX_LENGTH)
        ),
      ],
    ],
    fax: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.FAX_MAX_LENGTH)
        ),
      ],
    ],
    password: this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(
              Number(this.supplierConst.CHARACTER_LIMITS.PASSWORD_MIN_LENGTH)
            ),
            Validators.maxLength(
              Number(this.supplierConst.CHARACTER_LIMITS.PASSWORD_MAX_LENGTH)
            ),
            Validators.pattern(regExConst.PASSWORD_REG_EX),
          ],
        ],
        confirm: ['', [Validators.required]],
      },
      { validators: [CustomValidators.compareValidator('password', 'confirm')] }
    ),
    payee_1: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.PAYEE_1_MAX_LENGTH)
        ),
      ],
    ],
    payee_2: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.PAYEE_2_MAX_LENGTH)
        ),
      ],
    ],
    payment_division_id: ['', [Validators.required]],
    cutoff_date_billing: ['', [Validators.required]],
    scheduled_payment_date: '',
    payment_site_division_id: '',
    sales_fraction_division_id: [''],
    sales_tax_division_id: ['', [Validators.required]],
    sales_tax_calc_division_id: ['', [Validators.required]],
    sales_tax_fraction_division_id: ['', [Validators.required]],
    remarks_1: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.REMARKS_1_MAX_LENGTH)
        ),
      ],
    ],
    remarks_2: [
      '',
      [
        Validators.maxLength(
          Number(this.supplierConst.CHARACTER_LIMITS.REMARKS_2_MAX_LENGTH)
        ),
      ],
    ],
    supplier_custom_tag: this.fb.array([
      this.fb.group({
        custom_tag_id: '',
        name: '',
        value: '',
      }),
    ]),
    logo_image: null,
    logo_image_path: '',
  });
  get fc() {
    return this.form.controls;
  }
  get fc_pw() {
    return this.fc.password.controls;
  }

  // 選択肢周りの変数
  options = {
    province: [] as SelectOption[],
    cutoff_date_billing: [] as SelectOption[],
    scheduled_payment_date: [] as SelectOption[],
    payment_division_id: [] as SelectOption[],
    payment_site_division_id: [] as SelectOption[],
    sales_fraction_division_id: [] as SelectOption[],
    sales_tax_division_id: [] as SelectOption[],
    sales_tax_calc_division_id: [] as SelectOption[],
    sales_tax_fraction_division_id: [] as SelectOption[],
  };

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private route: ActivatedRoute,
    private common: CommonService,
    private service: SupplierService,
    private customTags: SupplierCustomTagService,
    private divisions: DivisionService
  ) {}

  // ログイン中ユーザー
  author!: Employee;
  private subscription = new Subscription();
  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 選択肢を初期化
    this.initOptions();

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

    // 新規登録なら処理終了
    if (!this.id) {
      return;
    }

    // パスワードの入力フォームを無効化
    this.fc.password.disable();

    // 各APIサービスのオブザーバブルを作成
    const supplier$ = this.service
      .find(this.id)
      .pipe(catchError(this.service.handleErrorModal<SupplierApiResponse>()));
    const customTag$ = this.customTags
      .getRelatedCustomTags(this.id)
      .pipe(
        catchError(
          this.customTags.handleErrorModal<SupplierCustomTagApiResponse>()
        )
      );

    // APIコール
    this.common.loading = true;
    forkJoin({ ss: supplier$, ct: customTag$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        // 仕入先の各種情報をセット
        const supplier = x.ss.data[0];
        this.form.patchValue(supplier as object);
        this.updater = `${supplier.employee_updated_last_name} ${supplier.employee_updated_first_name}`;

        // カスタムタグのフォームを生成して値をセット
        const tags = x.ct.data;
        if (tags.length) {
          this.fc.supplier_custom_tag.clear(); // 初期設定のフォームを削除
        }
        tags.map((y) =>
          this.fc.supplier_custom_tag.push(
            this.fb.group({
              custom_tag_id: y.custom_tag_id + '',
              name: y.custom_tag_name,
              value: y.custom_tag_value,
            })
          )
        );
      });
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
  private initOptions() {
    this.common.loading = true;
    this.divisions
      .getAsSelectOptions()
      .pipe(
        catchError(
          this.divisions.handleErrorModal({} as Record<string, SelectOption[]>)
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        // 区分を設定
        this.options.payment_division_id = x['仕入先支払区分'];
        this.options.payment_site_division_id = x['支払いサイト'];
        this.options.sales_fraction_division_id = x['販売端数区分'];
        this.options.sales_tax_division_id = x['仕入先消費税区分'];
        this.options.sales_tax_calc_division_id = x['得意先消費税計算区分'];
        this.options.sales_tax_fraction_division_id = x['消費税端数区分'];

        // 都道府県を設定
        this.options.province = provinces.map((x) => ({ value: x, text: x }));

        // 締日・支払日を設定
        const date = [...Array(30)].map((_, i) => ({
          value: i + 1,
          text: `${i + 1}日`,
        }));
        date.push({ value: 99, text: '末日' });
        this.options.cutoff_date_billing = [...date];
        this.options.scheduled_payment_date = [...date];

        // 初期値を設定
        Object.values(this.options).forEach((value) =>
          value.unshift({ value: '', text: '選択してください' })
        );

        // 新規登録の場合のみ
        if (!this.id) {
          // 販売端数区分の初期値を設定
          const target = this.options.sales_fraction_division_id!.find(
            (item) => item.text === '四捨五入'
          );
          const value = target?.value?.toString() || '';
          this.form.patchValue({ sales_fraction_division_id: value });
        }
      });
  }
}
