import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { ProductService } from 'src/app/services/product.service';
import { StockFn } from '../../../../functions/stock-functions';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { ProductApiResponse } from 'src/app/models/product';
import { StoreService } from 'src/app/services/store.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { CustomValidators } from 'src/app/app-custom-validator';

/**
 * 検索フォームコンポーネント
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private storeService: StoreService
  ) {}

  private subscription = new Subscription();

  isDuringAcquisition = false;

  @Output() event = new EventEmitter();
  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<HttpErrorResponse>();
  options = {} as StockFn.Options;

  storeOptions!: SelectOption[];

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // フォームグループ
  form = this.fb.group({
    name: '',
    product_id: '',
    product_name: '',
    store_id: '',
    created_at: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  get fc() {
    return this.form.controls;
  }

  // バリデーション用
  errorConst = errorConst;
  /**
   * 初期化処理
   */
  ngOnInit(): void {
    // 店舗選択肢を取得
    this.getStores();
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

  // 店舗一覧を取得
  getStores() {
    this.subscription.add(
      this.storeService
        .getAll()
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.isDuringAcquisition = false;
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

  getProductSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.fc.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * パネル開閉ボタンクリック時の処理
   */
  searchButtonOnClick() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  /**
   * 「絞り込みクリア」ボタンクリック時の処理
   */
  handleClickSearchClearButton() {
    this.form.reset();
    Object.values(this.fc).forEach((x) => x.patchValue('')); // SELECT がある階層は空文字で初期化
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  handleClickSearchSubmitButton() {
    const values = this.form.value;
    const flatted = StockFn.flattingFormValue(values);
    this.event.emit(StockFn.removeNullsAndBlanks(flatted));
    this.isOpen = false;
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleError(error: HttpErrorResponse) {
    this.errorEvent.emit(error);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
