import { SelectOption } from '../components/atoms/select/select.component';
import { divisionConst } from '../const/division.const';
import { DivisionApiResponseIsInvalid } from './shared-functions';

// 修理登録・編集で利用する区分選択肢をセットにした型
export type RepairOptions = {
  repair_division: SelectOption[];
  repair_status_division: SelectOption[];
  contact_division: SelectOption[];
};

// 選択肢文字列の配列
const optionKeys = [
  divisionConst.REPAIR_TYPE,
  divisionConst.REPAIR_STATUS,
  divisionConst.CONTACT,
];

/**
 * 修理に必要な区分を生成
 * @param divisions
 * @param shouldSetDefaultValue
 * @returns RepairOptions | null
 */
export function generateOptionsFromDivision(
  divisions: Record<string, SelectOption[]>,
  shouldSetDefaultValue: boolean
): RepairOptions | null {
  // 選択肢が正常に取得できない場合nullを返却して終了
  const isInvalid = optionKeys.map((v) => {
    return DivisionApiResponseIsInvalid(divisions, v);
  });
  if (isInvalid.includes(true)) return null;

  // 選択肢生成
  const options = {} as RepairOptions;
  options.repair_division = divisions[divisionConst.REPAIR_TYPE];
  options.repair_status_division = divisions[divisionConst.REPAIR_STATUS];
  options.contact_division = divisions[divisionConst.CONTACT];

  // 選択肢の初期値が必要な場合セットする
  if (shouldSetDefaultValue) {
    const defaultValue: SelectOption = { value: '', text: '選択してください' };
    for (const option of Object.values(options)) {
      option.unshift(defaultValue);
    }
  }

  return options;
}
