type DeliveryConst = {
  CLIENT: string;
  MEMBER: string;
  GENERAL: string;
  PRODUCT_SALES: string;
  CUSTOMER_ORDER: string;
  REPAIR: string;
  RENTAL: string;
  NO_DELIVERY: string;
  DELIVERY_AVAILABLE: string;
  NO_COLLECTION: string;
  COLLECTION_AVAILABLE: string;
  DELIVERY: string;
  COLLECTION: string;
  readonly SALES_TYPE: ReadonlyArray<{
    readonly id: number;
    readonly name: string;
  }>;
  readonly CUSTOMER_TYPE: ReadonlyArray<{
    readonly id: number;
    readonly name: string;
  }>;
  readonly DELIVERY_TYPE: ReadonlyArray<{
    readonly value: number;
    readonly text: string;
  }>;
  readonly DELIVERY_REQUEST: {
    readonly CODE: {
      readonly NO_DELIVERY: number;
      readonly DELIVERY_AVAILABLE: number;
    };
    readonly VALUE: {
      readonly NO_DELIVERY: string;
      readonly DELIVERY_AVAILABLE: string;
    };
  };
  readonly COLLECTION_REQUEST: {
    readonly CODE: {
      readonly NO_COLLECTION: number;
      readonly COLLECTION_AVAILABLE: number;
    };
    readonly VALUE: {
      readonly NO_COLLECTION: string;
      readonly COLLECTION_AVAILABLE: string;
    };
  };
};

const baseConst = {
  CLIENT: '得意先',
  MEMBER: '会員',
  GENERAL: '一般',
  PRODUCT_SALES: '物販',
  CUSTOMER_ORDER: '客注',
  REPAIR: '修理',
  RENTAL: 'レンタル',
  NO_DELIVERY: '配送なし',
  DELIVERY_AVAILABLE: '配送あり',
  NO_COLLECTION: '回収なし',
  COLLECTION_AVAILABLE: '回収あり',
  DELIVERY: '配送',
  COLLECTION: '回収',
};

export const deliveryConst: DeliveryConst = {
  ...baseConst,
  SALES_TYPE: [
    { id: 1, name: baseConst.PRODUCT_SALES },
    { id: 2, name: baseConst.CUSTOMER_ORDER },
    { id: 3, name: baseConst.REPAIR },
    { id: 4, name: baseConst.RENTAL },
  ],
  CUSTOMER_TYPE: [
    { id: 1, name: baseConst.CLIENT },
    { id: 2, name: baseConst.MEMBER },
    { id: 3, name: baseConst.GENERAL },
  ],
  DELIVERY_TYPE: [
    { value: 1, text: baseConst.DELIVERY },
    { value: 2, text: baseConst.COLLECTION },
  ],
  DELIVERY_REQUEST: {
    CODE: {
      NO_DELIVERY: 0,
      DELIVERY_AVAILABLE: 1,
    },
    VALUE: {
      NO_DELIVERY: '配送なし',
      DELIVERY_AVAILABLE: '配送あり',
    },
  },
  COLLECTION_REQUEST: {
    CODE: {
      NO_COLLECTION: 0,
      COLLECTION_AVAILABLE: 1,
    },
    VALUE: {
      NO_COLLECTION: '配送なし',
      COLLECTION_AVAILABLE: '配送あり',
    },
  },
};
