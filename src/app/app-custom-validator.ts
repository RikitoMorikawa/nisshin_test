import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { from } from 'rxjs';
import { generalConst } from './const/general.const';

/**
 * カスタムバリデーション
 */
export class CustomValidators {
  /**
   * 相手側コントロールに入力がある場合、自身を必須とする
   * グループのvalidatorsで利用される事を想定してます
   * 単一のコントロールに設定した場合は常にnullを返します
   * @param opponentControlName 相手側コントロール名
   * @param ownControlName 必須にするコントロール名
   * @returns ValidatorFn (control: AbstractControl): ValidationErrors { isRequired: true } | null
   */
  static opponentEnteredRequireValidator(
    opponentControlName: string,
    ownControlName: string
  ): ValidatorFn {
    return (controls: AbstractControl): ValidationErrors | null => {
      const opponent = controls.get(opponentControlName);
      const own = controls.get(ownControlName);
      // 相手コントロールが取得できない場合は何もしない
      if (!opponent) {
        return null;
      }
      // 相手コントロールの入力がない場合は何もしない
      if (opponent.value === null) {
        return null;
      }
      // 自身のコントロールが取得できない場合は何もしない
      if (!own) {
        return null;
      }
      // 自身のコントロールの値がnullの場合は何もしない
      if (own.value === null) {
        return null;
      }
      // ここまでのnullチェックはform.reset対応
      // 自身のコントロールに入力がない場合はエラーを返さない
      if (opponent.value.length > 0) {
        return own.value.length > 0 ? null : { isRequired: true };
      } else {
        return null;
      }
    };
  }

  /**
   * コントロール同士の値を比較する
   * グループのvalidatorsで利用される事を想定してます
   * 単一のコントロールに設定した場合は常にnullを返します
   * @description
   * @param opponentControlName
   * @param ownControlName
   * @returns ValidatorFn null | { isPasswordSame: true }
   */
  static compareValidator(
    opponentControlName: string,
    ownControlName: string
  ): ValidatorFn {
    return (controls: AbstractControl): ValidationErrors | null => {
      const opponent = controls.get(opponentControlName);
      const own = controls.get(ownControlName);
      // 相手コントロールが取得できない場合は何もしない
      if (!opponent) {
        return null;
      }
      // 相手コントロールの入力がない場合は何もしない
      if (opponent.value === null) {
        return null;
      }
      // 自身のコントロールが取得できない場合は何もしない
      if (!own) {
        return null;
      }
      // 自身のコントロールの値がnullの場合は何もしない
      if (own.value === null) {
        return null;
      }
      // ここまでのnullチェックはform.reset対応
      // パスワード確認用に入力がない場合はエラーを返さない
      if (own.value.length > 0) {
        return opponent.value === own.value ? null : { isPasswordSame: true };
      } else {
        return null;
      }
    };
  }

