import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { catchError, filter, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { regExConst } from 'src/app/const/regex.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { QrService } from 'src/app/services/qr.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Qr } from 'src/app/models/qr';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss'],
})
export class QrEditComponent implements OnInit, OnDestroy {
  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数制限
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  // 必須項目
  requiredItem = {
    message: errorConst.FORM_ERROR.REQUIRED_ITEM,
  };
  // 全角カナ
  fullWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/
  // 購読を一元的に格納
  subscription = new Subscription();
  // QRIDを格納
  selectedId!: number;
  // 初期値からの変化の有無を格納（Trueで保存ボタンを非活性化）
  IsFormNotChanged: boolean = true;
  // キャンセル時のモーダルタイトル
  cancelModalTitle = 'QR編集キャンセル：' + modalConst.TITLE.CANCEL;
  // パスパラメータ取得エラー時のモーダルタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;
  // QRレコード詳細へのルートパス
  qrDetailRootPath: string = '/setting/non-cash-item/qr/detail/';
  // QRレコード詳細へのパス
  qrDetailPath!: string; /////////////////////////////////// `!` ⇦が必要か確認する
  // QR一覧へのパス
  qrListPath = '/setting/non-cash-item/qr';
  // APIから取得した、フォーム更新前のQR情報を格納
  qrInitialValues!: Qr;
  // 最終更新者を格納
  lastUpdaterFullName!: string;
  // 対象レコードの値を格納
  qr: Qr = {
    id: 0,
    name: '',
    furi: '',
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
  // フォーム
  qrEditForm = this.formBuilder.group({
    name: [this.qr.name, [Validators.required, Validators.maxLength(10)]],
    furi: [
      this.qr.furi,
      [
        Validators.maxLength(7),
        Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
      ],
    ],
  });

  /**
   * コンストラクタ
   * @param formBuilder
   * @param modalService
   * @param router
   * @param route
   * @param qrService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private qrService: QrService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // パスパラメータ取得エラーのモーダルを閉じる処理を購読
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
            this.router.navigateByUrl(this.qrListPath);
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
    this.qrDetailPath = this.qrDetailRootPath + this.selectedId;

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
            this.router.navigateByUrl(this.qrDetailPath);
          }
        })
    );
    // フォームの変更を購読
    this.subscription.add(
      this.qrEditForm.valueChanges.subscribe((res) => {
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
    this.common.loading = true;
    this.subscription.add(
      this.qrService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
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
          this.common.loading = false;
        })
    );
  }

  /**
   * クラス変数とフォームに取得した値を格納
   * @param data
   */
  setData(data: any) {
    this.qr = data;
    this.qrInitialValues = data;
    this.qrEditForm.patchValue(this.qr);
    this.lastUpdaterFullName = `${this.qr.employee_updated_last_name}　${this.qr.employee_updated_first_name}`;
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
      id: this.qr.id,
      name: formValues.name,
      furi: formValues.furi,
      created_at: this.qr.created_at,
      created_id: this.qr.created_id,
      updated_at: this.qr.updated_at,
      updated_id: this.qr.updated_id,
      deleted_at: this.qr.deleted_at,
      deleted_id: this.qr.deleted_id,
      employee_created_last_name: this.qr.employee_created_last_name,
      employee_created_first_name: this.qr.employee_created_first_name,
      employee_updated_last_name: this.qr.employee_updated_last_name,
      employee_updated_first_name: this.qr.employee_updated_first_name,
    };
    // オブジェクトの比較のためにjsonへキャスト
    const v1 = JSON.stringify(this.qrInitialValues);
    const v2 = JSON.stringify(values);
    // フォームの値と初期値の比較結果を格納（一致する場合はテンプレートで保存ボタンを非活性化）
    this.IsFormNotChanged = v1 === v2;
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
   * フォームの入力内容をクリアして、APIで取得した初期値を設定する
   * @return void
   */
  handleClickClearButton(): void {
    this.qrEditForm.reset(this.qrInitialValues);
  }

  /**
   * キャンセル押下時の処理
   * @return void
   */
  handleClickCancel(): void {
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
      this.router.navigateByUrl(this.qrDetailPath);
    }
  }

  /**
   * 保存ボタン押下時の処理
   * @return void
   */
  handleClickSaveButton() {
    // 変更前のフラグ状態に戻し、保存ボタンを非活性化
    this.IsFormNotChanged = true;
    this.common.loading = true;
    const formValues = this.qrEditForm.value;

    // 更新を購読
    this.subscription.add(
      this.qrService
        .update(this.selectedId, formValues)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          this.flashMessageService.setFlashMessage(
            res.message,
            'success',
            15000
          );
          this.router.navigateByUrl(this.qrDetailPath);
          this.common.loading = false;
        })
    );
  }

  /**
   * エラー処理
   * 親コンポーネントへエラーを送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorService.setError({
      status: status,
      title: 'QR編集エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
