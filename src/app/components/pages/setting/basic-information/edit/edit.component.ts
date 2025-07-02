import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  BasicInformation,
  BasicInformationLogicalNames,
} from 'src/app/models/basic-information';
import { BasicInformationService } from 'src/app/services/basic-information.service';
import { generalConst } from 'src/app/const/general.const';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { provinces } from 'src/app/models/province';
import { catchError, filter, of, Subscription, zipWith } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { DivisionService } from 'src/app/services/division.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { DivisionApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { divisionConst } from 'src/app/const/division.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { Router } from '@angular/router';
import {
  FlashMessageService,
  FlashMessagePurpose,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private biService: BasicInformationService,
    private divisionService: DivisionService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    private common: CommonService
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
  // メールアドレス形式
  emailFormatViolation = {
    message: errorConst.FORM_ERROR.EMAIL_FORMAT_VIOLATION,
  };
  // 半角数字のみ
  numericLimitViolation = {
    message: errorConst.FORM_ERROR.NUMERIC_LIMIT_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/
  // 購読を一元管理
  subscription = new Subscription();

  // キャンセル時に出すモーダルのタイトル
  cancelModalTitle = '基本情報編集：' + modalConst.TITLE.CANCEL;

  detailPath = '/setting/basic-information';

  // データ取得中フラグ
  isDuringAcquisition = false;

  // 画像最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  lastUpdater!: string;

  // ロゴ画像のファイル名
  logoImageFileName?: string;

  // ロゴ画像のファイルパス
  logoImageUrl?: SafeUrl;

  // 社長画像のファイル名
  representativeImageFileName?: string;

  // 社長画像のファイルパス
  representativeImageUrl?: SafeUrl;

  // 画像タイプ定数
  REPRESENTATIVE_IMAGE = 'representative_image';
  LOGO_IMAGE = 'logo_image';

  // 物理名から論理名を取得するオブジェクト
  logicalNames = BasicInformationLogicalNames;

  // 都道府県選択肢
  provincesOptions!: SelectOption[];

  // 販売端数区分選択肢
  salesFractionDivisionOptions!: SelectOption[];

  // 消費税端数区分
  salesTaxFractionDivisionOptions!: SelectOption[];

  // APIから取得した更新前の基本情報を保持
  beforeUpdateBi!: BasicInformation;

  // 更新対象の基本情報
  bi: BasicInformation = {
    representative_name: '',
    sales_fraction_division_id: 0,
    sales_tax_fraction_division_id: 0,
    name: '',
    name_kana: '',
    corporate_num: '',
    invoice_number: '',
    postal_code: '',
    province: '',
    locality: '',
    street_address: '',
    other_address: '',
    tel: '',
    fax: '',
    mail: '',
    payee_1: '',
    payee_2: '',
    created_at: '',
    created_id: 0,
  };

  // 選択中の都道府県のindex
  selectedProvinceIndex!: number;

  // リアクティブフォームとバリデーションの設定
  biEditForm = this.formBuilder.group({
    corporate_num: [
      this.bi.corporate_num,
      [
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(13),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    fax: [
      this.bi.fax,
      [
        Validators.minLength(10),
        Validators.maxLength(16),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    invoice_number: [
      this.bi.invoice_number,
      [Validators.required, Validators.minLength(14), Validators.maxLength(14)],
    ],
    locality: [
      this.bi.locality,
      [Validators.required, Validators.maxLength(9)],
    ],
    // ロゴ画像
    logo_image: [null, [this.limitFileSizeValidator()]],
    mail: [this.bi.mail, [Validators.email]],
    name: [this.bi.name, [Validators.required, Validators.maxLength(15)]],
    name_kana: [
      this.bi.name_kana,
      [
        Validators.maxLength(15),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    other_address: [this.bi.other_address, [Validators.maxLength(6)]],
    payee_1: [this.bi.payee_1, [Validators.maxLength(25)]],
    payee_2: [this.bi.payee_2, [Validators.maxLength(25)]],
    postal_code: [
      this.bi.postal_code,
      [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(7),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    province: [
      this.bi.province,
      [Validators.required, Validators.maxLength(4)],
    ],
    // 代表画像
    representative_image: [null, [this.limitFileSizeValidator()]],
    representative_name: [
      this.bi.representative_name,
      [Validators.maxLength(25)],
    ],
    sales_fraction_division_id: [
      this.bi.sales_fraction_division_id,
      [Validators.required],
    ],
    sales_tax_fraction_division_id: [
      this.bi.sales_tax_fraction_division_id,
      [Validators.required],
    ],
    street_address: [
      this.bi.street_address,
      [Validators.required, Validators.maxLength(25)],
    ],
    tel: [
      this.bi.tel,
      [Validators.required, Validators.minLength(10), Validators.maxLength(16)],
    ],
  });

  ngOnInit(): void {
    // 都道府県の選択肢を作成
    this.provincesOptions = provinces.map((v) => {
      return { value: v, text: v };
    });
    // 購読を親サブスクリプションへアタッチ
    this.subscription.add(
      // ロゴ画像の FormControl の変更を購読
      this.biEditForm.controls.logo_image.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file, this.LOGO_IMAGE);
      })
    );
    this.subscription.add(
      // 社長画像の FormControl の変更を購読
      this.biEditForm.controls.representative_image.valueChanges.subscribe(
        (file) => {
          this.updatePreviewElements(file, this.REPRESENTATIVE_IMAGE);
        }
      )
    );
    this.subscription.add(
      // フォームの変更を購読
      this.biEditForm.valueChanges.subscribe((res) => {
        this.checkFormDefaultValueChanged(res);
      })
    );
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
    // 基本情報と選択肢を取得
    this.getDisplayData();
  }

  /**
   * フォームへ表示する基本情報と選択肢を取得
   * @returns void
   */
  getDisplayData(): void {
    // ローディング開始
    this.isDuringAcquisition = true;
    this.common.loading = true;
    this.subscription.add(
      this.biService
        .find()
        .pipe(
          zipWith(
            this.divisionService.getAsSelectOptions({
              name: divisionConst.SALES_FRACTION,
            }),
            this.divisionService.getAsSelectOptions({
              name: divisionConst.SALES_TAX_FRACTION,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          this.isDuringAcquisition = false;
          this.common.loading = false;
          // APIのレスポンスがエラーレスポンスの場合
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }

          // レスポンスが配列で帰ってこない場合
          if (!Array.isArray(res)) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          // レスポンスの配列の要素数が3ではない場合
          if (res.length !== 3) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          // 基本情報のレスポンスの評価を行いメンバへ代入
          const biRes = res[0];
          const biResInvalid = ApiResponseIsInvalid(biRes);
          if (biResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.bi = biRes.data[0];
          this.beforeUpdateBi = biRes.data[0];
          this.lastUpdater =
            biRes.data[0].employee_updated_last_name +
            ' ' +
            biRes.data[0].employee_updated_first_name;

          // 販売端数区分のレスポンスの評価を行いメンバへ代入
          const salesFractionDivisionRes = res[1];
          const salesFractionDivisionResInvalid = DivisionApiResponseIsInvalid(
            salesFractionDivisionRes,
            divisionConst.SALES_FRACTION
          );
          if (salesFractionDivisionResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.salesFractionDivisionOptions =
            salesFractionDivisionRes[divisionConst.SALES_FRACTION];

          // 消費税端数区分のレスポンスの評価を行いメンバへ代入
          const salesTaxFractionDivisionRes = res[2];
          const salesTaxFractionDivisionResInvalid =
            DivisionApiResponseIsInvalid(
              salesTaxFractionDivisionRes,
              divisionConst.SALES_TAX_FRACTION
            );
          if (salesTaxFractionDivisionResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.salesTaxFractionDivisionOptions =
            salesTaxFractionDivisionRes[divisionConst.SALES_TAX_FRACTION];

          // 取得した値でフォームを更新
          this.biEditForm.patchValue(this.bi);
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
        control.setValue(null);
        // upload_fileのerrorsへエラーメッセージを設定
        return { limitFileSize: { errorMessage: this.exceededFileSizeLimit } };
      }
      return null;
    };
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
   * formで入力が取り消された場合に変更がない状態でサブミットさせないようにする
   *
   * @param formValues フォームの値
   * @returns void
   */
  private checkFormDefaultValueChanged(formValues: any): void {
    // 初期値から必要な項目のみ抽出
    const defaultValue = {
      corporate_num: this.beforeUpdateBi.corporate_num,
      fax: this.beforeUpdateBi.fax,
      invoice_number: this.beforeUpdateBi.invoice_number,
      locality: this.beforeUpdateBi.locality,
      logo_image: null,
      mail: this.beforeUpdateBi.mail,
      name: this.beforeUpdateBi.name,
      name_kana: this.beforeUpdateBi.name_kana,
      other_address: this.beforeUpdateBi.other_address,
      payee_1: this.beforeUpdateBi.payee_1,
      payee_2: this.beforeUpdateBi.payee_2,
      postal_code: this.beforeUpdateBi.postal_code,
      province: this.beforeUpdateBi.province,
      representative_image: null,
      representative_name: this.beforeUpdateBi.representative_name,
      sales_fraction_division_id:
        this.beforeUpdateBi.sales_fraction_division_id,
      sales_tax_fraction_division_id:
        this.beforeUpdateBi.sales_tax_fraction_division_id,
      street_address: this.beforeUpdateBi.street_address,
      tel: this.beforeUpdateBi.tel,
    };
    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(formValues);
    const v2 = JSON.stringify(defaultValue);
    // フォームの値と初期値が同じ場合サブミットさせない
    this.formInvalid = v1 === v2;
  }

  /**
   * 画像選択時に表示されるプレビュー画像の更新処理
   * @param file 対象となる画像ファイルの File オブジェクト
   */
  private updatePreviewElements(file: File | null, imageType: string) {
    if (file) {
      const url = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(file)
      );

      if (imageType === this.LOGO_IMAGE) {
        this.logoImageUrl = url;
        this.logoImageFileName = file.name;
      } else if (imageType === this.REPRESENTATIVE_IMAGE) {
        this.representativeImageUrl = url;
        this.representativeImageFileName = file.name;
      }
      this.formInvalid = false;
    } else {
      if (imageType === this.LOGO_IMAGE) {
        this.logoImageUrl = undefined;
        this.logoImageFileName = undefined;
      } else if (imageType === this.REPRESENTATIVE_IMAGE) {
        this.representativeImageUrl = undefined;
        this.representativeImageFileName = undefined;
      }
      this.formInvalid = true;
    }
  }

  /**
   * 選択中画像削除
   * @param imageType
   */
  handleClickDeleteIcon(imageType: string) {
    if (imageType === this.LOGO_IMAGE) {
      this.biEditForm.controls.logo_image.setValue(null);
    } else if (imageType === this.REPRESENTATIVE_IMAGE) {
      this.biEditForm.controls.representative_image.setValue(null);
    }
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
      this.router.navigateByUrl('/home');
    }
  }

  /**
   * 入力内容をクリアしてAPIで取得した値を設定する
   * @returns void
   */
  handleClickClearButton() {
    this.biEditForm.reset(this.beforeUpdateBi);
  }

  /**
   * 変更内容を保存
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.formInvalid = true;

    // ローディング開始
    this.isDuringAcquisition = true;
    this.common.loading = true;
    const formVal = this.biEditForm.value;

    // 販売端数区分の値チェック
    const salesFdIdExists = this.salesFractionDivisionOptions.some(
      (division) => {
        const divisionVal = Number(division.value);
        const divisionId = Number(formVal.sales_fraction_division_id);
        return divisionVal === divisionId;
      }
    );
    if (!salesFdIdExists) {
      this.biEditForm.controls.sales_fraction_division_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.isDuringAcquisition = false;
      this.common.loading = false;
      return;
    }

    // 消費税端数区分の値チェック
    const salesTaxFdIdExists = this.salesTaxFractionDivisionOptions.some(
      (division) => {
        const divisionVal = Number(division.value);
        const divisionId = Number(formVal.sales_tax_fraction_division_id);
        return divisionVal === divisionId;
      }
    );
    if (!salesTaxFdIdExists) {
      this.biEditForm.controls.sales_tax_fraction_division_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.isDuringAcquisition = false;
      this.common.loading = false;
      return;
    }

    // 都道府県の値チェック
    const provinceIdExists = this.provincesOptions.some((province) => {
      const optionProvinceVal = province.value;
      const formProvinceVal = formVal.province;
      return optionProvinceVal === formProvinceVal;
    });
    if (!provinceIdExists) {
      this.biEditForm.controls.province.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.isDuringAcquisition = false;
      this.common.loading = false;
      return;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.biService
        .update(formVal)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.isDuringAcquisition = false;
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
      title: '基本情報編集エラー：' + modalConst.TITLE.HAS_ERROR,
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
