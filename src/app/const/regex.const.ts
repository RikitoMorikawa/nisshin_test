type RegExConst = {
  // 全角カタカナ
  readonly FULL_WIDTH_KATAKANA_REG_EX: RegExp;
  // 半角カタカナ
  readonly HALF_WIDTH_KATAKANA_REG_EX: RegExp;

  // 社員ログイン用パスワード 半角英数（大文字小文字それぞれ1文字ずつ必須）
  PASSWORD_REG_EX: RegExp;

  // 半角数字
  NUMERIC_REG_EX: RegExp;
  // 数字2桁
  NUMERIC_2DIGIT_REG_EX: RegExp;
  // 数字2桁（小数第2位まで）
  NUMERIC_2DIGIT_DECIMAL_REG_EX: RegExp;
};

export const regExConst: RegExConst = {
  FULL_WIDTH_KATAKANA_REG_EX: /^[ァ-ヴー 　]+$/,
  HALF_WIDTH_KATAKANA_REG_EX: /^[ｦ-ﾟ]+$/,
  PASSWORD_REG_EX: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]+$/,
  NUMERIC_REG_EX: /^\d+$/,
  NUMERIC_2DIGIT_REG_EX: /^\d{1,2}$/,
  NUMERIC_2DIGIT_DECIMAL_REG_EX: /^\d{1,2}(\.\d{1,2})?$/,
};
