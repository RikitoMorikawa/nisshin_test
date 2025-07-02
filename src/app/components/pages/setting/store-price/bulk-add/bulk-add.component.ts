import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, Subscription, take } from 'rxjs';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { StorePriceApiResponse } from 'src/app/models/store-price';
import { AuthorService } from 'src/app/services/author.service';
import { StorePriceService } from 'src/app/services/store-price.service';
import { StorePriceCommonService } from '../store-price-common.service';
import { Employee } from 'src/app/models/employee';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  // 各種変数
  editor = { name: '', role: '' };

  // フォームコントロール周りの変数
  ctrl = new FormControl<File | null>(null, Validators.required);
  filename?: string;
  private subscription?: Subscription;

  // テンプレートダウンロード用
  template$ = this.service.getCsv('template').pipe(
    catchError(this.service.handleErrorModal<string>()),
    finalize(() => (this.common.loading = false))
  );
  fileNamePrefix = '店舗売価';

  // CSVファイルの説明文
  descriptions = [
    { title: 'store_id', description: '店舗ID（半角数字）', required: true },
    { title: 'product_id', description: '商品ID（半角数字）', required: true },
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
    { title: 'gross_profit_rate', description: '荒利率（半角数字）' },
    { title: 'b_gross_profit_rate', description: 'B荒利率（半角数字）' },
    { title: 'c_gross_profit_rate', description: 'C荒利率（半角数字）' },
    { title: 'selling_price', description: '売価（半角数字）', required: true },
    { title: 'b_selling_price', description: 'B売価（半角数字）' },
    { title: 'c_selling_price', description: 'C売価（半角数字）' },
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
    {
      title: 'supplier_cost_price',
      description: '仕入先商品単価（半角数字）',
      required: true,
    },
    {
      title: 'b_supplier_cost_price',
      description: '仕入先商品B単価（半角数字）',
      required: true,
    },
    {
      title: 'c_supplier_cost_price',
      description: '仕入先商品C単価（半角数字）',
      required: true,
    },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private spcommon: StorePriceCommonService,
    private router: Router,
    private service: StorePriceService,
    private author: AuthorService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ファイルの変更を購読
    this.subscription = this.ctrl.valueChanges.subscribe(
      (x) => (this.filename = x?.name)
    );

    // 登録者情報の取得と設定
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
    this.editor.name = authorInfo.last_name + ' ' + authorInfo.first_name;
    this.editor.role = authorInfo.role_name ?? '';
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * エクスポートの進捗応じた処理
   * @param status エクスポートコンポーネントから取得されるステータス
   */
  onExportStatusChange(status: ExportStatus) {
    if (status === ExportStatus.START) {
      // エラー発生時に備えて false の設定はオブザーバブルの finalize で処理
      this.common.loading = true;
    }
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
    this.service
      .bulkAdd(this.ctrl.value)
      .pipe(
        catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '登録しました') {
          this.spcommon.showSuccessMessage(
            '店舗売価情報が正常に登録されました。'
          );
          this.router.navigateByUrl('/setting/store-price');
        }
      });
  }
}
