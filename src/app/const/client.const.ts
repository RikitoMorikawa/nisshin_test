export type ClientConst = {
  readonly CHARACTER_LIMITS: {
    readonly NAME_MAX_LENGTH: string;
    readonly NAME_KANA_MAX_LENGTH: string;
    readonly CLIENT_CD_MAX_LENGTH: string;
    readonly BILLING_CD_MAX_LENGTH: string;
    readonly PIC_NAME_MAX_LENGTH: string;
    readonly PIC_NAME_KANA_MAX_LENGTH: string;
    readonly POSTAL_CODE_MAX_LENGTH: string;
    readonly POSTAL_CODE_MIN_LENGTH: string;
    readonly PROVINCE_MAX_LENGTH: string;
    readonly LOCALITY_MAX_LENGTH: string;
    readonly STREET_ADDRESS_MAX_LENGTH: string;
    readonly OTHER_ADDRESS_MAX_LENGTH: string;
    readonly MAIL_MAX_LENGTH: string;
    readonly TEL_MAX_LENGTH: string;
    readonly FAX_MAX_LENGTH: string;
    readonly CREDIT_MAX_LENGTH: string;
    readonly LINE_NUM_MAX_LENGTH: string;
    readonly CUSTOM_TITLE_MAX_LENGTH: string;
    readonly REMARKS_1_MAX_LENGTH: string;
    readonly REMARKS_2_MAX_LENGTH: string;
  };
  readonly TITLE: {
    readonly CODE: {
      readonly ORGANIZATION: number;
      readonly INDIVIDUAL: number;
      readonly USER_SPECIFIED: number;
    };
    readonly VALUE: {
      readonly ORGANIZATION: string;
      readonly INDIVIDUAL: string;
      readonly USER_SPECIFIED: string;
    };
  };
  readonly PAYMENT_DIVISION: {
    readonly CODE: {
      readonly ACCOUNTS_RECEIVABLE: number; // 売掛金
      readonly CASH: number; // 現金
    };
    readonly VALUE: {
      readonly ACCOUNTS_RECEIVABLE: string;
      readonly CASH: string;
    };
  };
  readonly SALES_TAX_DIVISION: {
    readonly CODE: {
      readonly TAX_EXCLUDED: number; // 外税
      readonly TAX_INCLUDED: number; // 内税
      readonly NON_TAXABLE: number; // 非課税
    };
    readonly VALUE: {
      readonly TAX_EXCLUDED: string;
      readonly TAX_INCLUDED: string;
      readonly NON_TAXABLE: string;
    };
  };
  readonly SALES_TAX_CALC_DIVISION: {
    readonly CODE: {
      readonly MONTHLY: number; // 月単位
      readonly SLIP_UNIT: number; // 伝票単位
    };
    readonly VALUE: {
      readonly MONTHLY: string;
      readonly SLIP_UNIT: string;
    };
  };
  readonly SALES_FRACTION: {
    readonly CODE: {
      readonly ROUND_DOWN: number; // 切り捨て
      readonly ROUND_UP: number; // 切り上げ
      readonly ROUND_HALF_UP: number; // 四捨五入
    };
    readonly VALUE: {
      readonly ROUND_DOWN: string;
      readonly ROUND_UP: string;
      readonly ROUND_HALF_UP: string;
    };
  };
  readonly SALES_TAX_FRACTION: {
    readonly CODE: {
      readonly ROUND_DOWN: number; // 切り捨て
      readonly ROUND_UP: number; // 切り上げ
      readonly ROUND_HALF_UP: number; // 四捨五入
    };
    readonly VALUE: {
      readonly ROUND_DOWN: string;
      readonly ROUND_UP: string;
      readonly ROUND_HALF_UP: string;
    };
  };
  readonly PRINT: {
    readonly CODE: {
      readonly ORIGINAL: number; // オリジナル
      readonly DOT: number; // ドット
    };
    readonly VALUE: {
      readonly ORIGINAL: string;
      readonly DOT: string;
    };
  };
  readonly PAYMENT_TERM: {
    readonly CODE: {
      readonly AFTER_1_MONTHS: number; // 翌月
      readonly AFTER_2_MONTHS: number; // 翌々月
      readonly AFTER_3_MONTHS: number; // 3ヶ月後
      readonly CURRENT_MONTH: number; // 当月
    };
    readonly VALUE: {
      readonly AFTER_1_MONTHS: string;
      readonly AFTER_2_MONTHS: string;
      readonly AFTER_3_MONTHS: string;
      readonly CURRENT_MONTH: string;
    };
  };
};

