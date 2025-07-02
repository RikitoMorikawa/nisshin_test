import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CustomValidators } from 'src/app/app-custom-validator';
import { regExConst } from 'src/app/const/regex.const';
import { Rental } from 'src/app/models/rental';
import { RentalProduct } from 'src/app/models/rental-product';
import { rentalSlipConst } from 'src/app/const/rental-slip.const';

export type RentalSlipFormType = {
  store_id: FormControl;
  reception_employee_id: FormControl;
  reception_tag: FormControl;
  reception_date: FormControl;
  remarks_1: FormControl;
  remarks_2: FormControl;
  send_sms_flg: FormControl;
  mobile_number: FormControl;
  shipping_address: FormControl;
  status_division_id: FormControl;
  customerTypeGroup: FormGroup<{
    client_id: FormControl;
    client_name: FormControl; // サジェスト用
    api_member_cd: FormControl;
    api_member_tel: FormControl;
    member_id: FormControl;
    full_name: FormControl; // サジェスト用
  }>;
  customer_type_division_id: FormControl;
  settle_status_division_id: FormControl;
  incident_division_id: FormControl;
  last_name: FormControl;
  first_name: FormControl;
  last_name_kana: FormControl;
  first_name_kana: FormControl;
  tel: FormControl;
  identification_document_confirmation_date: FormControl;
  idConfirmationDate: FormControl;
};

export type RentalSlipClientFormType = {
  store_id: FormControl;
  client_id: FormControl;
  client_name: FormControl; // サジェスト用
  full_name: FormControl; // サジェスト用
  reception_employee_id: FormControl;
  reception_tag: FormControl;
  reception_date: FormControl;
  remarks_1: FormControl;
  remarks_2: FormControl;
  send_sms_flg: FormControl;
  mobile_number: FormControl;
  shipping_address: FormControl;
  status_division_id: FormControl;
  customer_type_division_id: FormControl;
  settle_status_division_id: FormControl;
  incident_division_id: FormControl;
  idConfirmationDate: FormControl;
};
export type RentalSlipminimumFormType = {
  store_id: FormControl;
  reception_employee_id: FormControl;
  reception_tag: FormControl;
  reception_date: FormControl;
  remarks_1: FormControl;
  remarks_2: FormControl;
  send_sms_flg: FormControl;
  mobile_number: FormControl;
  customer_type_division_id: FormControl;
};

export type RentalSlipMemberFormType = {
  store_id: FormControl;
  api_member_id: FormControl;
  api_member_tel: FormControl;
  member_id: FormControl;
  full_name: FormControl; // サジェスト用
  reception_employee_id: FormControl;
  reception_tag: FormControl;
  reception_date: FormControl;
  remarks_1: FormControl;
  remarks_2: FormControl;
  send_sms_flg: FormControl;
  mobile_number: FormControl;
  shipping_address: FormControl;
  status_division_id: FormControl;
  customer_type_division_id: FormControl;
  settle_status_division_id: FormControl;
  incident_division_id: FormControl;
  idConfirmationDate: FormControl;
};

export type RentalSlipGeneralFormType = {
  store_id: FormControl;
  last_name: FormControl;
  first_name: FormControl;
  last_name_kana: FormControl;
  first_name_kana: FormControl;
  tel: FormControl;
  reception_employee_id: FormControl;
  reception_tag: FormControl;
  reception_date: FormControl;
  remarks_1: FormControl;
  remarks_2: FormControl;
  send_sms_flg: FormControl;
  mobile_number: FormControl;
  shipping_address: FormControl;
  status_division_id: FormControl;
  customer_type_division_id: FormControl;
  settle_status_division_id: FormControl;
  incident_division_id: FormControl;
  identification_document_confirmation_date: FormControl;
  idConfirmationDate: FormControl;
};

export type StatusFormType = {
  status_division_id: FormControl;
  reception_employee_id: FormControl;
  reception_tag: FormControl;
  processing_units: FormControl;
};

export type BulkFormType = {
  scheduled_rental_date: FormControl;
  scheduled_return_date: FormControl;
  rental_date: FormControl;
  return_date: FormControl;
  scheduledDateGroup: FormGroup<{
    scheduled_rental_date: FormControl;
    scheduled_return_date: FormControl;
  }>;
  dateGroup: FormGroup<{
    rental_date: FormControl;
    return_date: FormControl;
  }>;
  rental_employee_id: FormControl;
  return_employee_id: FormControl;
  late_return_reported: FormControl;
};

