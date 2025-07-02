import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { errorConst } from 'src/app/const/error.const';
import { removeNullsAndBlanks } from 'src/app/functions/shared-functions';
import { flattingFormValue } from 'src/app/functions/shared-functions';
import { ProductApiResponse } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-stock-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private storeService: StoreService
  ) {}

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<HttpErrorResponse>();

  // 購読を管理
  private subscription = new Subscription();

  // 絞り込みパネル開閉フラグ
  hasSearchPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // 絞り込まれた在庫を入れる
  filteredOptions: SelectOption[] = [];

  // 店舗選択肢
  storeOptions!: SelectOption[];

  // エラー用定数
  errorConst = errorConst;

  // 絞り込みフォーム
  searchForm = this.fb.group({
    id: '',
    product_id: '',
    product_name: '',
    store_id: '',
    store_name: '',
    created_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
  });

  get sfc() {
    return this.searchForm.controls;
  }

  ngOnInit(): void {
    // 店舗選択肢取得
    this.getStoreOptions();
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

  getProductSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.sfc.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 店舗選択肢取得
   */
  private getStoreOptions() {
    this.subscription.add(
      this.storeService
        .getAll()
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res);
            return;
          }
          const defaultValue = [{ value: '', text: '選択してください' }];
          const storeOptions = res.data.map((store) => {
            return { value: store.id, text: store.name };
          });
          this.storeOptions = [...defaultValue, ...storeOptions];
        })
    );
  }

  /**
   * 絞り込みパネル開閉ボタンクリック時の処理
   * @returns void
   */
  handleClickSearchPaneToggleButton() {
    if (this.hasSearchPanelOpened) {
      this.hasSearchPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
      this.searchForm.reset({
        id: '',
        product_id: '',
        product_name: '',
        store_id: '',
        store_name: '',
        created_at: { from: '', to: '' },
      });
    } else {
      this.hasSearchPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 入力内容クリアボタンクリック時の処理
   */
  handleClickSearchClearButton() {
    Object.values(this.sfc).forEach((x) => x.patchValue(''));
    this.searchForm.reset({ created_at: { from: '', to: '' } });
  }

  /**
   * 絞り込み実行ボタンクリック時の処理
   */
  handleClickSearchSubmitButton() {
    // フォームの値取得
    const formValue = this.searchForm.value;
    // supplier_nameを削除
    const searchVal = {
      id: formValue.id,
      product_id: formValue.product_id,
      store_id: formValue.store_id,
      created_at: formValue.created_at,
    };
    // 日付の値をフラットにする
    const flatted = flattingFormValue(searchVal);
    // 親コンポーネントへ送信
    this.searchEvent.emit(removeNullsAndBlanks(flatted));
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleError(error: HttpErrorResponse) {
    this.errorEvent.emit(error);
  }
}
