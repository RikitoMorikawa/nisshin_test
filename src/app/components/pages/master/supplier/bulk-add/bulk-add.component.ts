import { Component, OnInit } from '@angular/core';
import { SupplierService } from 'src/app/services/supplier.service';
import { ApiCallStatus } from '../../template/add-edit/add-edit.component';
import { SupplierConst, supplierConst } from 'src/app/const/supplier.const';
import { CommonService } from 'src/app/services/shared/common.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit {
  // 仕入先用の定数
  supplierConst: SupplierConst = supplierConst;
  fileNamePrefix = '仕入先';
  apiService = this.service;
  authorname: string = 'データ取得中...';

  descriptions = [
    {
      title: 'id',
      description: '仕入先ID（半角英数）※空欄にすると新規登録になります。',
    },
    {
      title: 'name',
      description: `仕入先名（${supplierConst.CHARACTER_LIMITS.NAME_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'name_kana',
      description: `仕入先名カナ（${supplierConst.CHARACTER_LIMITS.NAME_KANA_MAX_LENGTH}文字以内の文字列）`,
    },
    {
      title: 'postal_code',
      description: `郵便番号（ハイフンなし${supplierConst.CHARACTER_LIMITS.POSTAL_CODE_MAX_LENGTH}文字）`,
      required: true,
    },
    {
      title: 'province',
      description: `都道府県（${supplierConst.CHARACTER_LIMITS.PROVINCE_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'locality',
      description: `市区町村（${supplierConst.CHARACTER_LIMITS.LOCALITY_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'street_address',
      description: `町名番地（${supplierConst.CHARACTER_LIMITS.STREET_ADDRESS_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'other_address',
      description: `建物名など（${supplierConst.CHARACTER_LIMITS.OTHER_ADDRESS_MAX_LENGTH}文字以内の文字列）`,
    },
    {
      title: 'tel',
      description: `電話番号（ハイフンなし${supplierConst.CHARACTER_LIMITS.TEL_MAX_LENGTH}文字以内）`,
      required: true,
    },
    {
      title: 'fax',
      description: `FAX番号（ハイフンなし${supplierConst.CHARACTER_LIMITS.FAX_MAX_LENGTH}文字以内）`,
    },
    {
      title: 'mail',
      description: `メールアドレス（${supplierConst.CHARACTER_LIMITS.MAIL_MAX_LENGTH}文字以内の文字列）`,
      required: true,
    },
    {
      title: 'cutoff_date_billing',
      description: '締日（末日：99、末日以外：半角数値で指定）',
      required: true,
    },
    {
      title: 'scheduled_payment_date',
      description: '支払日（末日：99、末日以外：半角数値で指定）',
    },
    {
      title: 'payment_division_id',
      description: '支払区分（買掛: 340、現金: 341）',
    },
    {
      title: 'payment_site_division_id',
      description:
        '支払いサイト区分（翌月: 60、翌々月: 61、3か月後: 124、当月: 157）',
      required: true,
    },
    {
      title: 'sales_fraction_division_id',
      description: '販売端数区分（切り捨て: 1、切り上げ: 2、四捨五入: 3）',
      required: false,
    },
    {
      title: 'sales_tax_fraction_division_id',
      description: '消費税端数区分（切り捨て: 4、切り上げ: 5、四捨五入: 6）',
      required: true,
    },
    {
      title: 'sales_tax_division_id',
      description: '消費税区分（外税10%: 33、内税10%: 34、非課税: 35）',
      required: true,
    },
    {
      title: 'sales_tax_calc_division_id',
      description: '消費税計算区分（月単位: 15、伝票単位: 16）',
      required: true,
    },
    {
      title: 'remarks_1',
      description: `備考1（${supplierConst.CHARACTER_LIMITS.REMARKS_1_MAX_LENGTH}文字以内の文字列）'`,
    },
    {
      title: 'remarks_2',
      description: `備考2（${supplierConst.CHARACTER_LIMITS.REMARKS_2_MAX_LENGTH}文字以内の文字列）`,
    },
    {
      title: 'pic_name',
      description: `担当者名（${supplierConst.CHARACTER_LIMITS.PIC_NAME_MAX_LENGTH}文字以内の文字列）`,
    },
    {
      title: 'pic_name_kana',
      description: `担当者名カナ（${supplierConst.CHARACTER_LIMITS.PIC_NAME_KANA_MAX_LENGTH}文字以内の文字列）`,
    },
    {
      title: 'payee_1',
      description: `振込先1（${supplierConst.CHARACTER_LIMITS.PAYEE_1_MAX_LENGTH}文字以内の文字列）`,
    },
    {
      title: 'payee_2',
      description: `振込先2（${supplierConst.CHARACTER_LIMITS.PAYEE_2_MAX_LENGTH}文字以内の文字列）`,
    },
    { title: 'account_payable', description: '買掛残高（半角数字）' },
    {
      title: 'custom_tag',
      description:
        'カスタムタグ（タグ名:値。2つ以上登録する場合は「タグ名:値@タグ名:値」のように@でつなぐ）',
    },
    {
      title: 'password',
      description: `ログイン用パスワード（半角の英大文字小文字数字がそれぞれ1文字ずつ含まれる${supplierConst.CHARACTER_LIMITS.PASSWORD_MIN_LENGTH}～${supplierConst.CHARACTER_LIMITS.PASSWORD_MAX_LENGTH}文字の文字列）`,
      required: true,
    },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private service: SupplierService,
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
  }
  /**
   * 編集テンプレのステータス変更に応じた処理
   * @param status 編集テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    if (status === ApiCallStatus.START) {
      this.common.loading = true;
    }
    if (status === ApiCallStatus.END) {
      this.common.loading = false;
    }
  }
}
2;
