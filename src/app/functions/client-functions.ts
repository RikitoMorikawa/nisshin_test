import { AbstractControl, ValidationErrors } from '@angular/forms';
import { provinces } from '../models/province';
import { SelectOption } from '../components/atoms/select/select.component';

export module ClientFunctions {
  /**
   * 得意先関連で仕様される選択項目のインターフェイス
   */
  export interface Options {
    provinceOptions: SelectOption[]; // 都道府県（区分の項目ではない）
    paymentDivisionOptions: SelectOption[]; // 得意先支払区分
    cutoffDateBillingOptions: SelectOption[]; // 締日区分
    scheduledPaymentDateOptions: SelectOption[]; // 支払予定日
    paymentTermOptions: SelectOption[]; // 支払いサイト
    salesFractionDivisionOptions: SelectOption[]; // 販売端数区分
    printDivisionOptions: SelectOption[]; // 得意先印刷区分
    salesTaxDivisionOptions: SelectOption[]; // 得意先消費税区分
    salesTaxCalcDivisionOptions: SelectOption[]; // 得意先消費税計算区分
    salesTaxFractionDivisionOptions: SelectOption[]; // 消費税端数区分
    titleDivisionOptions: SelectOption[]; // 得意先敬称区分
    priceRankingOptions: SelectOption[]; // ランク価格（区分の項目ではない）
  }

  /**
   * selectコンポーネントに渡す選択肢の初期化処理
   * APIから取得したデータの設定の他に、都道府県や締日、支払予定日などの項目の生成も行う
   * @param targetOptions 区分・ランクAPIから取得したSelectOptionの一覧
   * @param defaultOption 初期値として先頭に設定されるSelectOption
   * @returns 値がセットされたOptionsオブジェクt
   */
  export function initOptions(
    targetOptions: Record<string, SelectOption[]>,
    defaultOption?: SelectOption
  ) {
    const options = {} as Options;

    // 都道府県
    options.provinceOptions = provinces.map<SelectOption>((x) => ({
      value: x,
      text: x,
    }));
    // 締日・支払予定日
    const dateOption = createDateOptions();
    options.cutoffDateBillingOptions = dateOption.cutoff_date_billing;
    options.scheduledPaymentDateOptions = dateOption.scheduled_payment_date;
    // APIから取得する項目
    options.paymentDivisionOptions = targetOptions['得意先支払区分'];
    options.paymentTermOptions = targetOptions['支払いサイト'];
    options.salesFractionDivisionOptions = targetOptions['販売端数区分'];
    options.printDivisionOptions = targetOptions['得意先印刷区分'];
    options.salesTaxDivisionOptions = targetOptions['得意先消費税区分'];
    options.salesTaxCalcDivisionOptions = targetOptions['得意先消費税計算区分'];
    options.salesTaxFractionDivisionOptions = targetOptions['消費税端数区分'];
    options.titleDivisionOptions = targetOptions['得意先敬称区分'];
    options.priceRankingOptions = targetOptions['ランク価格'];
    // 初期値を設定
    if (defaultOption) {
      for (const [key, value] of Object.entries(options)) {
        value.unshift(defaultOption);
      }
    }
    return options;
  }
  /**
   * 締日・支払日用の`SelectOption`の配列を生成する。
   * @returns 生成された`SelectOption`の配列。
   */
  export function createDateOptions() {
    const ret = {
      cutoff_date_billing: [] as SelectOption[],
      scheduled_payment_date: [] as SelectOption[],
    };
    const dateOption = [] as SelectOption[];
    for (let i = 1; i < 31; i++) {
      dateOption.push({ value: i, text: i + '日' });
    }
    ret.cutoff_date_billing = [...dateOption, { value: 99, text: '末日' }];
    ret.scheduled_payment_date = [...dateOption, { value: 99, text: '末日' }];
    return ret;
  }
}
