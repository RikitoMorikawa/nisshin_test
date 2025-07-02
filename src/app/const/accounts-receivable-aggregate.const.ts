type accountsReceivableAggregateConst = {
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE: string;
  };
  readonly STATUS_CODE: {
    readonly CASH: number;
    readonly DISCOUNT: number;
    readonly TRANSFER: number;
  };
  readonly STATUS: {
    readonly CASH: string;
    readonly DISCOUNT: string;
    readonly TRANSFER: string;
  };
};

export const accountsReceivableAggregateConst: accountsReceivableAggregateConst =
  {
    ERROR: {
      CANNOT_BE_DELETED: 'このデータ削除できません。',
      ATTEMPTED_TO_MODIFY_SUBMITTED_DATA_CHANGE:
        '送信済みの発注書を削除しようとしている可能性があるため処理を実行しませんでした。',
    },
    STATUS_CODE: {
      CASH: 0,
      DISCOUNT: 1,
      TRANSFER: 2,
    },
    STATUS: {
      CASH: '現金',
      DISCOUNT: '値引',
      TRANSFER: '振込',
    },
  };