export const clientConst: ClientConst = {
  CHARACTER_LIMITS: {
    NAME_MAX_LENGTH: '25',
    NAME_KANA_MAX_LENGTH: '25',
    CLIENT_CD_MAX_LENGTH: '8',
    BILLING_CD_MAX_LENGTH: '8',
    PIC_NAME_MAX_LENGTH: '25',
    PIC_NAME_KANA_MAX_LENGTH: '25',
    POSTAL_CODE_MAX_LENGTH: '7',
    POSTAL_CODE_MIN_LENGTH: '7',
    PROVINCE_MAX_LENGTH: '4',
    LOCALITY_MAX_LENGTH: '20',
    STREET_ADDRESS_MAX_LENGTH: '20',
    OTHER_ADDRESS_MAX_LENGTH: '20',
    MAIL_MAX_LENGTH: '255',
    TEL_MAX_LENGTH: '16',
    FAX_MAX_LENGTH: '16',
    CREDIT_MAX_LENGTH: '12',
    LINE_NUM_MAX_LENGTH: '3',
    CUSTOM_TITLE_MAX_LENGTH: '3',
    REMARKS_1_MAX_LENGTH: '20',
    REMARKS_2_MAX_LENGTH: '20',
  },
  TITLE: {
    CODE: {
      ORGANIZATION: 0,
      INDIVIDUAL: 1,
      USER_SPECIFIED: 2,
    },
    VALUE: {
      ORGANIZATION: '御中',
      INDIVIDUAL: '様',
      USER_SPECIFIED: '指定',
    },
  },
  PAYMENT_DIVISION: {
    CODE: {
      ACCOUNTS_RECEIVABLE: 0,
      CASH: 1,
    },
    VALUE: {
      ACCOUNTS_RECEIVABLE: '売掛',
      CASH: '現金',
    },
  },
  SALES_TAX_DIVISION: {
    CODE: {
      TAX_EXCLUDED: 1,
      TAX_INCLUDED: 2,
      NON_TAXABLE: 3,
    },
    VALUE: {
      TAX_EXCLUDED: '外税',
      TAX_INCLUDED: '内税',
      NON_TAXABLE: '非課税',
    },
  },
  SALES_TAX_CALC_DIVISION: {
    CODE: {
      MONTHLY: 0,
      SLIP_UNIT: 1,
    },
    VALUE: {
      MONTHLY: '月単位',
      SLIP_UNIT: '伝票単位',
    },
  },
  SALES_FRACTION: {
    CODE: {
      ROUND_DOWN: 1,
      ROUND_UP: 2,
      ROUND_HALF_UP: 3,
    },
    VALUE: {
      ROUND_DOWN: '切り捨て',
      ROUND_UP: '切り上げ',
      ROUND_HALF_UP: '四捨五入',
    },
  },
  SALES_TAX_FRACTION: {
    CODE: {
      ROUND_DOWN: 1,
      ROUND_UP: 2,
      ROUND_HALF_UP: 3,
    },
    VALUE: {
      ROUND_DOWN: '切り捨て',
      ROUND_UP: '切り上げ',
      ROUND_HALF_UP: '四捨五入',
    },
  },
  PRINT: {
    CODE: {
      ORIGINAL: 0,
      DOT: 1,
    },
    VALUE: {
      ORIGINAL: 'オリジナル',
      DOT: 'ドット',
    },
  },
  PAYMENT_TERM: {
    CODE: {
      AFTER_1_MONTHS: 1,
      AFTER_2_MONTHS: 2,
      AFTER_3_MONTHS: 3,
      CURRENT_MONTH: 4,
    },
    VALUE: {
      AFTER_1_MONTHS: '翌月',
      AFTER_2_MONTHS: '翌々月',
      AFTER_3_MONTHS: '3か月後',
      CURRENT_MONTH: '当月',
    },
  },
};
