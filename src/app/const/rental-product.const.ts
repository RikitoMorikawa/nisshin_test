type RentalProductConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE: string;
  };
  readonly STATUS_CODE: {
    readonly RENTABLE: number;
    readonly RESERVED: number;
    readonly RENTED: number;
    readonly RETURNED: number;
    readonly CLEANING: number;
    readonly UNDER_REPAIR: number;
    readonly DISCONTINUED: number;
  };
  readonly STATUS: {
    readonly RENTABLE: string;
    readonly RESERVED: string;
    readonly RENTED: string;
    readonly RETURNED: string;
    readonly CLEANING: string;
    readonly UNDER_REPAIR: string;
    readonly DISCONTINUED: string;
  };
};

export const rentalProductConst: RentalProductConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータは削除できません。',
    ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE:
      '貸出中のレンタル受付票を削除しようとしている可能性があるため処理を実行しませんでした。',
  },
  STATUS_CODE: {
    RENTABLE: 0,
    RESERVED: 1,
    RENTED: 2,
    RETURNED: 3,
    CLEANING: 4,
    UNDER_REPAIR: 5,
    DISCONTINUED: 99,
  },
  STATUS: {
    RENTABLE: '貸出可能',
    RESERVED: '予約済み',
    RENTED: '貸出中',
    RETURNED: '返却済み',
    CLEANING: '清掃中',
    UNDER_REPAIR: '修理中',
    DISCONTINUED: '廃番',
  },
};
