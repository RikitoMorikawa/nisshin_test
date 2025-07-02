import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  of,
  Subscription,
  map,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { modalConst } from 'src/app/const/modal.const';
import { Supplier } from 'src/app/models/supplier';
import { EmployeeService } from 'src/app/services/employee.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { Employee } from 'src/app/models/employee';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { CustomValidators } from 'src/app/app-custom-validator';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { PaymentApiResponse } from 'src/app/models/payment';
import { PaymentService } from 'src/app/services/payment.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  // 各種パラメータ
  @Output() event = new EventEmitter();

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  /**
   * コンストラクタ
   *
   * @param fb
   * @param modalService
   * @param employeeService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private paymentService: PaymentService,
    private modalService: ModalService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService
  ) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  // エラー文言
  errorConst = errorConst;
  regExConst = regExConst;

  // 支払先選択肢
  supplierSuggests!: SelectOption[];

  // 登録者選択肢
  employeeSuggests!: SelectOption[];

  // 設定一覧のパス
  listPagePath = '/setting';

  // エラーモーダルのタイトル
  errorModalTitle = '支払消込一覧取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // ストレージキー
  localStorageKey = 'filterParams-payment-clearing';

  // 選択項目のオブジェクト
  options = {
    cutoff_date_billing: [] as SelectOption[],
  };

  // フォーム関連
  searchForm = this.fb.group({
    payment_id: '',
    supplier_id: '',
    cutoff_date_billing: '',
    created_id: '',
    payment_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  get ctrls() {
    return this.searchForm.controls;
  }

  ngOnInit(): void {
    // 検索条件肢初期化実行
    this.searchForm = this.setSearchClear();

    // 選択肢初期化処理
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * パネル開閉ボタンクリック時の処理
   */
  searchButtonOnClick() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  /**
   * 「絞り込みクリア」ボタンクリック時の処理
   */
  onClickReset() {
    this.searchForm.reset();
    this.searchForm = this.setSearchClear();
    // local strage をクリア
    this.clearFilterParams();
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    const flatted = flattingFormValue(
      this.removeNullsAndBlanks(this.searchForm.value)
    );
    this.event.emit(flatted);
  }

  /**
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
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

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  /**
   * 選択肢初期化
   */
  initOptions() {
    this.common.loading = true;

    // LocalStrage値取得
    const filterParams: any = this.loadFilterParams();

    // 締日
    for (let i = 1; i < 31; i++) {
      this.options.cutoff_date_billing.push({ value: i, text: i + '日' });
    }
    this.options.cutoff_date_billing.push(
      { value: 99, text: '末日' },
      { value: 98, text: '無し' }
    );

    // フィルターパラメータをロードしてフォームに設定
    if (filterParams) {
      if ('from_payment_date' in filterParams) {
        let from = this.convertStringToDate(filterParams['from_payment_date']);
        if (!isNaN(from.getTime())) {
          // 日付が有効かどうかをチェック
          this.ctrls.payment_date.controls.from.setValue(from.toISOString());
        } else {
          this.ctrls.payment_date.controls.from.setValue('');
        }
      }
      if ('to_payment_date' in filterParams) {
        let to = this.convertStringToDate(filterParams['to_payment_date']);
        if (!isNaN(to.getTime())) {
          // 日付が有効かどうかをチェック
          this.ctrls.payment_date.controls.to.setValue(to.toISOString());
        } else {
          this.ctrls.payment_date.controls.to.setValue('');
        }
      }
      this.setSearchArgs(filterParams);
    }

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

          // 支払先データセット
          this.supplierSuggests = res[0];

          // 社員データセット
          this.employeeSuggests = res[1];

          // フィルターパラメータをロードしてフォームに設定
          if (filterParams) {
            Object.entries(filterParams).forEach(([key, value]) => {
              if (key === 'created_id') {
                const createdValue = this.employeeSuggests.find((x) => {
                  return Number(x.value) === Number(filterParams['created_id']);
                });
                this.ctrls.created_id.patchValue(String(createdValue?.value));
              }
              if (key === 'supplier_id') {
                const clientValue = this.supplierSuggests.find((x) => {
                  return (
                    Number(x.value) === Number(filterParams['supplier_id'])
                  );
                });
                this.ctrls.supplier_id.patchValue(String(clientValue?.value));
              }
            });
          }
        })
    );
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
   * 検索条件初期化
   */
  setSearchClear() {
    return this.fb.group({
      payment_id: '',
      supplier_id: '',
      cutoff_date_billing: '',
      created_id: '',
      payment_date: this.fb.group(
        { from: '', to: '' },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
    });
  }

  private saveFilterParams(filter: object) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(filter));
  }
  private loadFilterParams(): object | null {
    const params = localStorage.getItem(this.localStorageKey);
    return params ? JSON.parse(params) : null;
  }

  private clearFilterParams() {
    localStorage.removeItem(this.localStorageKey);
  }

  convertStringToDate(dateString: string): Date {
    return new Date(Date.parse(dateString));
  }

  setSearchArgs(filterParams: any) {
    Object.entries(filterParams).forEach(([key, value]) => {
      if (
        key === 'from_payment_date' ||
        key === 'to_payment_date' ||
        key === 'created_id' ||
        key === 'supplier_id'
      ) {
        return;
      }
      if (key in this.searchForm.controls) {
        (
          this.searchForm.controls[
            key as keyof typeof this.searchForm.controls
          ] as FormControl
        ).setValue(value);
      }
    });
    this.searchForm.patchValue(filterParams);
  }
}