  static valueChanged(
    typeName: string,
    comparison: string | number | undefined | null
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      console.log(typeof comparison);
      console.log(typeof control.value);
      console.log(comparison);
      console.log(control.value);

      let val: any;

      if (typeName === 'number') {
        val = Number(control.value);
      }

      console.log(typeof comparison);
      console.log(typeof val);
      console.log(comparison);
      console.log(val);

      if (val === comparison) {
        return { noChange: true };
      } else {
        return null;
      }
    };
  }
  /**
   * 相手側コントロールのvalue（選択項目を想定）が指定の値だった場合、自身を必須とする
   *
   * @param opponentControlName 相手側コントロール名
   * @param opponentTargetSelection 相手側コントロールが選択した値
   * @param ownControlName 必須にするコントロール名
   * @returns ValidatorFn (control: AbstractControl): ValidationErrors { isRequired: true } | null
   */
  static opponentSelectionRequiredValidator(
    opponentControlName: string,
    opponentTargetSelection: string,
    ownControlName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const opponent = control.get(opponentControlName);
      const own = control.get(ownControlName);
      // 相手コントロールが取得できない場合は何もしない
      if (!opponent) {
        return null;
      }
      // 相手コントロールの入力がない場合は何もしない
      if (opponent.value === null) {
        return null;
      }
      // 自身のコントロールが取得できない場合は何もしない
      if (!own) {
        return null;
      }
      // 自身のコントロールの値がnullの場合は何もしない
      if (own.value === null) {
        return null;
      }
      // ここまでのnullチェックはform.reset対応
      // 自身のコントロールに入力がない場合はエラーを返さない
      // APIから取得して来たときはNumber、フォーム更新時はStringで入ってくるのでキャストする
      if (String(opponent.value) === opponentTargetSelection) {
        return own.value.length > 0 ? null : { isRequired: true };
      } else {
        return null;
      }
    };
  }

  /**
   * 開始日 > 終了日 ならエラー
   */
  static beforeFromDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const from = control.get('from')?.value;
      const to = control.get('to')?.value;
      if (!from || !to) return null;
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // 時間をリセットして日付のみで比較
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      return fromDate > toDate ? { beforeFromDate: true } : null;
    };
  }

  /**
   * 開始日 >= 終了日 ならエラー（new Date(x)して比較）
   * 開始と終了のコントロール名を指定できるバージョン
   */
  static endingDateIsSmaller(from: string, to: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formVal = control.get(from)?.value;
      const toVal = control.get(to)?.value;
      if (formVal && toVal) {
        return new Date(formVal) >= new Date(toVal)
          ? { endingDateIsSmaller: true }
          : null;
      } else {
        return null;
      }
    };
  }

  /**
   * 開始日 > 終了日 ならエラー（new Date(x).toLocaleDateString()して比較）
   * 開始と終了のコントロール名を指定できるバージョン
   */
  static isStartDateGreaterThanOrEqualToEndDate(
    from: string,
    to: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formVal = control.get(from)?.value;
      const toVal = control.get(to)?.value;
      if (formVal && toVal) {
        const startDate = new Date(formVal);
        const endDate = new Date(toVal);
        // 時間をリセット
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        return startDate > endDate
          ? { isStartDateGreaterThanOrEqualToEndDate: true }
          : null;
      } else {
        return null;
      }
    };
  }

  /**
   * どちらか一方が必須のカスタムバリデータ関数
   *
   * @param firstRequiredControlName - 一方が必須であるべきフォームコントロール名1
   * @param secondRequiredControlName - 一方が必須であるべきフォームコントロール名2
   * @returns ValidatorFn - バリデーション関数
   */
  static eitherRequiredValidator(
    firstRequiredControlName: string,
    secondRequiredControlName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // コントロール取得
      const firstRequiredControl = control.parent?.get(
        firstRequiredControlName
      );
      const secondRequiredControl = control.parent?.get(
        secondRequiredControlName
      );

      // どちらか一方に値がある場合
      if (firstRequiredControl?.value || secondRequiredControl?.value) {
        // 一方に値がある場合でもう一方の値が空なら、空の方のコントロールのエラーを除外
        if (
          firstRequiredControl?.value.length > 0 &&
          secondRequiredControl?.value.length === 0
        ) {
          secondRequiredControl.setErrors(null);
        } else if (
          firstRequiredControl?.value === 0 &&
          secondRequiredControl?.value.length > 0
        ) {
          firstRequiredControl.setErrors(null);
        }
        return null;
      } else {
        return { eitherRequired: true };
      }
    };
  }

  /**
   * どちらか一方が必須のカスタムバリデータ関数
   *
   * @param firstRequiredControlName - 一方が必須であるべきフォームコントロール名1
   * @param secondRequiredControlName - 一方が必須であるべきフォームコントロール名2
   * @returns ValidatorFn - バリデーション関数
   */
  static eitherIsRequiredValidator(
    firstRequiredControlName: string,
    secondRequiredControlName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // コントロール取得
      const firstRequiredControl = control.get(firstRequiredControlName);
      const secondRequiredControl = control.get(secondRequiredControlName);

      // どちらか一方に値がある場合
      if (firstRequiredControl?.value || secondRequiredControl?.value) {
        // 一方に値がある場合でもう一方の値が空なら、空の方のコントロールのエラーを除外
        if (
          firstRequiredControl?.value.length > 0 &&
          secondRequiredControl?.value.length === 0
        ) {
          secondRequiredControl.setErrors(null);
        } else if (
          firstRequiredControl?.value === 0 &&
          secondRequiredControl?.value.length > 0
        ) {
          firstRequiredControl.setErrors(null);
        }
        return null;
      } else {
        return { eitherRequired: true };
      }
    };
  }
}
