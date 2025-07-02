import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, Observable, Subscription } from 'rxjs';
import { ApiResponse } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ApiCallStatus } from '../add-edit/add-edit.component';

/**
 * 説明文オブジェクトの型
 */
type Description = {
  title: string;
  description: string;
  required?: boolean;
};

/**
 * APIサービスの型
 */
type ApiService = {
  bulkAdd(file: Blob): Observable<ApiResponse>;
  getCsv<T>(type: 'template' | 'csv', params?: Partial<T>): Observable<string>;
  handleErrorModal<T>(): (err: HttpErrorResponse) => Observable<T>;
};

/**
 * 一括登録画面テンプレートコンポーネント
 */
@Component({
  selector: 'app-template-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  @Input() service!: ApiService;
  @Input() descriptions: Description[] = [];
  @Output() statusChange = new EventEmitter<ApiCallStatus>();

  // フォームコントロール周りの変数
  ctrl = new FormControl<File | null>(null, Validators.required);
  filename?: string;
  private subscription?: Subscription;

  // テンプレートダウンロード用
  template$!: Observable<string>;
  @Input() fileNamePrefix!: string;
  @Input() templateFileExtension = '';

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flash: FlashMessageService
  ) {}

  ngOnInit(): void {
    // テンプレートダウンロード用のオブザーバブルをセット
    this.template$ = this.service
      .getCsv('template')
      .pipe(catchError(this.service.handleErrorModal<string>()));

    // ファイルの変更を購読
    this.subscription = this.ctrl.valueChanges.subscribe(
      (x) => (this.filename = x?.name)
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
    this.statusChange.emit(ApiCallStatus.START);
    this.service
      .bulkAdd(this.ctrl.value)
      .pipe(
        catchError(this.service.handleErrorModal<ApiResponse>()),
        finalize(() => this.statusChange.emit(ApiCallStatus.END))
      )
      .subscribe((x) => {
        if (x === undefined) {
          return;
        }
        if (x.message === '登録しました') {
          this.showSuccessMessage('正常に登録されました。');
          this.router.navigate(['../'], { relativeTo: this.route });
        }
        if (x.message === 'バックエンド処理を登録しました') {
          this.showSuccessMessage(
            '更新処理がバックエンドでの処理に登録されました。'
          );
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  /**
   * 成功のフラッシュメッセージを表示する。
   * @param message 表示するメッセージ。
   */
  private showSuccessMessage(message: string) {
    this.flash.setFlashMessage(message, 'success', 15000);
  }
}
