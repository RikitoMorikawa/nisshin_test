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
  throwError,
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
import { DepositDetailApiResponse } from 'src/app/models/deposit-detail';
import { DepositService } from 'src/app/services/deposit.service';
import { DepositDetailService } from 'src/app/services/deposit-detail.service';
import { MessageService } from 'src/app/services/shared/message.service';
/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};

// 入金明細登録用データ型
type depositAddDetailDataType = {
  client_id: number;
  created_id: number;
  remarks_1: string;
  deposit_detail: any[];
};

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddComponent implements OnInit, OnDestroy {
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
    private common: CommonService,
    private message: MessageService
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

  response: any = [];
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
  // Deposit_date
  deposit_date: string = '';

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    created_id: ['', [Validators.required]],
    deposit_date: ['', [Validators.required]],
    remarks_1: [''],
    deposit_detail: this.fb.array([
      this.fb.group({
        id: [''],
        deposit_id: [''],
        deposit_client_id: ['', [Validators.required]],
        deposit_client_name: [''],
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
        deposit_client_id: [''],
        deposit_client_name: [''],
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

    // 子コンポーネントから流れてくるエラーストリームを購読
    this.subscription.add(
      this.errorService.getError().subscribe((res) => {
        this._handleError(res);
      })
    );

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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 選択肢初期化
   */
  initOptions() {
    this.common.loading = true;

    // 日付のサジェスト
    this.ctrls.deposit_date.valueChanges.subscribe(() => {
      this.deposit_date = this.ctrls.deposit_date.value
        ? new Date(this.ctrls.deposit_date.value).toLocaleDateString()
        : '';
      this.message.setMessege(this.deposit_date);
    });

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
      const employeeId = Number(this.author.id);
      return employeeVal === employeeId;
    });
    if (!employeeIdExists) {
      this.ctrls.created_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // フォームの値を送信用フォーマットに置き換え
    const rawDelValues = this.ctrls.deposit_detail.getRawValue();

    // クライアント事に値をまとめる

    let clients: any[] = [];

    let message = '作成しました';

    rawDelValues.forEach((x) => {
      const depositDetails = {
        id: '',
        deposit_client_id: Number(x.deposit_client_id),
        deposit_client_name: x.deposit_client_name,
        deposit_detail_division_code: x.deposit_detail_division_code,
        deposit_amount: x.deposit_amount,
        deposit_date: this.deposit_date, // 共通
        remarks_1: x.remarks_1,
      };
      this.depositDetailAny.push(depositDetails);
      clients.push(Number(x.deposit_client_id));
    });

    let clientlist: any = this.uniq(clients);
    let observable$ = [];

    // Client_id 毎に保存処理
    for (let index in clientlist) {
      const detail_list = this.depositDetailAny.filter((x: any) => {
        return clientlist[index] == x.deposit_client_id;
      });
      const postData: depositAddDetailDataType = {
        client_id: Number(detail_list[0].deposit_client_id),
        created_id: Number(this.author.id),
        remarks_1: formVal.remarks_1 ? formVal.remarks_1 : '　',
        deposit_detail: [...detail_list],
      };
      observable$.push(this.depositService.add(postData));
    }
    // 格納処理
    forkJoin(observable$)
      .pipe(
        // エラー対応
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => {
          this.common.loading = false;
        })
      )
      .subscribe((res: any) => {
        if (res instanceof HttpErrorResponse) {
          const errorMessage = res.error
            ? res.error.message
            : this.errorModalTitle;
          this.handleError(res.status, this.errorModalTitle, errorMessage);
          this.common.loading = false;
          return;
        }
        this.response = res;
      })
      .add(() => {
        if (this.response.length > 0) {
          //すべて完了
          const purpose: FlashMessagePurpose = 'success';
          this.common.loading = false;
          this.flashMessageService.setFlashMessage(message, purpose, 15000);
          this.router.navigateByUrl(this.prevUrl);
        }
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

  uniq(array: any) {
    return Array.from(new Set(array));
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

  /**
   * 子コンポーネントから流れてくるエラーストリームを処理する
   * @param error
   */
  _handleError(error: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    // モーダルのタイプをModalPurpose型から選択させる
    const modalPurpose: ModalPurpose = 'danger';

    // リダイレクト希望の場合は保持しておく
    if (error.redirectPath) {
      this.redirectPath = error.redirectPath;
    }

    // statusで処理を分岐
    if (error.status === 0) {
      // クライアント側あるいはネットワークによるエラー
      // モーダル表示
      this.modalService.setModal(
        error.title,
        error.message + errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    } else {
      // サーバー側から返却されるエラー
      // モーダル表示
      this.modalService.setModal(
        error.title,
        `ステータスコード: ${error.status} \nメッセージ: ` +
          error.message +
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
          filter(
            (_) => this.modalService.getModalProperties().title === error.title
          ) // モーダルのタイトルがエラーのタイトル以外は実行しない
        )
        .subscribe((_) => {
          // リダイレクト希望があれば移動する
          if (this.redirectPath) this.router.navigateByUrl(this.redirectPath);
        })
    );
  }
}
