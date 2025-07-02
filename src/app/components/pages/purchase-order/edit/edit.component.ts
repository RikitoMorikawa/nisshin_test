import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { purchaseOrderConst } from 'src/app/const/purchase-order.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Employee } from 'src/app/models/employee';
import { PurchaseOrder } from 'src/app/models/purchase-order';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { OrderService } from 'src/app/services/order.service';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private poService: PurchaseOrderService,
    private orderService: OrderService,
    private divisionService: DivisionService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private storeService: StoreService,
    public common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // ログイン中ユーザー
  author!: Employee;

  // 発注書データ
  purchaseOrder!: PurchaseOrder;

  // 最終更新者フルネーム
  updaterFullName!: string;

  // 発注担当者選択肢
  employeeSuggests!: SelectOption[];

  // 店舗選択肢
  storeOptions!: SelectOption[];

  // ステータス選択肢
  statusDivisionOptions!: SelectOption[];

  // 選択中契約書ID
  selectedId!: number;

  // 一覧のパス
  listPagePath = '/purchase-order';

  // 詳細画面のパス
  detailPagePath!: string;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '発注書編集キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '発注書編集エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    dateGroup: this.fb.group(
      {
        order_date: ['', [Validators.required]],
        preferred_delivery_date: ['', [Validators.required]],
      },
      {
        validators: [
          CustomValidators.endingDateIsSmaller(
            'order_date',
            'preferred_delivery_date'
          ),
        ],
      }
    ),
    order_employee_id: ['', [Validators.required]],
    purchase_order_status_division_id: ['', [Validators.required]],
    store_id: ['', [Validators.required]],
    remarks: '',
  });

  get ctrls() {
    return this.form.controls;
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

    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];
    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);
    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        this.errorModalTitle,
        'パラメータがエラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    this.selectedId = Number(selectedId);

    // 取得したパスパラメータをメンバへセット
    this.detailPagePath = this.listPagePath + '/detail/' + selectedId;

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
            this.router.navigate([this.detailPagePath], {});
          }
        })
    );

    this.initialization(Number(selectedId));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * string型の数字のパスパラメータ・クエリパラメータを受け取り正当性を確認
   * @param parameter
   * @returns
   */
  private isParameterInvalid(parameter: string): boolean {
    if (parameter === null) {
      // パラメータ取得エラー
      return true;
    } else if (isNaN(Number(parameter))) {
      // number型へのキャストエラー
      return true;
    }
    return false;
  }

  /**
   * 初期化処理
   * @param selectedId
   */
  private initialization(selectedId: number) {
    // ローディング開始
    this.common.loading = true;

    // 発注書データと発注書に紐付く発注商品データを取得
    this.subscription.add(
      forkJoin([
        this.poService.find(selectedId),
        this.employeeService.getAsSelectOptions(),
        this.storeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.PURCHASE_ORDER_STATUS,
        }),
        this.orderService.getAll({ purchase_order_id: selectedId }),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.title, res.message);
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

          // レスポンスの配列の要素が5つあるか
          if (res.length !== 5) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // 発注書データ取得エラーを確認
          const purchaseOrderResInvalid = ApiResponseIsInvalid(res[0]);
          if (purchaseOrderResInvalid) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }

          // 発注書データ
          this.purchaseOrder = res[0].data[0];

          // 最終更新者のフルネーム作成
          this.updaterFullName =
            this.purchaseOrder.employee_updated_last_name +
            ' ' +
            this.purchaseOrder.employee_updated_first_name;

          // 社員データセット
          this.employeeSuggests = res[1];

          // 店舗データセット
          this.storeOptions = res[2];

          // 表示区分を取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[3];
          const statusDivisionOptions =
            statusDivisionsRes[divisionConst.PURCHASE_ORDER_STATUS];

          // ステータスによって選択肢を調整する
          switch (this.purchaseOrder.purchase_order_status_value) {
            case purchaseOrderConst.STATUS.CANCEL:
              // ステータスがキャンセルの場合キャンセル以外の選択肢を表示しない
              this.statusDivisionOptions = statusDivisionOptions.filter((x) => {
                return String(x.text) === purchaseOrderConst.STATUS.CANCEL;
              });
              break;
            case purchaseOrderConst.STATUS.SENT:
              // ステータスが送信済みの場合キャンセル以外の選択肢を表示する
              this.statusDivisionOptions = statusDivisionOptions.filter((x) => {
                return String(x.text) !== purchaseOrderConst.STATUS.CANCEL;
              });
              break;
            case purchaseOrderConst.STATUS.DRAFT:
              // ステータスが下書きの場合全ての選択肢を表示する
              this.statusDivisionOptions = statusDivisionOptions;
              break;
            default:
              // ステータスがないなどの場合下書きのみを選択肢とする
              this.statusDivisionOptions = statusDivisionOptions.filter((x) => {
                return String(x.text) === purchaseOrderConst.STATUS.DRAFT;
              });
              break;
          }

          // 紐付く個票がなく、ステータスがキャンセル以外の場合下書き以外の選択肢を表示しない
          const orders = res[4].data;
          if (
            orders.length === 0 &&
            this.purchaseOrder.purchase_order_status_value !==
              purchaseOrderConst.STATUS.CANCEL
          ) {
            this.statusDivisionOptions = statusDivisionOptions.filter((x) => {
              return String(x.text) === purchaseOrderConst.STATUS.DRAFT;
            });
          }

          const purchaseOrder = {
            dateGroup: {
              order_date: this.purchaseOrder.order_date,
              preferred_delivery_date:
                this.purchaseOrder.preferred_delivery_date,
            },
            order_employee_id: String(this.purchaseOrder.order_employee_id),
            purchase_order_status_division_id: String(
              this.purchaseOrder.purchase_order_status_division_id
            ),
            store_id: String(this.purchaseOrder.store_id),
            remarks: this.purchaseOrder.remarks,
          };

          this.form.patchValue(purchaseOrder);
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
      this.router.navigate([this.detailPagePath], {});
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

    // 発注担当者の値チェック
    const employeeIdExists = this.employeeSuggests.some((employee) => {
      const employeeVal = Number(employee.value);
      const employeeId = Number(formVal.order_employee_id);
      return employeeVal === employeeId;
    });
    if (!employeeIdExists) {
      this.ctrls.order_employee_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 届け先店舗の値チェック
    const storeIdExists = this.storeOptions.some((store) => {
      const storeVal = Number(store.value);
      const storeId = Number(formVal.store_id);
      return storeVal === storeId;
    });
    if (!storeIdExists) {
      this.ctrls.store_id.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // 発注日・希望納入日の値チェック
    if (
      !formVal.dateGroup?.order_date ||
      !formVal.dateGroup?.preferred_delivery_date
    ) {
      this.ctrls.dateGroup.controls.order_date.setValue('');
      this.ctrls.dateGroup.controls.preferred_delivery_date.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // フォームの値を送信用フォーマットに置き換え
    const po = {
      order_date: new Date(formVal.dateGroup.order_date).toLocaleDateString(),
      preferred_delivery_date: new Date(
        formVal.dateGroup.preferred_delivery_date
      ).toLocaleDateString(),
      order_employee_id: formVal.order_employee_id,
      store_id: formVal.store_id,
      supplier_id: this.purchaseOrder.supplier_id,
      purchase_order_status_division_id:
        formVal.purchase_order_status_division_id,
      remarks: formVal.remarks,
    };

    // 購読管理用サブスクリプションへ格納
    this.subscription.add(
      // 保存処理開始
      this.poService
        .update(this.selectedId, po)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
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
          this.router.navigateByUrl(this.detailPagePath);
        })
    );
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param title
   * @param message
   * @param redirectPath
   */
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath: string = this.detailPagePath
  ) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath,
    });
  }
}
