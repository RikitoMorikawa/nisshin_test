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
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { removeNullsAndBlanks } from 'src/app/functions/shared-functions';
import { flattingFormValue } from 'src/app/functions/shared-functions';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-inventory-group-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param fb
   * @param storeService
   */
  constructor(private fb: FormBuilder, private storeService: StoreService) {}

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
    store_id: '',
    inventory_execution_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
    inventory_complete_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  // フォームコントロールのゲッター
  get sfc() {
    return this.searchForm.controls;
  }

  // 店舗選択肢
  storeOptions!: SelectOption[];

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
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

  /**
   * 店舗選択肢取得
   */
  getStoreOptions() {
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
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました。';
            this.handleError(res.status, title, message);
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
   * 絞り込みパネル開閉ボタンのクリックイベント
   */
  handleClickSearchPaneToggleButton() {
    if (this.hasSearchPanelOpened) {
      this.hasSearchPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
      this.searchForm.reset({
        store_id: '',
        inventory_execution_date: { from: '', to: '' },
        inventory_complete_date: { from: '', to: '' },
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
      store_id: '',
      inventory_execution_date: { from: '', to: '' },
      inventory_complete_date: { from: '', to: '' },
    });
  }

  /**
   * 絞り込みイベントを親コンポーネントへ送信
   */
  handleClickSearchSubmitButton() {
    // フォームの値取得
    const formValue = this.searchForm.value;
    const searchFormValue = {
      store_id: formValue.store_id,
      inventory_execution_date: formValue.inventory_execution_date,
      inventory_complete_date: formValue.inventory_complete_date,
    };
    // フォームの値をフラットにする
    const flatFormValue = flattingFormValue(searchFormValue);
    // 絞り込みイベントを親コンポーネントへ送信
    this.searchEvent.emit(removeNullsAndBlanks(flatFormValue));
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleError(
    status: number,
    title: string,
    message: string,
    redirectPath?: string
  ) {
    this.errorEvent.emit({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath ? redirectPath : undefined,
    });
  }

  /**
   * コンポーネント破棄時の処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
