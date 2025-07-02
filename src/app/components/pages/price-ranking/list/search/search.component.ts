import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { ProductApiResponse } from 'src/app/models/product';
import { DivisionService } from 'src/app/services/division.service';
import { ProductService } from 'src/app/services/product.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  constructor(
    private divisionService: DivisionService,
    private storeService: StoreService,
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  // 購読管理
  private subscription = new Subscription();

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  priceRankingDivisionOptions!: SelectOption[];

  storeOptions!: SelectOption[];

  errorConst = errorConst;

  // フォーム関連
  searchForm = this.fb.group({
    product_id: '',
    product_name: '',
    store_id: '',
    rank_division_id: '',
    created_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    update_at: this.fb.group(
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
    this.initOptions();
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

  private initOptions() {
    // ランク価格区分の選択肢を取得
    // 店舗の選択肢を取得

    this.subscription.add(
      forkJoin([
        this.divisionService.getAsSelectOptions({
          name: divisionConst.PRICE_RANKING,
        }),
        this.storeService.getAsSelectOptions(),
      ])
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            return;
          }
          const priceRankingDivisionOptions =
            res[0][divisionConst.PRICE_RANKING];
          this.priceRankingDivisionOptions = [
            { value: '', text: '選択してください' },
            ...priceRankingDivisionOptions,
          ];
          const storeOptions = res[1];
          this.storeOptions = [
            { value: '', text: '選択してください' },
            ...storeOptions,
          ];
        })
    );
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

  // 絞り込みパネル開閉処理メソッド
  toggleSearchPanel() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  handleClickSearchClearButton() {
    this.searchForm.reset({
      product_id: '',
      product_name: '',
      store_id: '',
      rank_division_id: '',
      created_at: { from: '', to: '' },
      update_at: { from: '', to: '' },
    });
  }

  handleClickSearchSubmitButton() {
    // フォームの値取得
    const formValue = this.searchForm.value;
    // supplier_nameを削除
    const searchVal = {
      product_id: formValue.product_id,
      store_id: formValue.store_id,
      rank_division_id: formValue.rank_division_id,
      created_at: formValue.created_at,
      updated_at: formValue.update_at,
    };
    // 日付の値をフラットにする
    const flatted = flattingFormValue(searchVal);
    // 親コンポーネントへ
    this.searchEvent.emit(removeNullsAndBlanks(flatted));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
