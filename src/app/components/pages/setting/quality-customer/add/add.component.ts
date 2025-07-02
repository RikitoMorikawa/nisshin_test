import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, filter, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { QualityCustomerService } from 'src/app/services/quality-customer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { regExConst } from 'src/app/const/regex.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  /******************** フォームエラーメッセージ用変数 ********************/
  // 制限文字数超過
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  // 必須項目
  requiredItem = {
    message: errorConst.FORM_ERROR.REQUIRED_ITEM,
  };
  // 全角カタカナ
  fullWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/
  // 購読を一元的に格納
  subscription = new Subscription();
  // ローディング中フラグ
  isLoading = false;
  // ログイン中ユーザーを格納
  author!: Employee;
  // 客層一覧のパス
  qualityCustomerRootPath = '/setting/quality-customer';
  // キャンセル時のモーダルタイトル
  cancelModalTitle = '客層登録キャンセル：' + modalConst.TITLE.CANCEL;
  // リアクティブフォームとバリデーションの設定
  qualityCustomerAddForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(10)]],
    furi: [
      '',
      [
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    code: ['', [Validators.required, Validators.maxLength(2)]],
  });

  /**
   * コンストラクタ
   * @param formBuilder
   * @param modalService
   * @param router
   * @param qualityCustomerService
   * @param errorService
   * @param flashMessageService
   * @param authorService
   */
  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private qualityCustomerService: QualityCustomerService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.isLoading = true;
    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            // キャンセルモーダルでフィルタリング
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          // OKボタンクリック時のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.qualityCustomerRootPath);
          }
        })
    );
    // ログイン中ユーザーをサービスが保持していれば取得
    if (this.authorService.author) {
      this.author = this.authorService.author;
      this.common.loading = false;
      this.isLoading = false;
      console.log('Reload');
    } else {
      this.subscription.add(
        // ログイン中ユーザーストリームを購読
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          this.common.loading = false;
          this.isLoading = false;
          console.log('Restart');
        })
      );
    }
  }

  /**
   * フォームの状態を管理
   * @param formControl
   * @returns
   */
  isInvalid(formControl: FormControl): boolean {
    return (formControl.touched || formControl.dirty) && formControl.invalid;
  }
  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }
  /**
   * キャンセルボタンクリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // フォームに入力されていた場合はモーダルを表示
    if (this.qualityCustomerAddForm.status === 'VALID') {
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        'warning',
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.qualityCustomerRootPath);
    }
  }

  /**
   * 保存ボタン押下時の処理
   * @return void
   */
  handleClickSaveButton() {
    // 保存ボタンを非活性化
    this.qualityCustomerAddForm.markAsPristine();
    this.isLoading = true;
    this.common.loading = true;
    const formValues = this.qualityCustomerAddForm.value;

    this.subscription.add(
      this.qualityCustomerService
        .add(formValues)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.common.loading = false;
          // エラー処理
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          // フラッシュメッセージ作成
          this.flashMessageService.setFlashMessage(
            res.message,
            'success',
            15000
          );
          // 客層一覧へ遷移
          this.router.navigateByUrl(this.qualityCustomerRootPath);
        })
    );
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '客層登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * コンポーネント終了時の処理
   * @return void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
