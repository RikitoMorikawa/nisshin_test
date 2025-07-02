import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { purchaseOrderConst } from 'src/app/const/purchase-order.const';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { StoreService } from 'src/app/services/store.service';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
  selector: 'app-order-data-creation',
  templateUrl: './order-data-creation.component.html',
  styleUrls: ['./order-data-creation.component.scss'],
})
export class OrderDataCreationComponent implements OnInit {
  constructor(
    private poService: PurchaseOrderService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    private fb: FormBuilder,
    private authorService: AuthorService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private storeService: StoreService,
    private divisionService: DivisionService,
    private common: CommonService
  ) {}

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // ログイン中ユーザー
  author!: Employee;

  // 一覧のパス
  listPagePath = '/purchase-order';

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '発注データ登録キャンセル：' + modalConst.TITLE.CANCEL;

  // エラーモーダルのタイトル
  errorModalTitle = '発注データ新規登録エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;

  //初期値前日日付
  init_date: string = this.getInitDate();

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    dateGroup: this.fb.group({
      from_date_of_sale: ['', [Validators.required]],
      to_date_of_sale: ['', [Validators.required]],
    }),
  });

  get ctrls() {
    return this.form.controls;
  }

  getInitDate(): any {
    var date = new Date();
    date.setDate(date.getDate() - 1);
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
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );
    this.setDefaultValue();
  }
  setDefaultValue() {
    /**
     * 初期値設置
     */
    this.ctrls.dateGroup.controls.from_date_of_sale.setValue(
      this.getInitDate()
    );
    this.ctrls.dateGroup.controls.to_date_of_sale.setValue(this.getInitDate());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
      this.router.navigateByUrl(this.listPagePath);
    }
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
   * @param message
   */
  handleError(status: number, title: string, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: this.listPagePath,
    });
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

    // 発注日・希望納入日の値チェック
    if (
      !formVal.dateGroup?.from_date_of_sale ||
      !formVal.dateGroup?.to_date_of_sale
    ) {
      this.ctrls.dateGroup.controls.from_date_of_sale.setValue('');
      this.ctrls.dateGroup.controls.to_date_of_sale.setValue('');
      // ローディング終了
      this.common.loading = false;
      return;
    }

    // フォームの値を送信用フォーマットに置き換え
    const po = {
      from_date_of_sale: new Date(
        formVal.dateGroup.from_date_of_sale
      ).toLocaleDateString(),
      to_date_of_sale: new Date(
        formVal.dateGroup.to_date_of_sale
      ).toLocaleDateString(),
    };

    // 購読管理用サブスクリプションへ格納
    this.subscription.add(
      // 保存処理開始
      this.poService
        .put(po)
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
          this.router.navigateByUrl(this.listPagePath);
        })
    );
  }
}
