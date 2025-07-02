import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { MainProductBook } from 'src/app/models/pb-main';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PbMainService } from 'src/app/services/pb-main.service';
import { PbSecondCategoryService } from 'src/app/services/pb-second-category.service';
import { StoreService } from 'src/app/services/store.service';
import { ProductService } from 'src/app/services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { regExConst } from 'src/app/const/regex.const';
import { PbSecondCategory } from 'src/app/models/pb-second-category';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { ProductApiResponse } from 'src/app/models/product';
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
    private pbMainService: PbMainService,
    private pbSecondCategoryService: PbSecondCategoryService,
    private storeService: StoreService,
    private productService: ProductService,
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
  // 半角数字のみ
  numericLimitViolation = {
    message: errorConst.FORM_ERROR.NUMERIC_LIMIT_VIOLATION,
  };
  /******************** フォームエラーメッセージ用変数 ********************/

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 選択中ID
  selectedId!: number;

  // 第2分類の選択肢
  scOptions: SelectOption[] = [];
  // 店舗の選択肢
  storeOptions: SelectOption[] = [];

  // 第2分類
  pbSecondCategory!: PbSecondCategory[];

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle =
    'メイン商品ブック編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 詳細画面へのパス
  detailPath!: string;

  // APIから取得した更新前の基本情報を保持
  beforeUpdateData!: MainProductBook;

  mpb: MainProductBook = {
    id: 0,
    product_book_second_category_id: 0,
    product_id: 0,
    product_name: '',
    store_id: 0,
    name: '',
    furi: '',
    gyo: 0,
    size_name: '',
    barcode: '',
    created_at: '',
    created_id: 0,
    employee_updated_last_name: '',
    employee_updated_first_name: '',
  };

  // リアクティブフォームとバリデーションの設定
  mpbEditForm = this.formBuilder.group({
    product_book_second_category_id: [
      this.mpb.product_book_second_category_id,
      [Validators.required],
    ],
    product_id: [this.mpb.product_id, [Validators.required]],
    product_name: [this.mpb.product_name, ''],
    store_id: [this.mpb.store_id, [Validators.required]],
    name: [this.mpb.name, [Validators.required, Validators.maxLength(20)]],
    furi: [this.mpb.furi, [Validators.maxLength(20)]],
    gyo: [
      this.mpb.gyo,
      [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    size_name: [this.mpb.size_name, [Validators.maxLength(10)]],
    barcode: [
      this.mpb.barcode,
      [Validators.maxLength(14), Validators.pattern(regExConst.NUMERIC_REG_EX)],
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
            this.router.navigateByUrl('/setting/main-product-book');
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
    this.detailPath = '/setting/main-product-book/detail/' + this.selectedId;

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
      this.mpbEditForm.valueChanges.subscribe((res) => {
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
        this.pbMainService.find(this.selectedId),
        this.pbSecondCategoryService.getAll(),
        this.storeService.getAll(),
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

          if (Array.isArray(res) && res.length === 3) {
            // 取得したデータをチェック
            const mpbResInvalid = ApiResponseIsInvalid(res[0]);
            const scResInvalid = ApiResponseIsInvalid(res[1]);
            const storeResInvalid = ApiResponseIsInvalid(res[2]);

            if (mpbResInvalid || scResInvalid || storeResInvalid) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

            const scs = res[1].data;
            scs.map((v) => {
              const obj = { value: v.id, text: v.name };
              this.scOptions.push(obj);
            });
            this.pbSecondCategory = res[1].data;

            const stores = res[2].data;
            stores.map((v) => {
              const obj = { value: v.id, text: v.name };
              this.storeOptions.push(obj);
            });

            // メンバへ取得したデータを代入
            this.mpb = res[0].data[0];
            this.beforeUpdateData = res[0].data[0];
            // フォーム更新
            this.mpbEditForm.patchValue(this.mpb);
          } else {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
        })
    );
    this.subscribeFormChanges();
  }

  /**
   * フォームの変更に応じて行う処理を設定する。
   */
  private subscribeFormChanges() {
    // 商品idの変更に応じた処理
    this.subscription.add(
      this.productService.observableProductId(
        this.mpbEditForm.controls.product_id,
        this.mpbEditForm.controls.product_name,
        this.common
      )
    );
  }

  /**
   * formで入力が取り消された場合に変更がない状態でサブミットさせないようにする
   *
   * @param formValues フォームの値
   * @returns void
   */
  checkFormDefaultValueChanged(formValues: any): void {
    const defaultValue = {
      product_book_second_category_id:
        this.beforeUpdateData.product_book_second_category_id,
      product_id: this.beforeUpdateData.product_id,
      store_id: this.beforeUpdateData.store_id,
      name: this.beforeUpdateData.name,
      furi: this.beforeUpdateData.furi,
      gyo: this.beforeUpdateData.gyo.toString(),
      size_name: this.beforeUpdateData.size_name,
      barcode: this.beforeUpdateData.barcode,
    };
    // オブジェクトの比較の為にjsonへ変更
    const v1 = JSON.stringify(formValues);
    const v2 = JSON.stringify(defaultValue);

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
    this.mpbEditForm.reset(this.beforeUpdateData);
    this.formInvalid = true;
  }

  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.formInvalid || !this.mpbEditForm.pristine) {
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
    const formVal = this.mpbEditForm.value;

    // 第2分類の値チェック
    const scIdExists = this.scOptions.some((sc) => {
      const scVal = Number(sc.value);
      const scId = Number(formVal.product_book_second_category_id);
      return scVal === scId;
    });
    if (!scIdExists) {
      this.mpbEditForm.controls.product_book_second_category_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }
    // 店舗の値チェック
    const storeIdExists = this.storeOptions.some((store) => {
      const storeVal = Number(store.value);
      const storeId = Number(formVal.store_id);
      return storeVal === storeId;
    });
    if (!storeIdExists) {
      this.mpbEditForm.controls.store_id.setValue(null);
      this.formInvalid = true;
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 商品の値チェックと登録処理
    this.productService
      .find(Number(formVal.product_id))
      .pipe(
        // productService.find(存在しないproduct_id) だとここに入る
        catchError((error: HttpErrorResponse) => {
          this.common.loading = false;
          this.mpbEditForm.controls.product_id.setValue(null);
          this.mpbEditForm.controls.product_name.setValue(null);
          this.formInvalid = true;
          return of(error);
        })
      )
      .subscribe((res) => {
        // エラーチェック
        if (res instanceof HttpErrorResponse) {
          this.handleError(res.status, res.error.message);
          return;
        }
        // find(product_id)が正常に返ってきたら後続処理実行

        // 第二分類IDを取得
        const selectedSecondCategoryId = this.pbSecondCategory.findIndex(
          (sc) => sc.id === Number(formVal.product_book_second_category_id)
        );
        if (selectedSecondCategoryId === -1) {
          this.formInvalid = true;
          // ローディング終了
          this.common.loading = false;
          return;
        }

        const mainProductBook = {
          product_book_second_category_id:
            formVal.product_book_second_category_id,
          product_id: formVal.product_id,
          store_id: formVal.store_id,
          name: this.pbSecondCategory[selectedSecondCategoryId].name,
          furi: this.pbSecondCategory[selectedSecondCategoryId].furi,
          gyo: formVal.gyo,
          size_name: formVal.size_name,
          barcode: formVal.barcode,
        };

        // 購読を格納
        this.subscription.add(
          // 更新処理
          this.pbMainService
            .update(this.selectedId, mainProductBook)
            .pipe(
              catchError((error: HttpErrorResponse) => {
                return of(error);
              }),
              finalize(() => {
                this.common.loading = false;
              })
            )
            .subscribe((res) => {
              if (res instanceof HttpErrorResponse) {
                this.handleError(res.status, res.error.message);
                return;
              }

              // フラッシュメッセージ作成
              const purpose: FlashMessagePurpose = 'success';
              this.flashMessageService.setFlashMessage(
                res.message,
                purpose,
                15000
              );
              // 詳細画面へ遷移
              this.router.navigateByUrl(this.detailPath);
            })
        );
      });
  }

  /**
   * 絞り込み用結果を取得
   * 得意先用
   * @returns
   */
  getSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.mpbEditForm.controls.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
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
      title: 'メイン商品ブック編集エラー：' + modalConst.TITLE.HAS_ERROR,
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
