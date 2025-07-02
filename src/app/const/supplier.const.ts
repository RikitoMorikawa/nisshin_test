export type SupplierConst = {
  readonly CHARACTER_LIMITS: {
    readonly NAME_MAX_LENGTH: string;
    readonly NAME_KANA_MAX_LENGTH: string;
    readonly PIC_NAME_MAX_LENGTH: string;
    readonly PIC_NAME_KANA_MAX_LENGTH: string;
    readonly POSTAL_CODE_MAX_LENGTH: string;
    readonly POSTAL_CODE_MIN_LENGTH: string;
    readonly PROVINCE_MAX_LENGTH: string;
    readonly LOCALITY_MAX_LENGTH: string;
    readonly STREET_ADDRESS_MAX_LENGTH: string;
    readonly OTHER_ADDRESS_MAX_LENGTH: string;
    readonly TEL_MAX_LENGTH: string;
    readonly FAX_MAX_LENGTH: string;
    readonly MAIL_MAX_LENGTH: string;
    readonly REMARKS_1_MAX_LENGTH: string;
    readonly REMARKS_2_MAX_LENGTH: string;
    readonly PAYEE_1_MAX_LENGTH: string;
    readonly PAYEE_2_MAX_LENGTH: string;
    readonly PASSWORD_MAX_LENGTH: string;
    readonly PASSWORD_MIN_LENGTH: string;
  };
};

export const supplierConst: SupplierConst = {
  CHARACTER_LIMITS: {
    NAME_MAX_LENGTH: '25',
    NAME_KANA_MAX_LENGTH: '25',
    PIC_NAME_MAX_LENGTH: '25',
    PIC_NAME_KANA_MAX_LENGTH: '25',
    POSTAL_CODE_MAX_LENGTH: '7',
    POSTAL_CODE_MIN_LENGTH: '7',
    PROVINCE_MAX_LENGTH: '4',
    LOCALITY_MAX_LENGTH: '20',
    STREET_ADDRESS_MAX_LENGTH: '20',
    OTHER_ADDRESS_MAX_LENGTH: '20',
    TEL_MAX_LENGTH: '16',
    FAX_MAX_LENGTH: '16',
    MAIL_MAX_LENGTH: '255',
    REMARKS_1_MAX_LENGTH: '255',
    REMARKS_2_MAX_LENGTH: '255',
    PAYEE_1_MAX_LENGTH: '255',
    PAYEE_2_MAX_LENGTH: '255',
    PASSWORD_MAX_LENGTH: '24',
    PASSWORD_MIN_LENGTH: '8',
  },
};
