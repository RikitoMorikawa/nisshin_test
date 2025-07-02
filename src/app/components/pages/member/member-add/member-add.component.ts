import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { MemberService } from 'src/app/services/member.service';
import { catchError, filter, finalize, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService } from 'src/app/services/modal.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DivisionService } from 'src/app/services/division.service';
import { regExConst } from 'src/app/const/regex.const';
import { EmployeeService } from 'src/app/services/employee.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { provinces } from 'src/app/models/province';
import { memberLogicalNameForDisplay } from 'src/app/models/member';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
})
export class MemberAddComponent implements OnInit, OnDestroy {
  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数超過
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  // 文字数不足
  exceededCharacterMinLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MIN_LIMIT,
  };
  // 必須項目
  requiredItem = { message: errorConst.FORM_ERROR.REQUIRED_ITEM };
  // 半角数字制限
  numericLimitViolation = {
    message: errorConst.FORM_ERROR.NUMERIC_LIMIT_VIOLATION,
  };
  // 全角カナ制限
  fullWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  // メールアドレス
  emailFormatViolation = {
    message: errorConst.FORM_ERROR.EMAIL_FORMAT_VIOLATION,
  };
  // パスワード不一致
  passwordMatchViolation = {
    message: errorConst.FORM_ERROR.PASSWORD_MATCH_VIOLATION,
  };
  // パスワードフォーマット
  passwordFormatViolation = {
    message: errorConst.FORM_ERROR.PASSWORD_FORMAT_VIOLATION,
  };
  //
  /******************** フォームエラーメッセージ用変数 ********************/
  // 購読を一元的に保持
  private subscription = new Subscription();
  // 表示用の項目名を格納
  logicalNames = memberLogicalNameForDisplay;
  // ログイン中ユーザ
  author!: Employee;
  // キャンセル時のモーダルタイトル
  cancelModalTitle = '会員登録キャンセル：' + modalConst.TITLE.CANCEL;
  // 会員一覧のパス
  memberListPath = '/member';
  // 会員ステータス区分の選択肢
  statusOptions!: SelectOption[];
  // 都道府県
  provinceOptions: SelectOption[] = [];
  // パスワード用フォーム B2C除外対応
  // passwordForm = this.formBuilder.group(
  //   {
  //     password: [
  //       '',
  //       [
  //         Validators.required,
  //         Validators.minLength(8),
  //         Validators.maxLength(24),
  //         Validators.pattern(regExConst.PASSWORD_REG_EX),
  //       ],
  //     ],
  //     confirm_password: ['', [Validators.required]],
  //   },
  //   {
  //     validators: [
  //       CustomValidators.compareValidator('password', 'confirm_password'),
  //     ],
  //   }
  // );
  // リアクティブフォームとバリデーションの設定
  formGroup = this.formBuilder.group({
    member_cd: ['', [Validators.required, Validators.maxLength(10)]], // 会員番号
    last_name: ['', [Validators.required, Validators.maxLength(255)]], // 会員 姓
    first_name: ['', [Validators.required, Validators.maxLength(255)]], // 会員 名
    last_name_kana: [
      '',
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ], // 会員 姓カナ
    first_name_kana: [
      '',
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ], // 会員 名カナ
    postal_code: [
      '',
      [
        Validators.minLength(7),
        Validators.maxLength(7),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ], // 郵便番号
    province: [''], // 都道府県
    locality: ['', [Validators.maxLength(20)]], // 市区町村
    street_address: ['', [Validators.maxLength(20)]], // 町名番地
    other_address: ['', [Validators.maxLength(20)]], // 建物名など
    tel: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(16)],
    ], // 電話番号
    mail: [
      '',
      [Validators.email, Validators.maxLength(255)], // Validators.required削除 B2C除外対応
    ], // メールアドレス
    point: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(256),
      ],
    ], // ポイント保有数
    status_division_id: ['', [Validators.required]], // 会員ステータス区分
    remarks_1: ['', [Validators.maxLength(255)]], // 備考1
    remarks_2: ['', [Validators.maxLength(255)]], // 備考2
    identification_document_confirmation_date: [''], // 本人確認書類確認年月日
  });
  get ctrls() {
    return this.formGroup.controls;
  }

  /**
   * コンストラクタ
   * @param formBuilder
   * @param authorService
   * @param errorService
   * @param modalService
   * @param memberService
   * @param router
   * @param divisionService
   * @param employeeService
   * @param flashMessageService
   */
  constructor(
    private formBuilder: FormBuilder,
    private authorService: AuthorService,
    private errorService: ErrorService,
    private modalService: ModalService,
    private memberService: MemberService,
    private router: Router,
    private divisionService: DivisionService,
    private employeeService: EmployeeService,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            // キャンセルモーダルのタイトルでフィルタリング
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          // OKボタンクリック時のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.memberListPath);
          }
        })
    );
    if (this.authorService.author) {
      // サービスからログイン中ユーザを取得
      this.author = this.authorService.author;
    } else {
      // ログイン中ユーザストリームを購読
      this.subscription.add(
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
    this.getOptions();
  }

  /**
   * 区分の選択肢を取得
   * @returns void
   */
  private getOptions(): void {
    this.common.loading = true;
    this.subscription.add(
      this.divisionService
        .getAsSelectOptions({ name: '会員ステータス区分' })
        .pipe(
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
          if (res === null) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.initOptions(res['会員ステータス区分']);
        })
    );
  }

  /**
   * 選択項目を設定
   * @param memberStatus
   * @returns void
   */
  private initOptions(memberStatus: SelectOption[]) {
    // 会員ステータス区分
    this.statusOptions = memberStatus;
    this.statusOptions.unshift({
      value: '',
      text: '選択してください',
    });
    // 都道府県
    provinces
      .map((provinceName, index) => ({ value: index, text: provinceName }))
      .map((province) => this.provinceOptions.push(province));
    this.provinceOptions.unshift({
      value: '',
      text: '選択してください',
    });
  }

  /**
   * フォームのエラー状態管理
   * @param formControl
   * @returns boolean
   */
  isFormInvalid(formControl: FormControl): boolean {
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
   * キャンセルボタン押下後の処理
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (!this.formGroup.pristine) {
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        'warning',
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.memberListPath);
    }
  }

  /**
   * 保存ボタン押下後の処理
   */
  handleClickSaveButton(): void {
    this.common.loading = true;
    // 送信ボタンを非活性
    this.formGroup.markAsPristine();
    const formValues = this.formGroup.value;
    const member = {
      member_cd: formValues.member_cd,
      status_division_id: formValues.status_division_id,
      point: formValues.point,
      last_name: formValues.last_name,
      first_name: formValues.first_name,
      last_name_kana: formValues.last_name_kana,
      first_name_kana: formValues.first_name_kana,
      mail: formValues.mail,
      tel: formValues.tel,
      postal_code: formValues.postal_code,
      province: this.getProvinceName(formValues.province), // 当道府県番号を都道府県名に変換
      locality: formValues.locality,
      street_address: formValues.street_address,
      other_address: formValues.other_address,
      remarks_1: formValues.remarks_1,
      remarks_2: formValues.remarks_2,
      identification_document_confirmation_date: '',
    };

    // 本人確認書類確認年月日の値を整形
    if (
      this.formGroup.controls.identification_document_confirmation_date.value
    ) {
      const tempDate = new Date(
        this.formGroup.controls.identification_document_confirmation_date.value
      ).toLocaleString();
      member.identification_document_confirmation_date = tempDate;
    }

    // 登録処理を購読へ追加
    this.subscription.add(
      this.memberService
        .add(member)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.member);
            return;
          }
          this.flashMessageService.setFlashMessage(
            res.message,
            'success',
            15000
          );
          this.router.navigateByUrl(this.memberListPath);
        })
    );
  }

  /**
   * 選択項目の都道府県番号から都道府県名を取得
   * @param provinceNumber
   * @returns 都道府県名
   */
  getProvinceName(provinceNumber: string | undefined | null) {
    if (
      provinceNumber === '' ||
      provinceNumber === null ||
      typeof provinceNumber === undefined
    ) {
      return null;
    }
    const provinceName = this.provinceOptions.filter(
      (item) => item.value === Number(provinceNumber)
    );
    return provinceName[0].text;
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // エラーサービスへエラー内容をセット
    this.errorService.setError({
      status: status,
      title: '会員新規登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * コンポーネントの終了処理
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
