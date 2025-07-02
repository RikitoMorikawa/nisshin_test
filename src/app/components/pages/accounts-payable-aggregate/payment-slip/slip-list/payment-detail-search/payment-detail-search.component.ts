import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  Input,
  EventEmitter,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { CustomValidators } from 'src/app/app-custom-validator';
import { TableData } from 'src/app/components/atoms/table/table.component';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  flattingFormValue,
  convertToJpDate,
} from 'src/app/functions/shared-functions';

@Component({
  selector: 'app-payment-detail-search',
  templateUrl: './payment-detail-search.component.html',
  styleUrls: ['./payment-detail-search.component.scss'],
})
export class PaymentDetailSearchComponent implements OnInit, OnChanges {
  @Output() event = new EventEmitter();
  @Input() paymentDetailsOrg!: TableData[][];

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // 商品選択肢
  productSuggests!: SelectOption[];

  /**
   * コンストラクタ
   *
   * @param fb
   * @param flashMessageService
   */
  constructor(private fb: FormBuilder) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  // エラー文言
  errorConst = errorConst;
  regExConst = regExConst;

  // フォーム関連
  searchForm = this.fb.group({
    product_name: '',
    payment_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });

  get ctrls() {
    return this.searchForm.controls;
  }

  get fc() {
    return this.searchForm.controls;
  }

  ngOnInit(): void {
    // TODO: ダミー
    console.log('ngOnInit this.paymentDetailsOrg:: ', this.paymentDetailsOrg);
    if (this.paymentDetailsOrg !== undefined) {
      const a = this.paymentDetailsOrg.forEach((res) => {
        console.log(res);
        return {
          value: res[1],
          text: res[1],
        };
        // const ret = res.data.map((x) => ({
        //   value: x.id,
        //   text: x.name,
        // }));
        // return ret;
      });
      console.log(a);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['paymentDetailsOrg'] &&
      changes['paymentDetailsOrg'].currentValue
    ) {
      this.updateProductSuggests();
    }
  }

  private updateProductSuggests() {
    this.productSuggests = this.paymentDetailsOrg.map((paymentDetail) => ({
      value: paymentDetail[2] as string,
      text: paymentDetail[2] as string,
    }));
    console.log('Updated productSuggests:: ', this.productSuggests);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * パネル開閉ボタンクリック時の処理
   */
  searchButtonOnClick() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  /**
   * 「絞り込みクリア」ボタンクリック時の処理
   */
  onClickReset() {
    this.searchForm.reset({
      payment_date: {
        from: '',
        to: '',
      },
    });
    // Object.values(this.ctrls).forEach((x) => x.patchValue('')); // 空文字で初期化
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    this.filterPaymentDetails();
  }

  private filterPaymentDetails() {
    const flatted = flattingFormValue(
      this.removeNullsAndBlanks(this.searchForm.value)
    );
    console.log(flatted);
    const from_payment_date = (flatted as any)['from_payment_date'];
    const to_payment_date = (flatted as any)['to_payment_date'];
    const from_date = new Date(from_payment_date);
    const to_date = new Date(to_payment_date);
    const filter_product_name = (flatted as any)['product_name'];
    const filteredPaymentDetails = this.paymentDetailsOrg.filter(
      (paymentDetail) => {
        const tmpPaymentDate = (paymentDetail[1] as string)
          .replace(/ 年 /, '/')
          .replace(/ 月 /, '/')
          .replace(/ 日/, '');
        const paymentDate = new Date(tmpPaymentDate);
        const product_name = paymentDetail[2] as string;

        if (from_payment_date !== '' && paymentDate < from_date) {
          return false;
        }
        if (to_payment_date !== '' && paymentDate > to_date) {
          return false;
        }
        if (
          filter_product_name !== undefined &&
          product_name !== filter_product_name
        ) {
          return false;
        }
        return true;
      }
    );
    this.event.emit(filteredPaymentDetails);
  }

  /**
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
  }

  /**
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }
}
