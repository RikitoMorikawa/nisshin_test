import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { PbFirstCategoryService } from 'src/app/services/pb-first-category.service';
import { PbSecondCategoryService } from 'src/app/services/pb-second-category.service';
import { StoreService } from 'src/app/services/store.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { generalConst } from 'src/app/const/general.const';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
    private pbFirstCategoryService: PbFirstCategoryService,
    private pbSecondCategoryService: PbSecondCategoryService,
    private storeService: StoreService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
    private sanitizer: DomSanitizer,
    public common: CommonService
  ) {}

  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数制限
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  // 必須項目
  requiredItem = { message: errorConst.FORM_ERROR.REQUIRED_ITEM };
  // ファイルサイズ超過
  exceededFileSizeLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_FILE_SIZE_LIMIT,
  };
  // 全角カタカナ
  fullWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 第1分類の選択肢
  fcOptions: SelectOption[] = [{ value: '', text: generalConst.PLEASE_SELECT }];
  // 店舗の選択肢
  storeOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  // ログイン中ユーザーを保持
  author!: Employee;

  // 第1分類一覧のパス
  scRootPath = '/setting/product-book-second-category';

  // 画像関連
  // 画像のファイル名
  imageFileName?: string;
  // 画像のファイルパス
  imageUrl?: SafeUrl;
  // 画像の最大サイズ
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '第2分類登録キャンセル：' + modalConst.TITLE.CANCEL;

  // リアクティブフォームとバリデーションの設定
  scAddForm = this.formBuilder.group({
    image: null,
    product_book_first_category_id: ['', [Validators.required]],
    store_id: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(20)]],
    furi: [
      '',
      [
        Validators.maxLength(20),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
  });

  /**
   * コンポーネントの初期化処理
   */
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
            this.router.navigateByUrl(this.scRootPath);
          }
        })
    );

    this.subscription.add(
      // ロゴ画像の FormControl の変更を購読
      this.scAddForm.controls.image.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
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

    this.getSelectOptions();
  }

  /**
   * 選択肢を設定
   */
  getSelectOptions() {
    // ローディング開始
    this.common.loading = true;

    this.subscription.add(
      forkJoin([
        this.pbFirstCategoryService.getAll(),
        this.storeService.getAll(),
      ])
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
            return;
          }

          if (Array.isArray(res) && res.length === 2) {
            // 取得したデータをチェック
            const fcResInvalid = ApiResponseIsInvalid(res[0]);
            const storeResInvalid = ApiResponseIsInvalid(res[1]);

            if (fcResInvalid || storeResInvalid) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

            const fcs = res[0].data;
            fcs.map((v) => {
              const obj = { value: v.id, text: v.name };
              this.fcOptions.push(obj);
            });

            const stores = res[1].data;
            stores.map((v) => {
              const obj = { value: v.id, text: v.name };
              this.storeOptions.push(obj);
            });
          } else {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
        })
    );
  }

  // /**
  //  * ファイルサイズバリデーション
  //  * 最大ファイルサイズ：maxFileSizeで指定
  //  * @returns { upload_file: { value: null } } | null
  //  */
  limitFileSizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file: File = control.value;
      // ファイルサイズが3Mより大きい場合はアップロードさせない
      if (file?.size && file?.size > generalConst.IMAGE_MAX_FILE_SIZE) {
        // employeeAddForm upload_file"の値を削除する
        this.scAddForm.controls.image.setValue(null);
        // upload_fileのerrorsへエラーメッセージを設定
        return { limitFileSize: { errorMessage: this.exceededFileSizeLimit } };
      }
      return null;
    };
  }

  /**
   * 画像選択時に表示されるプレビュー画像の更新処理
   * @param file 対象となる画像ファイルの File オブジェクト
   */
  private updatePreviewElements(file: File | null) {
    if (file) {
      const url = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(file)
      );
      this.imageUrl = url;
      this.imageFileName = file.name;
    } else {
      this.imageUrl = undefined;
      this.imageFileName = undefined;
    }
  }

  /**
   * 選択中画像削除
   * @returns void
   */
  handleClickDeleteIcon() {
    this.scAddForm.controls.image.setValue(null);
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
    if (this.scAddForm.status === 'VALID') {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.scRootPath);
    }
  }

  /**
   * 送信ボタンクリック時の処理
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.scAddForm.markAsPristine();
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.scAddForm.value;

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.pbSecondCategoryService
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
          this.router.navigateByUrl(this.scRootPath);
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
      title: '商品ブック第2分類登録エラー：' + modalConst.TITLE.HAS_ERROR,
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
