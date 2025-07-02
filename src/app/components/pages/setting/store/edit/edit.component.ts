import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, of, Subscription } from 'rxjs';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { generalConst } from 'src/app/const/general.const';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { Store, storeLogicalNamesForDisplay } from 'src/app/models/store';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { provinces } from 'src/app/models/province';
import { StoreService } from 'src/app/services/store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessageService,
  FlashMessagePurpose,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private storeService: StoreService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
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

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 選択中店舗ID
  selectedId!: number;

  // 表示用論理名
  logicalNames = storeLogicalNamesForDisplay;

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // 画像の最大サイズ
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // ロゴ画像のファイル名
  logoImageFileName?: string;

  // ロゴ画像のファイルパス
  logoImageUrl?: SafeUrl;

  last_update_user?: string;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '店舗編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 詳細画面へのパス
  detailPath!: string;

  // 都道府県選択肢
  provincesOptions!: SelectOption[];

  // APIから取得した更新前の基本情報を保持
  beforeUpdateStore!: Store;

  store: Store = {
    id: 0,
    logo_image_path: '',
    name: '',
    name_kana: '',
    alias: '',
    postal_code: '',
    province: '',
    locality: '',
    street_address: '',
    other_address: '',
    tel: '',
    fax: '',
    payee_1: '',
    payee_2: '',
  };

  // リアクティブフォームとバリデーションの設定
  storeEditForm = this.formBuilder.group({
    logo_image: [null, [this.limitFileSizeValidator()]],
    name: [this.store.name, [Validators.required, Validators.maxLength(10)]],
    name_kana: [
      this.store.name_kana,
      [
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    alias: [this.store.alias, [Validators.maxLength(2)]],
    postal_code: [
      this.store.postal_code,
      [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(7),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    province: [
      this.store.province,
      [Validators.required, Validators.maxLength(4)],
    ],
    locality: [
      this.store.locality,
      [Validators.required, Validators.maxLength(9)],
    ],
    street_address: [
      this.store.street_address,
      [Validators.required, Validators.maxLength(7)],
    ],
    other_address: [this.store.other_address, [Validators.maxLength(6)]],
    tel: [
      this.store.tel,
      [Validators.required, Validators.minLength(10), Validators.maxLength(16)],
    ],
    fax: [this.store.fax, [Validators.minLength(10), Validators.maxLength(16)]],
    payee_1: [this.store.payee_1, [Validators.maxLength(20)]],
    payee_2: [this.store.payee_2, [Validators.maxLength(20)]],
  });

  ngOnInit(): void {
    // 都道府県の選択肢を作成
    this.provincesOptions = provinces.map((v) => {
      return { value: v, text: v };
    });

    // パスパラメータ取得エラーモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.getPathErrorModalTitle
          ) // パスパラメータ取得エラーモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl('/setting/store');
          }
        })
    );

    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.paramMap.get('id');
    if (selectedId === null) {
      // パスパラメータ取得エラー 一覧へ戻す
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.getPathErrorModalTitle,
        modalConst.BODY.HAS_ERROR,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    } else if (isNaN(Number(selectedId))) {
      // number型へのキャストエラー 一覧へ戻す
      // パスパラメータ取得エラー 一覧へ戻す
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.getPathErrorModalTitle,
        modalConst.BODY.HAS_ERROR,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }

    // 店舗IDを保持
    this.selectedId = Number(selectedId);
    // 店舗詳細のパスを生成
    this.detailPath = '/setting/store/detail/' + this.selectedId;

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
            // 詳細画面へ移動する
            this.router.navigateByUrl(this.detailPath);
          }
        })
    );

    this.subscription.add(
      // ロゴ画像の FormControl の変更を購読
      this.storeEditForm.controls.logo_image.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
      })
    );

    this.subscription.add(
      // フォームの変更を購読
      this.storeEditForm.valueChanges.subscribe((res) => {
        this.checkFormDefaultValueChanged(res);
      })
    );

    // データ取得
    this.getDisplayData();
  }

  /**
   * フォームへ表示する基本情報と選択肢を取得
   * @returns void
   */
  getDisplayData(): void {
    // ローディング開始
    this.common.loading = true;
    this.subscription.add(
      this.storeService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.common.loading = false;

          // エラーレスポンスが帰ってきた場合
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }

          // 取得したデータをチェック
          const storeResInvalid = ApiResponseIsInvalid(res);

          // データに異常がある場合
          if (storeResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          // メンバへ取得したデータを代入
          this.store = res.data[0];
          this.beforeUpdateStore = res.data[0];
          this.last_update_user = `${this.store.employee_updated_last_name} ${this.store.employee_updated_first_name}`;

          this.storeEditForm.patchValue(this.store);
        })
    );
  }

  /**
   * formで入力が取り消された場合に変更がない状態でサブミットさせないようにする
   *
   * @param formValues フォームの値
   * @returns void
   */
  checkFormDefaultValueChanged(formValues: any): void {
    // 初期値から必要な項目のみ抽出
    const defaultValue = {
      name: this.beforeUpdateStore.name,
      name_kana: this.beforeUpdateStore.name_kana,
      alias: this.beforeUpdateStore.alias,
      postal_code: this.beforeUpdateStore.postal_code,
      province: this.beforeUpdateStore.province,
      locality: this.beforeUpdateStore.locality,
      street_address: this.beforeUpdateStore.street_address,
      other_address: this.beforeUpdateStore.other_address,
      tel: this.beforeUpdateStore.tel,
      fax: this.beforeUpdateStore.fax,
      payee_1: this.beforeUpdateStore.payee_1,
      payee_2: this.beforeUpdateStore.payee_2,
    };

    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(formValues);
    const v2 = JSON.stringify(defaultValue);
    // フォームの値と初期値が同じ場合サブミットさせない
    this.formInvalid = v1 === v2;
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
      this.formInvalid = false;
    } else {
      this.logoImageUrl = undefined;
      this.logoImageFileName = undefined;
      this.formInvalid = true;
    }
  }

  /**
   * 入力内容をクリアしてAPIで取得した値を設定する
   * @returns void
   */
  handleClickClearButton() {
    this.storeEditForm.reset(this.beforeUpdateStore);
  }

  /**
   * 選択中画像削除
   * @returns void
   */
  handleClickDeleteIcon() {
    this.storeEditForm.controls.logo_image.setValue(null);
  }

  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.formInvalid) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPath);
    }
  }

  // 送信ボタンクリック時の処理
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.formInvalid = true;
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.storeEditForm.value;

    // 都道府県の値チェック
    const provinceIdExists = this.provincesOptions.some((province) => {
      const optionProvinceVal = province.value;
      const formProvinceVal = formVal.province;
      return optionProvinceVal === formProvinceVal;
    });
    if (!provinceIdExists) {
      this.storeEditForm.controls.province.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.storeService
        .update(this.selectedId, formVal)
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
          this.router.navigateByUrl(this.detailPath);
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
      title: '店舗編集エラー：' + modalConst.TITLE.HAS_ERROR,
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
