import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, filter, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { QualityCustomer } from 'src/app/models/quality-customer';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService } from 'src/app/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { QualityCustomerService } from 'src/app/services/quality-customer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数制限
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
  // 購読を一元的に格納
  subscription = new Subscription();
  // 客層IDを格納
  selectedId!: number;
  // ローディング中フラグ
  isLoading = false;
  // 初期値から変化の有無を格納（Trueで保存ボタンを非活性）
  IsFormNotChanged: boolean = true;
  // キャンセル時のモーダルタイトル
  cancelModalTitle = '客層編集キャンセル：' + modalConst.TITLE.CANCEL;
  // パスパラメータ取得エラー時のモーダルタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;
  // 客層レコード詳細へのパス（ngOnInitで客層IDを末尾に付与）
  detailRootPath: string = '/setting/quality-customer/detail/';
  // 客層レコード詳細へのパス（ngOnInitで客層IDを末尾に付与）
  detailPath: string = '';
  // 客層一覧へのパス
  qualityCustomerListPath = '/setting/quality-customer';
  // APIから取得した、フォーム更新前の客層情報を格納
  qualityCustomerInitialValues!: QualityCustomer;
  // 最終更新者を格納
  lastUpdaterFullName!: string;
  // 対象レコードの値を格納
  qualityCustomer: QualityCustomer = {
    id: 0,
    name: '',
    furi: '',
    code: 0,
    created_at: '',
    created_id: 0,
    updated_at: '',
    updated_id: 0,
    deleted_at: '',
    deleted_id: 0,
    employee_created_last_name: '',
    employee_created_first_name: '',
    employee_updated_last_name: '',
    employee_updated_first_name: '',
  };
  // リアクティブフォームとバリデーションの設定
  qualityCustomerEditForm = this.formBuilder.group({
    name: [
      this.qualityCustomer.name,
      [Validators.required, Validators.maxLength(10)],
    ],
    furi: [
      this.qualityCustomer.furi,
      [
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
    code: [
      this.qualityCustomer.code,
      [Validators.required, Validators.maxLength(2)],
    ],
  });

  /**
   * コンストラクタ
   * @param formBuilder
   * @param modalService
   * @param router
   * @param route
   * @param qualityCustomerService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private qualityCustomerService: QualityCustomerService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // パスパラメーター取得エラーのモーダルを閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            // パスパラメータ取得エラーのモーダルでフィルタリング
            (_) =>
              this.modalService.getModalProperties().title ===
              this.getPathErrorModalTitle
          )
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.qualityCustomerListPath);
          }
        })
    );
    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.paramMap.get('id');
    if (selectedId === null || isNaN(Number(selectedId))) {
      this.modalService.setModal(
        this.getPathErrorModalTitle,
        modalConst.BODY.HAS_ERROR,
        'danger',
        modalConst.BUTTON_TITLE.CANCEL
      );
      return;
    }
    // 客層詳細のパスを生成
    this.selectedId = Number(selectedId);
    this.detailPath = this.detailRootPath + this.selectedId;

    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            // キャンセルモーダルでフィルタリング
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          // okボタンクリック時のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.detailPath);
          }
        })
    );

    // フォームの変更を購読
    this.subscription.add(
      this.qualityCustomerEditForm.valueChanges.subscribe((res) => {
        this.checkFormInitialValueChanged(res);
      })
    );
    // データ取得
    this.getDisplayData();
  }

  /**
   * フォームへ表示する情報を取得
   */
  getDisplayData(): void {
    this.isLoading = true;
    this.common.loading = true;
    this.subscription.add(
      this.qualityCustomerService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          // 取得データに中身があるか確認
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.setData(res.data[0]);
        })
    );
  }

  /**
   * クラス変数とフォームに取得した値を格納
   * @param data
   */
  setData(data: any) {
    this.qualityCustomer = data;
    this.qualityCustomerInitialValues = data;
    this.qualityCustomerEditForm.patchValue(this.qualityCustomer);
    this.lastUpdaterFullName = `${this.qualityCustomer.employee_updated_last_name}　${this.qualityCustomer.employee_updated_first_name}`;
  }

  /**
   * フォームの値と初期値の比較し「比較結果を格納する変数」に結果を格納
   * （同じ場合は保存ボタンを非活性化してサブミットさせない）
   * @param formValues
   * @return void
   */
  checkFormInitialValueChanged(formValues: any): void {
    // フォームの値と客層情報を格納
    // （注：全項目のJsonを文字列に変換して初期値と比較しており項目の順番も意味アリ）
    const values = {
      id: this.qualityCustomer.id,
      code: Number(formValues.code), // APIからは数値、フォームからは文字列として取れるのでキャスト
      name: formValues.name,
      furi: formValues.furi,
      created_at: this.qualityCustomer.created_at,
      created_id: this.qualityCustomer.created_id,
      updated_at: this.qualityCustomer.updated_at,
      updated_id: this.qualityCustomer.updated_id,
      deleted_at: this.qualityCustomer.deleted_at,
      deleted_id: this.qualityCustomer.deleted_id,
      employee_created_last_name:
        this.qualityCustomer.employee_created_last_name,
      employee_created_first_name:
        this.qualityCustomer.employee_created_first_name,
      employee_updated_last_name:
        this.qualityCustomer.employee_updated_last_name,
      employee_updated_first_name:
        this.qualityCustomer.employee_updated_first_name,
    };
    // オブジェクトの比較のためにjsonへキャスト
    const v1 = JSON.stringify(this.qualityCustomerInitialValues);
    const v2 = JSON.stringify(values);
    // フォームの値と初期値の比較結果を格納（一致する場合はテンプレートで保存ボタンを非活性化）
    this.IsFormNotChanged = v1 === v2;
  }

  /**
   * フォームの状態を管理
   * @param formControl
   * @returns
   */
  isInvalid(formControl: FormControl): boolean {
    return (formControl.touched || formControl.dirty) && formControl.invalid;
  }

  // フォームの入力内容をクリアして、APIで取得した初期値を設定する
  handleClickClearButton() {
    this.qualityCustomerEditForm.reset(this.qualityCustomerInitialValues);
  }

  /**
   * キャンセル押下時の処理
   * @return void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.IsFormNotChanged) {
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        'warning',
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPath);
    }
  }

  /**
   * 保存ボタン押下の処理
   */
  handleClickSaveButton() {
    // 変更前のフラグ状態に戻し、保存ボタンを非活性化
    this.IsFormNotChanged = true;
    this.isLoading = true;
    this.common.loading = true;
    const formValues = this.qualityCustomerEditForm.value;

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.qualityCustomerService
        .update(this.selectedId, formValues)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.common.loading = false;
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
    // 親コンポーネントへエラーを送信
    this.errorService.setError({
      status: status,
      title: '客層編集エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * コンポーネントの終了処理
   * @return void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
