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
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelSize } from '../../atoms/label/label.component';

export interface ApiResponse<T> {
  message: string;
  totalItems: number;
  data: T[];
}

export interface ApiInput<T> {
  observable: Observable<T>;
  idField: string;
  nameField: string;
  otherField?: string;
}

@Component({
  selector: 'app-real-time-suggest-container',
  templateUrl: './real-time-suggest-container.component.html',
  styleUrls: ['./real-time-suggest-container.component.scss'],
})
export class RealTimeSuggestContainerComponent<T extends Record<string, any>>
  implements OnInit, OnDestroy
{
  constructor() {}

  private subscription = new Subscription();

  @Input() idCtrl!: FormControl;
  @Input() nameCtrl!: FormControl;
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() labelSize!: LabelSize;
  @Input() invalid = false;

  @Input() apiInput!: ApiInput<any>;

  @Output() idValueChanges = new Subject<string>();
  @Output() selectedData = new EventEmitter<T>();

  filteredOptions: SelectOption[] = [];
  originalDataMap = new Map<string, T>();
  isSearchLoading = false;

  ngOnInit(): void {
    this.subscription.add(
      this.nameCtrl.valueChanges
        .pipe(
          debounceTime(500),
          startWith(this.nameCtrl.value), // 初期値を使用
          distinctUntilChanged(),
          switchMap((value) => this.getSelectOptions(value))
        )
        .subscribe()
    );

    // 初期値が設定されている場合、選択肢を取得して表示を更新
    if (this.idCtrl.value && this.nameCtrl.value) {
      this.getSelectOptions(this.nameCtrl.value).subscribe();
    }
  }

  getSelectOptions(value: string | null): Observable<any> {
    if (value === null || value === '' || value === undefined) {
      this.idCtrl.reset('', { emitEvent: false });
      this.nameCtrl.reset('', { emitEvent: false });
      this.filteredOptions = [];
      this.isSearchLoading = false;
      this.idValueChanges.next('');
      return of(null);
    }
    this.isSearchLoading = true;
    this.filteredOptions = [];
    this.originalDataMap.clear();
    return this.apiInput.observable.pipe(
      tap(() => (this.isSearchLoading = true)),
      map((res: ApiResponse<T>) => {
        if (res.totalItems > 0) {
          this.filteredOptions = res.data.map((x: T) => {
            const value = x[this.apiInput.idField];
            let text = x[this.apiInput.nameField];
            if (this.apiInput.otherField) {
              text += ` ${x[this.apiInput.otherField]}`;
            }

            this.originalDataMap.set(String(value), x);

            return { value, text };
          });

          // 初期値が設定されている場合、表示を更新
          const selectedOption = this.filteredOptions.find(
            (option) => option.value === this.idCtrl.value
          );
          if (selectedOption) {
            this.updateSelectedOption(selectedOption);
          }
        } else {
          alert('該当するデータがありません');
          this.idCtrl.reset('', { emitEvent: false });
          this.nameCtrl.reset('', { emitEvent: false });
          this.filteredOptions = [];
        }
        return of(null);
      }),
      tap(() => (this.isSearchLoading = false)),
      catchError((error: HttpErrorResponse) => {
        this.idCtrl.reset('', { emitEvent: false });
        this.nameCtrl.reset('', { emitEvent: false });
        this.filteredOptions = [];
        this.isSearchLoading = false;
        return of(error);
      })
    );
  }

  searchInputOnBlur() {
    setTimeout(() => {
      this.filteredOptions = [];
    }, 200);
  }

  updateSelectedOption(option: SelectOption): void {
    this.idCtrl.patchValue(option.value, { emitEvent: false });
    this.nameCtrl.patchValue(option.text, { emitEvent: false });

    this.idValueChanges.next(String(option.value));

    const originalData = this.originalDataMap.get(String(option.value));
    if (originalData) {
      this.selectedData.emit(originalData);
    }

    this.filteredOptions = [];
    this.originalDataMap.clear();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
