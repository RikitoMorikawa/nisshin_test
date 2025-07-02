import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { PaymentDetailApiResponse } from 'src/app/models/payment-detail';
import { PaymentDetailService } from 'src/app/services/payment-detail.service';

/**
 * フォームのインターフェイス
 */
export interface PaymentClearingAddDetailForm extends FormGroup {
  controls: {
    [x: string]: FormControl<any>;
    id: FormControl;
    payment_supplier_id: FormControl;
    payment_supplier_name: FormControl;
    scheduled_payment_amount: FormControl;
    payment_id: FormControl;
    payment_type_division_code: FormControl;
    payment_amount: FormControl;
    payment_date: FormControl;
    remarks_1: FormControl;
  };
}

export type PaymentAddDetail = {
  id: '';
  payment_supplier_id: '';
  payment_supplier_name: '';
  scheduled_payment_amount: '';
  payment_id: '';
  payment_type_division_code: '';
  payment_amount: '';
  payment_date: '';
  remarks_1: '';
};

/**
 * カスタムタグ入力フォームのコンポーネント
 */
@Component({
  selector: 'app-payment-clearing-add-detail',
  templateUrl: './payment-clearing-detail.component.html',
  styleUrls: ['./payment-clearing-detail.component.scss'],
})
export class PaymentClearingAddDetailComponent implements OnInit {
  @Input() itemsId?: number;
  @Input() paymentDate?: FormControl<string | null>;
  @Input() formArray!: FormArray<PaymentClearingAddDetailForm>;
  @Input() delArray!: FormArray<PaymentClearingAddDetailForm>;
  @Output() err = new EventEmitter<HttpErrorResponse>();
  paymentDetail: PaymentAddDetail[] = [];

  private template = {
    id: '',
    payment_id: '',
    payment_supplier_id: '',
    payment_supplier_name: '',
    scheduled_payment_amount: '',
    payment_type_division_code: '',
    payment_amount: '',
    payment_date: '',
    remarks_1: '',
  } as const;

  /**
   * コンストラクタ
   */
  constructor(private fb: FormBuilder) {}

  /**
   * コンポーネントの初期化処理。
   */
  ngOnInit(): void {
    this.delArray.removeAt(0);
  }

  /**
   * フォーム配列を追加
   */
  addTagForm() {
    this.formArray.push(this.fb.group(this.template));
  }

  /**
   * フォーム配列からフォームを削除
   * @param index 削除するフォームのインデックス
   */
  removeTagForm(index: number) {
    this.delArray.push(this.formArray.at(index));
    this.formArray.removeAt(index);
  }

  /**
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`DepositDetailApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (error: HttpErrorResponse) => {
      this.err.emit(error);
      return of({} as PaymentDetailApiResponse);
    };
  }
}
