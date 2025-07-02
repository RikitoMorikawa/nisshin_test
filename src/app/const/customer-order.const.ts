type CustomerOrderConst = {
  readonly FAILED_CHOICES_FOR_NARROWING_DOWN: string;
  readonly ERROR: {
    readonly CANNOT_BE_DELETED: string;
    readonly ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE: string;
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
  readonly STATUS_CODE: {
    readonly BEFORE_PLACING_AN_ORDER: number;
    readonly PRODUCT_ORDERED: number;
    readonly BEFORE_PRODUCT_INSPECTION: number;
    readonly PRODUCT_INSPECTION_FINISHED: number;
    readonly RETURNED_PRODUCT: number;
  };
  readonly STATUS: {
    readonly BEFORE_PLACING_AN_ORDER: string;
    readonly PRODUCT_ORDERED: string;
    readonly BEFORE_PRODUCT_INSPECTION: string;
    readonly PRODUCT_INSPECTION_FINISHED: string;
    readonly RETURNED_PRODUCT: string;
  };
};

export const customerOrderConst: CustomerOrderConst = {
  FAILED_CHOICES_FOR_NARROWING_DOWN: '絞り込み用選択肢が取得できませんでした。',
  ERROR: {
    CANNOT_BE_DELETED: 'このデータは削除できません。',
    ATTEMPTED_TO_MODIFY_ACCEPTED_DATA_CHANGE:
      '受注済みの客注受付表を削除しようとしている可能性があるため処理を実行しませんでした。',
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
  STATUS_CODE: {
    BEFORE_PLACING_AN_ORDER: 0,
    PRODUCT_ORDERED: 1,
    BEFORE_PRODUCT_INSPECTION: 2,
    PRODUCT_INSPECTION_FINISHED: 3,
    RETURNED_PRODUCT: 99,
  },
  STATUS: {
    BEFORE_PLACING_AN_ORDER: '商品発注前',
    PRODUCT_ORDERED: '商品発注済み',
    BEFORE_PRODUCT_INSPECTION: '商品検品前',
    PRODUCT_INSPECTION_FINISHED: '商品検品済み',
    RETURNED_PRODUCT: '商品返品済み',
  },
};
