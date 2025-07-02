import { FormGroup } from '@angular/forms';
import { Rental } from '../models/rental';
import { RentalProduct } from '../models/rental-product';

interface EditFormControls {
  rental_product_id: string;
  rental_fee: string;
  delivery_division_id: string;
  collection_division_id: string;
  scheduledDateGroup: {
    scheduled_rental_date: string;
    scheduled_return_date: string;
  };
  dateGroup: {
    rental_date: string;
    return_date: string;
  };
  late_return_reported: string;
  settle_status_division_id: string;
  grace_period_end: string;
  remarks_1: string;
  remarks_2: string;
}

export function setDataForRentalEditForm(
  formGroup: FormGroup,
  rental: Rental,
  rentalProduct: RentalProduct
) {
  if (formGroup === null || formGroup === undefined) {
    return null;
  }
  if (
    rental === null ||
    rental === undefined ||
    Object.keys(rental).length > 0
  ) {
    return null;
  }
  if (
    rentalProduct === null ||
    rentalProduct === undefined ||
    Object.keys(rentalProduct).length > 0
  ) {
    return null;
  }

  // 選択中のレンタル商品が配送料金かどうかのフラグを取得
  const selectedProductDeliveryChargeFlag = rentalProduct.delivery_charge_flag;

  // 配送料金と通常商品で共通の項目をセット
  formGroup.controls['rental_fee'].setValue(rental.rental_fee);
  formGroup.controls['remarks_1'].setValue(rental.remarks_1);
  formGroup.controls['remarks_1'].setValue(rental.remarks_1);

  // 選択中のレンタル商品が配送料金の場合
  if (selectedProductDeliveryChargeFlag) {
    return formGroup;
  }

  // 選択中のレンタル商品が配送料金でない場合
  formGroup.controls['rental_fee'].setValue(rental.rental_fee);
}
