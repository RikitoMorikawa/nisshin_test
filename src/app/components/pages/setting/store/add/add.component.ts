import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { storeLogicalNamesForDisplay } from 'src/app/models/store';
import { generalConst } from 'src/app/const/general.const';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { modalConst } from 'src/app/const/modal.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { regExConst } from 'src/app/const/regex.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { provinces } from 'src/app/models/province';
import { StoreService } from 'src/app/services/store.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
    private router: Router,
    private storeService: StoreService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    private authorService: AuthorService,
    public common: CommonService
  ) {}

  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数制限
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  exceededCharacterMinLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MIN_LIMIT,
  };
  // 必須項目
  requiredItem = { message: errorConst.FORM_ERROR.REQUIRED_ITEM };
  // ファイルサイズ超過
  exceededFileSizeLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_FILE_SIZE_LIMIT,
  };
  // 全角カタカナ制限
  fullWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  // 半角数字のみ
  numericLimitViolation = {
    message: errorConst.FORM_ERROR.NUMERIC_LIMIT_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/

  // ログイン中ユーザーを保持
  author!: Employee;

  // 店舗一覧のパス
  storeListPath = '/setting/store';

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 表示用論理名
  logicalNames = storeLogicalNamesForDisplay;

  // 画像の最大サイズ
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // ロゴ画像のファイル名
  logoImageFileName?: string;

  // ロゴ画像のファイルパス
  logoImageUrl?: SafeUrl;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '店舗登録キャンセル：' + modalConst.TITLE.CANCEL;

  // 都道府県選択肢
  provincesOptions!: SelectOption[];

  // リアクティブフォームとバリデーションの設定
  storeAddForm = this.formBuilder.group({
    logo_image: [null, [this.limitFileSizeValidator()]],
    name: ['', [Validators.required, Validators.maxLength(10)]],
    name_kana: [
      '',
      [
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    alias: ['', [Validators.maxLength(2)]],
    postal_code: [
      '',
      [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(7),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    province: ['', [Validators.required, Validators.maxLength(4)]],
    locality: ['', [Validators.required, Validators.maxLength(9)]],
    street_address: ['', [Validators.required, Validators.maxLength(7)]],
    other_address: ['', [Validators.maxLength(6)]],
    tel: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(16)],
    ],
    fax: ['', [Validators.minLength(10), Validators.maxLength(16)]],
    payee_1: ['', [Validators.maxLength(20)]],
    payee_2: ['', [Validators.maxLength(20)]],
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

    // 都道府県の選択肢を作成
    this.provincesOptions = provinces.map((v) => {
      return { value: v, text: v };
    });

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
            this.router.navigateByUrl(this.storeListPath);
          }
        })
    );

    this.subscription.add(
      // ロゴ画像の FormControl の変更を購読
      this.storeAddForm.controls.logo_image.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
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
   * ファイルサイズバリデーション
   * 最大ファイルサイズ：maxFileSizeで指定
   * @returns { upload_file: { value: null } } | null
   */
  limitFileSizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file: File = control.value;
      // ファイルサイズが指定された値より大きい場合はアップロードさせない
      if (file?.size && file?.size > generalConst.IMAGE_MAX_FILE_SIZE) {
        // 値を削除する
        control.setValue(null);
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
      this.logoImageUrl = url;
      this.logoImageFileName = file.name;
    } else {
      this.logoImageUrl = undefined;
      this.logoImageFileName = undefined;
    }
  }

  /**
   * 選択中画像削除
   * @returns void
   */
  handleClickDeleteIcon() {
    this.storeAddForm.controls.logo_image.setValue(null);
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
    if (!this.storeAddForm.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.storeListPath);
    }
  }

  // 送信ボタンクリック時の処理
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.storeAddForm.markAsPristine();
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.storeAddForm.value;

    // 都道府県の値チェック
    const provinceIdExists = this.provincesOptions.some((province) => {
      const optionProvinceVal = province.value;
      const formProvinceVal = formVal.province;
      return optionProvinceVal === formProvinceVal;
    });
    if (!provinceIdExists) {
      this.storeAddForm.controls.province.setValue(null);
      this.storeAddForm.controls.province.markAsPristine();
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.storeService
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
          this.router.navigateByUrl(this.storeListPath);
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
      title: '店舗登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.storeListPath,
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
