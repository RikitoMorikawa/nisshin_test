import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { SmallCategory } from 'src/app/models/small-category';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SmallCategoryService } from 'src/app/services/small-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
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
    private smService: SmallCategoryService,
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

  // 中分類の選択肢
  mcOptions: SelectOption[] = [];

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '小分類編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 詳細画面へのパス
  detailPath!: string;

  // APIから取得した更新前の基本情報を保持
  beforeUpdateMc!: SmallCategory;

  sm: SmallCategory = {
    id: 0,
    name: '',
    short_name: '',
    medium_category_id: 0,
    medium_category_name: '',
    created_at: '',
    created_id: 0,
    employee_updated_last_name: '',
    employee_updated_first_name: '',
  };

  // リアクティブフォームとバリデーションの設定
  smEditForm = this.formBuilder.group({
    medium_category_id: [this.sm.medium_category_id, [Validators.required]],
    name: [this.sm.name, [Validators.required, Validators.maxLength(10)]],
    short_name: [
      this.sm.short_name,
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
            this.router.navigateByUrl('/setting/small-category');
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

    // 小分類IDを保持
    this.selectedId = Number(selectedId);
    // 小分類詳細のパスを生成
    this.detailPath = '/setting/small-category/detail/' + this.selectedId;

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
      this.smEditForm.valueChanges.subscribe((res) => {
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
      forkJoin([this.smService.find(this.selectedId), this.mcService.getAll()])
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
            const smResInvalid = ApiResponseIsInvalid(res[0]);
            const mcResInvalid = ApiResponseIsInvalid(res[1]);

            if (smResInvalid || mcResInvalid) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

            const mcs = res[1].data;
            mcs.map((v, k) => {
              const obj = { value: v.id, text: v.name };
              this.mcOptions.push(obj);
            });

            // メンバへ取得したデータを代入
            this.sm = res[0].data[0];
            this.beforeUpdateMc = res[0].data[0];
            this.smEditForm.patchValue(this.sm);
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
      id: this.sm.id,
      medium_category_id: formValues.medium_category_id,
      name: formValues.name,
      short_name: formValues.short_name,
      created_at: this.sm.created_at,
      created_id: this.sm.created_id,
      updated_at: this.sm.updated_at,
      updated_id: this.sm.updated_id,
      deleted_at: this.sm.deleted_at,
      deleted_id: this.sm.deleted_id,
      medium_category_name: this.sm.medium_category_name,
      employee_created_last_name: this.sm.employee_created_last_name,
      employee_created_first_name: this.sm.employee_created_first_name,
      employee_updated_last_name: this.sm.employee_updated_last_name,
      employee_updated_first_name: this.sm.employee_updated_first_name,
    };
    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(this.beforeUpdateMc);
    const v2 = JSON.stringify(formValue);

    if (v1 === v2) {
      this.smEditForm.markAsPristine();
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
    this.smEditForm.reset(this.beforeUpdateMc);
    this.formInvalid = true;
  }

  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.formInvalid || !this.smEditForm.pristine) {
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
    const formVal = this.smEditForm.value;

    // 中分類の値チェック
    const mcIdExists = this.mcOptions.some((mc) => {
      const lcVal = Number(mc.value);
      const storeId = Number(formVal.medium_category_id);
      return lcVal === storeId;
    });
    if (!mcIdExists) {
      this.smEditForm.controls.medium_category_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.smService
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
      title: '小分類編集エラー：' + modalConst.TITLE.HAS_ERROR,
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
