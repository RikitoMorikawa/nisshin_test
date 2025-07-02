type TaxFractionConst = {
  readonly TAX_STATUS_CODE: {
    readonly TAX_EXCLUDED_10: number;
    readonly TAX_INCLUDED_10: number;
    readonly NO_TAX: number;
    readonly TAX_EXCLUDED_8: number;
    readonly TAX_INCLUDED_8: number;
  };
  readonly TAX_STATUS: {
    readonly TAX_EXCLUDED_10: string;
    readonly TAX_INCLUDED_10: string;
    readonly NO_TAX: string;
    readonly TAX_EXCLUDED_8: string;
    readonly TAX_INCLUDED_8: string;
  };
  readonly FRACTION_DIVISION_CODE: {
    readonly ROUND_DOWN: number;
    readonly ROUND_UP: number;
    readonly ROUND: number;
  };
  readonly FRACTION_DIVISION_VALUE: {
    readonly ROUND_DOWN: string;
    readonly ROUND_UP: string;
    readonly ROUND: string;
  };
  readonly FRACTION_DIVISION_METHOD: {
    readonly ROUND_DOWN: string;
    readonly ROUND_UP: string;
    readonly ROUND: string;
  };
  readonly TAX: {
    readonly TAX_EXCLUDED_10: number;
    readonly TAX_INCLUDED_10: number;
    readonly NO_TAX: number;
    readonly TAX_EXCLUDED_8: number;
    readonly TAX_INCLUDED_8: number;
  };
};

export const taxFractionConst: TaxFractionConst = {
  TAX_STATUS_CODE: {
    TAX_EXCLUDED_10: 1,
    TAX_INCLUDED_10: 2,
    NO_TAX: 3,
    TAX_EXCLUDED_8: 4,
    TAX_INCLUDED_8: 5,
  },
  TAX_STATUS: {
    TAX_EXCLUDED_10: '外税10%',
    TAX_INCLUDED_10: '内税10%',
    NO_TAX: '非課税',
    TAX_EXCLUDED_8: '外税8%',
    TAX_INCLUDED_8: '内税8%',
  },
  FRACTION_DIVISION_CODE: {
    ROUND_DOWN: 1,
    ROUND_UP: 2,
    ROUND: 3,
  },
  FRACTION_DIVISION_VALUE: {
    ROUND_DOWN: '切り捨て',
    ROUND_UP: '切り上げ',
    ROUND: '四捨五入',
  },
  FRACTION_DIVISION_METHOD: {
    ROUND_DOWN: 'floor',
    ROUND_UP: 'ceil',
    ROUND: 'round',
  },
  TAX: {
    TAX_EXCLUDED_10: 10,
    TAX_INCLUDED_10: 10,
    NO_TAX: 0,
    TAX_EXCLUDED_8: 8,
    TAX_INCLUDED_8: 8,
  },
};
