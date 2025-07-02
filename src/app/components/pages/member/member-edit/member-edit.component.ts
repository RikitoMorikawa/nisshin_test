import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Employee } from 'src/app/models/employee';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { MemberService } from 'src/app/services/member.service';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DivisionService } from 'src/app/services/division.service';
import { regExConst } from 'src/app/const/regex.const';
import {
  FlashMessageService,
  FlashMessagePurpose,
} from 'src/app/services/flash-message.service';
import { provinces } from 'src/app/models/province';
import { Member, memberLogicalNameForDisplay } from 'src/app/models/member';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss'],
})
export class MemberEditComponent implements OnInit, OnDestroy {
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
  //
  /******************** フォームエラーメッセージ用変数 ********************/

  /**
   * コンストラクタ
   *
   * @param formBuilder
   * @param errorService
   * @param modalService
   * @param memberService
   * @param router
   * @param route
   * @param divisionService
   * @param flashMessageService
   */
  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private modalService: ModalService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private divisionService: DivisionService,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 選択中ID
  selectedId!: number;

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // 表示用の項目名を格納
  logicalNames = memberLogicalNameForDisplay;

  // ログイン中ユーザ
  author!: Employee;

  // 最終更新者フルネーム
  lastUpdater!: string;

  // キャンセル時のモーダルタイトル
  cancelModalTitle = '会員編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 会員一覧のパス
  memberListPath = '/member';

  // 詳細画面へのパス
  detailPath!: string;

  // 会員ステータス区分の選択肢
  statusOptions!: SelectOption[];

  // 都道府県
  provinceOptions: SelectOption[] = [];

  // 変更前の会員情報
  beforeUpdateMember!: Member;

  // 変更対象会員情報（初期状態は空の会員情報）
  member: Member = {
    id: 0,
    member_cd: 0,
    last_name: '',
    first_name: '',
    last_name_kana: '',
    first_name_kana: '',
    postal_code: '',
    province: '',
    locality: '',
    street_address: '',
    other_address: '',
    tel: '',
    mail: '',
    point: '',
    status_division_id: 0,
    division_status_value: '',
    remarks_1: '',
    remarks_2: '',
    created_at: '',
    created_id: 0,
    updated_at: '',
    updated_id: 0,
    identification_document_confirmation_date: '',
  };

  // リアクティブフォームとバリデーションの設定
  formGroup = this.formBuilder.group({
    member_cd: [
      this.member.member_cd,
      [Validators.required, Validators.maxLength(10)],
    ], // 会員番号,
    last_name: [
      this.member.last_name,
      [Validators.required, Validators.maxLength(255)],
    ], // 会員 姓,
    first_name: [
      this.member.first_name,
      [Validators.required, Validators.maxLength(255)],
    ], // 会員 名
    last_name_kana: [
      this.member.last_name_kana,
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ], // 会員 姓カナ
    first_name_kana: [
      this.member.first_name_kana,
      [
        Validators.maxLength(255),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ], // 会員 名カナ
    postal_code: [
      this.member.postal_code,
      [
        Validators.minLength(7),
        Validators.maxLength(7),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ], // 郵便番号
    province: [this.member.province], // 都道府県
    locality: [this.member.locality, [Validators.maxLength(20)]], // 市区町村
    street_address: [this.member.street_address, [Validators.maxLength(20)]], // 町名番地
    other_address: [this.member.other_address, [Validators.maxLength(20)]], // 建物名など
    tel: [
      this.member.tel,
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(16)],
    ], // 電話番号
    mail: [
      this.member.mail,
      [Validators.email, Validators.maxLength(255)], // Validators.required削除 B2C除外対応
    ], // メールアドレス
    point: [
      this.member.point,
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.maxLength(256),
      ],
    ], // ポイント保有数
    status_division_id: [this.member.status_division_id, [Validators.required]], // 会員ステータス区分
    remarks_1: [this.member.remarks_1, [Validators.maxLength(255)]], // 備考1
    remarks_2: [this.member.remarks_2, [Validators.maxLength(255)]], // 備考2
    identification_document_confirmation_date: [''], // 本人確認書類確認年月日
  });

