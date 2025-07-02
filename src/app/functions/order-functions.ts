import { AbstractControl, ValidationErrors } from '@angular/forms';
import { SelectOption } from '../components/atoms/select/select.component';

export module OrderFn {
  /**
   * 仕入先関連で使用されるすべての選択肢項目のインターフェイス
   */
  export interface Options {
    order_rep: SelectOption[]; // 都道府県
    receiving_rep: SelectOption[]; // 支払区分
    cancel_rep: SelectOption[]; // 締日
    product: SelectOption[]; // 締日
  }

  /**
   * select コンポーネントに渡す選択肢の初期化処理。
   * APIから取得したデータの設定の他、都道府県や締日、支払日などの項目の生成も行う。
   * @param employeeOptions 社員APIから取得した`SelectOption`の一覧
   * @param defaultOption 初期値として先頭に設定される`SelectOption`
   * @returns 値がセットされた`Options`オブジェクト。
   */
  export function initOptions(
    employeeOptions: SelectOption[],
    defaultOption?: SelectOption
  ) {
    const options = {} as Options;

    // APIからの取得項目
    options.order_rep = employeeOptions;
    options.receiving_rep = employeeOptions;
    options.cancel_rep = employeeOptions;

    return options;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  export function removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
  }

  /**
   * 絞り込み用フォームにて、グループとして定義された`created_at`と`updated_at`を展開して、
   * 親コンポーネントへの返却用オブジェクトへ変換する処理。
   * @param formValue フォームに設定された値のオブジェクト。
   * @returns 親コンポーネントへの返却用オブジェクト。
   */
  export function flattingFormValue(formValue: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(formValue)) {
      if (
        value !== null &&
        !(value instanceof Date) &&
        typeof value === 'object'
      ) {
        for (const [cKey, cValue] of Object.entries(flattingFormValue(value))) {
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
   * カスタムバリデーションのオブジェクト。
   */
  export const customValids = {
    /**
     * 開始日 > 本日 ならエラー
     */
    afterToday: () => {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.get('from')?.value;
        const today = new Date();
        const target = new Date(value);
        return target > today ? { afterToday: true } : null;
      };
    },

    /**
     * 開始日 > 終了日 ならエラー
     */
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
}
