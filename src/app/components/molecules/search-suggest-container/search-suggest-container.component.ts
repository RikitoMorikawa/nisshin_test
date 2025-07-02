import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectOption } from '../../atoms/select/select.component';
import { Observable, Subject, Subscription, catchError, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelSize } from '../../atoms/label/label.component';

export interface ApiResponse<T> {
  message: string;
  totalItems: number;
  data: T[];
}

export interface ApiInput<T> {
  observable: Observable<T>;
  valueTargetColumn: string;
  textTargetColumn: string;
  textAttachColumn?: string;
}

@Component({
  selector: 'app-search-suggest-container',
  templateUrl: './search-suggest-container.component.html',
  styleUrls: ['./search-suggest-container.component.scss'],
})
export class SearchSuggestContainerComponent<T extends Record<string, any>>
  implements OnInit, OnDestroy
{
  constructor() {}

  // 購読管理用プロパティ
  private subscription = new Subscription();

  // フォームコントロールで受け取る項目
  // フォームコントロール
  @Input() fc!: FormControl;
  // 選択肢を選択した際にフォームコントロールにセットするオプションのプロパティ名を指定
  // valueはvalueTargetColumnで指定した列のデータで、textはtextTargetColumnで指定した列のデータ
  @Input() targetOptionData!: 'value' | 'text';
  // name属性値
  @Input() nameAttrValue?: string;
  // id属性値
  @Input() idAttrValue?: string;
  // label属性値
  @Input() labelSize?: LabelSize;
  // invalid属性値 trueの場合は入力不可
  @Input() invalid = false;

  @Input() buttonDisabled = true;

  // APIレスポンス受け取り用
  @Input() apiInput!: ApiInput<any>;

  // idの変更を外部に送信するためのSubject
  @Output() idValueChanges = new Subject<string>();

  // 選択されたデータを外部に送信するためのEventEmitter
  @Output() selectedData = new EventEmitter<T>();

  // 絞り込まれた選択肢を入れる
  filteredOptions: SelectOption[] = [];

  // オリジナルのデータを保持
  originalDataMap = new Map<string, T>();

  // 選択肢取得中ローディング
  isSearchLoading = false;

  // フォームコントロールの入力値を保持
  inputValue!: string;

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    this.subscription.add(
      this.fc.valueChanges.subscribe((value) => {
        console.log(value);
        this.inputValue = value;
      })
    );
  }

  /**
   * 検索ボタンクリック時の処理
   */
  onSearchButtonClick() {
    console.log(this.inputValue);
    this.subscription.add(this.getOptions(this.inputValue).subscribe());
  }

  /**
   * 選択肢取得処理
   * @param value
   * @returns
   */
  private getOptions(value: string | null): Observable<any> {
    if (value === null || value === '' || value === undefined) {
      this.fc.reset('', { emitEvent: false });
      this.filteredOptions = [];
      this.isSearchLoading = false;
      this.idValueChanges.next('');
      //this.selectedData.emit(undefined);
      return of(null);
    }
    this.isSearchLoading = true;
    this.filteredOptions = [];
    this.originalDataMap.clear();
    return this.apiInput.observable.pipe(
      tap(() => (this.isSearchLoading = true)),
      tap((res: ApiResponse<T>) => {
        this.isSearchLoading = false;
        console.log(res);
        if (res.totalItems > 0) {
          this.filteredOptions = res.data.map((x: T) => {
            // 選択肢に表示するデータ
            const value = x[this.apiInput.valueTargetColumn];
            let text = x[this.apiInput.textTargetColumn];
            if (this.apiInput.textAttachColumn) {
              text += ` ${x[this.apiInput.textAttachColumn]}`;
            }

            // オリジナルのデータをMapに保存
            this.originalDataMap.set(String(value), x);

            return { value, text };
          });
        } else {
          alert('該当するデータがありません');
          this.fc.reset('', { emitEvent: false });
          this.filteredOptions = [];
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.fc.reset('', { emitEvent: false });
        this.filteredOptions = [];
        this.isSearchLoading = false;
        return of(error);
      })
    );
  }

  /**
   * 入力コントロールからフォーカスが外れた時の処理
   * 選択肢クリック時にフォーカスが外れて選択肢が消えて選択できなくなってしまうのを防ぐため
   * 200ms後に選択肢をクリアする
   */
  searchInputOnBlur() {
    setTimeout(() => {
      this.filteredOptions = [];
    }, 200);
  }

  /**
   * 選択肢クリック時の処理
   * @param option
   */
  updateSelectedOption(option: SelectOption): void {
    // 選択されたデータをフォームコントロールにセット
    this.fc.patchValue(option[this.targetOptionData], { emitEvent: false });

    // idの変更を外部に送信
    this.idValueChanges.next(String(option.value));

    // 選択されたデータを外部に送信
    const originalData = this.originalDataMap.get(String(option.value));
    if (originalData) {
      this.selectedData.emit(originalData);
    }

    // 選択肢をクリア
    this.filteredOptions = [];
    // オリジナルのデータをクリア
    this.originalDataMap.clear();
  }

  /**
   * 破棄処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
