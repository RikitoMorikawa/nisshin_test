type ErrorConst = {
  readonly ERROR: string;
  readonly GUIDANCE_OF_SUPPORT: string;
  readonly COULD_NOT_GET_DATA: string;
  readonly COULD_NOT_GET_DIVISION_TABLE: string;
  readonly COULD_NOT_GET_PRICE_RANK_TABLE: string;
  readonly NETWORK_ERROR: string;
  readonly PROCESS_ERROR_TEMPLATE: string;
  readonly FORM_ERROR: {
    readonly EXCEEDED_CHARACTER_MAX_LIMIT: string;
    readonly EXCEEDED_CHARACTER_MIN_LIMIT: string;
    readonly REQUIRED_ITEM: string;
    readonly OPPONENT_ENTERED_REQUIRE_ITEM: string;
    readonly FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION: string;
    readonly HALF_WIDTH_KATAKANA_RESTRICTION_VIOLATION: string;
    readonly EXCEEDED_FILE_SIZE_LIMIT: string;
    readonly EMAIL_FORMAT_VIOLATION: string;
    readonly NUMERIC_LIMIT_VIOLATION: string;
    readonly PASSWORD_MATCH_VIOLATION: string;
    readonly PASSWORD_FORMAT_VIOLATION: string;
    readonly DATE_TERM_FROM_BEFORE_TODAY: string;
    readonly DATE_TERM_TO_BEFORE_FROM: string;
    readonly DATE_SPECIFICATION_VIOLATION: string;
    readonly EXCEEDED_DIGIT_MAX_LIMIT: string;
    readonly OPPONENT_SELECTION_REQUIRED_ITEM: string;
    readonly NUMERIC_2DIGIT_VIOLATION: string;
    readonly NUMERIC_2DIGIT_DECIMAL_VIOLATION: string;
  };
};

export const errorConst: ErrorConst = {
  ERROR: 'error',
  GUIDANCE_OF_SUPPORT:
    '\n上記メッセージはシステムサポート時に必要になる場合があります。',
  COULD_NOT_GET_DATA: 'データが取得できませんでした。\n一覧画面へ戻ります。',
  COULD_NOT_GET_DIVISION_TABLE:
    '区分テーブルが取得できませんでした。\n一覧画面へ戻ります。',
  COULD_NOT_GET_PRICE_RANK_TABLE:
    '価格ランクテーブルが取得できませんでした。\n一覧画面へ戻ります。',
  NETWORK_ERROR:
    '内部エラーまたはネットワークエラーが発生しました。\nインターネットへの接続をご確認ください。',
  // 行頭に処理名を入れて利用してください。
  PROCESS_ERROR_TEMPLATE:
    `に失敗しました。時間をおいて再度お試しください。\n` +
    'それでも解消しない場合は、お手数ですがシステムご担当者へご連絡ください。',
  FORM_ERROR: {
    EXCEEDED_CHARACTER_MAX_LIMIT: '※ 入力文字数が制限を超えています。',
    EXCEEDED_CHARACTER_MIN_LIMIT: '※ 入力文字数が制限未満です。',
    REQUIRED_ITEM: '※ 必須項目です。',
    OPPONENT_ENTERED_REQUIRE_ITEM: '※ 確認対象が入力されている場合必須です。',
    FULL_WIDTH_KATAKANA_RESTRICTION_VIOLATION:
      '※ 全角カタカナで入力してください。',
    HALF_WIDTH_KATAKANA_RESTRICTION_VIOLATION:
      '※ 半角カタカナで入力してください。',
    EXCEEDED_FILE_SIZE_LIMIT: '※ ファイルサイズが制限を超えています。',
    EMAIL_FORMAT_VIOLATION: '※ メールアドレス形式で入力してください。',
    NUMERIC_LIMIT_VIOLATION: '※ 半角数字のみ入力してください。',
    PASSWORD_MATCH_VIOLATION: '※ パスワードが一致しません。',
    PASSWORD_FORMAT_VIOLATION:
      '※ 半角の英大文字小文字数字それぞれ1文字ずつ必須',
    DATE_TERM_FROM_BEFORE_TODAY:
      '期間指定の開始日には、本日以前の日付を設定してください。',
    DATE_TERM_TO_BEFORE_FROM:
      '期間指定の終了日には、開始日以降の日付を設定してください。',
    DATE_SPECIFICATION_VIOLATION:
      '※ 日付指定が不正です。正しい値を設定してください。',
    EXCEEDED_DIGIT_MAX_LIMIT: '※ 入力桁数が制限を超えています。',
    OPPONENT_SELECTION_REQUIRED_ITEM: '※ 敬称指定時は必須です。',
    NUMERIC_2DIGIT_VIOLATION: '※ 半角数字2桁以内で入力してください。',
    NUMERIC_2DIGIT_DECIMAL_VIOLATION:
      '※ 半角数字で入力してください(少数点は第2位まで入力可能)',
  },
};
