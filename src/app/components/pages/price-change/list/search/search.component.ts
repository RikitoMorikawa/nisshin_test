import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { errorConst } from 'src/app/const/error.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { ProductApiResponse } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // 絞り込みパネル開閉フラグ
  hasSearchPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // 絞り込まれた条件を入れる
  filteredOptions: SelectOption[] = [];

  // ステータス選択肢
  statusDivisionOptions!: SelectOption[];

  // 選択肢取得中ローディング
  isSearchLoading = false;

  // エラー用定数
  errorConst = errorConst;

  // 絞り込みフォーム
  searchForm = this.fb.group({
    product_id: '',
    product_name: '',
    scheduled_price_change_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    price_change_completion_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
  });

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
   * 絞り込みパネル開閉ボタンクリック時の処理
   * @returns void
   */
  handleClickSearchPaneToggleButton() {
    if (this.hasSearchPanelOpened) {
      this.hasSearchPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
      this.searchForm.reset({
        product_id: '',
        product_name: '',
        scheduled_price_change_date: { from: '', to: '' },
        price_change_completion_date: { from: '', to: '' },
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
    this.searchForm.reset({
      product_id: '',
      product_name: '',
      scheduled_price_change_date: { from: '', to: '' },
      price_change_completion_date: { from: '', to: '' },
    });
  }

  /**
   * 絞り込み実行ボタンクリック時の処理
   */
  handleClickSearchSubmitButton() {
    // フォームの値取得
    const formValue = this.searchForm.value;
    // supplier_nameを削除
    const searchVal = {
      product_id: formValue.product_id,
      scheduled_price_change_date: formValue.scheduled_price_change_date,
      price_change_completion_date: formValue.price_change_completion_date,
    };
    // 日付の値をフラットにする
    const flatted = flattingFormValue(searchVal);
    // 親コンポーネントへ
    this.searchEvent.emit(removeNullsAndBlanks(flatted));
  }
}