export type AddFormType = {
  id: FormControl; // サジェスト用
  name: FormControl; // サジェスト用
  rental_product_id: FormControl;
  rental_fee: FormControl;
  delivery_division_id: FormControl;
  collection_division_id: FormControl;
  scheduledDateGroup: FormGroup<{
    scheduled_rental_date: FormControl;
    scheduled_return_date: FormControl;
  }>;
  remarks_1: FormControl;
  remarks_2: FormControl;
};

export type RentalAddFormType = {
  rental_product_id: FormControl;
  rental_product_name: FormControl; // 一覧表示用
  selling_price: FormControl; // 一覧表示用
  division_status_value: FormControl; // 一覧表示用
  rental_fee: FormControl;
  delivery_division_id: FormControl;
  collection_division_id: FormControl;
  scheduledDateGroup: FormGroup<{
    scheduled_rental_date: FormControl;
    scheduled_return_date: FormControl;
  }>;
  remarks_1: FormControl;
  remarks_2: FormControl;
};

export type RentalAddEditFormType = {
  id: FormControl;
  rental_product_id: FormControl;
  rental_product_name: FormControl; // 一覧表示用
  selling_price: FormControl; // 一覧表示用
  division_status_value: FormControl; // 一覧表示用
  rental_fee: FormControl;
  delivery_division_id: FormControl;
  collection_division_id: FormControl;
  scheduledDateGroup: FormGroup<{
    scheduled_rental_date: FormControl;
    scheduled_return_date: FormControl;
  }>;
  remarks_1: FormControl;
  remarks_2: FormControl;
};

export type RentalAddFormInitialValueType = {
  rental_product_id: number;
  rental_product_name: string; // 一覧表示用
  rental_date?: string; // 貸出日
  rental_item_count: number; // レンタル個数
  delinquency_flag: number; // 延滞フラグ
  selling_price: number; // 一覧表示用
  division_status_value: string; // 一覧表示用
  rental_fee?: number;
  delivery_division_id?: number;
  collection_division_id?: number;
  scheduledDateGroup?: {
    scheduled_rental_date?: string;
    scheduled_return_date?: string;
  };
  remarks_1?: string;
  remarks_2?: string;
};

