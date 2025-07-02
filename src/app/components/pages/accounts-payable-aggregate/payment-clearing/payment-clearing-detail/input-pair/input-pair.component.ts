import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PaymentDetail } from 'src/app/models/payment-detail';
import { PaymentClearingDetailForm } from '../payment-clearing-detail.component';
import { generalConst } from 'src/app/const/general.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { CommonService } from 'src/app/services/shared/common.service';
import { DivisionService } from 'src/app/services/division.service';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
import { divisionConst } from 'src/app/const/division.const';
import { catchError, filter, finalize } from 'rxjs/operators';
import { Subscription, forkJoin, of } from 'rxjs';
/**
 * 入金明細用の入力フォームコンポーネント
 */
@Component({
  selector: 'app-input-pair',
  templateUrl: './input-pair.component.html',
  styleUrls: ['./input-pair.component.scss'],
})
export class InputPairComponent implements OnInit {
  // フォーム周りの変数
  @Input() formGroup!: PaymentClearingDetailForm;
  get ctrls() {
    return this.formGroup.controls;
  }
  @Input() index!: number;
  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();

  // サジェスト周りの変数
  private _PaymentDetails: PaymentDetail[] = [];
  valueSuggests: string[] = [];
  @Input() set paymentDetail(arg: PaymentDetail[]) {
    this._PaymentDetails = arg;
  }

  constructor(
    private divisionService: DivisionService,
    private common: CommonService
  ) {}

  // 支払区分選択肢
  statusDivisionOptions: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
    {
      value: 1,
      text: '掛',
    },
    {
      value: 2,
      text: '現金',
    },
  ];

  pageConst = accountsReceivableAggregateConst;

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  /**入金区分 */
  paymentClassficationOption: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
  ];

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([
        this.divisionService.getAsSelectOptions({
          name: divisionConst.DEPOSIT_CLASSIFICATION,
        }),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // 請求先データセット

          // code と value 置き換え
          const payment = res[0][divisionConst.DEPOSIT_CLASSIFICATION].filter(
            (x: any) => {
              this.paymentClassficationOption.push({
                value: x.code,
                text: x.text,
              });
            }
          );
          this.common.loading = false;
        })
    );
  }

  /**
   * フォームの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }
}
