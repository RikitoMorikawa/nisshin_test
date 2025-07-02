import { Component, OnInit } from '@angular/core';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import {
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { provinces } from 'src/app/models/province';
import { regExConst } from 'src/app/const/regex.const';
import { ClientApiResponse } from 'src/app/models/client';
import { ClientCustomTagApiResponse } from 'src/app/models/client-custom-tag';
import { DivisionService } from 'src/app/services/division.service';
import { ClientCustomTagService } from 'src/app/services/client-custom-tag.service';
import { ClientService } from 'src/app/services/client.service';
import { ApiCallStatus } from '../../template/add-edit/add-edit.component';
import { divisionConst } from 'src/app/const/division.const';
import { clientConst, ClientConst } from 'src/app/const/client.const';
import { generalConst } from 'src/app/const/general.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit {
  // 定数
  clientConst: ClientConst = clientConst;
  generalConst = generalConst;
  // 各種パラメータ
  id = this.route.snapshot.params['id'];
  updater = 'データ取得中...';
  authorname = 'データ取得中...';
  apiService = this.service;

  // 送信時にフォームの値を修正する関数
  modifyFormValue = () => {
    const value = {
      ...this.form.value,
      ...this.form.controls.title.value,
    } as any;
    // カスタムタグの配列から空の要素を除外
    value.client_custom_tag = this.form.value.client_custom_tag?.filter(
      (x) => x.name && x.value
    );
    Object.keys(value.client_custom_tag).forEach((x: any) => {
      !x.custom_tag_id ? delete x.custom_tag_id : '';
    });

    // 与信の次回確認日の形式を変更
    if (value.next_credit_confirmation_date !== '') {
      value.next_credit_confirmation_date = new Date(
        String(value.next_credit_confirmation_date)
      ).toLocaleDateString();
    }

    // 次回請求日
    if (value.next_billing_date !== '') {
      value.next_billing_date = new Date(
        String(value.next_billing_date)
      ).toLocaleDateString();
    }

    return value;
  };

  //敬称区分_Designated Honorific Title
  designated_honorific_title_id!: number;
  designated_honorific_title_code!: number;
  is_user_specified_title: boolean = false;

  // フォームまわりの変数
  form = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.NAME_MAX_LENGTH)
        ),
      ],
    ],
    name_kana: [
      '',
      [
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.NAME_KANA_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    client_cd: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.CLIENT_CD_MAX_LENGTH)
        ),
      ],
    ],
    billing_cd: [
      '',
      [
        Validators.required,
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.BILLING_CD_MAX_LENGTH)
        ),
      ],
    ],
    pic_name: [
      '',
      [
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.PIC_NAME_MAX_LENGTH)
        ),
      ],
    ],
    pic_name_kana: [
      '',
      [
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.PIC_NAME_KANA_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    postal_code: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.POSTAL_CODE_MAX_LENGTH)
        ),
        Validators.minLength(
          Number(this.clientConst.CHARACTER_LIMITS.POSTAL_CODE_MIN_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    province: ['', Validators.required],
    locality: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.LOCALITY_MAX_LENGTH)
        ),
      ],
    ],
    street_address: [
      '',
      [
        Validators.required,
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.STREET_ADDRESS_MAX_LENGTH)
        ),
      ],
    ],
    other_address: [
      '',
      Validators.maxLength(
        Number(this.clientConst.CHARACTER_LIMITS.OTHER_ADDRESS_MAX_LENGTH)
      ),
    ],
    mail: [
      '',
      [
        Validators.email,
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.MAIL_MAX_LENGTH)
        ),
      ],
    ],
    tel: [
      '',
      [
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.TEL_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    fax: [
      '',
      [
        Validators.maxLength(
          Number(this.clientConst.CHARACTER_LIMITS.FAX_MAX_LENGTH)
        ),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    payment_division_id: ['', Validators.required],
    cutoff_date_billing: ['', Validators.required],
    scheduled_payment_date: [''],
    next_credit_confirmation_date: [''],
    next_billing_date: [''],
    payment_term: [''],
    sales_fraction_division_id: [''],
    print_division_id: [''],
    sales_tax_division_id: [''],
    sales_tax_calc_division_id: ['', Validators.required],
    sales_tax_fraction_division_id: ['', Validators.required],
    rank_division_id: [''],
    credit: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(
          Number(clientConst.CHARACTER_LIMITS.CREDIT_MAX_LENGTH)
        ),
      ],
    ],
    line_num: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(
          Number(clientConst.CHARACTER_LIMITS.LINE_NUM_MAX_LENGTH)
        ),
      ],
    ],
    remarks_1: [
      '',
      Validators.maxLength(
        Number(clientConst.CHARACTER_LIMITS.REMARKS_1_MAX_LENGTH)
      ),
    ],
    remarks_2: [
      '',
      Validators.maxLength(
        Number(clientConst.CHARACTER_LIMITS.REMARKS_2_MAX_LENGTH)
      ),
    ],
    title: this.fb.group(
      {
        title_division_id: [''],
        title_division_code: [''],
        custom_title: [
          '',
          Validators.maxLength(
            Number(clientConst.CHARACTER_LIMITS.CUSTOM_TITLE_MAX_LENGTH)
          ),
        ],
      },
      {
        validators: [
          CustomValidators.opponentSelectionRequiredValidator(
            'title_division_code',
            String(clientConst.TITLE.CODE.USER_SPECIFIED), // custom_titleが必須かどうか boolean
            'custom_title'
          ),
        ],
      }
    ),
    client_custom_tag: this.fb.array([
      this.fb.group({
        custom_tag_id: '',
        name: '',
        value: '',
      }),
    ]),
  });
  get fc() {
    return this.form.controls;
  }
  get fc_title() {
    return this.fc.title.controls;
  }

  // 選択肢まわりの変数
  options = {
    payment_division_id: [] as SelectOption[],
    cutoff_date_billing: [] as SelectOption[],
    scheduled_payment_date: [] as SelectOption[],
    payment_term: [] as SelectOption[],
    sales_fraction_division_id: [] as SelectOption[],
    print_division_id: [] as SelectOption[],
    sales_tax_division_id: [] as SelectOption[],
    sales_tax_calc_division_id: [] as SelectOption[],
    sales_tax_fraction_division_id: [] as SelectOption[],
    rank_division_id: [] as SelectOption[],
    title_division_id: [] as SelectOption[],
    province: [] as SelectOption[],
  };

  // テンプレートでの参照用
  errorConst = errorConst;

  // コンストラクタ
  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ClientService,
    private customTags: ClientCustomTagService,
    private divisions: DivisionService
  ) {}

  // ログイン中ユーザー
  author!: Employee;
  private subscription = new Subscription();
  // コンポーネントの初期化処理
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

    // 各APIサービスのオブザーバブルを作成
    const client$ = this.service
      .find(this.id)
      .pipe(catchError(this.service.handleErrorModal<ClientApiResponse>()));
    const customTag$ = this.customTags
      .getRelatedCustomTags(this.id)
      .pipe(
        catchError(
          this.customTags.handleErrorModal<ClientCustomTagApiResponse>()
        )
      );
    // APIコール
    this.common.loading = true;
    forkJoin({ cs: client$, ct: customTag$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        // 得意先の各種情報をセット
        const client = x.cs.data[0];
        this.form.patchValue(client as object);
        this.fc.title.patchValue(client as object);
        this.updater = `${client.employee_updated_last_name} ${client.employee_updated_first_name}`;
        console.log(client);
        this.setTitleDivisionId(Number(client.title_division_id));
        // カスタムタグのフォームを生成して値をセット
        const tags = x.ct.data;
        if (tags.length) {
          // 初期設定のフォームを削除
          this.fc.client_custom_tag.clear();
        }
        tags.map((y) =>
          this.fc.client_custom_tag.push(
            this.fb.group({
              custom_tag_id: y.custom_tag_id + '',
              name: y.custom_tag_name,
              value: y.custom_tag_value,
            })
          )
        );
      });
  }

  setTitleDivisionId(division_id: number) {
    if (Number(division_id) === this.designated_honorific_title_id) {
      console.log(true);
      this.fc_title.title_division_code.patchValue(
        String(clientConst.TITLE.CODE.USER_SPECIFIED)
      );
      this.is_user_specified_title = true;
    } else {
      this.fc_title.title_division_code.patchValue('');
      this.is_user_specified_title = false;
    }
  }
  getSelectTitleDivisionId(event: Event) {
    let targ_value = (event.target as HTMLInputElement).value;
    if (Number(targ_value) === this.designated_honorific_title_id) {
      this.fc_title.title_division_code.patchValue(
        String(clientConst.TITLE.CODE.USER_SPECIFIED)
      );
      this.is_user_specified_title = true;
    } else {
      this.fc_title.title_division_code.patchValue('');
      this.is_user_specified_title = false;
    }
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
   * 編集テンプレのステータス変更に応じた処理
   * @param status 編集テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    this.common.loading = !!status;
  }

  /**
   * 各APIから情報を取得して、選択肢項目を設定
   */
  private initOptions() {
    this.common.loading = true;
    const divisions_title$ = this.divisions.getAll({
      name: divisionConst.CLIENT_TITLE,
    });

    // 区分を取得
    const divisions$ = this.divisions
      .getAsSelectOptions()
      .pipe(
        catchError(
          this.divisions.handleErrorModal({} as Record<string, SelectOption[]>)
        )
      );
    forkJoin({
      divisions: divisions$,
      divisions_title: divisions_title$,
    })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        // 区分を設定
        this.options.payment_division_id =
          x.divisions[divisionConst.CLIENT_PAYMENT_TYPE];
        this.options.payment_term = x.divisions[divisionConst.TERM_OF_PAYMENT];
        this.options.sales_fraction_division_id =
          x.divisions[divisionConst.SALES_FRACTION];
        this.options.print_division_id =
          x.divisions[divisionConst.CLIENT_PRINT_TYPE];
        this.options.sales_tax_division_id =
          x.divisions[divisionConst.CLIENT_SALES_TAX];
        this.options.sales_tax_calc_division_id =
          x.divisions[divisionConst.CLIENT_SALES_TAX_CALC_TYPE];
        this.options.sales_tax_fraction_division_id =
          x.divisions[divisionConst.MAIN_SALES_TAX_FRACTION];
        this.options.title_division_id =
          x.divisions[divisionConst.CLIENT_TITLE];
        this.options.rank_division_id =
          x.divisions[divisionConst.PRICE_RANKING];
        // 都道府県を設定
        this.options.province = provinces.map((x) => ({ value: x, text: x }));

        // 締日・支払予定日を設定
        const date = [...Array(30)].map((_, i) => ({
          value: i + 1,
          text: `${i + 1}日`,
        }));
        date.push({ value: 99, text: '末日' });
        this.options.cutoff_date_billing = [
          ...date,
          { value: 98, text: '無し' },
        ]; // 締日のみ「無し」を追加
        this.options.scheduled_payment_date = [...date];

        // 初期値を設定
        Object.values(this.options).forEach((value) =>
          value.unshift({ value: '', text: '選択してください' })
        );
        //Title
        let title_divisions: any = x.divisions_title.data.find((y: any) => {
          return y.division_code === clientConst.TITLE.CODE.USER_SPECIFIED;
        });
        this.designated_honorific_title_id = title_divisions.id;
        this.designated_honorific_title_code = title_divisions.code;
      });
  }
}
