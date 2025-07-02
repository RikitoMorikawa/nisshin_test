type CustomerOrderReceptionSlipConst = {
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
  readonly SETTLE_STATUS_DIVISION: {
    readonly CODE: {
      readonly BEFORE_PAYMENT: number;
      readonly PAID: number;
    };
    readonly VALUE: {
      readonly BEFORE_PAYMENT: string;
      readonly PAID: string;
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
  readonly STATUS_CODE: {
    readonly ACCEPTED: number;
    readonly TICKET_ISSUED: number;
    readonly QUOTATION_CREATED: number;
    readonly QUOTATION_UNDER_REVIEW: number;
    readonly QUOTATION_SENT: number;
    readonly ORDER_RECEIVED: number;
    readonly AVAILABLE: number;
    readonly CONTACTED_CUSTOMER: number;
    readonly DELIVERED_TO_CARRIER: number;
    readonly PRODUCT_IN_TRANSIT: number;
    readonly DELIVERED: number;
    readonly ALL_ITEMS_REFUNDED: number;
    readonly CANCELLED: number;
  };
  readonly STATUS: {
    readonly ACCEPTED: string;
    readonly TICKET_ISSUED: string;
    readonly QUOTATION_CREATED: string;
    readonly QUOTATION_UNDER_REVIEW: string;
    readonly QUOTATION_SENT: string;
    readonly ORDER_RECEIVED: string;
    readonly AVAILABLE: string;
    readonly CONTACTED_CUSTOMER: string;
    readonly DELIVERED_TO_CARRIER: string;
    readonly PRODUCT_IN_TRANSIT: string;
    readonly DELIVERED: string;
    readonly ALL_ITEMS_REFUNDED: string;
    readonly CANCELLED: string;
  };
  readonly CALLED_NUMBER_PREFIX: string;
};

export const customerOrderReceptionSlipConst: CustomerOrderReceptionSlipConst =
  {
    FAILED_CHOICES_FOR_NARROWING_DOWN:
      '絞り込み用選択肢が取得できませんでした。',
    ERROR: {
      CANNOT_BE_DELETED: 'このデータは削除できません。',
      ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE:
        '受注済みの客注受付票を削除しようとしている可能性があるため処理を実行しませんでした。',
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
        BEFORE_PAYMENT: 0,
        PAID: 1,
      },
      VALUE: {
        BEFORE_PAYMENT: '精算前',
        PAID: '精算済み',
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
    STATUS_CODE: {
      ACCEPTED: 0, // 受付済み
      TICKET_ISSUED: 1, // 受付票発行済み
      QUOTATION_CREATED: 2, // 見積書作成済み
      QUOTATION_UNDER_REVIEW: 3, // 見積書稟議中
      QUOTATION_SENT: 4, // 見積書送付済み
      ORDER_RECEIVED: 5, // 受注済み
      AVAILABLE: 6, // 入荷済み
      CONTACTED_CUSTOMER: 7, // お客様へ連絡済み
      DELIVERED_TO_CARRIER: 8, // 配送業者へ引き渡し済み
      PRODUCT_IN_TRANSIT: 9, // 商品配達予定
      DELIVERED: 10, // 商品引き渡し済み
      ALL_ITEMS_REFUNDED: 98, // 返品
      CANCELLED: 99, // キャンセル
    },
    STATUS: {
      ACCEPTED: '受付済み',
      TICKET_ISSUED: '受付票発行済み',
      QUOTATION_CREATED: '見積書作成済み',
      QUOTATION_UNDER_REVIEW: '見積書稟議中',
      QUOTATION_SENT: '見積書送付済み',
      ORDER_RECEIVED: '受注済み',
      AVAILABLE: '入荷済み',
      CONTACTED_CUSTOMER: 'お客様へ連絡済み',
      DELIVERED_TO_CARRIER: '配送業者へ引き渡し済み',
      PRODUCT_IN_TRANSIT: '商品配達予定',
      DELIVERED: '商品引き渡し済み',
      ALL_ITEMS_REFUNDED: '返品',
      CANCELLED: 'キャンセル',
    },
    CALLED_NUMBER_PREFIX: '2',
  };
