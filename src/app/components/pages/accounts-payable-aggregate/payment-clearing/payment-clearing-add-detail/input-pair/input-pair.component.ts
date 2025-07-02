import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, catchError, finalize, forkJoin, of } from 'rxjs';
import { PaymentClearingAddDetailForm } from '../payment-clearing-detail.component';
import { generalConst } from 'src/app/const/general.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { CommonService } from 'src/app/services/shared/common.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { DivisionService } from 'src/app/services/division.service';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
import { divisionConst } from 'src/app/const/division.const';
import {
  AccountsPayableAggregate,
  AccountsPayableAggregateApiResponse,
} from 'src/app/models/accounts-payable-aggregate';
import { AccountsPayableAggregateService } from 'src/app/services/accounts-payable-aggregate.service';
import { AccountsPayableAggregateDomain } from 'src/app/domains/accounts-payable-aggregate.domain';

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
  @Input() formGroup!: PaymentClearingAddDetailForm;
  get ctrls() {
    return this.formGroup.controls;
  }
  @Input() paymentDate?: FormControl<string | null>;
  @Input() index!: number;
  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();

  constructor(
    private supplierService: SupplierService,
    private divisionService: DivisionService,
    private common: CommonService,
    private service: AccountsPayableAggregateService,
    private domain: AccountsPayableAggregateDomain
  ) {}
  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  private accounts_payable_aggregate: AccountsPayableAggregate[] = [];

  // 支払い先選択肢
  supplierSuggests!: SelectOption[];

  pageConst = accountsReceivableAggregateConst;
  /**支払区分 */
  paymentClassficationOption: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
  ];
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

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    if (this.paymentDate !== undefined) {
      this.paymentDate.valueChanges.subscribe((payment_date) => {
        //console.log(payment_date.toLocaleDateString());
        if (payment_date === undefined) {
          return;
        }
        this.setScheduledPaymentAmount();
      });
    }
    this.ctrls.payment_supplier_id.valueChanges.subscribe((supplier_id) => {
      // ここでnewValueに対して必要な処理を実行
      //console.log('payment_supplier_idの新しい値:', supplier_id);
      if (supplier_id === undefined || supplier_id === null) {
        return;
      }
      this.callApi(supplier_id);
      // 例: newValueを使用して何か処理を行う
    });

    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      this.supplierService.getAsSelectOptions().subscribe((res) => {
        // 請求先データセット
        this.supplierSuggests = res;
      })
    );

    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([
        this.supplierService.getAsSelectOptions(),
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
          this.supplierSuggests = res[0];
          // code と value 置き換え
          const payment = res[1][divisionConst.DEPOSIT_CLASSIFICATION].filter(
            (x: any) => {
              this.paymentClassficationOption.push({
                value: x.code,
                text: x.text,
              });
            }
          );
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

  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private callApi(supplier_id: number) {
    this.common.loading = true;
    this.service
      .getAll(this.createApiParams(supplier_id))
      .pipe(
        catchError(
          this.service.handleErrorModal<AccountsPayableAggregateApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        console.log(res);
        this.accounts_payable_aggregate = res.data;
        this.setScheduledPaymentAmount();
        // const params = this.createTableParams<AccountsPayableAggregate>(
        //   res,
        //   this.tableNameMapping,
        //   this.modifiedTableBody
        // );
      });
  }

  /**
   * APIコール用のパラメータを生成する。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams(supplier_id: number) {
    const filter = {
      supplier_id: supplier_id,
    };

    // APIコール用のパラメータを生成して返却
    return {
      ...filter,
      limit: 10,
      sort: 'id:desc',
    };
  }

  private setScheduledPaymentAmount(): void {
    //
    console.log('setScheduledPaymentAmount');
    const paymentDate = this.paymentDate?.value;
    const estimatedPaymentAmount = this.domain.getScheduledPaymentAmount(
      this.accounts_payable_aggregate,
      paymentDate
    );
    this.ctrls['scheduled_payment_amount'].setValue(null);
    if (estimatedPaymentAmount === undefined) {
      return;
    }
    this.ctrls['scheduled_payment_amount'].setValue(estimatedPaymentAmount);
  }
}
