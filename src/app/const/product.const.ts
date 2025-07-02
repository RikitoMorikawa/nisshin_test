export type ProductConst = {
  readonly CHARACTER_LIMITS: {
    readonly NAME_MAX_LENGTH: string;
    readonly NAME_KANA_MAX_LENGTH: string;
    readonly STANDARD_MAX_LENGTH: string;
    readonly PART_NUMBER_MAX_LENGTH: string;
    readonly BARCODE_MAX_LENGTH: string;
    readonly B_BARCODE_MAX_LENGTH: string;
    readonly C_BARCODE_MAX_LENGTH: string;
    readonly QUANTITY_MAX_LENGTH: string;
    readonly B_QUANTITY_MAX_LENGTH: string;
    readonly C_QUANTITY_MAX_LENGTH: string;
    readonly ORDERING_TARGET_BARCODE_MAX_LENGTH: string;
    readonly REMARKS_1_MAX_LENGTH: string;
    readonly REMARKS_2_MAX_LENGTH: string;
    readonly REMARKS_3_MAX_LENGTH: string;
    readonly REMARKS_4_MAX_LENGTH: string;
    readonly SUPPLIER_NAME: string;
    readonly SUPPLIER_PRODUCT_CD: string;
  };
  readonly PRODUCT_DIVISION: {
    readonly CODE: {
      readonly STANDARD: number;
      readonly WASTE_NUMBER: number;
      readonly CUSTOM: number;
    };
    readonly VALUE: {
      readonly STANDARD: string;
      readonly WASTE_NUMBER: string;
      readonly CUSTOM: string;
    };
  };
};

export const productConst: ProductConst = {
  CHARACTER_LIMITS: {
    NAME_MAX_LENGTH: '25',
    NAME_KANA_MAX_LENGTH: '50',
    STANDARD_MAX_LENGTH: '25',
    PART_NUMBER_MAX_LENGTH: '25',
    BARCODE_MAX_LENGTH: '13',
    B_BARCODE_MAX_LENGTH: '14',
    C_BARCODE_MAX_LENGTH: '14',
    QUANTITY_MAX_LENGTH: '7',
    B_QUANTITY_MAX_LENGTH: '7',
    C_QUANTITY_MAX_LENGTH: '7',
    ORDERING_TARGET_BARCODE_MAX_LENGTH: '14',
    REMARKS_1_MAX_LENGTH: '20',
    REMARKS_2_MAX_LENGTH: '20',
    REMARKS_3_MAX_LENGTH: '20',
    REMARKS_4_MAX_LENGTH: '20',
    SUPPLIER_NAME: '255',
    SUPPLIER_PRODUCT_CD: '10',
  },
  PRODUCT_DIVISION: {
    CODE: {
      STANDARD: 0,
      WASTE_NUMBER: 1,
      CUSTOM: 2,
    },
    VALUE: {
      STANDARD: '定番',
      WASTE_NUMBER: '廃番',
      CUSTOM: '特注品',
    },
  },
};
