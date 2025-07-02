import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import {
  catchError,
  filter,
  finalize,
  Subscription,
  take,
  zipWith,
} from 'rxjs';
import { Employee, employeeLogicalNames } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { regExConst } from 'src/app/const/regex.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { CustomValidators } from 'src/app/app-custom-validator';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { DivisionService } from 'src/app/services/division.service';
import { StoreService } from 'src/app/services/store.service';
import { RoleService } from 'src/app/services/role.service';
import { employeeConst } from 'src/app/const/employee.const';
import { AuthorService } from 'src/app/services/author.service';
import { StoreApiResponse } from 'src/app/models/store';
import { RoleApiResponse } from 'src/app/models/role';
import { ErrorService } from 'src/app/services/shared/error.service';
import { FlashMessagePurpose } from 'src/app/services/flash-message.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
    private router: Router,
    private divisionService: DivisionService,
    private storeService: StoreService,
    private roleService: RoleService,
    private authorService: AuthorService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
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
  opponentEnteredRequireItem = {
    message: errorConst.FORM_ERROR.OPPONENT_ENTERED_REQUIRE_ITEM,
  };
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
  // パスワード不一致
  passwordMatchViolation = {
    message: errorConst.FORM_ERROR.PASSWORD_MATCH_VIOLATION,
  };
  // パスワード制約
  passwordViolation = {
    message: errorConst.FORM_ERROR.PASSWORD_FORMAT_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/
  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  author!: Employee;

  // 表示用論理名
  logicalNames = employeeLogicalNames;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '社員登録キャンセル：' + modalConst.TITLE.CANCEL;

  // アップロード画像のファイル名
  fileName?: string;
  // アップロード画像のファイルパス
  imageUrl?: SafeUrl;
  // 画像最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // ロール選択肢
  roleOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  // 表示区分選択肢
  statusDivisionOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  // 店舗選択肢
  storeOptions: SelectOption[] = [
    { value: '', text: generalConst.PLEASE_SELECT },
  ];

  // リアクティブフォームとバリデーションの設定
  employeeAddForm = this.formBuilder.group({
    image: [null, [this.limitFileSizeValidator()]],
    status_division_id: [
      this.statusDivisionOptions[0].value,
      [Validators.required],
    ],
    role_id: [this.roleOptions[0].value, [Validators.required]],
    store_id: [this.storeOptions[0].value, [Validators.required]],
    code: [
      '',
      [
        Validators.required,
        Validators.maxLength(4),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    last_name: ['', [Validators.required, Validators.maxLength(10)]],
    first_name: ['', [Validators.required, Validators.maxLength(10)]],
    last_name_kana: [
      '',
      [
        Validators.required,
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    first_name_kana: [
      '',
      [
        Validators.required,
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    mail: ['', [Validators.required, Validators.email]],
    tel: [
      '',
      [
        Validators.minLength(10),
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    passwordGroup: this.formBuilder.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(24),
            Validators.pattern(regExConst.PASSWORD_REG_EX),
          ],
        ],
        confirm_password: ['', [Validators.required]],
      },
      {
        validators: [
          CustomValidators.compareValidator('password', 'confirm_password'),
        ],
      }
    ),
    posPasswordGroup: this.formBuilder.group(
      {
        pos_password: [
          '',
          [
            Validators.minLength(4),
            Validators.maxLength(7),
            Validators.pattern(regExConst.NUMERIC_REG_EX),
          ],
        ],
        confirm_pos_password: '',
      },
      {
        validators: [
          CustomValidators.compareValidator(
            'pos_password',
            'confirm_pos_password'
          ),
          CustomValidators.opponentEnteredRequireValidator(
            'pos_password',
            'confirm_pos_password'
          ),
        ],
      }
    ),

    barcode: [
      '',
      [Validators.maxLength(4), Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    max_discount_rate: 0,
  });

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
        this.employeeAddForm.controls.image.setValue(null);
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
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // 購読を格納
    this.subscription.add(
      // 画像の FormControl の変更を購読
      this.employeeAddForm.controls.image.valueChanges.subscribe((file) => {
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
          //take(1), // 1回のみ実行
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // 実行確認のモーダルじゃなければスルー
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl('/employee/list');
          }
        })
    );

    // 選択肢取得
    this.getOptions();
  }

  /**
   * 表示用データ取得時の値チェック
   * @param arg
   * @returns boolean
   */
  checkNullOrEmpty(arg: StoreApiResponse | RoleApiResponse): boolean {
    if (arg === null || arg === undefined) return false;
    if (arg.data === null || !Array.isArray(arg.data)) return false;
    if (!arg.data.length) return false;
    return true;
  }

  /**
   * 店舗・権限・表示区分の各選択肢を取得
   * @returns void
   */
  getOptions(): void {
    this.common.loading = true;
    this.subscription.add(
      this.storeService
        .getAll()
        .pipe(
          zipWith(
            this.divisionService.getAsSelectOptions({
              name: employeeConst.EMPLOYEE_STATUS_DIVISION,
            }),
            this.roleService.getAll()
          ),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          if (res && Array.isArray(res) && res.length === 3) {
            // 1番目は店舗データ
            const storesRes = res[0];
            const checkStoresRes = this.checkNullOrEmpty(storesRes);
            if (checkStoresRes) {
              storesRes.data.forEach((store) => {
                const obj = { value: store.id, text: store.name };
                this.storeOptions.push(obj);
              });
            } else {
              this.handleError(
                400,
                employeeConst.FAILED_CHOICES_FOR_NARROWING_DOWN
              );
              return;
            }
            // 2番目は表示区分データ
            // 表示区分を取得
            const statusDivisionsRes: Record<string, SelectOption[]> = res[1];
            if (
              statusDivisionsRes === null ||
              statusDivisionsRes === undefined ||
              statusDivisionsRes[employeeConst.EMPLOYEE_STATUS_DIVISION] ===
                null ||
              statusDivisionsRes[employeeConst.EMPLOYEE_STATUS_DIVISION] ===
                undefined
            ) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            } else {
              const statusDivisions =
                statusDivisionsRes[employeeConst.EMPLOYEE_STATUS_DIVISION];
              statusDivisions.forEach((selectOption) => {
                this.statusDivisionOptions.push(selectOption);
              });
            }
            // 3番目は権限データ
            const roleRes = res[2];
            const checkRoleRes = this.checkNullOrEmpty(roleRes);
            if (checkRoleRes) {
              roleRes.data.forEach((role) => {
                const obj = { value: role.id, text: role.name };
                this.roleOptions.push(obj);
              });
            } else {
              this.handleError(
                400,
                employeeConst.FAILED_CHOICES_FOR_NARROWING_DOWN
              );
              return;
            }
          } else {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
          }
        })
    );
  }
  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }
  /**
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (!this.employeeAddForm.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl('/employee/list');
    }
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
      title: '社員登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: '/employee/list',
    });
  }

  /**
   * 送信ボタンクリック時の処理
   * @returns void
   */
  handleClickSaveButton(): void {
    // ローディング開始
    this.common.loading = true;
    const formVal = this.employeeAddForm.value;

    const employee = {
      image: formVal.image,
      barcode: formVal.barcode,
      code: formVal.code,
      first_name: formVal.first_name,
      first_name_kana: formVal.first_name_kana,
      last_name: formVal.last_name,
      last_name_kana: formVal.last_name_kana,
      mail: formVal.mail,
      max_discount_rate: formVal.max_discount_rate,
      password: formVal.passwordGroup?.password,
      pos_password: formVal.posPasswordGroup?.pos_password,
      role_id: formVal.role_id,
      store_id: formVal.store_id,
      status_division_id: formVal.status_division_id,
      tel: formVal.tel,
      created_id: this.author.id,
    };

    // 店舗の値チェック
    const storeIdExists = this.storeOptions.some((store) => {
      const storeVal = Number(store.value);
      const storeId = Number(employee.store_id);
      return storeVal === storeId;
    });
    if (!storeIdExists) {
      this.employeeAddForm.controls.store_id.setValue(null);
      this.employeeAddForm.markAsPristine();
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // ロールの値チェック
    const roleIdExists = this.roleOptions.some((role) => {
      const roleVal = Number(role.value);
      const roleId = Number(employee.role_id);
      return roleVal === roleId;
    });
    if (!roleIdExists) {
      this.employeeAddForm.controls.role_id.setValue(null);
      this.employeeAddForm.markAsPristine();
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 表示区分の値チェック
    const statusDivisionIdExists = this.statusDivisionOptions.some(
      (division) => {
        const divisionVal = Number(division.value);
        const divisionId = Number(employee.status_division_id);
        return divisionVal === divisionId;
      }
    );
    if (!statusDivisionIdExists) {
      this.employeeAddForm.controls.status_division_id.setValue(null);
      this.employeeAddForm.markAsPristine();
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 送信ボタンを非活性にする
    this.employeeAddForm.markAsPristine();

    this.subscription.add(
      this.employeeService
        .add(employee)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
          } else {
            const purpose: FlashMessagePurpose = 'success';
            this.flashMessageService.setFlashMessage(
              res.message,
              purpose,
              15000
            );
            this.router.navigateByUrl('/employee/list');
          }
        })
    );
  }

  /**
   * 選択された画像を削除
   */
  handleClickDeleteIcon() {
    this.employeeAddForm.controls.image.setValue(null);
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
      this.fileName = file.name;
    } else {
      this.imageUrl = undefined;
      this.fileName = undefined;
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
