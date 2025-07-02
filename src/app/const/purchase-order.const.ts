type PurchaseOrderConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE: string;
  };
  readonly STATUS_CODE: {
    readonly DRAFT: number;
    readonly CANCEL: number;
    readonly SENT: number;
  };
  readonly STATUS: {
    readonly DRAFT: string;
    readonly CANCEL: string;
    readonly SENT: string;
  };
  readonly UNIT_CATEGORY: {
    readonly CODE: {
      readonly SMALL: number;
      readonly MEDIUM: number;
      readonly LARGE: number;
    };
    readonly VALUE: {
      readonly SMALL: string;
      readonly MEDIUM: string;
      readonly LARGE: string;
    };
  };
};

export const purchaseOrderConst: PurchaseOrderConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータ削除できません。',
    ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE:
      '送信済みの発注書を削除しようとしている可能性があるため処理を実行しませんでした。',
  },
  STATUS_CODE: {
    DRAFT: 0,
    CANCEL: 1,
    SENT: 2,
  },
  STATUS: {
    DRAFT: '下書き',
    CANCEL: '取り消し',
    SENT: '送信済み',
  },
  UNIT_CATEGORY: {
    CODE: {
      SMALL: 1,
      MEDIUM: 2,
      LARGE: 3,
    },
    VALUE: {
      SMALL: 'バラ',
      MEDIUM: '小分け',
      LARGE: 'ケース',
    },
  },
};
