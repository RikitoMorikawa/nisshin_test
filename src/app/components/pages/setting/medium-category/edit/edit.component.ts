import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { MediumCategory } from 'src/app/models/medium-category';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { regExConst } from 'src/app/const/regex.const';
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
    private lcService: LargeCategoryService,
    private mcService: MediumCategoryService,
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
  // 半角カタカナ制限
  halfWidthKatakanaRestrictionViolation = {
    message: errorConst.FORM_ERROR.HALF_WIDTH_KATAKANA_RESTRICTION_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 選択中権限ID
  selectedId!: number;

  // 大分類の選択肢
  lcOptions: SelectOption[] = [];

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '中分類編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 詳細画面へのパス
  detailPath!: string;

  // APIから取得した更新前の基本情報を保持
  beforeUpdateMc!: MediumCategory;

  mc: MediumCategory = {
    id: 0,
    name: '',
    short_name: '',
    large_category_id: 0,
    large_category_name: '',
    created_at: '',
    created_id: 0,
    employee_updated_last_name: '',
    employee_updated_first_name: '',
  };

  // リアクティブフォームとバリデーションの設定
  mcEditForm = this.formBuilder.group({
    large_category_id: [this.mc.large_category_id, [Validators.required]],
    name: [this.mc.name, [Validators.required, Validators.maxLength(10)]],
    short_name: [
      this.mc.short_name,
      [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(regExConst.HALF_WIDTH_KATAKANA_REG_EX),
      ],
    ],
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
            this.router.navigateByUrl('/setting/medium-category');
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

    // 中分類IDを保持
    this.selectedId = Number(selectedId);
    // 中分類詳細のパスを生成
    this.detailPath = '/setting/medium-category/detail/' + this.selectedId;

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
      this.mcEditForm.valueChanges.subscribe((res) => {
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
      forkJoin([this.mcService.find(this.selectedId), this.lcService.getAll()])
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
          if (Array.isArray(res) && res.length === 2) {
            // 取得したデータをチェック
            const mcResInvalid = ApiResponseIsInvalid(res[0]);
            const lcResInvalid = ApiResponseIsInvalid(res[1]);

            if (mcResInvalid || lcResInvalid) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

            const lcs = res[1].data;
            lcs.map((v, k) => {
              const obj = { value: v.id, text: v.name };
              this.lcOptions.push(obj);
            });

            // メンバへ取得したデータを代入
            this.mc = res[0].data[0];
            this.beforeUpdateMc = res[0].data[0];
            this.mcEditForm.patchValue(this.mc);
            // ローディング終了
            this.common.loading = false;
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
      id: this.mc.id,
      large_category_id: formValues.large_category_id,
      name: formValues.name,
      short_name: formValues.short_name,
      created_at: this.mc.created_at,
      created_id: this.mc.created_id,
      updated_at: this.mc.updated_at,
      updated_id: this.mc.updated_id,
      deleted_at: this.mc.deleted_at,
      deleted_id: this.mc.deleted_id,
      large_category_name: this.mc.large_category_name,
      employee_created_last_name: this.mc.employee_created_last_name,
      employee_created_first_name: this.mc.employee_created_first_name,
      employee_updated_last_name: this.mc.employee_updated_last_name,
      employee_updated_first_name: this.mc.employee_updated_first_name,
    };
    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(this.beforeUpdateMc);
    const v2 = JSON.stringify(formValue);

    if (v1 === v2) {
      this.mcEditForm.markAsPristine();
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
    this.mcEditForm.reset(this.beforeUpdateMc);
    this.formInvalid = true;
  }

  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.formInvalid || !this.mcEditForm.pristine) {
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
    const formVal = this.mcEditForm.value;

    // 大分類の値チェック
    const lcIdExists = this.lcOptions.some((lc) => {
      const lcVal = Number(lc.value);
      const storeId = Number(formVal.large_category_id);
      return lcVal === storeId;
    });
    if (!lcIdExists) {
      this.mcEditForm.controls.large_category_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.mcService
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
      title: '中分類編集エラー：' + modalConst.TITLE.HAS_ERROR,
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
