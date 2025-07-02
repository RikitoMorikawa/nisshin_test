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
import { PriceChangeService } from 'src/app/services/price-change.service';
import { CommonService } from 'src/app/services/shared/common.service';
@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  constructor(
    private authorService: AuthorService,
    private priceChangeService: PriceChangeService,
    private modal: ModalService,
    private flash: FlashMessageService,
    private router: Router,
    public common: CommonService
  ) {}

  // 購読を格納する変数
  private subscription = new Subscription();

  // 一覧ページのパス
  listPagePath = '/setting/price-change';

  // 設定一覧のパス
  settingMenuPath = '/setting';

  // ログイン中ユーザー
  author!: Employee;
  updater!: string;

  // テンプレートダウンロード用
  template$!: Observable<string>;
  fileNamePrefix = '価格変更';
  ctrl = new FormControl<File | null>(null, Validators.required);
  filename?: string;

  // CSVファイルの説明文
  descriptions = [
    { title: '項目名', description: '概要' },
    { title: 'product_id', description: '商品ID', required: true },
    { title: 'cost_price', description: 'バラ仕入単価', required: true },
    { title: 'b_cost_price', description: '小分け仕入単価' },
    { title: 'c_cost_price', description: 'ケース仕入単価' },
    { title: 'gross_profit_rate', description: 'バラ粗利率' },
    { title: 'b_gross_profit_rate', description: '小分け粗利率' },
    { title: 'c_gross_profit_rate', description: 'ケース粗利率' },
    { title: 'gross_profit_rate', description: 'バラ売価', required: true },
    { title: 'b_gross_profit_rate', description: '小分け売価' },
    { title: 'c_gross_profit_rate', description: 'ケース売価' },
    {
      title: 'scheduled_price_change_date',
      description: '価格変更予定日時',
      required: true,
    },
  ];

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
    this.template$ = this.priceChangeService
      .getCsv('template')
      .pipe(catchError(this.handleError<string>('')));
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
      this.priceChangeService
        .bulkAdd(this.ctrl.value)
        .pipe(
          catchError(this.handleError({} as PriceChangeApiResponse)),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((x) => {
          if (x.message === '登録しました') {
            this.flash.setFlashMessage(
              '販売価格情報が正常に登録されました。',
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
        err.message,
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
