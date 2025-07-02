import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, catchError, finalize, of } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { Employee } from 'src/app/models/employee';
import { PriceChangeApiResponse } from 'src/app/models/price-change';
import { AuthorService } from 'src/app/services/author.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ModalService } from 'src/app/services/modal.service';
import { PriceRankingService } from 'src/app/services/price-ranking.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  constructor(
    private authorService: AuthorService,
    private priceRankingService: PriceRankingService,
    private modal: ModalService,
    private flash: FlashMessageService,
    private router: Router,
    public common: CommonService
  ) {}

  // 購読を格納する変数
  private subscription = new Subscription();

  // 一覧ページのパス
  listPagePath = '/setting/price-ranking';

  // 設定一覧のパス
  settingMenuPath = '/setting';

  // ログイン中ユーザー
  author!: Employee;
  updater!: string;

  // テンプレートダウンロード用
  template$!: Observable<string>;
  fileNamePrefix = 'ランク価格';
  ctrl = new FormControl<File | null>(null, Validators.required);
  filename?: string;

  // CSVファイルの説明文
  descriptions = [
    {
      title: 'rank_division_id',
      description: 'ランク区分ID（半角数字）',
      required: true,
    },
    { title: 'store_id', description: '店舗ID（半角数字）', required: true },
    { title: 'product_id', description: '商品ID（半角数字）', required: true },
    {
      title: 'supplier_cost_price',
      description: 'バラ仕入単価（半角数字）',
      required: true,
    },
    {
      title: 'b_supplier_cost_price',
      description: '小分け仕入単価（半角数字）',
    },
    {
      title: 'c_supplier_cost_price',
      description: 'ケース仕入単価（半角数字）',
    },
    { title: 'gross_profit_rate', description: 'バラ荒利率（半角数字）' },
    { title: 'b_gross_profit_rate', description: '小分け荒利率（半角数字）' },
    { title: 'c_gross_profit_rate', description: 'ケース荒利率（半角数字）' },
    {
      title: 'selling_price',
      description: 'バラ売価（半角数字）',
      required: true,
    },
    { title: 'b_selling_price', description: '小分け売価（半角数字）' },
    { title: 'c_selling_price', description: 'ケース売価（半角数字）' },
    {
      title: 'sales_tax_division_id',
      description:
        '商品消費税区分ID（外税10%：28、内税10%：29、非課税：30、外税8%：31、内税8%：32）',
      required: true,
    },
    {
      title: 'sales_fraction_division_id',
      description:
        '商品消費税端数区分ID（切り捨て：4、切り上げ：5、四捨五入：6）',
      required: true,
    },
    {
      title: 'supplier_sales_tax_division_id',
      description: '仕入先消費税区分ID（外税：33、内税：34、非課税：35）',
      required: true,
    },
    {
      title: 'supplier_sales_fraction_division_id',
      description:
        '仕入先消費税端数区分ID（切り捨て：4、切り上げ：5、四捨五入：6）',
      required: true,
    },
  ];

  /**
   * 初期化処理
   *
   */
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

    // ファイル選択時にファイル名を取得
    this.subscription.add(
      this.ctrl.valueChanges.subscribe((x) => (this.filename = x?.name))
    );

    // テンプレートダウンロード用のオブザーバブルを作成
    this.template$ = this.priceRankingService
      .getCsv('template')
      .pipe(catchError(this.handleError<string>('')));
  }

  /**
   * キャンセルリンククリック時の処理
   */
  handleClickCancelLink() {
    this.router.navigateByUrl(this.listPagePath);
  }

  /**
   * アップロードボタンクリック時の処理
   */
  onClickUpload() {
    // value が空なら何もしない（念のため）
    if (!this.ctrl.value) {
      return;
    }
    // APIコール
    this.common.loading = true;
    this.subscription.add(
      this.priceRankingService
        .bulkAdd(this.ctrl.value)
        .pipe(
          catchError(this.handleError({} as PriceChangeApiResponse)),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((x) => {
          if (x.message === '登録しました') {
            this.flash.setFlashMessage(
              'ランク価格情報が正常に登録されました。',
              'success',
              15000
            );
            this.router.navigateByUrl(this.listPagePath);
          }
          if (x.message === 'バックエンド処理を登録しました') {
            this.flash.setFlashMessage(
              'ランク価格情報更新がバックエンドでの処理に登録されました。',
              'success',
              15000
            );
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );
  }

  /**
   * ユーザーへエラーを通知するモーダルを表示し、
   * アプリの動作を止めないよう空のオブジェクトを返却する。
   * @returns `catchError`関数へ渡す関数。
   */
  private handleError<T>(result?: T) {
    return (err: HttpErrorResponse) => {
      console.error(err);
      this.modal.setModal(
        modalConst.TITLE.HAS_ERROR,
        `${err.message}\n\n${err.error.message}`,
        'danger',
        '閉じる',
        ''
      );
      return of(result as T);
    };
  }

  ngOnDestroy(): void {
    // 購読を解除
    this.subscription.unsubscribe();
  }
}
