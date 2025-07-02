import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, filter, of, Subscription } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import {
  roleKeysForDisplay,
  roleLogicalNamesForDisplay,
} from 'src/app/models/role';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { RoleService } from 'src/app/services/role.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { HttpErrorResponse } from '@angular/common/http';
import { errorConst } from 'src/app/const/error.const';
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
    private roleService: RoleService,
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
  /******************** フォームエラーメッセージ用変数 ********************/

  // ログイン中ユーザーを保持
  author!: Employee;

  // 表示用論理名
  logicalNames = roleLogicalNamesForDisplay;

  // 表示用社員のキー
  roleKeys = roleKeysForDisplay;

  // 購読を一元管理
  subscription = new Subscription();

  // エラーモーダルのタイトル
  errorModalTitle = '権限新規登録：' + modalConst.TITLE.HAS_ERROR;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '権限登録キャンセル：' + modalConst.TITLE.CANCEL;

  // 権限一覧のパス
  roleListPath = '/setting/role';

  // リアクティブフォームとバリデーションの設定
  roleAddForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
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
            this.router.navigateByUrl(this.roleListPath);
          }
        })
    );
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
    if (!this.roleAddForm.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.roleListPath);
    }
  }

  // 送信ボタンクリック時の処理
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.roleAddForm.markAsPristine();
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.roleAddForm.value;

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.roleService
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
          // 権限一覧へ遷移
          this.router.navigateByUrl(this.roleListPath);
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
      title: '権限登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.roleListPath,
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
