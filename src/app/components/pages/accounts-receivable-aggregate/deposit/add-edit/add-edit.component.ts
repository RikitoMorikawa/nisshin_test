import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  of,
  Subscription,
  take,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ClientService } from 'src/app/services/client.service';
import { Client } from 'src/app/models/client';
import { Deposit, DepositApiResponse } from 'src/app/models/deposit';
import {
  DepositDetail,
  DepositDetailApiResponse,
} from 'src/app/models/deposit-detail';
import { DepositService } from 'src/app/services/deposit.service';
import { DepositDetailService } from 'src/app/services/deposit-detail.service';
import { dummyDataDetail } from 'src/app/models/deposit';
import { dummyData } from 'src/app/models/deposit-detail';
import { AccountsReceivableAggregateService } from 'src/app/services/accounts-receivable-aggregate.service';
/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};

// 入金明細登録用データ型
type depositDetailDataType = {
  client_id: number;
  created_id: number;
  remarks_1: string;
  deposit_detail: any[];
};

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private depositService: DepositService,
    private depositDetailService: DepositDetailService,
    private common: CommonService,
    private accountsReceivableAggregateService: AccountsReceivableAggregateService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // 各種パラメータ
  breadcrumbList: BreadcrumbList[] = [];
  id = this.route.snapshot.params['id'];
  url = this.router.url;
  detailUrl = this.url.replace('detail-edit', 'detail-view');
  listlUrl = this.id ? '../../' : this.url.replace('/add', '');
  prevUrl = this.id ? `${this.detailUrl}` : `${this.listlUrl}`;
  pageTitle = this.id ? '入金詳細編集' : '入金新規登録';
  detailPagePath: string = this.prevUrl;
  authorTitle = this.id ? '更新者' : '登録者';
  depositIdValue = this.id ? '　入金ID：' + this.id : '';

  updater = 'データ取得中...';
  authorname = 'データ取得中...';

  // ログイン中ユーザー
  author!: Employee;

  // 請求先選択肢
  clientSuggests!: SelectOption[];

  // 登録者選択肢
  employeeSuggests!: SelectOption[];

  // 一覧のパス
  topPagePath = '/setting';
  listPagePath = '/setting/accounts-receivable-aggregate/deposit';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = this.pageTitle + 'キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = this.pageTitle + 'エラー：' + modalConst.TITLE.HAS_ERROR;
  // リダイレクト希望の場合のパス
  private redirectPath: string = this.prevUrl;

  // エラー文言
  errorConst = errorConst;

  // クライアントの支払い期日
  payment_term: any = {};
  //
  payment_term_prices: any = [];

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    client_id: ['', [Validators.required]],
    created_id: ['', [Validators.required]],
    remarks_1: [''],
    deposit_detail: this.fb.array([
      this.fb.group({
        id: [''],
        deposit_id: [''],
        deposit_detail_division_code: [''],
        deposit_amount: [''],
        deposit_date: [''],
        remarks_1: [''],
      }),
    ]),
    deposit_detail_del: this.fb.array([
      this.fb.group({
        id: [''],
        deposit_id: [''],
        deposit_detail_division_code: [''],
        deposit_amount: [''],
        deposit_date: [''],
        remarks_1: [''],
      }),
    ]),
  });

  get ctrls() {
    return this.form.controls;
  }

  depositDetailAny: any = [];
  depositAddForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  get depositAddFormsArray() {
    return this.depositAddForms.get('forms') as FormArray;
  }

  get depositAddFormsArrayControls() {
    return this.depositAddFormsArray.controls as FormGroup[];
  }

  ngOnInit(): void {
    // 初期状態のパンくずリストを設定
    this.breadcrumbList = this.createBreadcrumbList(this.router.url);

    // ログイン中ユーザー取得処理
    if (this.authorService.author) {
      // authorServiceに値がある場合
      this.author = this.authorService.author;
      this.ctrls.created_id.patchValue(String(this.author.id));
      // 選択肢初期化処理
      this.initOptions();
    } else {
      // authorServiceに値がない場合
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
          this.ctrls.created_id.patchValue(String(this.author.id));
          // 選択肢初期化処理
          this.initOptions();
        })
      );
    }

    if (!this.id) {
      this.detailPagePath = this.listPagePath;
    }

    // キャンセルのモーダルを購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.detailPagePath);
          }
        })
    );

    // 新規登録なら処理終了
    if (!this.id) {
      return;
    }

    const pageName = this.id ? '入金詳細閲覧' : '入金新規登録';

    // 入金情報入力のフォーム設定
    this.subscription.add(
      this.depositService
        .find(this.id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              pageName + modalConst.TITLE.HAS_ERROR,
              res.error.message
            );
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(
              400,
              pageName + modalConst.TITLE.HAS_ERROR,
              errorConst.COULD_NOT_GET_DATA
            );
            return;
          }
          const deposit$ = res.data[0];
          this.form.controls.client_id.patchValue(String(deposit$.client_id));
          this.form.controls.created_id.patchValue(String(deposit$.created_id));
          this.form.controls.remarks_1.patchValue(String(deposit$.remarks_1));

          this.payment_term = {
            client_id: deposit$.client_id,
            payment_term: deposit$.client_payment_term,
          };
        })
    );

    // 入金明細のフォーム設定
    this.subscription.add(
      this.depositDetailService
        .getAll({ deposit_id: this.id })
        .pipe(
          catchError(
            this.depositDetailService.handleErrorModal<DepositDetailApiResponse>()
          ),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          console.log(res);
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              pageName + modalConst.TITLE.HAS_ERROR,
              res.error.message
            );
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(
              400,
              pageName + modalConst.TITLE.HAS_ERROR,
              errorConst.COULD_NOT_GET_DATA
            );
            return;
          }
          const depositDetail$ = res.data;
          if (depositDetail$.length) {
            this.form.controls.deposit_detail.clear();
          }

          depositDetail$.map((y) => {
            /**
             * 入金予定額の呼び出し
             */
            let pay = this.getDates(
              y.deposit_date,
              Number(this.payment_term.payment_term)
            );

            this.subscription.add(
              this.accountsReceivableAggregateService
                .getAll({
                  client_id: y.id,
                  from_payment_due_date: pay.from_payment_due_date,
                  to_payment_due_date: pay.to_payment_due_date,
                })
                .pipe(
                  finalize(() => (this.common.loading = false)),
                  catchError((error) => {
                    return of(error);
                  })
                )
                .subscribe((res) => {
                  if (res.data[0]) {
                    this.payment_term_prices.push({
                      id: y.id,
                      billing_amount:
                        res.data[0].billing_amount.toLocaleString(),
                      barance: res.data[0].balance.toLocaleString(),
                    });
                  }
                })
            );

            this.form.controls.deposit_detail.push(
              this.fb.group({
                id: y.id + '',
                deposit_id: y.deposit_id + '',
                deposit_detail_division_code:
                  y.deposit_detail_division_code + '',
                deposit_amount: y.deposit_amount + '',
                deposit_date: y.deposit_date + '',
                remarks_1: y.remarks_1,
              })
            );
          });
          console.log(this.payment_term_prices);
        })
    );
  }

  getbilling_amount(
    id: any,
    client_id: any,
    from_payment_due_date: any,
    to_payment_due_date: any
  ): any {
    // 請求データにクエリ

    this.subscription.add(
      this.accountsReceivableAggregateService
        .getAll({
          client_id: client_id,
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
            this.payment_term_prices.push({
              id: id,
              billing_amount: res.data[0].billing_amount.toLocaleString(),
              barance: res.data[0].balance.toLocaleString(),
            });
          }
        })
    );
  }
  getDates(date: any, payment_term: number): any {
    // 〇月請求のデーター
    let dt = new Date(date);

    dt.setMonth(dt.getMonth() - this.getPaymentDate(payment_term));
    dt.setDate(1);
    let from_payment_due_date = dt.toLocaleDateString();
    let to_payment_due_date = new Date(
      dt.getFullYear(),
      dt.getMonth() + 1,
      0
    ).toLocaleDateString();

    return {
      from_payment_due_date: from_payment_due_date,
      to_payment_due_date: to_payment_due_date,
    };
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 選択肢初期化
   */
  initOptions() {
    this.common.loading = true;

    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([
        this.clientService.getAsSelectOptions(),
        this.employeeService.getAsSelectOptions(),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // レスポンスの配列の要素が4つあるか
          if (res.length !== 2) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // 請求先データセット
          this.clientSuggests = res[0];

          // 社員データセット
          this.employeeSuggests = res[1];
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
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (!this.form.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPagePath);
    }
  }

  /**
   * データ保存処理
   * フォームデータをapiへpost
   * @returns
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.form.markAsPristine();

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.form.value;

    // 登録者の値チェック
    const employeeIdExists = this.employeeSuggests.some((employee) => {
      const employeeVal = Number(employee.value);
      const employeeId = Number(formVal.created_id);
      return employeeVal === employeeId;
    });
    if (!employeeIdExists) {
      this.ctrls.created_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 請求先の値チェック
    const clientIdExists = this.clientSuggests.some((Client) => {
      const clientVal = Number(Client.value);
      const clientId = Number(formVal.client_id);
      return clientVal === clientId;
    });
    if (!clientIdExists) {
      this.ctrls.client_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 更新時の場合のみ、入金明細削除を実施
    if (this.id) {
      const rawDelValues = this.ctrls.deposit_detail_del.getRawValue();
      rawDelValues.forEach((x) => {
        if (x.id) {
          this.depositDetailService
            .remove(x.id)
            .pipe(
              // エラー対応
              catchError((error: HttpErrorResponse) => {
                // 空の値を返却
                return of(error);
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
            });
        }
      });
    }

    // フォームの値を送信用フォーマットに置き換え
    const rawDelValues = this.ctrls.deposit_detail.getRawValue();
    rawDelValues.forEach((x) => {
      const depositDetails = {
        id: '',
        deposit_id: this.id,
        deposit_detail_division_code: x.deposit_detail_division_code,
        deposit_amount: x.deposit_amount,
        deposit_date: new Date(String(x.deposit_date)).toLocaleString(),
        remarks_1: x.remarks_1,
      };
      if (x.id) {
        depositDetails.id = x.id;
      }
      this.depositDetailAny.push(depositDetails);
    });

    const postData: depositDetailDataType = {
      client_id: Number(formVal.client_id),
      created_id: Number(formVal.created_id),
      remarks_1: String(formVal.remarks_1),
      deposit_detail: [...this.depositDetailAny],
    };

    let observable$ = this.depositService.add(postData);
    let response = '作成しました';
    let message = '正常に登録されました。';

    // 編集なら各種変数を書き換える
    if (this.id) {
      observable$ = this.depositService.update(this.id, postData);
      response = '更新しました';
      message = '正常に更新されました。';
    }

    // APIコール
    observable$
      .pipe(
        // エラー対応
        catchError((error: HttpErrorResponse) => {
          // 空の値を返却
          return of(error);
        }),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.handleError(res.status, this.errorModalTitle, res.message);
          return;
        }
        const purpose: FlashMessagePurpose = 'success';
        this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
        this.router.navigateByUrl(this.prevUrl);
      });
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, title: string, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
    });

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
        .subscribe((_) => {
          // リダイレクト希望があれば移動する
          if (this.redirectPath) this.router.navigateByUrl(this.redirectPath);
        })
    );
  }

  /**
   * 請求残高計算
   */
  calc() {
    let answer = 0;
    const rawValues = this.ctrls.deposit_detail.getRawValue();
    rawValues.forEach((x) => {
      answer += Number(x.deposit_amount);
    });
    return Math.floor(answer);
  }

  /**
   * URLに応じたパンくずリストオブジェクトを生成する。
   * @param url 表示されているページのURL。
   */
  private createBreadcrumbList(url: string) {
    const paths = url
      .replace(/.*\/accounts-receivable-aggregate\/?/, '')
      .split('/');
    const pageName = this.id ? '入金詳細閲覧' : '入金新規登録';
    const pageUrl = this.id ? `${this.detailUrl}` : '';
    const pageFg = this.id ? true : false;
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting', text: '設定一覧' },
      { path: this.listlUrl, text: '入金一覧' },
      { path: pageUrl, text: pageName },
    ];
    if (pageFg) {
      breadcrumbList.push({ text: `入金詳細編集` });
    }
    return breadcrumbList;
  }
}
