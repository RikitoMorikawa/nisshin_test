import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  catchError,
  filter,
  finalize,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { AuthorService } from 'src/app/services/author.service';
import { generalConst } from 'src/app/const/general.const';
import { HttpErrorResponse } from '@angular/common/http';
import { Employee } from 'src/app/models/employee';
import { ModalPurpose } from 'src/app/services/modal.service';
import { ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { Router } from '@angular/router';
import { PbSecondCategoryService } from 'src/app/services/pb-second-category.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private authorService: AuthorService,
    private modalService: ModalService,
    private router: Router,
    private pbSecondCategoryService: PbSecondCategoryService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  private subscription = new Subscription();

  // テンプレートダウンロード用
  template$!: Observable<string>;
  fileNamePrefix = '商品ブック第2分類';

  // ログイン中ユーザー
  author!: Employee;

  // キャンセル用モーダルのタイトル
  cancelModalTitle =
    '商品ブック第2分類一括登録キャンセル：' + modalConst.TITLE.CANCEL;

  // アップロード対象のファイル名
  fileName?: string;

  // アップロード可能な最大ファイルサイズ
  exceededFileSizeLimit = generalConst.IMAGE_MAX_FILE_SIZE;

  // ファイル最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // アップロードボタン活性化・非活性化制御フラグ
  isUploadable = false;

  // リアクティブフォームとバリデーションの設定
  scBulkAddForm = this.formBuilder.group({
    file: [null, [this.limitFileSizeValidator()]],
  });

  // CSVファイルの説明
  descriptions = [
    {
      title: 'id',
      description:
        '商品ブック第2分類ID（半角数字）※空欄にすると新規登録になります。',
    },
    {
      title: 'name',
      description: '商品ブック第2分類名（20文字以内）',
      required: true,
    },
    {
      title: 'furi',
      description: '商品ブック第2分類名カナ（20文字以内）',
    },
    {
      title: 'product_book_first_category_id',
      description: '商品ブック第1分類ID（半角数字）',
      required: true,
    },
    {
      title: 'store_id',
      description: '店舗ID（半角数字）',
      required: false,
    },
  ];
  ngOnInit(): void {
    // テンプレートダウンロード用のオブザーバブルを作成
    this.template$ = this.pbSecondCategoryService.getCsv('template').pipe(
      catchError(this.handleCatchError<string>('')),
      finalize(() => (this.common.loading = false))
    );

    // 購読を格納
    this.subscription.add(
      // 画像の FormControl の変更を購読
      this.scBulkAddForm.controls.file.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
      })
    );
    if (this.authorService.author) {
      this.author = this.authorService.author;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
    // 購読を格納
    this.subscription.add(
      // キャンセルのモーダルを購読
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // キャンセルのモーダルじゃなければスルー
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl('/setting/product-book-second-category');
          }
        })
    );
  }

  /**
   * ファイルサイズバリデーション
   * 最大ファイルサイズ：maxFileSizeで指定
   * @returns { upload_file: { value: null } } | null
   */
  limitFileSizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file: File = control.value;
      // ファイルサイズが3Mより大きい場合はアップロードさせない
      if (file?.size && file?.size > generalConst.IMAGE_MAX_FILE_SIZE) {
        // employeeAddForm upload_file"の値を削除する
        this.scBulkAddForm.controls.file.setValue(null);
        // upload_fileのerrorsへエラーメッセージを設定
        return { limitFileSize: { errorMessage: this.exceededFileSizeLimit } };
      }
      return null;
    };
  }

  /**
   * TODO: テンプレートダウンロード用エラー対応、親コンポーネントへ渡す処理があるので統合するなどリファクタリングが必要
   * @param result
   * @returns
   */
  private handleCatchError<T>(result?: T) {
    return (err: HttpErrorResponse) => {
      console.error(err);
      return of(result as T);
    };
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string): void {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '商品ブック第2分類一括登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * キャンセルボタンが押された場合の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (this.isUploadable) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl('/setting/product-book-second-category');
    }
  }

  /**
   * ファイルアップロード
   * @returns void
   */
  handleClickUploadButton(): void {
    // ボタンを非活性
    this.isUploadable = false;
    // ローディング開始
    this.common.loading = true;

    // 購読を格納
    this.subscription.add(
      // 商品ブック第1分類一括登録実行
      this.pbSecondCategoryService
        .bulkAdd(this.scBulkAddForm.controls.file.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
          } else {
            const purpose: FlashMessagePurpose = 'success';
            this.flashMessageService.setFlashMessage(
              res.message,
              purpose,
              15000
            );
            this.router.navigateByUrl('/setting/product-book-second-category');
          }
        })
    );
  }

  /**
   * ファイル削除アイコクリック対応
   * @returns void
   */
  handleClickDeleteIcon(): void {
    this.scBulkAddForm.controls.file.setValue(null);
  }

  /**
   * ファイル選択時の更新処理
   * @param file 対象となる File オブジェクト
   * @returns void
   */
  private updatePreviewElements(file: File | null): void {
    if (file) {
      this.fileName = file.name;
      this.isUploadable = true;
    } else {
      this.fileName = undefined;
      this.isUploadable = false;
    }
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を解除
    this.subscription.unsubscribe();
  }
}
