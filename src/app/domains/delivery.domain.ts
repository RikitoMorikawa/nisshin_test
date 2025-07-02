import { Injectable } from '@angular/core';
import { RentalSlip } from 'src/app/models/rental-slip';
import { CustomerOrderReceptionSlip } from 'src/app/models/customer-order-reception-slip';
import { deliveryConst } from 'src/app/const/delivery.const';
import { Rental } from 'src/app/models/rental';

interface Customer {
  id: string;
  customer_type: string;
  customer_type_name: string;
  name: string;
  name_kana: string;
  tel: string;
  shipping_address: string;
  customer_title: string;
  cors_slip_id: number;
  rs_slip_id: number;
}

/**
 *
 * 配送のビジネスロジック
 *
 */
@Injectable({
  providedIn: 'root',
})
export class DeliveryDomain {
  // 配送用定数
  deliveryConst = deliveryConst;

  getClientId(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return String(slip.client_id);
  }

  getClientAddress(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return (
      slip.member_province +
      slip.member_locality +
      slip.member_street_address +
      slip.member_other_address
    );
  }

  getMemberId(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return String(slip.member_id);
  }

  getMemberName(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return slip.member_last_name + ' ' + slip.member_first_name;
  }

  getMemberNameKana(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return slip.member_last_name_kana + ' ' + slip.member_first_name_kana;
  }

  getMemberAddress(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return (
      slip.client_province +
      slip.client_locality +
      slip.client_street_address +
      slip.client_other_address
    );
  }

  getShippingAddress(
    slip: RentalSlip | CustomerOrderReceptionSlip,
    clientAddress: string
  ): string {
    return slip.shipping_address ? slip.shipping_address : clientAddress;
  }

  getCustomerTitle(slip: RentalSlip | CustomerOrderReceptionSlip): string {
    return slip.client_division_title_value
      ? String(slip.client_division_title_value)
      : String(slip.client_custom_title);
  }

  setClientCustomer(
    customer: Customer,
    slip: RentalSlip | CustomerOrderReceptionSlip
  ): void {
    customer.customer_type = String(
      deliveryConst.CUSTOMER_TYPE.find((x) => x.name === deliveryConst.CLIENT)
        ?.id
    );
    customer.customer_type_name = deliveryConst.CLIENT;
    customer.id = this.getClientId(slip);
    const clientAddress = this.getClientAddress(slip);
    customer.shipping_address = this.getShippingAddress(slip, clientAddress);
    customer.name = String(slip.client_name);
    customer.name_kana = String(slip.client_name_kana);
    customer.customer_title = this.getCustomerTitle(slip);
  }

  setMemberCustomer(
    customer: Customer,
    slip: RentalSlip | CustomerOrderReceptionSlip
  ): void {
    customer.customer_type = String(
      deliveryConst.CUSTOMER_TYPE.find((x) => x.name === deliveryConst.MEMBER)
        ?.id
    );
    customer.customer_type_name = deliveryConst.MEMBER;
    customer.id = this.getMemberId(slip);
    const memberAddress = this.getMemberAddress(slip);
    customer.shipping_address = this.getShippingAddress(slip, memberAddress);
    customer.name = this.getMemberName(slip);
    customer.name_kana = this.getMemberNameKana(slip);
    customer.customer_title = '様';
  }

  setGeneralCustomer(
    customer: Customer,
    slip: RentalSlip | CustomerOrderReceptionSlip
  ): void {
    customer.customer_type = String(
      deliveryConst.CUSTOMER_TYPE.find((x) => x.name === deliveryConst.GENERAL)
        ?.id
    );
    customer.customer_type_name = deliveryConst.GENERAL;
    customer.tel = String(slip.tel);
    customer.shipping_address = slip.shipping_address;
    customer.name = slip.last_name + ' ' + slip.first_name;
    customer.name_kana = slip.last_name_kana + ' ' + slip.first_name_kana;
    customer.customer_title = '様';
  }

  getDeliverySpecifiedTime(
    delivery_specified_time: any,
    hour: any,
    minute: any
  ) {
    const date = this.dateFormatter(String(delivery_specified_time));

    // 日付の部分をパース
    const dateParts = date.split('/');
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1; // JavaScriptのDateは月を0-11で表現するため、実際の月-1を行う
    const day = Number(dateParts[2]);

    // 時間と分を数値に変換
    const hourNumber = Number(hour);
    const minuteNumber = Number(minute);

    const deliverySpecifiedTime = new Date(
      year,
      month,
      day,
      hourNumber,
      minuteNumber
    ).toLocaleString();

    return deliverySpecifiedTime;
  }

  /**
   * 文字列をDateへ変換してフォーマットを整形
   * 時間以下を削除
   * @param date
   * @returns Date
   */
  dateFormatter(date: string | undefined) {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  /**
   * 配送かどうかを判定する
   */
  isRentalDelivery(rental: Rental[]): boolean {
    console.log('isRentalDelivery', rental);
    if (!rental || rental.length === 0) {
      return false;
    }
    // レンタルの中に配送が含まれているかをチェック
    // 配送が含まれている場合はtrueを返す
    // 含まれていない場合はfalseを返す
    const DELIVERY_AVAILABLE_CODE =
      deliveryConst.DELIVERY_REQUEST.CODE.DELIVERY_AVAILABLE;
    const COLLECTION_AVAILABLE_CODE =
      deliveryConst.COLLECTION_REQUEST.CODE.COLLECTION_AVAILABLE;
    for (const item of rental) {
      if (item.division_delivery_code === DELIVERY_AVAILABLE_CODE) {
        return true;
      }
      if (item.division_collection_code === COLLECTION_AVAILABLE_CODE) {
        return true;
      }
    }

    return false;
  }
}
