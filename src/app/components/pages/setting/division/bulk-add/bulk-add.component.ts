import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subscription,
  finalize,
  catchError,
  of,
  filter,
  Observable,
} from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { DivisionApiResponse } from 'src/app/models/division';
import { AuthorService } from 'src/app/services/author.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { DivisionService } from 'src/app/services/division.service';
import { FormBuilder } from '@angular/forms';
import { Employee } from 'src/app/models/employee';
import { generalConst } from 'src/app/const/general.const';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private authorService: AuthorService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private divisionService: DivisionService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    public common: CommonService
  ) {}

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // テンプレートダウンロード用
  //template$!: Observable<string>;

  // テンプレートダウンロード用
  template$ = this.divisionService.getCsv('template').pipe(
    catchError(this.divisionService.handleErrorModal<string>()),
    finalize(() => (this.common.loading = false))
  );

  fileNamePrefix = '区分';

  // ローディング中フラグ
  isDuringAcquisition = false;

  // キャンセル用モーダルのタイトル
  cancelModalTitle = '区分一括登録キャンセル：' + modalConst.TITLE.CANCEL;

  // ログイン中ユーザーを保持
  author!: Employee;

  // アップロード対象のファイル名
  fileName?: string;

  // アップロード可能な最大ファイルサイズ
  exceededFileSizeLimit = generalConst.IMAGE_MAX_FILE_SIZE;

  // ファイル最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // アップロードボタン活性化・非活性化制御フラグ
  isUploadable = false;

  // リアクティブフォームとバリデーションの設定
  divisionBulkAddForm = this.formBuilder.group({
    file: [null, [this.limitFileSizeValidator()]],
  });

  // CSVファイルの説明文
  descriptions = [
    {
      title: 'id',
      description: '区分ID（半角数字）※空欄にすると新規登録になります。',
    },
    {
      title: 'name',
      description: '区分名（255文字以内）',
      required: true,
    },
    {
      title: 'division_code',
      description: '区分コード',
      required: true,
    },
    {
      title: 'value',
      description: '区分の値（255文字以内）',
      required: true,
    },
  ];

  ngOnInit(): void {
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
            this.router.navigateByUrl('/employee/list');
          }
        })
    );

    // 購読を格納
    this.subscription.add(
      // 画像の FormControl の変更を購読
      this.divisionBulkAddForm.controls.file.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
      })
    );

    // ログイン中ユーザーを取得
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
        // divisionBulkAddForm file"の値を削除する
        this.divisionBulkAddForm.controls.file.setValue(null);
        // fileのerrorsへエラーメッセージを設定
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
      title: '区分一括登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * キャンセルボタンが押させて場合の処理
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
      this.router.navigateByUrl('/setting/division');
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
    this.isDuringAcquisition = true;

    // 購読を格納
    this.subscription.add(
      // 社員一括登録実行
      this.divisionService
        .bulkAdd(this.divisionBulkAddForm.controls.file.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.isDuringAcquisition = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
          } else {
            const purpose: FlashMessagePurpose = 'success';
            this.flashMessageService.setFlashMessage(
              res.message,
              purpose,
              15000
            );
            this.router.navigateByUrl('/setting/division');
          }
        })
    );
  }

  /**
   * ファイル削除アイコクリック対応
   * @returns void
   */
  handleClickDeleteIcon(): void {
    this.divisionBulkAddForm.controls.file.setValue(null);
  }

  /**
   * 画像選択時に表示されるプレビュー画像の更新処理
   * @param file 対象となる画像ファイルの File オブジェクト
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
}
