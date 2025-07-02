import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Subscription,
  catchError,
  distinctUntilChanged,
  filter,
  forkJoin,
  of,
} from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import { StockTransferService } from 'src/app/services/stock-transfer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { regExConst } from 'src/app/const/regex.const';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { StoreService } from 'src/app/services/store.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

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
    private stockTransferService: StockTransferService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
    private storeService: StoreService,
    private productService: ProductService,
    public common: CommonService
  ) {}

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // ログイン中ユーザーを保持
  author!: Employee;

  // 一覧のパス
  listPagePath = '/inventory-control/stock-transfer';

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '在庫移動キャンセル：' + modalConst.TITLE.CANCEL;

  // 店舗選択肢
  fromStoreOptions!: SelectOption[];
  toStoreOptions!: SelectOption[];
  allStoreOptions!: SelectOption[];

  // エラー定数
  errorConst = errorConst;

  // リアクティブフォームとバリデーションの設定
  addForm = this.formBuilder.group({
    from_store_id: ['', Validators.required],
    to_store_id: [''],
    product_id: ['', Validators.required],
    product_name: ['', Validators.required],
    quantity: ['', Validators.required],
    remarks: ['', Validators.maxLength(255)],
    stock_transfer_date: ['', Validators.required],
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
            this.router.navigateByUrl(this.listPagePath);
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

    // 選択肢初期化処理
    this.initOptions();
    // from_store_idの値が変わるたびにtoStoreOptionsを更新
    this.addForm.controls.from_store_id.valueChanges.subscribe(
      (fromId: string | null) => {
        this.updateToStoreOptions(fromId);
        // to_store_idが同じ値ならリセット
        if (this.addForm.controls.to_store_id.value === fromId) {
          this.addForm.controls.to_store_id.setValue('');
        }
      }
    );
  }

  /**
   * 選択肢の初期化処理
   */
  initOptions() {
    this.common.loading = true;

    this.subscription.add(
      forkJoin([this.storeService.getAsSelectOptions()])
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.common.loading = false;
            return of(error);
          })
        )
        .subscribe((res: any) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました。';
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }

          // 取得した店舗選択肢をセット
          const storeOptions = res[0];
          this.fromStoreOptions = [
            { value: '', text: '選択してください' },
            ...storeOptions,
          ];
          this.allStoreOptions = [{ value: '', text: '' }, ...storeOptions];
          this.toStoreOptions = this.allStoreOptions;

          // 初期化時もnull対応
          this.updateToStoreOptions(this.addForm.controls.from_store_id.value);

          // ローディング終了
          this.common.loading = false;
        })
    );
  }

  updateToStoreOptions(fromId: string | null) {
    const storeOptions = this.allStoreOptions.filter(
      (opt: any) => opt.value != fromId
    );
    this.toStoreOptions = storeOptions;
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
   * キャンセルリンククリック時の処理
   * @returns void
   */
  handleClickCancel() {
    // 編集中の場合はモーダルを表示
    if (!this.addForm.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.listPagePath);
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
    // const formVal = this.addForm.value;
    const formVal = { ...this.addForm.value };

    // stock_transfer_dateをYYYY-MM-DD形式に変換
    if (formVal.stock_transfer_date) {
      // 文字列でなければDate型として変換
      const dateObj =
        typeof formVal.stock_transfer_date === 'string'
          ? new Date(formVal.stock_transfer_date)
          : formVal.stock_transfer_date;
      // date-fnsを使う場合
      formVal.stock_transfer_date = new Date(
        String(formVal.stock_transfer_date)
      ).toLocaleDateString();
      // date-fnsが無い場合は↓
      // formVal.stock_transfer_date = dateObj.toISOString().slice(0, 10);
    }

    // to_store_idが空なら項目ごと削除
    if (!formVal.to_store_id) {
      delete formVal.to_store_id;
    }

    // 購読を格納
    this.subscription.add(
      // 更新処理
      this.stockTransferService
        .add(formVal)
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
            //this.handleError(res.status, res.error.message);
            return;
          }

          // フラッシュメッセージ作成
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          // 詳細画面へ遷移
          this.router.navigateByUrl(this.listPagePath);
        })
    );
  }

  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProductSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.addForm.controls.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * サジェストで選択した商品の値をフォームへセット
   * @param product
   */
  handleSelectedProductData(product: Product) {
    if (!product) {
      return;
    }
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath: string
  ) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '在庫移動エラー：' + title + ' ' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
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
