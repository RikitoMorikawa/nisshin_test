import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  Subject,
  filter,
  finalize,
  of,
  Subscription,
  take,
} from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { PaymentCutoffService } from 'src/app/services/payment-cutoff.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';

// 支払データ締め型
type PaymentCutoffDataType = {
  from_order_date: string;
  to_order_date: string;
  cutoff_date_billing: number;
};

@Component({
  selector: 'app-payment-cutoff',
  templateUrl: './payment-cutoff.component.html',
  styleUrls: ['./payment-cutoff.component.scss'],
})
export class PaymentCutoffComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private errorService: ErrorService,
    private common: CommonService,
    private paymentCutoffService: PaymentCutoffService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  subject = new Subject<object>();

  // ログイン中ユーザー
  author!: Employee;

  // 初期値のパス
  topPagePath = '/setting';
  listPagePath = '../payment-slip';
  mainPagePath = '/payment-cutoff';

  // エラーモーダルのタイトル
  errorLoadTitle =
    '支払データ締め処理画面エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラーモーダルのタイトル
  errorModalTitle = '支払締めデータ作成エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;

  //初期値前日日付
  init_date: string = this.getInitDate();

  // 締日
  cutoffDateBillingSuggests!: SelectOption[];
  cutoffDateBilling!: number;

  // リアクティブフォームとバリデーションの設定
  inputForm = this.fb.group({
    cutoff_date_billing: [''],
    order_date: this.fb.group(
      {
        from: ['', [Validators.required]],
        to: ['', [Validators.required]],
      },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });

  get ctrls() {
    return this.inputForm.controls;
  }

  getInitDate(): any {
    var today = new Date();
    var date = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return date;
  }

  getEndDate(): any {
    var today = new Date();
    var date = new Date(today.getFullYear(), today.getMonth(), 0);
    return date;
  }

  ngOnInit(): void {
    // ログイン中ユーザー取得処理
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.author = this.authorService.author;
    } else {
      // authorServiceに値がない場合
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
    // 選択肢初期化書実行
    this.initOptions();
    // 初期値設定実行
    //this.setDefaultValue();
    this.setSubscribe();
  }

  initOptions() {
    this.cutoffDateBillingSuggests = [];
    for (let i = 1; i < 31; i++) {
      this.cutoffDateBillingSuggests.push({ value: i, text: i + '日' });
    }
    this.cutoffDateBillingSuggests.push(
      { value: 99, text: '末日' },
      { value: 98, text: '無し' }
    );
  }

  // setDefaultValue() {
  //   /**
  //    * 初期値設置
  //    */
  //   this.ctrls.order_date.controls.from.setValue(this.getInitDate());
  //   this.ctrls.order_date.controls.to.setValue(this.getEndDate());
  // }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param title
   * @param message
   */
  /**
   * 子コンポーネントから流れてくるエラーストリームを処理する
   * @param error
   */
  handleError(status: number, title: string, message: string) {
    // モーダルのタイプをModalPurpose型から選択させる
    const modalPurpose: ModalPurpose = 'danger';

    // statusで処理を分岐
    if (status === 0) {
      // クライアント側あるいはネットワークによるエラー
      // モーダル表示
      this.modalService.setModal(
        title,
        message + errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    } else {
      // サーバー側から返却されるエラー
      // モーダル表示
      this.modalService.setModal(
        title,
        `ステータスコード: ${status} \nメッセージ: ` +
          message +
          errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    }

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter((_) => this.modalService.getModalProperties().title === title) // モーダルのタイトルがエラーのタイトル以外は実行しない
        )
        .subscribe((_) => {})
    );
  }

  /**
   * データ保存処理
   * フォームデータをapiへpost
   * @returns
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.inputForm.markAsPristine();

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.inputForm.value;

    // 仕入日の値チェック
    if (!formVal.order_date?.from || !formVal.order_date?.to) {
      this.ctrls.order_date.controls.from.setValue('');
      this.ctrls.order_date.controls.to.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // フォームの値を送信用フォーマットに置き換え
    const postData: PaymentCutoffDataType = {
      from_order_date: new Date(formVal.order_date.from).toLocaleDateString(),
      to_order_date: new Date(formVal.order_date.to).toLocaleDateString(),
      cutoff_date_billing: Number(formVal.cutoff_date_billing),
    };

    this.subscription.add(
      // 支払締めデータ作成処理開始
      this.paymentCutoffService
        .createPayableData(postData)
        .pipe(
          catchError((res: HttpErrorResponse) => {
            return of(res);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              this.errorModalTitle,
              res.error.message
            );
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.subject.next({});
        })
    );
  }

  private setSubscribe(): void {
    let cutoffDateBillingSubscription: Subscription = new Subscription();

    const cutoffDateBillingHandler = (value: any) => {
      this.cutoffDateBilling = value;
      this.ctrls.order_date.controls.from.setValue(null);
      this.ctrls.order_date.controls.to.setValue(null);
    };

    cutoffDateBillingSubscription = this.inputForm
      .get('cutoff_date_billing')
      ?.valueChanges.subscribe(cutoffDateBillingHandler) as Subscription;
  }
}
