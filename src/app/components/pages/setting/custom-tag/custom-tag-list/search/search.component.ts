import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { errorConst } from 'src/app/const/error.const';

/**
 * カスタムバリデーター
 */
const myValidators = {
  afterToday: () => {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.get('from')?.value;
      const today = new Date();
      const target = new Date(value);
      return target > today ? { afterToday: true } : null;
    };
  },
  beforeFromDate: () => {
    return (control: AbstractControl): ValidationErrors | null => {
      const from = control.get('from')?.value;
      const to = control.get('to')?.value;
      return from && new Date(from) > new Date(to)
        ? { beforeFromDate: true }
        : null;
    };
  },
};

/**
 * 検索フォームコンポーネント
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  // 各種パラメータ
  @Output() event = new EventEmitter();

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // フォーム関連
  form = this.fb.group({
    name: '',
    value: '',
    created_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [myValidators.afterToday(), myValidators.beforeFromDate()],
      }
    ),
    update_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [myValidators.afterToday(), myValidators.beforeFromDate()],
      }
    ),
  });
  get ctrls() {
    return this.form.controls;
  }
  get created_at() {
    return this.ctrls.created_at.controls;
  }
  get update_at() {
    return this.ctrls.update_at.controls;
  }

  // 各種定数（テンプレートからの参照用）
  errorConst = errorConst;

  /**
   * コンストラクタ
   */
  constructor(private fb: FormBuilder) {}

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
  onClickReset() {
    this.form.reset();
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    const flatted = this.flattingFormValue(this.form.value);
    this.event.emit(this.removeNullsAndBlanks(flatted));
  }

  /**
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 絞り込み用フォームにて、グループとして定義された`created_at`と`updated_at`を展開して、
   * 親コンポーネントへの返却用オブジェクトへ変換する処理。
   * @param formValue フォームに設定された値のオブジェクト。
   * @returns 親コンポーネントへの返却用オブジェクト。
   */
  flattingFormValue(formValue: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(formValue)) {
      if (
        value !== null &&
        !(value instanceof Date) &&
        typeof value === 'object'
      ) {
        for (const [cKey, cValue] of Object.entries(
          this.flattingFormValue(value)
        )) {
          ret[`${cKey}_${key}`] =
            cValue instanceof Date ? cValue.toLocaleDateString() : cValue;
        }
        continue;
      }
      ret[key] = value;
    }
    return ret as object;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
  }
}
