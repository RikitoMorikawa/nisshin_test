import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, filter, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { ModalService } from 'src/app/services/modal.service';
import { Gift1Service } from 'src/app/services/gift1.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-gift1-add',
  templateUrl: './gift1-add.component.html',
  styleUrls: ['./gift1-add.component.scss'],
})
export class Gift1AddComponent implements OnInit {
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
  // 購読を一元的に保持
  subscription = new Subscription();
  // ログイン中ユーザを格納
  author!: Employee;
  // ギフト1一覧へのパス
  gift1ListPath = '/setting/non-cash-item/gift1';
  // キャンセル時のモーダルタイトル
  cancelModalTitle = 'ギフト1登録キャンセル：' + modalConst.TITLE.CANCEL;
  // フォーム
  gift1AddForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(10)]],
    furi: [
      '',
      [
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private gift1Service: Gift1Service,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   * @returns void
   */
  ngOnInit(): void {
    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          // キャンセルモーダルでフィルタリング
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          // OKボタンクリック時のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.gift1ListPath);
          }
        })
    );
    // ログイン中ユーザをサービスが保持していれば取得
    if (this.authorService.author) {
      this.author = this.authorService.author;
    } else {
      // ログイン中ユーザストリームを購読
      this.subscription.add(
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
  }

  /**
   * フォームの状態を管理
   * @param formControl
   * @returns boolean
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
    if (this.gift1AddForm.status === 'VALID') {
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        'warning',
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.gift1ListPath);
    }
  }

  /**
   * 保存ボタン押下時の処理
   */
  handleClickSaveButton() {
    // 保存ボタンを非活性化
    this.gift1AddForm.markAsPristine();
    this.common.loading = true;
    const formValues = this.gift1AddForm.value;

    this.subscription.add(
      this.gift1Service
        .add(formValues)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // エラー処理
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          // フラッシュメッセージ
          this.flashMessageService.setFlashMessage(
            res.message,
            'success',
            15000
          );
          this.router.navigateByUrl(this.gift1ListPath);
          this.common.loading = false;
        })
    );
  }

  /**
   * エラー処理
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: 'ギフト1登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * コンポーネント終了時の処理
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