export type EditFormType = {
  rental_product_id: FormControl;
  rental_fee: FormControl;
  delivery_division_id: FormControl;
  delivery_price: FormControl;
  collection_division_id: FormControl;
  scheduledDateGroup: FormGroup<{
    scheduled_rental_date: FormControl;
    scheduled_return_date: FormControl;
  }>;
  dateGroup: FormGroup<{
    rental_date: FormControl;
    return_date: FormControl;
  }>;
  late_return_reported: FormControl;
  settle_status_division_id: FormControl;
  grace_period_end: FormControl;
  remarks_1: FormControl;
  remarks_2: FormControl;
  rental_employee_id: FormControl;
  return_employee_id: FormControl;
  late_fee: FormControl;
  refund_fee: FormControl;
};

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor() {}

  createMinimumRentalSlipForm(
    fb: FormBuilder
  ): FormGroup<RentalSlipminimumFormType> {
    return fb.group({
      store_id: ['', [Validators.required]],
      reception_employee_id: ['', [Validators.required]],
      reception_tag: [''],
      reception_date: ['', [Validators.required]],
      remarks_1: ['', [Validators.maxLength(255)]],
      remarks_2: ['', [Validators.maxLength(255)]],
      send_sms_flg: [''],
      mobile_number: ['', [Validators.maxLength(20)]],
      customer_type_division_id: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
    });
  }
  /**
   * レンタル受付票のフォームグループを作成する
   * @param fb
   * @returns フォームグループ FormGroup
   */
  createRentalSlipForm(fb: FormBuilder): FormGroup<RentalSlipFormType> {
    return fb.group({
      store_id: ['', [Validators.required]],
      reception_employee_id: ['', [Validators.required]],
      reception_tag: [''],
      reception_date: ['', [Validators.required]],
      remarks_1: ['', [Validators.maxLength(255)]],
      remarks_2: ['', [Validators.maxLength(255)]],
      send_sms_flg: [''],
      mobile_number: ['', [Validators.maxLength(20)]],
      shipping_address: ['', [Validators.maxLength(255)]],
      status_division_id: ['', [Validators.required]],
      customerTypeGroup: fb.group({
        client_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
        client_name: [''],
        api_member_cd: [''],
        api_member_tel: [''],
        member_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
        full_name: [''],
      }),
      customer_type_division_id: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      settle_status_division_id: ['', [Validators.required]],
      incident_division_id: ['', [Validators.required]],
      //以下一般ユーザー
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      first_name: ['', [Validators.maxLength(255)]],
      last_name_kana: [
        '',
        [
          Validators.maxLength(255),
          Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
        ],
      ],
      first_name_kana: [
        '',
        [
          Validators.maxLength(255),
          Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
        ],
      ],
      tel: [
        '',
        [
          Validators.required,
          Validators.maxLength(14),
          Validators.pattern(regExConst.NUMERIC_REG_EX),
        ],
      ],
      identification_document_confirmation_date: [''],
      idConfirmationDate: [''],
    });
  }

  /**
   * レンタル受付票のステータス更新用フォームグループを作成する
   * @param fb FormBuilder
   * @returns フォームグループ FormGroup
   */
  createStatusForm(fb: FormBuilder): FormGroup<StatusFormType> {
    return fb.group({
      status_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      reception_employee_id: ['', [Validators.required]],
      reception_tag: ['', [Validators.required]],
      processing_units: ['', [Validators.required]],
    });
  }

  /**
   * レンタル受付票のフォームグループを作成する
   * @param fb
   * @returns フォームグループ FormGroup
   */
  createAnyRentalSlipForm(fb: FormBuilder, type_code: number): FormGroup<any> {
    let default_group = {
      store_id: ['', [Validators.required]],
      reception_employee_id: ['', [Validators.required]],
      reception_tag: [''],
      reception_date: ['', [Validators.required]],
      remarks_1: ['', [Validators.maxLength(255)]],
      remarks_2: ['', [Validators.maxLength(255)]],
      send_sms_flg: [''],
      mobile_number: ['', [Validators.maxLength(20)]],
      shipping_address: ['', [Validators.maxLength(255)]],
      status_division_id: ['', [Validators.required]],
      customer_type_division_id: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      settle_status_division_id: ['', [Validators.required]],
      incident_division_id: ['', [Validators.required]],
      idConfirmationDate: [''],
    };

    let client_form = {
      client_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      client_name: [''],
    };
    let member_form = {
      api_member_id: [''],
      api_member_tel: [''],
      member_id: ['', [Validators.pattern(regExConst.NUMERIC_REG_EX)]],
      full_name: [''],
    };
    let general_form = {
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      first_name: ['', [Validators.maxLength(255)]],
      last_name_kana: [
        '',
        [
          Validators.maxLength(255),
          Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
        ],
      ],
      first_name_kana: [
        '',
        [
          Validators.maxLength(255),
          Validators.pattern(regExConst.FULL_WIDTH_KATAKANA_REG_EX),
        ],
      ],
      tel: [
        '',
        [
          Validators.required,
          Validators.maxLength(16),
          Validators.pattern(regExConst.NUMERIC_REG_EX),
        ],
      ],
      identification_document_confirmation_date: [''],
    };
    let allObj = {};
    if (type_code === rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.MEMBER) {
      allObj = Object.assign({}, default_group, member_form);
    } else if (
      type_code === rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.CLIENT
    ) {
      allObj = Object.assign({}, default_group, client_form);
    } else if (
      type_code === rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL
    ) {
      allObj = Object.assign({}, default_group, general_form);
    }

    return fb.group(allObj);
  }

  /**
   * レンタル受付票のステータス更新用フォームグループを作成する
   * @param fb FormBuilder
   * @returns フォームグループ FormGroup
   */
  createBulkForm(fb: FormBuilder): FormGroup<BulkFormType> {
    return fb.group({
      scheduled_rental_date: ['', [Validators.required]],
      scheduled_return_date: ['', [Validators.required]],
      rental_date: [''],
      return_date: [''],
      // 予定日グループ
      scheduledDateGroup: fb.group(
        {
          // 貸出予定日
          scheduled_rental_date: ['', [Validators.required]],
          // 返却予定日
          scheduled_return_date: ['', [Validators.required]],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      dateGroup: fb.group(
        {
          // 貸出予定日
          rental_date: [''],
          // 返却予定日
          return_date: [''],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      rental_employee_id: [''],
      return_employee_id: [''],
      late_return_reported: [''],
    });
  }

  /**
   * レンタル受付票のステータス更新用フォームグループを作成する
   * @param fb FormBuilder
   * @returns フォームグループ FormGroup
   */
  createDiffForm(fb: FormBuilder): FormGroup<BulkFormType> {
    return fb.group({
      scheduled_rental_date: ['', [Validators.required]],
      scheduled_return_date: ['', [Validators.required]],
      rental_date: [''],
      return_date: [''],
      // 予定日グループ
      scheduledDateGroup: fb.group(
        {
          // 貸出予定日
          scheduled_rental_date: ['', [Validators.required]],
          // 返却予定日
          scheduled_return_date: ['', [Validators.required]],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      dateGroup: fb.group(
        {
          // 貸出予定日
          rental_date: [''],
          // 返却予定日
          return_date: [''],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      rental_employee_id: [''],
      return_employee_id: [''],
      late_return_reported: [''],
    });
  }

  /**
   * レンタル明細の追加用フォームグループを作成する
   * @param fb FormBuilder
   * @returns フォームグループ FormGroup
   */
  createAddForm(fb: FormBuilder): FormGroup<AddFormType> {
    return fb.group({
      // レンタル商品ID、サジェストで利用するための項目
      id: [''],
      // レンタル商品名、サジェストで利用するための項目
      name: [''],
      // レンタル商品ID
      rental_product_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // レンタル料金
      rental_fee: [
        '',
        [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.min(1)],
      ],
      // 配送区分ID
      delivery_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 回収区分ID
      collection_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 予定日グループ
      scheduledDateGroup: fb.group(
        {
          // 貸出予定日
          scheduled_rental_date: ['', [Validators.required]],
          // 返却予定日
          scheduled_return_date: ['', [Validators.required]],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      // 備考1
      remarks_1: [''],
      // 備考2
      remarks_2: [''],
    });
  }

  /**
   * レンタル明細の追加用フォームグループを作成する
   * @param fb FormBuilder
   * @param initialValues フォームの初期値
   * @returns フォームグループ FormGroup
   */
  // createRentalAddForm(fb: FormBuilder, initialValues: RentalAddFormInitialValueType): FormGroup<RentalAddFormType> {
  //   return fb.group({
  //     // レンタル商品ID
  //     rental_product_id: [
  //       initialValues.rental_product_id || '',
  //       [
  //         Validators.required,
  //         Validators.pattern(regExConst.NUMERIC_REG_EX),
  //         Validators.maxLength(11),
  //       ],
  //     ],
  //     // レンタル商品名
  //     rental_product_name: [
  //       initialValues.rental_product_name || '',
  //       [Validators.required, Validators.maxLength(255)],
  //     ],
  //     // 基本料金
  //     selling_price: [
  //       initialValues.selling_price || '',
  //       [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
  //     ],
  //     // レンタル状態
  //     division_status_value: [
  //       initialValues.division_status_value || '',
  //       [Validators.required, Validators.maxLength(255)],
  //     ],
  //     // レンタル料金
  //     rental_fee: [
  //       initialValues.rental_fee || '',
  //       [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.min(1)],
  //     ],
  //     // 配送区分ID
  //     delivery_division_id: [
  //       initialValues.delivery_division_id || '',
  //       [
  //         Validators.required,
  //         Validators.pattern(regExConst.NUMERIC_REG_EX),
  //         Validators.maxLength(11),
  //       ],
  //     ],
  //     // 回収区分ID
  //     collection_division_id: [
  //       initialValues.collection_division_id || '',
  //       [
  //         Validators.required,
  //         Validators.pattern(regExConst.NUMERIC_REG_EX),
  //         Validators.maxLength(11),
  //       ],
  //     ],
  //     // 予定日グループ
  //     scheduledDateGroup: fb.group(
  //       {
  //         // 貸出予定日
  //         scheduled_rental_date: [ initialValues.scheduledDateGroup?.scheduled_rental_date || '', [Validators.required]],
  //         // 返却予定日
  //         scheduled_return_date: [ initialValues.scheduledDateGroup?.scheduled_rental_date || '', [Validators.required]],
  //       },
  //       {
  //         validators: [
  //           CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
  //             'scheduled_rental_date',
  //             'scheduled_return_date'
  //           ),
  //         ],
  //       }
  //     ),
  //     // 備考1
  //     remarks_1: [ initialValues.remarks_1 || ''],
  //     // 備考2
  //     remarks_2: [ initialValues.remarks_2 || ''],
  //   });
  // }

  /**
   * レンタル明細の追加用フォームグループを作成する
   * @param fb FormBuilder
   * @param initialValues フォームの初期値
   * @returns フォームグループ FormGroup
   */
  createRentalAddForm(fb: FormBuilder): FormGroup<RentalAddFormType> {
    return fb.group({
      // レンタル商品ID
      rental_product_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // レンタル商品名
      rental_product_name: [
        '',
        [Validators.required, Validators.maxLength(255)],
      ],
      // 基本料金
      selling_price: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      // レンタル状態
      division_status_value: [
        '',
        [Validators.required, Validators.maxLength(255)],
      ],
      // レンタル料金
      rental_fee: [
        '',
        [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.min(1)],
      ],
      // 配送区分ID
      delivery_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 回収区分ID
      collection_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 予定日グループ
      scheduledDateGroup: fb.group(
        {
          // 貸出予定日
          scheduled_rental_date: ['', [Validators.required]],
          // 返却予定日
          scheduled_return_date: ['', [Validators.required]],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      // 備考1
      remarks_1: [''],
      // 備考2
      remarks_2: [''],
    });
  }

  /**
   * レンタル明細の追加用フォームグループを作成する
   * @param fb FormBuilder
   * @param initialValues フォームの初期値
   * @returns フォームグループ FormGroup
   */
  createRentalEditAddForm(fb: FormBuilder): FormGroup<RentalAddEditFormType> {
    return fb.group({
      id: [''],
      // レンタル商品ID
      rental_product_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // レンタル商品名
      rental_product_name: [
        '',
        [Validators.required, Validators.maxLength(255)],
      ],
      // 基本料金
      selling_price: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      // レンタル状態
      division_status_value: [
        '',
        [Validators.required, Validators.maxLength(255)],
      ],
      // レンタル料金
      rental_fee: [
        '',
        [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.min(1)],
      ],
      // 配送区分ID
      delivery_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 回収区分ID
      collection_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 予定日グループ
      scheduledDateGroup: fb.group(
        {
          // 貸出予定日
          scheduled_rental_date: ['', [Validators.required]],
          // 返却予定日
          scheduled_return_date: ['', [Validators.required]],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      // 備考1
      remarks_1: [''],
      // 備考2
      remarks_2: [''],
    });
  }

  /**
   * レンタル明細の編集用フォームグループを作成する
   * @param fb FormBuilder
   * @returns フォームグループ FormGroup
   */
  createEditForm(fb: FormBuilder): FormGroup<EditFormType> {
    return fb.group({
      // レンタル商品ID
      rental_product_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // レンタル料金
      rental_fee: [
        '',
        [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.min(1)],
      ],
      // 配送区分ID
      delivery_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      delivery_price: [''],
      // 回収区分ID
      collection_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      // 予定日グループ
      scheduledDateGroup: fb.group(
        {
          // 貸出予定日
          scheduled_rental_date: ['', [Validators.required]],
          // 返却予定日
          scheduled_return_date: ['', [Validators.required]],
        },
        {
          validators: [
            CustomValidators.isStartDateGreaterThanOrEqualToEndDate(
              'scheduled_rental_date',
              'scheduled_return_date'
            ),
          ],
        }
      ),
      // 実際の貸出日と返却日グループ
      dateGroup: fb.group({
        // 実際の貸出日
        rental_date: [''],
        // 実際の返却日
        return_date: [''],
      }),
      // 遅延返却の連絡の有無
      late_return_reported: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      // 精算区分ID
      settle_status_division_id: [''],
      // 遅延連絡ありの場合の猶予期間終了時間
      grace_period_end: [''],
      // 備考1
      remarks_1: [''],
      // 備考2
      remarks_2: [''],
      rental_employee_id: [''],
      return_employee_id: [''],
      late_fee: [''],
      refund_fee: [''],
    });
  }

  /**
   * レンタル明細追加用フォームをリセットする
   * @param formGroup FormGroup<AddFormType>
   */
  resetAddForm(formGroup: FormGroup<AddFormType>) {
    formGroup.reset({
      id: '',
      name: '',
      rental_product_id: '',
      rental_fee: '',
      delivery_division_id: '',
      collection_division_id: '',
      scheduledDateGroup: {
        scheduled_rental_date: '',
        scheduled_return_date: '',
      },
      remarks_1: '',
      remarks_2: '',
    });
  }

  /**
   * レンタル明細更新用フォームをリセットする
   * @param formGroup FormGroup<EditFormType>
   */
  resetEditForm(formGroup: FormGroup<EditFormType>) {
    formGroup.reset({
      rental_product_id: '',
      rental_fee: '',
      delivery_division_id: '',
      delivery_price: '',
      collection_division_id: '',
      scheduledDateGroup: {
        scheduled_rental_date: '',
        scheduled_return_date: '',
      },
      dateGroup: {
        rental_date: '',
        return_date: '',
      },
      late_return_reported: '',
      settle_status_division_id: '',
      grace_period_end: '',
      remarks_1: '',
      remarks_2: '',
    });
  }

  /**
   * レンタル明細更新用フォームにデータをセットする
   *
   * @param formGroup FormGroup<EditFormType>
   * @param rental Rental
   */
  setEditFormData(formGroup: FormGroup<EditFormType>, rental: Rental) {
    try {
      formGroup.reset(
        {
          rental_product_id: String(rental.rental_product_id),
          rental_fee: String(rental.rental_fee),
          delivery_division_id: String(rental.delivery_division_id),
          delivery_price: String(rental.delivery_price),
          collection_division_id: String(rental.collection_division_id),
          scheduledDateGroup: {
            scheduled_rental_date: new Date(
              rental.scheduled_rental_date
            ).toISOString(),
            scheduled_return_date: new Date(
              rental.scheduled_return_date
            ).toISOString(),
          },
          dateGroup: {
            // 必須項目ではないので値がない場合は空文字をセットしないとエラーになる
            rental_date: rental.rental_date
              ? new Date(rental.rental_date).toISOString()
              : '',
            return_date: rental.return_date
              ? new Date(rental.return_date).toISOString()
              : '',
          },
          late_return_reported: String(rental.late_return_reported),
          settle_status_division_id: String(rental.settle_status_division_id),
          grace_period_end: String(rental.grace_period_end),
          remarks_1: rental.remarks_1,
          remarks_2: rental.remarks_2,
        },
        {
          emitEvent: false,
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        // 元のエラーオブジェクトを再スローする
        throw error;
      } else {
        // 不明なエラータイプの場合、コンソールにログを出力
        console.error('Unexpected error:', error);
        // 新しいエラーを投げる
        throw new Error(
          'レンタル商品更新のためのフォームデータのセットに失敗しました。'
        );
      }
    }
  }

  /**
   * 選択中のレンタル商品が配送料金かどうかでバリデーション追加・削除を行う
   */
  changeValidatorsForRentalFeeControl(
    fc: AddFormType | EditFormType,
    rentalProduct: RentalProduct
  ) {
    const selectedProductDeliveryChargeFlag =
      rentalProduct.delivery_charge_flag;

    // 選択中のレンタル商品が配送料金かどうかでバリデーション追加・削除を行う
    if (selectedProductDeliveryChargeFlag) {
      // 配送料金の場合
      // 配送料金へ必須バリデーションを追加
      fc.rental_fee.addValidators([Validators.required]);
      // バリデータが適用された後、コントロールのバリデーション状態を更新
      fc.rental_fee.updateValueAndValidity();
    } else {
      // 配送料金以外の場合
      // 配送料金から必須バリデーションを削除
      fc.rental_fee.removeValidators([Validators.required]);
      // バリデータが適用された後、コントロールのバリデーション状態を更新
      fc.rental_fee.updateValueAndValidity();
    }
  }
}
