import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
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
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { ProductApiResponse } from 'src/app/models/product';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private router: Router,
    private pbMainService: PbMainService,
    private pbSecondCategoryService: PbSecondCategoryService,
    private storeService: StoreService,
    private productService: ProductService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
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

  // ログイン中ユーザーを保持
  author!: Employee;

  // 第2分類の選択肢
  scOptions: SelectOption[] = [];
  // 店舗の選択肢
  storeOptions: SelectOption[] = [];

  // 第2分類
  pbSecondCategory!: PbSecondCategory[];

  // キャンセル時のモーダルのタイトル
  cancelModalTitle =
    'メイン商品ブック新規登録キャンセル：' + modalConst.TITLE.CANCEL;

  // 一覧画面へのパス
  listPath = '/setting/main-product-book';

  // リアクティブフォームとバリデーションの設定
  mpbAddForm = this.formBuilder.group({
    product_book_second_category_id: ['', [Validators.required]],
    product_id: ['', [Validators.required]],
    product_name: '',
    store_id: ['', [Validators.required]],
    gyo: [
      '',
      [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
    ],
    size_name: ['', [Validators.maxLength(10)]],
    barcode: [
      '',
      [Validators.maxLength(14), Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
  });

  ngOnInit(): void {
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
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPath);
          }
        })
    );

    // ログイン中ユーザー取得
    if (this.authorService.author) {
      // サービスが保持していれば取得
      this.author = this.authorService.author;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーストリームを購読
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }

    this.getOptions();
  }

  getOptions() {
    // ローディング開始
    this.common.loading = true;
    this.subscription.add(
      forkJoin([
        this.pbSecondCategoryService.getAll(),
        this.storeService.getAll(),
        this.productService.getAll({ limit: 100 }),
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
            const scResInvalid = ApiResponseIsInvalid(res[0]);
            const storeResInvalid = ApiResponseIsInvalid(res[1]);

            if (scResInvalid || storeResInvalid) {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
              return;
            }

            const scs = res[0].data;
            scs.map((v) => {
              const obj = { value: v.id, text: v.name };
              this.scOptions.push(obj);
            });
            this.pbSecondCategory = res[0].data;

            const stores = res[1].data;
            stores.map((v) => {
              const obj = { value: v.id, text: v.name };
              this.storeOptions.push(obj);
            });
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
        this.mpbAddForm.controls.product_id,
        this.mpbAddForm.controls.product_name,
        this.common
      )
    );
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
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }
  /**
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (this.mpbAddForm.status === 'VALID') {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.listPath);
    }
  }

  /**
   * 送信ボタンクリック時の処理
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.mpbAddForm.markAsPristine();
    // ローディング開始
    this.common.loading = true;
    // フォームの値を取得
    const formVal = this.mpbAddForm.value;

    // 第2分類の値チェック
    const scIdExists = this.scOptions.some((sc) => {
      const scVal = Number(sc.value);
      const scId = Number(formVal.product_book_second_category_id);
      return scVal === scId;
    });
    if (!scIdExists) {
      this.mpbAddForm.controls.product_book_second_category_id.setValue(null);
      this.mpbAddForm.markAsPristine();
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
      this.mpbAddForm.controls.store_id.setValue(null);
      this.mpbAddForm.markAsPristine();
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
          this.mpbAddForm.controls.product_id.setValue(null);
          this.mpbAddForm.controls.product_name.setValue(null);
          this.mpbAddForm.markAsPristine();
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
          this.mpbAddForm.markAsPristine();
          return;
        }
        // APIに渡す値を格納
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

        // 登録処理
        this.subscription.add(
          this.pbMainService
            .add(mainProductBook)
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
              // 一覧画面へ遷移
              this.router.navigateByUrl(this.listPath);
            })
        );
      });
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
      title: 'メイン商品ブック登録エラー：' + modalConst.TITLE.HAS_ERROR,
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

  /**
   * 絞り込み用結果を取得
   * 得意先用
   * @returns
   */
  getSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.mpbAddForm.controls.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
}
