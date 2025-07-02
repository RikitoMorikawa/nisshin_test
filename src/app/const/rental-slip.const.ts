type RentalSlipConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE: string;
  };
  readonly DELIVERY_DIVISION: {
    readonly CODE: {
      readonly NO_DELIVERY: number;
      readonly DELIVERY_INCLUDED: number;
    };
    readonly VALUE: {
      readonly NO_DELIVERY: string;
      readonly DELIVERY_INCLUDED: string;
    };
  };
  readonly COLLECTION_DIVISION: {
    readonly CODE: {
      readonly NO_COLLECTION: number;
      readonly COLLECTION_AVAILABLE: number;
    };
    readonly VALUE: {
      readonly NO_COLLECTION: string;
      readonly COLLECTION_AVAILABLE: string;
    };
  };
  readonly CUSTOMER_TYPE_DIVISION: {
    readonly CODE: {
      readonly CLIENT: number;
      readonly MEMBER: number;
      readonly GENERAL: number;
    };
    readonly VALUE: {
      readonly CLIENT: string;
      readonly MEMBER: string;
      readonly GENERAL: string;
    };
  };
  readonly SETTLE_STATUS_DIVISION: {
    readonly CODE: {
      readonly UNSETTLED: number;
      readonly SETTLED: number;
    };
    readonly VALUE: {
      readonly UNSETTLED: string;
      readonly SETTLED: string;
    };
  };
  readonly INCIDENT_DIVISION: {
    readonly CODE: {
      readonly NO_INCIDENTS: number;
      readonly INCIDENT_IN_PROGRESS: number;
      readonly INCIDENT_RESOLUTION: number;
    };
    readonly VALUE: {
      readonly NO_INCIDENTS: string;
      readonly INCIDENT_IN_PROGRESS: string;
      readonly INCIDENT_RESOLUTION: string;
    };
  };
  readonly STATUS_CODE: {
    readonly ACCEPTED: number;
    readonly TICKET_ISSUED: number;
    readonly READY_FOR_RENTAL: number;
    readonly PARTIALLY_RENTED: number;
    readonly ALL_RENTED: number;
    readonly PARTIALLY_RETURNED: number;
    readonly PARTIALLY_OVERDUE: number;
    readonly ALL_OVERDUE: number;
    readonly ALL_RETURNED: number;
    readonly CANCELLED: number;
  };
  readonly STATUS: {
    readonly ACCEPTED: string;
    readonly TICKET_ISSUED: string;
    readonly READY_FOR_RENTAL: string;
    readonly PARTIALLY_RENTED: string;
    readonly ALL_RENTED: string;
    readonly PARTIALLY_RETURNED: string;
    readonly PARTIALLY_OVERDUE: string;
    readonly ALL_OVERDUE: string;
    readonly ALL_RETURNED: string;
    readonly CANCELLED: string;
  };
  readonly CALLED_NUMBER_PREFIX: string;
};

export const rentalSlipConst: RentalSlipConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータは削除できません。',
    ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE:
      '貸出中のレンタル受付票を削除しようとしている可能性があるため処理を実行しませんでした。',
  },
  DELIVERY_DIVISION: {
    CODE: {
      NO_DELIVERY: 0,
      DELIVERY_INCLUDED: 1,
    },
    VALUE: {
      NO_DELIVERY: '配送なし',
      DELIVERY_INCLUDED: '配送あり',
    },
  },
  COLLECTION_DIVISION: {
    CODE: {
      NO_COLLECTION: 0,
      COLLECTION_AVAILABLE: 1,
    },
    VALUE: {
      NO_COLLECTION: '回収なし',
      COLLECTION_AVAILABLE: '回収あり',
    },
  },
  CUSTOMER_TYPE_DIVISION: {
    CODE: {
      CLIENT: 0,
      MEMBER: 1,
      GENERAL: 2,
    },
    VALUE: {
      CLIENT: '得意先',
      MEMBER: '会員',
      GENERAL: '一般',
    },
  },
  SETTLE_STATUS_DIVISION: {
    CODE: {
      UNSETTLED: 0,
      SETTLED: 1,
    },
    VALUE: {
      UNSETTLED: '精算前',
      SETTLED: '精算済み',
    },
  },
  INCIDENT_DIVISION: {
    CODE: {
      NO_INCIDENTS: 0,
      INCIDENT_IN_PROGRESS: 1,
      INCIDENT_RESOLUTION: 2,
    },
    VALUE: {
      NO_INCIDENTS: 'インシデントなし',
      INCIDENT_IN_PROGRESS: 'インシデント発生中',
      INCIDENT_RESOLUTION: 'インシデント解消',
    },
  },
  STATUS_CODE: {
    ACCEPTED: 0,
    TICKET_ISSUED: 1,
    READY_FOR_RENTAL: 2,
    PARTIALLY_RENTED: 3,
    ALL_RENTED: 4,
    PARTIALLY_RETURNED: 5,
    PARTIALLY_OVERDUE: 6,
    ALL_OVERDUE: 7,
    ALL_RETURNED: 98,
    CANCELLED: 99,
  },
  STATUS: {
    ACCEPTED: '受付済み',
    TICKET_ISSUED: '受付票発行済み',
    READY_FOR_RENTAL: '貸出準備完了',
    PARTIALLY_RENTED: '一部貸出中',
    ALL_RENTED: '全て貸出中',
    PARTIALLY_RETURNED: '一部返却済み',
    PARTIALLY_OVERDUE: '一部延滞中',
    ALL_OVERDUE: '全て延滞中',
    ALL_RETURNED: '全て返却済み',
    CANCELLED: 'キャンセル',
  },
  CALLED_NUMBER_PREFIX: '3',
};