  get formControls() {
    return this.formGroup.controls;
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
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
            this.router.navigateByUrl(this.memberListPath);
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

    // IDを保持
    this.selectedId = Number(selectedId);
    // 詳細のパスを生成
    this.detailPath = this.memberListPath + '/detail/' + this.selectedId;

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
      // フォームの変更を購読
      this.formGroup.valueChanges.subscribe((res) => {
        this.checkFormDefaultValueChanged(res);
      })
    );

    this.getOptions();
    this.getMember(this.selectedId);
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

          // 会員ステータス区分
          this.statusOptions = res['会員ステータス区分'];
          // 都道府県
          provinces
            .map((provinceName) => ({
              value: provinceName,
              text: provinceName,
            }))
            .map((province) => this.provinceOptions.push(province));
        })
    );
  }

  /**
   * フォームに表示する全てのデータを取得
   * @param memberId
   */
  getMember(memberId: number) {
    this.common.loading = true;
    this.subscription.add(
      this.memberService
        .find(memberId)
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
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          this.lastUpdater =
            res.data[0].employee_updated_last_name +
            ' ' +
            res.data[0].employee_updated_first_name;

          this.beforeUpdateMember = res.data[0];
          this.member = res.data[0];

          this.formGroup.patchValue(this.member);
        })
    );
  }

  /**
   * フォームの状態管理
   *
   * @param formControl
   * @returns
   */
  isFormInvalid(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  /**
   * フォームの初期値と比較して変更がない場合 markAsPristine とする
   *
   * @param formValues フォームの値
   * @returns void
   */
  checkFormDefaultValueChanged(formValues: any): void {
    const defaultValue = {
      member_cd: this.beforeUpdateMember.member_cd,
      last_name: this.beforeUpdateMember.last_name,
      first_name: this.beforeUpdateMember.first_name,
      last_name_kana: this.beforeUpdateMember.last_name_kana,
      first_name_kana: this.beforeUpdateMember.first_name_kana,
      postal_code: this.beforeUpdateMember.postal_code,
      province: this.beforeUpdateMember.province,
      locality: this.beforeUpdateMember.locality,
      street_address: this.beforeUpdateMember.street_address,
      other_address: this.beforeUpdateMember.other_address,
      tel: this.beforeUpdateMember.tel,
      mail: this.beforeUpdateMember.mail,
      point: this.beforeUpdateMember.point,
      status_division_id: this.beforeUpdateMember.status_division_id,
      remarks_1: this.beforeUpdateMember.remarks_1,
      remarks_2: this.beforeUpdateMember.remarks_2,
      identification_document_confirmation_date:
        this.beforeUpdateMember.identification_document_confirmation_date,
    };

    const before = JSON.stringify(defaultValue);
    const after = JSON.stringify(formValues);
    if (before === after) {
      this.formGroup.markAsPristine();
    }

    // フォームの値と初期値が同じ場合サブミットさせない
    this.formInvalid = before === after;
  }

  /**
   * キャンセルボタンクリック時の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (!this.formInvalid || !this.formGroup.pristine) {
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
   * フォームの値を初期状態に戻す
   * @returns void
   */
  handleClickClearButton() {
    this.formGroup.reset(this.beforeUpdateMember);
    this.formInvalid = true;
  }

  /**
   * 会員更新処理
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.formInvalid = true;

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.formGroup.value;

    // 本人確認書類確認年月日の値を整形
    if (
      this.formGroup.controls.identification_document_confirmation_date.value
    ) {
      const tempDate = new Date(
        this.formGroup.controls.identification_document_confirmation_date.value
      ).toLocaleString();
      formVal.identification_document_confirmation_date = tempDate;
    }

    // 更新処理を購読へ追加
    this.subscription.add(
      this.memberService
        .update(this.selectedId, formVal)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            console.log(res);
            this.handleError(res.status, res.error.message);
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.detailPath);
        })
    );
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '会員編集エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントが破棄される時に実行
   */
  ngOnDestroy(): void {
    // 一元管理した購読を全て解除
    this.subscription.unsubscribe();
  }
}
