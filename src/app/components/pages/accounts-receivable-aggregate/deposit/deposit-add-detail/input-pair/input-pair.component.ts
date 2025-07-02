import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DepositAddDetailForm } from '../deposit-detail.component';
import { generalConst } from 'src/app/const/general.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { Subscription, forkJoin, finalize, catchError, of, filter } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';
import { ClientService } from 'src/app/services/client.service';
import { DivisionService } from 'src/app/services/division.service';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
import { divisionConst } from 'src/app/const/division.const';
import { BillService } from 'src/app/services/bill.service';
import { MessageService } from 'src/app/services/shared/message.service';
import { AccountsReceivableAggregateService } from 'src/app/services/accounts-receivable-aggregate.service';

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
  @Input() formGroup!: DepositAddDetailForm;
  get ctrls() {
    return this.formGroup.controls;
  }
  @Input() index!: number;
  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();
  @Input() deposit_date!: any;

  constructor(
    private clientService: ClientService,
    private divisionService: DivisionService,
    private common: CommonService,
    private billService: BillService,
    private message: MessageService,
    private accountsReceivableAggregateService: AccountsReceivableAggregateService
  ) {}

  pageTitle = '入金新規登録';

  pageConst = accountsReceivableAggregateConst;

  billing_amount!: number;
  balance!: number;
  loading: boolean = false;

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  // 請求先選択肢
  clientSuggests!: SelectOption[];
  clientSuggest!: SelectOption[];

  divisios!: any[];
  // 表示区分選択肢
  statusDivisionOptions: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
    {
      value: 1,
      text: '入金待ち',
    },
    {
      value: 2,
      text: '入金済み',
    },
  ];
  /**入金区分 */
  depositClassficationOption: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
  ];
  /**得意先選択情報 */
  selectedValue = { value: 0, text: '' };
  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // サジェスト用サプライヤー選択肢取得

    this.subscription.add(
      forkJoin([
        this.clientService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.DEPOSIT_CLASSIFICATION,
        }),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.TERM_OF_PAYMENT,
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
          this.clientSuggests = res[0];
          // code と value 置き換え
          const deposit = res[1][divisionConst.DEPOSIT_CLASSIFICATION].filter(
            (x: any) => {
              this.depositClassficationOption.push({
                value: x.code,
                text: x.text,
              });
            }
          );

          this.divisios = res[2][divisionConst.TERM_OF_PAYMENT];
          // 請求先のサジェストID格納で入金予定額算出
          this.ctrls.deposit_client_id.valueChanges.subscribe(
            (value: string) => {
              if (value) {
                this.getClientById(value);
                this.getClientPaymentData(value);
              }
            }
          );
        })
    );
  }

  getClientPaymentData(client_id: string) {
    /**
     * this.message.messege
     * 入金日の値がない場合は処理できない
     */
    if (!this.message.messege) {
      alert('入金日は必須項目です');
    }
    this.loading = true;
    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([this.clientService.find(Number(client_id))])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // 請求先データセット
          const client = res[0].data[0];
          const payment_str = this.divisios.find((x) => {
            return x.value === client.payment_term;
          });

          let payment_term = client.payment_term;
          // クライアント情報取得
          // 該当請求検索

          // 〇月請求のデーター
          let dt = new Date(this.message.messege);

          dt.setMonth(dt.getMonth() - this.getPaymentDate(payment_term));
          dt.setDate(1);
          let from_payment_due_date = dt.toLocaleDateString();
          let to_payment_due_date = new Date(
            dt.getFullYear(),
            dt.getMonth() + 1,
            0
          ).toLocaleDateString();

          // 請求データにクエリ

          this.subscription.add(
            this.accountsReceivableAggregateService
              .getAll({
                client_id: client.id,
                from_payment_due_date: from_payment_due_date,
                to_payment_due_date: to_payment_due_date,
              })
              .pipe(
                finalize(() => (this.common.loading = false)),
                catchError((error) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res.data[0]) {
                  this.billing_amount =
                    res.data[0].billing_amount.toLocaleString();
                }
                if (res.data[0]) {
                  this.balance = res.data[0].balance.toLocaleString();
                }
              })
          );
        })
    );
  }

  /**
   * 遡る月数を算出
   */
  getPaymentDate(payment_term: number): number {
    switch (payment_term) {
      case 60: // 前月
        return 1;
      case 61: // 前々月
        return 2;
      case 124: // 3か月
        return 3;
      case 157: // 当月
        return 0;
      default:
        return 0;
    }
  }
  /**
   * 締日など、日付の項目を整形
   * @param value
   * @returns
   */
  setDaySuffix(value: number | '') {
    if (!value) {
      return '';
    }
    switch (value) {
      case 98:
        return '無し';
      case 99:
        return '末日';
      default:
        return value;
    }
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
   * 得意先idを指定して取得しフォームに設定する
   * @param id 得意先id
   * @returns
   */
  getClientById(id: string) {
    this.clientSuggests.find((x) => {
      if (Number(x.value) === Number(id)) {
        this.selectedValue.text = x.text;
        this.selectedValue.value = Number(x.value);
        this.ctrls.deposit_client_name.patchValue(this.selectedValue);
      }
    });
  }

  /**
   * 得意先からdeposit_client_idを抽出し、設定する。
   */
  clientChange(client_id: String) {
    /*　client_id */
    this.ctrls.deposit_client_id.patchValue(client_id);
  }
}
