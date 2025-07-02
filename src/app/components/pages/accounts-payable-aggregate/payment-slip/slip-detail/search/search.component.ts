import {
  Component,
  EventEmitter,
  OnDestroy,
  Input,
  Output,
} from '@angular/core';
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
  selector: 'app-slipdetail-search',
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
  @Output() event = new EventEmitter();

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
    barcode: '',
    product_id: '',
    product_name: '',
  });
  // フォームコントロールのゲッター
  get ctrls() {
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
        name: this.ctrls.product_name.value,
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
    this.searchForm.reset();
    this.searchForm = this.setSearchClear();
  }

  /**
   * 絞り込みイベントを親コンポーネントへ送信
   */
  handleClickSearchSubmitButton() {
    // フォームの値をフラットにする
    const flatted = flattingFormValue(
      removeNullsAndBlanks(this.searchForm.value)
    );
    // 絞り込みイベントを親コンポーネントへ送信
    this.event.emit(flatted);
  }

  /**
   * コンポーネント破棄時の処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 検索条件初期化
   */
  setSearchClear() {
    return this.fb.group({
      barcode: '',
      product_id: '',
      product_name: '',
    });
  }
}
