import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  Employee,
  EmployeeApiResponse,
  employeeLogicalNames,
} from 'src/app/models/employee';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  from,
  of,
  Subscription,
  take,
  zipWith,
} from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { StoreService } from 'src/app/services/store.service';
import { StoreApiResponse } from 'src/app/models/store';
import { DivisionService } from 'src/app/services/division.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { RoleApiResponse } from 'src/app/models/role';
import { RoleService } from 'src/app/services/role.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { generalConst } from 'src/app/const/general.const';
import { regExConst } from 'src/app/const/regex.const';
import { errorConst } from 'src/app/const/error.const';
import { employeeConst } from 'src/app/const/employee.const';
import { ErrorService } from 'src/app/services/shared/error.service';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private storeService: StoreService,
    private divisionService: DivisionService,
    private roleService: RoleService,
    private errorService: ErrorService,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
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

  // 画像最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // 詳細画面へ遷移するためのパス
  detailPath!: string;

  // 表示用論理名
  logicalNames = employeeLogicalNames;

  // 取得する社員のid
  selectedId!: number;

  // アップロード画像のファイル名
  fileName?: string;

  // アップロード画像のファイルパス
  imageUrl?: SafeUrl;

  // ロール選択肢
  roleOptions!: SelectOption[];

  // 表示区分選択肢
  statusDivisionOptions!: SelectOption[];

  // 店舗選択肢
  storeOptions!: SelectOption[];

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセルモーダルのタイトル
  cancelModalTitle = '社員編集：' + modalConst.TITLE.CANCEL;

  // 最終更新者
  lastUpdaterName!: string;

  // データ取得前のエラー回避用初期値
  employee: Employee = {
    id: 0,
    code: 0,
    store_id: 0,
    store_name: '',
    role_id: 0,
    role_name: '',
    mail: '',
    tel: '',
    last_name: '',
    first_name: '',
    last_name_kana: '',
    first_name_kana: '',
    password: '',
    pos_password: '',
    max_discount_rate: '',
    barcode: '',
    oid: '',
    image_path: '',
    last_login_at: '',
    created_at: '',
    created_id: 0,
    employee_created_last_name: '',
    employee_created_first_name: '',
    updated_at: '',
    updated_id: 0,
    employee_updated_last_name: '',
    employee_updated_first_name: '',
    status_division_id: 0,
    division_status_code: '',
    division_status_name: '',
    division_status_value: '',
  };

  // リアクティブフォームとバリデーションの設定
  employeeEditForm = this.formBuilder.group({
    image: [null, [this.limitFileSizeValidator()]],
    status_division_id: [
      this.employee.status_division_id,
      [Validators.required],
    ],
    role_id: [this.employee.role_id, [Validators.required]],
    store_id: [this.employee.store_id, [Validators.required]],
    code: [
      this.employee.code,
      [
        Validators.required,
        Validators.maxLength(4),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    last_name: [
      this.employee.last_name,
      [Validators.required, Validators.maxLength(10)],
    ],
    first_name: [
      this.employee.first_name,
      [Validators.required, Validators.maxLength(10)],
    ],
    last_name_kana: [
      this.employee.last_name_kana,
      [
        Validators.required,
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    first_name_kana: [
      this.employee.first_name_kana,
      [
        Validators.required,
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    mail: [this.employee.mail, [Validators.required, Validators.email]],
    tel: [
      this.employee.tel,
      [
        Validators.minLength(10),
        Validators.maxLength(14),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
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
      this.employee.barcode,
      [Validators.maxLength(4), Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    max_discount_rate: [this.employee.max_discount_rate],
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
        this.employeeEditForm.controls.image.setValue(null);
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
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '社員編集エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * 表示用データ取得時の値チェック
   * @param arg
   * @returns boolean
   */
  checkNullOrEmpty(
    arg: EmployeeApiResponse | StoreApiResponse | RoleApiResponse
  ): boolean {
    if (arg === null || arg === undefined) return false;
    if (arg.data === null || !Array.isArray(arg.data)) return false;
    if (!arg.data.length) return false;
    return true;
  }

  /**
   * 社員データ、表示区分、店舗一覧、権限一覧を一括取得し
   * クラスメンバへ格納
   * @returns void
   */
  getDisplayData() {
    this.common.loading = true;
    // 購読を親サブスクリプションへアタッチ
    this.subscription.add(
      this.employeeService
        .find(this.selectedId)
        .pipe(
          zipWith(
            this.divisionService.getAsSelectOptions({
              name: employeeConst.EMPLOYEE_STATUS_DIVISION,
            }),
            this.storeService.getAll(),
            this.roleService.getAll()
          ),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          this.common.loading = false;
          // エラー以外は処理を実行
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
          } else if (res.length === 4) {
            /*
          冗長だがmapでユーザー定義型ガードを4つ作るより下記の方がコード量が少ないため
          下記のようにそれぞれforEachで対応
          TODO: 時間があればユーザー定義型ガードをサービスへ追加
          */

            // 社員データを取得
            const employeeRes: EmployeeApiResponse = res[0];
            const checkEmployeeRes = this.checkNullOrEmpty(employeeRes);
            if (checkEmployeeRes) {
              this.employee = employeeRes.data[0];
              this.lastUpdaterName = `${this.employee.employee_updated_last_name}　${this.employee.employee_updated_first_name}`;
            } else {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

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
              this.statusDivisionOptions =
                statusDivisionsRes[employeeConst.EMPLOYEE_STATUS_DIVISION];
            }

            // 店舗を取得
            const storesRes: StoreApiResponse = res[2];
            const checkStoresRes = this.checkNullOrEmpty(storesRes);
            if (checkStoresRes) {
              const stores: SelectOption[] = [];
              storesRes.data.forEach((store) => {
                const obj = { value: store.id, text: store.name };
                stores.push(obj);
              });
              this.storeOptions = stores as SelectOption[];
            } else {
              this.handleError(
                400,
                employeeConst.FAILED_CHOICES_FOR_NARROWING_DOWN
              );
              return;
            }

            // 権限を取得
            const rolesRes: RoleApiResponse = res[3];
            const checkRolesRes = this.checkNullOrEmpty(rolesRes);
            if (checkRolesRes) {
              const roles: SelectOption[] = [];
              rolesRes.data.forEach((role) => {
                const obj = { value: role.id, text: role.name };
                roles.push(obj);
              });
              this.roleOptions = roles as SelectOption[];
            } else {
              this.handleError(
                400,
                employeeConst.FAILED_CHOICES_FOR_NARROWING_DOWN
              );
            }

            // 取得した社員情報でフォームを更新する
            // 選択肢も同時に更新される
            this.employeeEditForm.patchValue(this.employee);
          } else {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
          }
        })
    );
  }

  /**
   * formで入力が取り消された場合に変更がない状態でサブミットさせないようにする
   *
   * @param formValues フォームの値
   * @returns void
   */
  private checkFormDefaultValueChanged(formValues: any): void {
    // 比較用の初期値オブジェクト作成 numberはフォームの入力値がstringになってしまうためstringへ型変更
    const defaultValue = {
      image: null,
      status_division_id: this.employee.status_division_id.toString(),
      role_id: this.employee.role_id.toString(),
      store_id: this.employee.store_id.toString(),
      code: this.employee.code.toString(),
      last_name: this.employee.last_name,
      first_name: this.employee.first_name,
      last_name_kana: this.employee.last_name_kana,
      first_name_kana: this.employee.first_name_kana,
      mail: this.employee.mail,
      tel: this.employee.tel?.toString(),
      posPasswordGroup: {
        pos_password:
          this.employee.password === undefined ? '' : this.employee.password,
        confirm_pos_password: '',
      },
      barcode: this.employee.barcode?.toString(),
      max_discount_rate: this.employee.max_discount_rate?.toString(),
    };

    // 比較の為に元々numberになっていたものをstringへ型変更
    formValues['status_division_id'] =
      formValues['status_division_id'].toString();
    formValues['role_id'] = formValues['role_id'].toString();
    formValues['store_id'] = formValues['store_id'].toString();
    formValues['code'] = formValues['code'].toString();
    formValues['tel'] = formValues['tel'].toString();
    formValues['barcode'] = formValues['barcode'].toString();
    formValues['max_discount_rate'] =
      formValues['max_discount_rate'].toString();

    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(formValues);
    const v2 = JSON.stringify(defaultValue);

    this.formInvalid = v1 === v2;
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.paramMap.get('id');

    if (selectedId === null) {
      // パスパラメータ取得エラー 一覧へ戻す
      this.router.navigateByUrl('/employee/list');
    } else if (isNaN(Number(selectedId))) {
      // number型へのキャストエラー 一覧へ戻す
      this.router.navigateByUrl('/employee/list');
    }

    // 取得したidをクラスメンバへセット
    this.selectedId = Number(selectedId);

    // 詳細画面のパス
    this.detailPath = '/employee/detail/' + this.selectedId;

    // 購読を親サブスクリプションへアタッチ
    this.subscription.add(
      // 画像の FormControl の変更を購読
      this.employeeEditForm.controls.image.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
      })
    );
    this.subscription.add(
      this.employeeEditForm.valueChanges.subscribe((res) => {
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

    // 全ての表示用データを取得
    this.getDisplayData();
  }

  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel(): void {
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

  /**
   * 入力内容をクリアして取得した値を設定する
   * @returns void
   */
  handleClickClearButton(): void {
    this.employeeEditForm.reset(this.employee);
    this.employeeEditForm.patchValue(this.employee);
    this.employeeEditForm.controls.posPasswordGroup.controls.pos_password.setValue(
      this.employee.pos_password ? this.employee.pos_password : ''
    );
    this.employeeEditForm.controls.posPasswordGroup.controls.confirm_pos_password.setValue(
      ''
    );
  }

  /**
   * 変更内容を保存
   * @returns void
   */
  handleClickSaveButton(): void {
    // ローディング開始
    this.common.loading = true;
    const formVal = this.employeeEditForm.value;

    const employee = {
      image: formVal.image,
      status_division_id: formVal.status_division_id,
      role_id: formVal.role_id,
      store_id: formVal.store_id,
      code: formVal.code,
      last_name: formVal.last_name,
      first_name: formVal.first_name,
      last_name_kana: formVal.last_name_kana,
      first_name_kana: formVal.first_name_kana,
      mail: formVal.mail,
      tel: formVal.tel,
      pos_password: formVal.posPasswordGroup?.pos_password,
      barcode: formVal.barcode,
      max_discount_rate: formVal.max_discount_rate,
    };

    // 店舗の値チェック
    const storeIdExists = this.storeOptions.some((store) => {
      const storeVal = Number(store.value);
      const storeId = Number(employee.store_id);
      return storeVal === storeId;
    });
    if (!storeIdExists) {
      this.employeeEditForm.controls.store_id.setValue(null);
      this.formInvalid = true;
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
      this.employeeEditForm.controls.role_id.setValue(null);
      this.formInvalid = true;
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
      this.employeeEditForm.controls.status_division_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 送信ボタンを非活性にする
    this.formInvalid = true;

    // 更新処理をサブスクリプションへ追加
    this.subscription.add(
      // 更新処理を購読
      this.employeeService
        .update(this.selectedId, employee)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            return of(err.error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          // ローディング終了
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
          } else {
            const purpose: FlashMessagePurpose = 'success';
            this.flashMessageService.setFlashMessage(
              res.message,
              purpose,
              15000
            );
            this.router.navigateByUrl(this.detailPath);
          }
        })
    );
  }

  /**
   * 選択された画像を削除
   */
  handleClickDeleteIcon() {
    this.employeeEditForm.controls.image.setValue(null);
    this.employeeEditForm.patchValue(this.employee);
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
      this.formInvalid = false;
    } else {
      this.imageUrl = undefined;
      this.fileName = undefined;
      this.formInvalid = true;
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
