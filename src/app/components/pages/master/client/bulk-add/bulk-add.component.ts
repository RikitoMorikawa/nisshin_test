import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ClientService } from 'src/app/services/client.service';
import { ApiCallStatus } from '../../template/add-edit/add-edit.component';
import { ClientConst, clientConst } from 'src/app/const/client.const';
import { CommonService } from 'src/app/services/shared/common.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { ErrorService } from 'src/app/services/shared/error.service';
import { divisionConst } from 'src/app/const/division.const';
import { modalConst } from 'src/app/const/modal.const';
import { Subscription, catchError, finalize, of, forkJoin } from 'rxjs';
import { DivisionService } from 'src/app/services/division.service';
import { DivisionIdService } from 'src/app/services/shared/divisionid.service';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit {
  // 得意先用の定数
  clientConst: ClientConst = clientConst;
  fileNamePrefix = '得意先';
  apiService = this.service;
  authorname: string = 'データ取得中...';

  // エラーモーダルのタイトル
  errorModalTitle = '得意先一括登録エラー：' + modalConst.TITLE.HAS_ERROR;

  descriptions = [
    {
      title: 'id',
      description: '得意先ID（半角英数）※空欄にすると新規登録になります。',
    },
    {
      title: 'client_cd',
      description: `得意先コード（${clientConst.CHARACTER_LIMITS.CLIENT_CD_MAX_LENGTH}桁以内の半角数字）`,
      required: true,
    },
    {
      title: 'name',
      description: `得意先名（${clientConst.CHARACTER_LIMITS.NAME_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'name_kana',
      description: `得意先名カナ（${clientConst.CHARACTER_LIMITS.NAME_KANA_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'pic_name',
      description: `担当者名（${clientConst.CHARACTER_LIMITS.PIC_NAME_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'pic_name_kana',
      description: `担当者名カナ（${clientConst.CHARACTER_LIMITS.PIC_NAME_KANA_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'billing_cd',
      description: `請求先コード（${clientConst.CHARACTER_LIMITS.BILLING_CD_MAX_LENGTH}桁以内の半角数字）`,
      required: true,
    },
    {
      title: 'postal_code',
      description: `郵便番号（${clientConst.CHARACTER_LIMITS.POSTAL_CODE_MAX_LENGTH}桁のハイフンなし半角数字）`,
      required: true,
    },
    {
      title: 'province',
      description: `都道府県（${clientConst.CHARACTER_LIMITS.PROVINCE_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'locality',
      description: `市区町村（${clientConst.CHARACTER_LIMITS.LOCALITY_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'street_address',
      description: `町名番地（${clientConst.CHARACTER_LIMITS.STREET_ADDRESS_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'other_address',
      description: `建物名など（${clientConst.CHARACTER_LIMITS.OTHER_ADDRESS_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'tel',
      description: `電話番号（${clientConst.CHARACTER_LIMITS.TEL_MAX_LENGTH}桁以内のハイフンなし半角数字）`,
      required: false,
    },
    {
      title: 'fax',
      description: `FAX（${clientConst.CHARACTER_LIMITS.FAX_MAX_LENGTH}桁以内のハイフンなし半角数字）`,
      required: false,
    },
    {
      title: 'mail',
      description: `メールアドレス（${clientConst.CHARACTER_LIMITS.MAIL_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'remarks_1',
      description: `備考１（${clientConst.CHARACTER_LIMITS.REMARKS_1_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'remarks_2',
      description: `備考２（${clientConst.CHARACTER_LIMITS.REMARKS_2_MAX_LENGTH}文字以内の文字列）`,
      required: false,
    },
    {
      title: 'cutoff_date_billing',
      description: '締日（無し：98、末日：99、無し・末日以外：半角数値で指定）',
      required: true,
    },
    {
      title: 'scheduled_payment_date',
      description: '支払予定日（末日：99、末日以外：半角数値で指定）',
      required: false,
    },
    {
      title: 'payment_division_id',
      description: '支払区分（売掛：??、現金：??）',
      required: true,
    },
    {
      title: 'sales_tax_division_id',
      description: '消費税区分（外税：??、内税：??、非課税：??）',
      required: false,
    },
    {
      title: 'sales_tax_calc_division_id',
      description: '消費税計算区分（月単位：??、伝票単位：??）',
      required: true,
    },
    {
      title: 'sales_fraction_division_id',
      description: '販売端数区分（切り捨て：?、切り上げ：?、四捨五入：?）',
      required: false,
    },
    {
      title: 'sales_tax_fraction_division_id',
      description: '消費税端数区分（切り捨て：?、切り上げ：?、四捨五入：?）',
      required: true,
    },
    {
      title: 'print_division_id',
      description: '印刷区分（オリジナル：??、ドット：??）',
      required: false,
    },
    {
      title: 'rank_division_id',
      description: 'ランク価格ID（設定のランク価格を参照してください）',
      required: false,
    },
    {
      title: 'next_billing_date',
      description: '次回請求日（YYYY-MM-DD。例：2023-01-01）',
      required: false,
    },
    {
      title: 'next_credit_confirmation_date',
      description: '与信の次回確認日（YYYY-MM-DD。例：2023-01-01）',
      required: false,
    },
    {
      title: 'accounts_receivable_balance',
      description: `前回売掛金残（半角数字）`,
      required: false,
    },
    {
      title: 'credit',
      description: `売掛限度額（${clientConst.CHARACTER_LIMITS.CREDIT_MAX_LENGTH}桁以内の半角数字）`,
      required: false,
    },
    {
      title: 'line_num',
      description: `明細行数（${clientConst.CHARACTER_LIMITS.LINE_NUM_MAX_LENGTH}桁以内の半角数字）`,
      required: false,
    },
    {
      title: 'title_division_id',
      description: '敬称（御中：??、様：??、指定：??）',
      required: false,
    },
    {
      title: 'custom_title',
      description: `${clientConst.CHARACTER_LIMITS.CUSTOM_TITLE_MAX_LENGTH}文字以内の文字列（敬称「指定」選択時の敬称。敬称「指定」時は必須）`,
      required: false,
    },
    {
      title: 'payment_term',
      description:
        '支払いサイト（翌月：??、翌々月：??、3か月後：???、当月：???）',
      required: false,
    },
    {
      title: 'custom_tag',
      description:
        'カスタムタグ（タグ名:値。2つ以上登録する場合は「タグ名:値@タグ名:値」のように@でつなぐ）',
      required: false,
    },
  ];

  /**
   *  コンストラクタ
   * @param common
   * @param service
   */
  constructor(
    private common: CommonService,
    private service: ClientService,
    private divisionService: DivisionService,
    private dIService: DivisionIdService,
    private errorService: ErrorService,
    private authorService: AuthorService
  ) {}

  // ログイン中ユーザー
  author!: Employee;

  // 購読を一元管理
  private subscription = new Subscription();
  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  // コンポーネントの初期化処理
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
    this.initOptions();
  }

  /**
   * 一括登録のステータス変更に応じた処理
   * @param status 一括登録テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    if (status === ApiCallStatus.START) {
      this.common.loading = true;
    }
    if (status === ApiCallStatus.END) {
      this.common.loading = false;
    }
  }

  initOptions() {
    this.common.loading = true;

    this.subscription.add(
      forkJoin([this.divisionService.getAsSelectOptions()])
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
          const divisions = res[0];
          this.setDescriptions(divisions);
        })
    );
  }

  setDescriptions(divisions: any) {
    //console.log(divisions);
    const accounts_receivable = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_PAYMENT_TYPE,
      clientConst.PAYMENT_DIVISION.CODE.ACCOUNTS_RECEIVABLE
    );
    const cash = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_PAYMENT_TYPE,
      clientConst.PAYMENT_DIVISION.CODE.CASH
    );
    const tax_excluded = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_SALES_TAX,
      clientConst.SALES_TAX_DIVISION.CODE.TAX_EXCLUDED
    );
    const tax_included = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_SALES_TAX,
      clientConst.SALES_TAX_DIVISION.CODE.TAX_INCLUDED
    );
    const non_taxable = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_SALES_TAX,
      clientConst.SALES_TAX_DIVISION.CODE.NON_TAXABLE
    );
    const sales_tax_calc_monthly = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_SALES_TAX_CALC_TYPE,
      clientConst.SALES_TAX_CALC_DIVISION.CODE.MONTHLY
    );
    const sales_tax_calc_slip_unit = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_SALES_TAX_CALC_TYPE,
      clientConst.SALES_TAX_CALC_DIVISION.CODE.SLIP_UNIT
    );
    const sales_fraction_round_down = this.dIService.getDivisionid(
      divisions,
      divisionConst.SUPPLIER_SALES_FRACTION,
      clientConst.SALES_FRACTION.CODE.ROUND_DOWN
    );
    const sales_fraction_round_up = this.dIService.getDivisionid(
      divisions,
      divisionConst.SUPPLIER_SALES_FRACTION,
      clientConst.SALES_FRACTION.CODE.ROUND_UP
    );
    const sales_fraction_round_half_up = this.dIService.getDivisionid(
      divisions,
      divisionConst.SUPPLIER_SALES_FRACTION,
      clientConst.SALES_FRACTION.CODE.ROUND_HALF_UP
    );

    const sales_tax_fraction_round_down = this.dIService.getDivisionid(
      divisions,
      divisionConst.MAIN_SALES_TAX_FRACTION,
      clientConst.SALES_TAX_FRACTION.CODE.ROUND_DOWN
    );
    const sales_tax_fraction_round_up = this.dIService.getDivisionid(
      divisions,
      divisionConst.MAIN_SALES_TAX_FRACTION,
      clientConst.SALES_TAX_FRACTION.CODE.ROUND_UP
    );
    const sales_tax_fraction_round_half_up = this.dIService.getDivisionid(
      divisions,
      divisionConst.MAIN_SALES_TAX_FRACTION,
      clientConst.SALES_TAX_FRACTION.CODE.ROUND_HALF_UP
    );

    const print_original = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_PRINT_TYPE,
      clientConst.PRINT.CODE.ORIGINAL
    );
    const print_dot = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_PRINT_TYPE,
      clientConst.PRINT.CODE.DOT
    );
    const title_organization = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_TITLE,
      clientConst.TITLE.CODE.ORGANIZATION
    );
    const title_individual = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_TITLE,
      clientConst.TITLE.CODE.INDIVIDUAL
    );
    const title_user_specified = this.dIService.getDivisionid(
      divisions,
      divisionConst.CLIENT_TITLE,
      clientConst.TITLE.CODE.USER_SPECIFIED
    );

    const payment_term_after_1_months = this.dIService.getDivisionid(
      divisions,
      divisionConst.TERM_OF_PAYMENT,
      clientConst.PAYMENT_TERM.CODE.AFTER_1_MONTHS
    );
    const payment_term_after_2_months = this.dIService.getDivisionid(
      divisions,
      divisionConst.TERM_OF_PAYMENT,
      clientConst.PAYMENT_TERM.CODE.AFTER_2_MONTHS
    );
    const payment_term_after_3_months = this.dIService.getDivisionid(
      divisions,
      divisionConst.TERM_OF_PAYMENT,
      clientConst.PAYMENT_TERM.CODE.AFTER_3_MONTHS
    );
    const payment_term_current_month = this.dIService.getDivisionid(
      divisions,
      divisionConst.TERM_OF_PAYMENT,
      clientConst.PAYMENT_TERM.CODE.CURRENT_MONTH
    );

    this.descriptions.map((description) => {
      if (description.title === 'payment_division_id') {
        description.description = `支払区分（売掛：${accounts_receivable}、現金：${cash}）`;
      }
      if (description.title === 'sales_tax_division_id') {
        description.description = `消費税区分（外税：${tax_excluded}、内税：${tax_included}、非課税：${non_taxable}）`;
      }
      if (description.title === 'sales_tax_calc_division_id') {
        description.description = `消費税計算区分（月単位：${sales_tax_calc_monthly}、伝票単位：${sales_tax_calc_slip_unit}）`;
      }
      if (description.title === 'sales_fraction_division_id') {
        description.description = `販売端数区分（切り捨て：${sales_fraction_round_down}、切り上げ：${sales_fraction_round_up}、四捨五入：${sales_fraction_round_half_up}）`;
      }
      if (description.title === 'sales_tax_fraction_division_id') {
        description.description = `消費税端数区分（切り捨て：${sales_tax_fraction_round_down}、切り上げ：${sales_tax_fraction_round_up}、四捨五入：${sales_tax_fraction_round_half_up}）`;
      }
      if (description.title === 'print_division_id') {
        description.description = `印刷区分（オリジナル：${print_original}、ドット：${print_dot}）`;
      }
      if (description.title === 'title_division_id') {
        description.description = `敬称（御中：${title_organization}、様：${title_individual}、指定：${title_user_specified}）`;
      }
      if (description.title === 'payment_term') {
        description.description = `支払いサイト（翌月：${payment_term_after_1_months}、翌々月：${payment_term_after_2_months}、3か月後：${payment_term_after_3_months}、当月：${payment_term_current_month}）`;
      }
    });
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
}
