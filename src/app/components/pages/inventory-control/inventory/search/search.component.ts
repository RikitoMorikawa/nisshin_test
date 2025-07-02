import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { errorConst } from 'src/app/const/error.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { ProductApiResponse } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-inventory-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnDestroy {
  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  // 購読管理
  private subscription = new Subscription();

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }>();

  // エラー定数
  errorConst = errorConst;

  // 絞り込みパネルの開閉フラグ
  hasSearchPanelOpened = false;

  // 絞り込みパネルの開閉ボタンの回転アニメーション
  rotateAnimation = '';

  // 絞り込みフォーム
  searchForm = this.fb.group({
    product_id: '',
    product_name: '',
    updated_at: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  // フォームコントロールのゲッター
  get sfc() {
    return this.searchForm.controls;
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
   * 商品名サジェストの入力値を取得
   * @returns
   */
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
   * 絞り込みパネル開閉ボタンのクリックイベント
   */
  handleClickSearchPaneToggleButton() {
    if (this.hasSearchPanelOpened) {
      this.hasSearchPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
      this.searchForm.reset({
        product_id: '',
        updated_at: { from: '', to: '' },
      });
    } else {
      this.hasSearchPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 入力内容をクリア
   */
  handleClickSearchClearButton() {
    this.searchForm.reset({
      product_id: '',
      updated_at: { from: '', to: '' },
    });
  }

  /**
   * 絞り込みイベントを親コンポーネントへ送信
   */
  handleClickSearchSubmitButton() {
    // フォームの値取得
    const formValue = this.searchForm.value;
    const searchFormValue = {
      product_id: formValue.product_id,
      updated_at: formValue.updated_at,
    };
    // フォームの値をフラットにする
    const flatFormValue = flattingFormValue(searchFormValue);
    // 絞り込みイベントを親コンポーネントへ送信
    this.searchEvent.emit(removeNullsAndBlanks(flatFormValue));
  }

  /**
   * コンポーネント破棄時の処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
