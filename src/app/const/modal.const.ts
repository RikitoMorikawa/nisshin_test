type ModalConst = {
  readonly TITLE: {
    readonly DELETE: string;
    readonly HAS_ERROR: string;
    readonly CANCEL: string;
  };
  readonly BODY: {
    readonly DELETE: string;
    readonly CANCEL: string;
    readonly HAS_ERROR: string;
  };
  readonly BUTTON_TITLE: {
    readonly DELETE: string;
    readonly CANCEL: string;
    readonly CLOSE: string;
    readonly EXECUTION: string;
  };
  readonly BUTTON_CLICK_VALUE: {
    readonly OK_BUTTON_CLICK_VALUE: string;
    readonly CANCEL_BUTTON_CLICK_VALUE: string;
  };
};

type ModalChangeConst = {
  readonly TITLE: {
    readonly STATUS: string;
    readonly HAS_ERROR: string;
    readonly CANCEL: string;
  };
  readonly BODY: {
    readonly STATUS: string;
    readonly CANCEL: string;
    readonly HAS_ERROR: string;
  };
  readonly BUTTON_TITLE: {
    readonly STATUS: string;
    readonly CANCEL: string;
    readonly CLOSE: string;
    readonly EXECUTION: string;
  };
  readonly BUTTON_CLICK_VALUE: {
    readonly OK_BUTTON_CLICK_VALUE: string;
    readonly CANCEL_BUTTON_CLICK_VALUE: string;
  };
};

type templateModalConst = {
  readonly CLIENT: string;
  readonly CLIENT_WORKING_FIELD: string;
  readonly SUPPPLIER: string;
  readonly PRODUCT: string;
};

export const modalConst: ModalConst = {
  TITLE: {
    DELETE: 'データを削除します。',
    HAS_ERROR: 'エラーが発生しました。',
    CANCEL: '処理を中止します。',
  },
  BODY: {
    DELETE: 'この操作は取り消せません。\n' + '削除を実行しますか？',
    CANCEL: '変更内容を破棄して前の画面へ戻ります。',
    HAS_ERROR: 'エラーが発生しました。',
  },
  BUTTON_TITLE: {
    DELETE: '削除実行',
    CANCEL: 'キャンセル',
    CLOSE: '閉じる',
    EXECUTION: '実行',
  },
  BUTTON_CLICK_VALUE: {
    OK_BUTTON_CLICK_VALUE: 'continue',
    CANCEL_BUTTON_CLICK_VALUE: 'cancel',
  },
};

export const statusCahngeString: ModalChangeConst = {
  TITLE: {
    STATUS: 'ステータスを一括変更します',
    HAS_ERROR: 'エラーが発生しました。',
    CANCEL: '処理を中止します。',
  },
  BODY: {
    STATUS: 'この操作は取り消せません。\n' + '変更を行いますか？',
    CANCEL: '変更内容を破棄して前の画面へ戻ります。',
    HAS_ERROR: 'エラーが発生しました。',
  },
  BUTTON_TITLE: {
    STATUS: 'ステータス更新実行',
    CANCEL: 'キャンセル',
    CLOSE: '閉じる',
    EXECUTION: '実行',
  },
  BUTTON_CLICK_VALUE: {
    OK_BUTTON_CLICK_VALUE: 'continue',
    CANCEL_BUTTON_CLICK_VALUE: 'cancel',
  },
};

export const templateModalString: templateModalConst = {
  CLIENT: '得意先詳細',
  CLIENT_WORKING_FIELD: '得意先現場編集',
  SUPPPLIER: '仕入先詳細',
  PRODUCT: '商品詳細',
};
