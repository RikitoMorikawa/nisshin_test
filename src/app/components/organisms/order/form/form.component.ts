import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { catchError, of, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { ProductService } from 'src/app/services/product.service';
import { OrderFn } from 'src/app/functions/order-functions';
import { HttpErrorResponse } from '@angular/common/http';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';

export interface OrderForm extends FormGroup {
  controls: {
    order_code: FormControl;
    product_id: FormControl;
    order_quantity: FormControl;
    receiving_quantity: FormControl;
    order_date: FormControl;
    receiving_date: FormControl;
    order_rep_id: FormControl;
    receiving_rep_id: FormControl;
    cancel_rep_id: FormControl;
  };
}

/**
 * 発注情報入力フォームのコンポーネント
 */
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @Input() formGroup!: OrderForm;
  @Output() addTags = new EventEmitter();
  @Output() removeTags = new EventEmitter();
  @Output() err = new EventEmitter();

  filename = '現在のロゴ画像';
  options = {} as OrderFn.Options;
  get ctrls() {
    return this.formGroup.controls;
  }

  errorConst = errorConst;
  regExConst = regExConst;
  private subscription!: Subscription;

  /**
   * コンストラクタ
   *
   * @param {DomSanitizer} sanitizer
   * @param {EmployeeService} employeeService
   * @param {ProductService} productService
   */
  constructor(
    private sanitizer: DomSanitizer,
    private employeeService: EmployeeService,
    private productService: ProductService
  ) {}

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    // 社員APIを取得し、サブスクライブ
    this.employeeService
      .getAsSelectOptions()
      .pipe(
        catchError((err) => {
          err.emit(err); // エラーを親コンポーネントへ通知
          return of(err.error);
        })
      )
      .subscribe((res) => {
        this.options.order_rep = res;
        this.options.receiving_rep = res;
        this.options.cancel_rep = res;
      });

    this.productService
      .getAsSelectOptions()
      .pipe(
        catchError((err) => {
          err.emit(err); // エラーを親コンポーネントへ通知
          return of(err.error);
        })
      )
      .subscribe((res) => {
        this.options.product = res;
      });
  }

  /**
   * コンポーネントの終了処理
   */
  //ngOnDestroy(): void {
  //  //this.subscription.unsubscribe();
  //}

  /**
   * FormControl の不正判定
   * @param ctrl 対象となる FormControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: FormControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`OrderApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (err: HttpErrorResponse) => {
      this.err.emit(err);
      return of({});
    };
  }
}
