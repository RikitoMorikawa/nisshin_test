import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, of, Subscription } from 'rxjs';
import {
  PaymentDetail,
  PaymentDetailApiResponse,
} from 'src/app/models/payment-detail';
import { PaymentDetailService } from 'src/app/services/payment-detail.service';

/**
 * フォームのインターフェイス
 */
export interface PaymentClearingDetailForm extends FormGroup {
  controls: {
    id: FormControl;
    payment_id: FormControl;
    payment_type_division_code: FormControl;
    payment_amount: FormControl;
    scheduled_payment_amount: FormControl;
    payment_date: FormControl;
    remarks_1: FormControl;
  };
}

/**
 * カスタムタグ入力フォームのコンポーネント
 */
@Component({
  selector: 'app-payment-clearing-detail',
  templateUrl: './payment-clearing-detail.component.html',
  styleUrls: ['./payment-clearing-detail.component.scss'],
})
export class PaymentClearingDetailComponent implements OnInit {
  @Input() itemsId?: number;
  @Input() formArray!: FormArray<PaymentClearingDetailForm>;
  @Input() delArray!: FormArray<PaymentClearingDetailForm>;
  @Output() err = new EventEmitter<HttpErrorResponse>();
  paymentDetail: PaymentDetail[] = [];
  private template = {
    id: '',
    payment_id: '',
    payment_type_division_code: '',
    payment_amount: '',
    scheduled_payment_amount: '',
    payment_date: '',
    remarks_1: '',
  } as const;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private paymentDetailService: PaymentDetailService
  ) {}
  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  /**
   * コンポーネントの初期化処理。
   */
  ngOnInit(): void {
    console.log(this.paymentDetail);
    this.delArray.removeAt(0);
    this.subscription.add(
      this.paymentDetailService
        .getAll({ id: this.itemsId })
        .pipe(catchError(this.handleError()))
        .subscribe((res) => {
          console.log(this.itemsId);
          this.paymentDetail = res.data;
          console.log(res.data);
        })
    );
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
    console.log(this.formArray);
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
