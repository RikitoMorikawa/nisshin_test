import { SelectOption } from '../components/atoms/select/select.component';
import { divisionConst } from '../const/division.const';
import { DivisionApiResponseIsInvalid } from './shared-functions';

// 会員登録・編集で利用する区分選択肢をセットにした型
export type MemberOptions = {
  member_status_division: SelectOption[];
};

// 選択肢文字列の配列
const optionKeys = [divisionConst.MEMBER_STATUS];

/**
 * 会員に必要な区分を生成
 * @param divisions
 * @param shouldSetDefaultValue
 * @returns MemberOptions | null
 */
export function generateOptionsFromDivision(
  divisions: Record<string, SelectOption[]>,
  shouldSetDefaultValue: boolean
): MemberOptions | null {
  // 選択肢が正常に取得できない場合nullを返却して終了
  const isInvalid = optionKeys.map((v) => {
    return DivisionApiResponseIsInvalid(divisions, v);
  });
  if (isInvalid.includes(true)) return null;

  // 選択肢生成
  const options = {} as MemberOptions;
  options.member_status_division = divisions[divisionConst.MEMBER_STATUS];

  // 選択肢の初期値が必要な場合セットする
  if (shouldSetDefaultValue) {
    const defaultValue: SelectOption = { value: '', text: '選択してください' };
    for (const option of Object.values(options)) {
      option.unshift(defaultValue);
    }
  }

  return options;
}
