type RepairConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE: string;
  };
  readonly REPAIR_TYPE_CODE: {
    readonly REPAIR: number;
    readonly POLISHING: number;
  };
  readonly REPAIR_TYPE: {
    readonly REPAIR: string;
    readonly POLISHING: string;
  };
  readonly STATUS_CODE: {
    readonly BEFORE_REPAIR: number;
    readonly DURING_REPAIR: number;
    readonly AFTER_REPAIR: number;
  };
  readonly STATUS: {
    readonly BEFORE_REPAIR: string;
    readonly DURING_REPAIR: string;
    readonly AFTER_REPAIR: string;
  };
  readonly DELIVERY: {
    readonly NO_DELIVERY: string;
    readonly HAS_DELIVERY: string;
  };
};

export const repairConst: RepairConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータは削除できません。',
    ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE:
      '修理依頼中の修理受付票を削除しようとしている可能性があるため処理を実行しませんでした。',
  },
  REPAIR_TYPE_CODE: {
    REPAIR: 0,
    POLISHING: 1,
  },
  REPAIR_TYPE: {
    REPAIR: '修理',
    POLISHING: '研磨',
  },
  STATUS_CODE: {
    BEFORE_REPAIR: 0,
    DURING_REPAIR: 1,
    AFTER_REPAIR: 2,
  },
  STATUS: {
    BEFORE_REPAIR: '修理前',
    DURING_REPAIR: '修理中',
    AFTER_REPAIR: '修理完了',
  },
  DELIVERY: {
    NO_DELIVERY: '配送なし',
    HAS_DELIVERY: '配送あり',
  },
};
