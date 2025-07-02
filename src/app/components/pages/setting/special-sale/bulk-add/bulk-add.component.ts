import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, Subscription } from 'rxjs';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { SpecialSaleApiResponse } from 'src/app/models/special-sale';
import { AuthorService } from 'src/app/services/author.service';
import { SpecialSaleService } from 'src/app/services/special-sale.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { SpecialSaleCommonService } from '../special-sale-common.service';
import { Employee } from 'src/app/models/employee';

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
  fileNamePrefix = '特売';

  // CSVファイルの説明文
  descriptions = [
    {
      title: 'special_sale_cd',
      description: '特売コード（半角数字）',
      required: true,
    },
    { title: 'store_id', description: '店舗ID（半角数字）', required: true },
    { title: 'product_id', description: '商品ID（半角数字）', required: true },
    { title: 'gyo_cd', description: '行番号（半角数字）', required: true },
    {
      title: 'barcode',
      description: 'JANコード（13文字以内の文字列）',
      required: true,
    },
    {
      title: 'start_date',
      description: '開始日（14文字以内の文字列）',
      required: true,
    },
    {
      title: 'end_date',
      description: '終了日（14文字以内の文字列）',
      required: true,
    },
    {
      title: 'special_sale_price',
      description: '特売価格（半角数字）',
      required: true,
    },
    {
      title: 'special_sale_const_price',
      description: '特売原価（半角数字）',
      required: true,
    },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private spcommon: SpecialSaleCommonService,
    private router: Router,
    private service: SpecialSaleService,
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

    // 登録者情報の取得
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
        catchError(this.service.handleErrorModal<SpecialSaleApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '登録しました') {
          this.spcommon.showSuccessMessage('特売情報が正常に登録されました。');
          this.router.navigateByUrl('/setting/special-sale');
        }
      });
  }
}
