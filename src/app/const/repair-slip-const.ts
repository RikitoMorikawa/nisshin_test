type RepairSlipConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE: string;
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
    readonly PREPARING_QUOTE: number;
    readonly QUOTE_SENT_TO_CUSTOMER: number;
    readonly ORDERED_FROM_MANUFACTURER: number;
    readonly REPAIRED: number;
    readonly CUSTOMER_NOTIFIED_OF_REPAIR_COMPLETION: number;
    readonly DELIVERED_TO_SHIPPING_CARRIER: number;
    readonly SHIPPED: number;
    readonly DELIVERED: number;
    readonly CANCELLED: number;
  };
  readonly STATUS: {
    readonly ACCEPTED: string;
    readonly TICKET_ISSUED: string;
    readonly PREPARING_QUOTE: string;
    readonly QUOTE_SENT_TO_CUSTOMER: string;
    readonly ORDERED_FROM_MANUFACTURER: string;
    readonly REPAIRED: string;
    readonly CUSTOMER_NOTIFIED_OF_REPAIR_COMPLETION: string;
    readonly DELIVERED_TO_SHIPPING_CARRIER: string;
    readonly SHIPPED: string;
    readonly DELIVERED: string;
    readonly CANCELLED: string;
  };
  readonly CALLED_NUMBER_PREFIX: string;
};

export const repairSlipConst: RepairSlipConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータは削除できません。',
    ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE:
      '修理依頼中の修理受付票を削除しようとしている可能性があるため処理を実行しませんでした。',
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
    PREPARING_QUOTE: 2,
    QUOTE_SENT_TO_CUSTOMER: 3,
    ORDERED_FROM_MANUFACTURER: 4,
    REPAIRED: 5,
    CUSTOMER_NOTIFIED_OF_REPAIR_COMPLETION: 6,
    DELIVERED_TO_SHIPPING_CARRIER: 7,
    SHIPPED: 8,
    DELIVERED: 9,
    CANCELLED: 99,
  },
  STATUS: {
    ACCEPTED: '受付済み',
    TICKET_ISSUED: '受付票発行済み',
    PREPARING_QUOTE: '見積中',
    QUOTE_SENT_TO_CUSTOMER: 'お客様へ見積額を連絡済み',
    ORDERED_FROM_MANUFACTURER: 'メーカーへ依頼済み',
    REPAIRED: '修理完了',
    CUSTOMER_NOTIFIED_OF_REPAIR_COMPLETION: 'お客様へ修理完了の連絡済み',
    DELIVERED_TO_SHIPPING_CARRIER: '配送業者へ引き渡し済み',
    SHIPPED: '商品配送中',
    DELIVERED: '商品引き渡し済み',
    CANCELLED: 'キャンセル',
  },
  CALLED_NUMBER_PREFIX: '1',
};
