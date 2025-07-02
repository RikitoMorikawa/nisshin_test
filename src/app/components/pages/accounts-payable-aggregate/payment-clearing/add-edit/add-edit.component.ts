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
import { SupplierService } from 'src/app/services/supplier.service';
import { Supplier, SupplierApiResponse } from 'src/app/models/supplier';
import { Payment, PaymentApiResponse } from 'src/app/models/payment';
import {
  PaymentDetail,
  PaymentDetailApiResponse,
} from 'src/app/models/payment-detail';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentDetailService } from 'src/app/services/payment-detail.service';

/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};

// 支払消込明細登録用データ型
type paymentDetailDataType = {
  supplier_id: number;
  created_id: number;
  remarks_1: string;
  payment_detail: any[];
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
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private paymentService: PaymentService,
    private paymentDetailService: PaymentDetailService,
    private common: CommonService
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
  pageTitle = this.id ? '支払消込編集' : '支払消込新規登録';
  detailPagePath: string = this.prevUrl;
  authorTitle = this.id ? '更新者' : '登録者';
  paymentIdValue = this.id ? '　支払ID：' + this.id : '';

  updater = 'データ取得中...';
  authorname = 'データ取得中...';

  // ログイン中ユーザー
  author!: Employee;

  // 仕入先選択肢
  supplierSuggests!: SelectOption[];

  // 登録者選択肢
  employeeSuggests!: SelectOption[];

  // 一覧のパス
  topPagePath = '/setting';
  listPagePath = '/setting/accounts-payable-aggregate/payment-clearing';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = this.pageTitle + 'キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = this.pageTitle + 'エラー：' + modalConst.TITLE.HAS_ERROR;
  // リダイレクト希望の場合のパス
  private redirectPath: string = this.prevUrl;
  // エラー文言
  errorConst = errorConst;

  supplier!: Supplier;
  initSupplier!: Supplier;

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    supplier_id: ['', [Validators.required]],
    created_id: ['', [Validators.required]],
    remarks_1: [''],
    payment_detail: this.fb.array([
      this.fb.group({
        id: [''],
        payment_id: [''],
        payment_type_division_code: [''],
        payment_amount: [''],
        scheduled_payment_amount: [''],
        payment_date: [''],
        remarks_1: [''],
      }),
    ]),
    payment_detail_del: this.fb.array([
      this.fb.group({
        id: [''],
        payment_id: [''],
        payment_type_division_code: [''],
        payment_amount: [''],
        scheduled_payment_amount: [''],
        payment_date: [''],
        remarks_1: [''],
      }),
    ]),
  });

  get ctrls() {
    return this.form.controls;
  }

  paymentDetailAny: any = [];
  paymentAddForms: FormGroup = this.fb.group({
    forms: this.fb.array([]),
  });

  get paymentAddFormsArray() {
    return this.paymentAddForms.get('forms') as FormArray;
  }

  get paymentAddFormsArrayControls() {
    return this.paymentAddFormsArray.controls as FormGroup[];
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

    this.handleSelectSupplier();
    // 新規登録なら処理終了
    if (!this.id) {
      return;
    }

    const pageName = this.id ? '支払消込閲覧' : '支払消込新規登録';

    // 支払消込情報入力のフォーム設定
    this.subscription.add(
      this.paymentService
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
          const payment$ = res.data[0];
          this.form.controls.supplier_id.patchValue(
            String(payment$.supplier_id)
          );
          this.form.controls.created_id.patchValue(String(payment$.created_id));
          this.form.controls.remarks_1.patchValue(String(payment$.remarks_1));
        })
    );

    // 支払消込明細のフォーム設定
    this.subscription.add(
      this.paymentDetailService
        .getAll({ payment_id: this.id })
        .pipe(
          catchError(
            this.paymentDetailService.handleErrorModal<PaymentDetailApiResponse>()
          ),
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
          const paymentDetail$ = res.data;
          if (paymentDetail$.length) {
            this.form.controls.payment_detail.clear();
          }
          paymentDetail$.map((y) =>
            this.form.controls.payment_detail.push(
              this.fb.group({
                id: y.id + '',
                payment_id: y.payment_id + '',
                payment_type_division_code: y.payment_type_division_code + '',
                payment_amount: y.payment_amount + '',
                scheduled_payment_amount: y.scheduled_payment_amount
                  ? y.scheduled_payment_amount + ''
                  : '',
                payment_date: y.payment_date + '',
                remarks_1: y.remarks_1,
              })
            )
          );
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

    // サジェスト用サプライヤー選択肢取得
    this.subscription.add(
      forkJoin([
        this.supplierService.getAsSelectOptions(),
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

          // 仕入先データセット
          this.supplierSuggests = res[0];

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

    // 仕入先の値チェック
    const supplierIdExists = this.supplierSuggests.some((Supplier) => {
      const supplierVal = Number(Supplier.value);
      const supplierId = Number(formVal.supplier_id);
      return supplierVal === supplierId;
    });
    if (!supplierIdExists) {
      this.ctrls.supplier_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 更新時の場合のみ、支払消込明細削除を実施
    if (this.id) {
      const rawDelValues = this.ctrls.payment_detail_del.getRawValue();
      rawDelValues.forEach((x) => {
        if (x.id) {
          this.paymentDetailService
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
    this.paymentDetailAny = [];
    const rawDelValues = this.ctrls.payment_detail.getRawValue();
    rawDelValues.forEach((x) => {
      const paymentDetails = {
        id: '',
        payment_id: x.payment_id,
        payment_type_division_code: x.payment_type_division_code,
        payment_amount: x.payment_amount,
        scheduled_payment_amount: x.scheduled_payment_amount,
        payment_date: x.payment_date
          ? new Date(String(x.payment_date)).toLocaleString()
          : '',
        remarks_1: x.remarks_1,
      };
      if (x.id) {
        paymentDetails.id = x.id;
      }
      this.paymentDetailAny.push(paymentDetails);
    });

    const postData: paymentDetailDataType = {
      supplier_id: Number(formVal.supplier_id),
      created_id: Number(formVal.created_id),
      remarks_1: String(formVal.remarks_1),
      payment_detail: [...this.paymentDetailAny],
    };
    console.log(postData);

    let observable$ = this.paymentService.add(postData);
    let response = '作成しました';
    let message = '正常に登録されました。';

    // 編集なら各種変数を書き換える
    if (this.id) {
      observable$ = this.paymentService.update(this.id, postData);
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
          this.handleError(res.status, this.errorModalTitle, res.error.message);
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
    console.log(status);

    // statusで処理を分岐
    if (status === 400) {
      // クライアント側あるいはネットワークによるエラー
      // モーダル表示
      this.modalService.setModal(
        title,
        message + errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
      return;
    } else {
      console.log(status);
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
    const rawValues = this.ctrls.payment_detail.getRawValue();
    rawValues.forEach((x) => {
      answer += Number(x.payment_amount);
    });
    return Math.floor(answer);
  }

  /**
   * URLに応じたパンくずリストオブジェクトを生成する。
   * @param url 表示されているページのURL。
   */
  private createBreadcrumbList(url: string) {
    const paths = url
      .replace(/.*\/accounts-payable-aggregate\/?/, '')
      .split('/');
    const pageName = this.id ? '支払消込詳細閲覧' : '支払消込新規登録';
    const pageUrl = this.id ? `${this.detailUrl}` : '';
    const pageFg = this.id ? true : false;
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting', text: '設定一覧' },
      { path: this.listlUrl, text: '支払消込一覧' },
      { path: pageUrl, text: pageName },
    ];
    if (pageFg) {
      breadcrumbList.push({ text: `支払消込編集` });
    }
    return breadcrumbList;
  }

  handleSelectSupplier(): void {
    console.log('handleSelectSupplier');
    this.ctrls.supplier_id.valueChanges.subscribe((id: string | null) => {
      //console.log(id);
      if (id === null || id === '' || id === undefined) {
        // this.supplier = supplier;
        //this.supplier!: Supplier = undefined;
        this.supplier = this.initSupplier;
        return;
      }
      this.supplierService
        .find(Number(id))
        .pipe(
          catchError(
            this.supplierService.handleErrorModal<SupplierApiResponse>()
          )
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
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              errorConst.COULD_NOT_GET_DATA
            );
            return;
          }
          const supplier = res.data[0];
          this.supplier = supplier;
        });
    });
  }
}
