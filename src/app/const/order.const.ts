type OrderConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE: string;
  };
  /*readonly STATUS_CODE: {
    readonly BEFORE_INSPECTION: number;
    readonly CANCEL: number;
    readonly OUT_OF_STOCK: number;
    readonly SHORTAGE: number;
    readonly INSPECTED: number;
  };
  readonly STATUS: {
    readonly BEFORE_INSPECTION: string;
    readonly CANCEL: string;
    readonly OUT_OF_STOCK: string;
    readonly SHORTAGE: string;
    readonly INSPECTED: string;
  };*/
  readonly STATUS_CODE: {
    readonly BEFORE_INSPECTION: number;
    readonly SHORTAGE_OUT_OF_STOCK: number;
    readonly INSPECTED: number;
    readonly CANCEL: number;
  };
  readonly STATUS: {
    readonly BEFORE_INSPECTION: string;
    readonly SHORTAGE_OUT_OF_STOCK: string;
    readonly INSPECTED: string;
    readonly CANCEL: string;
  };
};

export const orderConst: OrderConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータ削除できません。',
    ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE:
      '検品済みの発注を削除しようとしている可能性があるため処理を実行しませんでした。',
  },
  /*
  STATUS_CODE: {
    BEFORE_INSPECTION: 0,
    SHORTAGE: 1,
    OUT_OF_STOCK: 2,
    CANCEL: 98,
    INSPECTED: 99,
  },
  STATUS: {
    BEFORE_INSPECTION: '検品前',
    SHORTAGE: '全数欠品',
    OUT_OF_STOCK: '一部欠品',
    CANCEL: '取り消し',
    INSPECTED: '検品済み',
  },*/
  STATUS_CODE: {
    BEFORE_INSPECTION: 0,
    INSPECTED: 1,
    SHORTAGE_OUT_OF_STOCK: 2,
    CANCEL: 98,
  },
  STATUS: {
    BEFORE_INSPECTION: '検品前・納品前',
    SHORTAGE_OUT_OF_STOCK: '一部検品済み・一部納品済み',
    INSPECTED: '検品済・納品済',
    CANCEL: '取り消し',
  },
};
