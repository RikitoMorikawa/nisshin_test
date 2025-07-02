import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, Subscription } from 'rxjs';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { CustomTagApiResponse } from 'src/app/models/custom-tag';
import { AuthorService } from 'src/app/services/author.service';
import { CustomTagService } from 'src/app/services/custom-tag.service';
import { CustomTagCommonService } from '../custom-tag-common.service';
import { Employee } from 'src/app/models/employee';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-custom-tag-bulk-add',
  templateUrl: './custom-tag-bulk-add.component.html',
  styleUrls: ['./custom-tag-bulk-add.component.scss'],
})
export class CustomTagBulkAddComponent implements OnInit, OnDestroy {
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
  fileNamePrefix = 'カスタムタグ';

  // CSVファイルの説明文
  descriptions = [
    {
      title: 'name',
      description: 'タグ名（255文字以内の文字列）',
      required: true,
    },
    {
      title: 'value',
      description: '値（255文字以内の文字列）',
      required: true,
    },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private cucommon: CustomTagCommonService,
    private router: Router,
    private service: CustomTagService,
    private author: AuthorService,
    public common: CommonService
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
        catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '登録しました') {
          this.cucommon.showSuccessMessage(
            'カスタムタグ情報が正常に登録されました。'
          );
          this.router.navigateByUrl('/setting/custom-tag');
        }
      });
  }
}
