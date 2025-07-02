import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { CustomMediumCategory } from 'src/app/models/custom-medium-category';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomMediumCategoryService } from 'src/app/services/custom-medium-category.service';
import { CustomLargeCategoryService } from 'src/app/services/custom-large-category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private clcService: CustomLargeCategoryService,
    private cmcService: CustomMediumCategoryService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  /******************** フォームエラーメッセージ用変数 ********************/
  // 文字数制限
  exceededCharacterMaxLimit = {
    message: errorConst.FORM_ERROR.EXCEEDED_CHARACTER_MAX_LIMIT,
  };
  // 必須項目
  requiredItem = { message: errorConst.FORM_ERROR.REQUIRED_ITEM };
  /******************** フォームエラーメッセージ用変数 ********************/

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 選択中ID
  selectedId!: number;

  // カスタム大分類の選択肢
  clcOptions: SelectOption[] = [];

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = 'カスタム中分類編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 詳細画面へのパス
  detailPath!: string;

  // APIから取得した更新前の基本情報を保持
  beforeUpdateCmc!: CustomMediumCategory;

  cmc: CustomMediumCategory = {
    id: 0,
    name: '',
    custom_large_category_id: 0,
    custom_large_category_name: '',
    created_at: '',
    created_id: 0,
    employee_updated_last_name: '',
    employee_updated_first_name: '',
  };

  // リアクティブフォームとバリデーションの設定
  cmcEditForm = this.formBuilder.group({
    custom_large_category_id: [
      this.cmc.custom_large_category_id,
      [Validators.required],
    ],
    name: [this.cmc.name, [Validators.required, Validators.maxLength(255)]],
  });

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
            this.router.navigateByUrl('/setting/custom-medium-category');
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

    // カスタム中分類IDを保持
    this.selectedId = Number(selectedId);
    // カスタム中分類詳細のパスを生成
    this.detailPath =
      '/setting/custom-medium-category/detail/' + this.selectedId;

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
      this.cmcEditForm.valueChanges.subscribe((res) => {
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
      forkJoin([
        this.cmcService.find(this.selectedId),
        this.clcService.getAll(),
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
            const cmcResInvalid = ApiResponseIsInvalid(res[0]);
            const clcResInvalid = ApiResponseIsInvalid(res[1]);

            if (cmcResInvalid || clcResInvalid) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

            const clcData = res[1].data;
            clcData.map((v, k) => {
              const obj = { value: v.id, text: v.name };
              this.clcOptions.push(obj);
            });

            // メンバへ取得したデータを代入
            this.cmc = res[0].data[0];
            this.beforeUpdateCmc = res[0].data[0];
            this.cmcEditForm.patchValue(this.cmc);
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
  checkFormDefaultValueChanged(formValues: any): void {
    // 比較対象のフォームの内容
    const formValue = {
      id: this.cmc.id,
      custom_large_category_id: formValues.custom_large_category_id,
      name: formValues.name,
      created_at: this.cmc.created_at,
      created_id: this.cmc.created_id,
      updated_at: this.cmc.updated_at,
      updated_id: this.cmc.updated_id,
      deleted_at: this.cmc.deleted_at,
      deleted_id: this.cmc.deleted_id,
      custom_large_category_name: this.cmc.custom_large_category_name,
      employee_created_last_name: this.cmc.employee_created_last_name,
      employee_created_first_name: this.cmc.employee_created_first_name,
      employee_updated_last_name: this.cmc.employee_updated_last_name,
      employee_updated_first_name: this.cmc.employee_updated_first_name,
    };
    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(this.beforeUpdateCmc);
    const v2 = JSON.stringify(formValue);

    if (v1 === v2) {
      this.cmcEditForm.markAsPristine();
    }

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
   * 入力内容をクリアしてAPIで取得した値を設定する
   * @returns void
   */
  handleClickClearButton() {
    this.cmcEditForm.reset(this.beforeUpdateCmc);
    this.formInvalid = true;
  }

  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.formInvalid || !this.cmcEditForm.pristine) {
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
   * 送信ボタンクリック時の処理
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.formInvalid = true;
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.cmcEditForm.value;

    // カスタム大分類の値チェック
    const lcIdExists = this.clcOptions.some((lc) => {
      const lcVal = Number(lc.value);
      const storeId = Number(formVal.custom_large_category_id);
      return lcVal === storeId;
    });
    if (!lcIdExists) {
      this.cmcEditForm.controls.custom_large_category_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.cmcService
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
      title: 'カスタム中分類編集エラー：' + modalConst.TITLE.HAS_ERROR,
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
