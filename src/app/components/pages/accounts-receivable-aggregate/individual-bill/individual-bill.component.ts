import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  Subject,
  filter,
  finalize,
  forkJoin,
  of,
  Subscription,
  take,
} from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Client } from 'src/app/models/client';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ClientService } from 'src/app/services/client.service';
import { IndividualBillService } from 'src/app/services/individual-bill.service';

// 個別請求データ型
type billingCreationDataType = {
  cutoff_date_billing?: number;
  client_id?: number;
  from_sale_date: string;
  to_sale_date: string;
};

export interface ClientSelectOption {
  value: number | string;
  text: string;
  cutoff_date_billing: number | string;
}

@Component({
  selector: 'app-individual-bill',
  templateUrl: './individual-bill.component.html',
  styleUrls: ['./individual-bill.component.scss'],
})
export class IndividualBillComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private clientService: ClientService,
    private router: Router,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private errorService: ErrorService,
    private common: CommonService,
    private individualBillService: IndividualBillService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  subject = new Subject<object>();

  // ログイン中ユーザー
  author!: Employee;

  // 初期値のパス
  topPagePath = '/setting';
  listPagePath = '../bill';
  mainPagePath = '/individual-bill';

  // エラーモーダルのタイトル
  errorLoadTitle = '個別請求データ画面エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラーモーダルのタイトル
  errorModalTitle = '請求データ作成エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;

  //初期値前日日付
  init_date: string = this.getInitDate();

  // 得意先
  clients!: Client[];

  // 得意先選択肢
  clientSuggests!: ClientSelectOption[];
  cutoffDateBillingSuggests!: SelectOption[];
  cutoffDateBilling!: number;

  // 得意先ID
  clientId!: number;

  // リアクティブフォームとバリデーションの設定
  inputForm = this.fb.group(
    {
      cutoff_date_billing: [''],
      client_id: [''],
      sale_date: this.fb.group(
        {
          from: ['', [Validators.required]],
          to: ['', [Validators.required]],
        },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
    },
    { validators: this.customValidator }
  );

  /**
   * カスタムバリデータの定義
   * cutoff_date_billingとclient_idの両方が空の場合エラー
   */
  customValidator(control: AbstractControl): ValidationErrors | null {
    const cutoffDateBilling = control.get('cutoff_date_billing')?.value;
    const clientId = control.get('client_id')?.value;
    if (!cutoffDateBilling && !clientId) {
      return { bothFieldsEmpty: true };
    }
    return null;
  }

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
    this.setDefaultValue();
    this.setSubscribe();
  }

  setDefaultValue() {
    /**
     * 初期値設置
     */
    // this.ctrls.sale_date.controls.from.setValue(this.getInitDate());
    // this.ctrls.sale_date.controls.to.setValue(this.getEndDate());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initOptions() {
    this.common.loading = true;
    const clientMapFn = (client: Client): ClientSelectOption => ({
      value: client.id,
      text: `${client.name}`, // 動的に表示する項目を設定
      cutoff_date_billing: client.cutoff_date_billing, // 動的に表示する項目を設定
    });
    // サジェスト用サプライヤー、ステータス選択肢取得
    this.subscription.add(
      forkJoin([this.clientService.getAsSelectOptions({}, clientMapFn)])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorLoadTitle, res.message);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorLoadTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // レスポンスの配列の要素が3つあるか
          if (res.length !== 1) {
            this.handleError(
              400,
              this.errorLoadTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          this.cutoffDateBillingSuggests = [];
          for (let i = 1; i < 31; i++) {
            this.cutoffDateBillingSuggests.push({ value: i, text: i + '日' });
          }
          this.cutoffDateBillingSuggests.push(
            { value: 99, text: '末日' },
            { value: 98, text: '無し' }
          );
          this.clientSuggests = res[0];
        })
    );
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

    // 売上日の値チェック
    if (!formVal.sale_date?.from || !formVal.sale_date?.to) {
      this.ctrls.sale_date.controls.from.setValue('');
      this.ctrls.sale_date.controls.to.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // フォームの値を送信用フォーマットに置き換え
    const postData: billingCreationDataType = {
      client_id: Number(formVal.client_id),
      from_sale_date: new Date(formVal.sale_date.from).toLocaleDateString(),
      to_sale_date: new Date(formVal.sale_date.to).toLocaleDateString(),
    };

    if (formVal.cutoff_date_billing !== null) {
      postData.cutoff_date_billing = Number(formVal.cutoff_date_billing);
    }
    console.log(
      'postData formVal.cutoff_date_billing:: ',
      formVal.cutoff_date_billing
    );
    console.log('postData formVal.client_id:: ', formVal.client_id);
    console.log('postData postData:: ', postData);

    this.subscription.add(
      // 個人請求データ作成処理開始
      this.individualBillService
        .createBillingData(postData)
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
    let clientIdSubscription: Subscription = new Subscription();

    const clientIdHandler = (value: any) => {
      cutoffDateBillingSubscription.unsubscribe(); // 一時的にサブスクリプションを解除
      this.inputForm.get('cutoff_date_billing')?.setValue(null); // cutoff_date_billingをクリア
      this.ctrls.sale_date.controls.from.setValue(null);
      this.ctrls.sale_date.controls.to.setValue(null);
      const selectedClient = this.clientSuggests.find(
        (client) => client.value === value
      );
      if (selectedClient) {
        this.cutoffDateBilling = Number(selectedClient.cutoff_date_billing);
      }
      cutoffDateBillingSubscription = this.inputForm
        .get('cutoff_date_billing')
        ?.valueChanges.subscribe(cutoffDateBillingHandler) as Subscription; // 再度サブスクリプションを設定
    };

    const cutoffDateBillingHandler = (value: any) => {
      this.cutoffDateBilling = value;
      clientIdSubscription.unsubscribe(); // 一時的にサブスクリプションを解除
      this.inputForm.get('client_id')?.setValue(null); // client_idをクリア
      this.ctrls.sale_date.controls.from.setValue(null);
      this.ctrls.sale_date.controls.to.setValue(null);
      clientIdSubscription = this.inputForm
        .get('client_id')
        ?.valueChanges.subscribe(clientIdHandler) as Subscription; // 再度サブスクリプションを設定
    };

    cutoffDateBillingSubscription = this.inputForm
      .get('cutoff_date_billing')
      ?.valueChanges.subscribe(cutoffDateBillingHandler) as Subscription;
    clientIdSubscription = this.inputForm
      .get('client_id')
      ?.valueChanges.subscribe(clientIdHandler) as Subscription;
  }
}
