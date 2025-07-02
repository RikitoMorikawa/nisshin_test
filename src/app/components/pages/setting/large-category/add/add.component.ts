import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
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
  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private lcService: LargeCategoryService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
    public common: CommonService
  ) {}

  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数制限
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  // 必須項目
  requiredItem = { message: errorConst.FORM_ERROR.REQUIRED_ITEM };
  // 半角カタカナ制限
  halfWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.HALF_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // ログイン中ユーザーを保持
  author!: Employee;

  // 大分類一覧のパス
  lcRootPath = '/setting/large-category';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '大分類登録キャンセル：' + modalConst.TITLE.CANCEL;

  // リアクティブフォームとバリデーションの設定
  lcAddForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(10)]],
    short_name: [
      '',
      [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(regExConst.HALF_WIDTH_KATAKANA_REG_EX),
      ],
    ],
  });

  ngOnInit(): void {
    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // キャンセルモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.lcRootPath);
          }
        })
    );

    // ログイン中ユーザー取得
    if (this.authorService.author) {
      // サービスが保持していれば取得
      this.author = this.authorService.author;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーストリームを購読
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
  }

  /**
   * フォームの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }
  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }
  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (this.lcAddForm.status === 'VALID') {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.lcRootPath);
    }
  }

  /**
   * 送信ボタンクリック時の処理
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.lcAddForm.markAsPristine();
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.lcAddForm.value;

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.lcService
        .add(formVal)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.common.loading = false;
          // エラー対応
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }

          // フラッシュメッセージ作成
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          // 詳細画面へ遷移
          this.router.navigateByUrl(this.lcRootPath);
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
      title: '大分類登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
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
