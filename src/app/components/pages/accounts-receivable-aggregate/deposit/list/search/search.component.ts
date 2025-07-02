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
  FormGroup,
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
import { Client } from 'src/app/models/client';
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
import { DepositApiResponse } from 'src/app/models/deposit';
import { DepositService } from 'src/app/services/deposit.service';
import { ClientService } from 'src/app/services/client.service';
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
    private deposit: DepositService,
    private modalService: ModalService,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService
  ) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  // エラー文言
  errorConst = errorConst;
  regExConst = regExConst;

  // 請求先選択肢
  clientSuggests!: SelectOption[];

  // 登録者選択肢
  employeeSuggests!: SelectOption[];

  // 設定一覧のパス
  listPagePath = '/setting';

  // エラーモーダルのタイトル
  errorModalTitle = '入金一覧取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // ストレージキー
  localStorageKey = 'filterParams-deposit';

  // フォーム関連
  searchForm = this.fb.group({
    deposit_id: '',
    deposit_client_id: '',
    cutoff_date_billing: '',
    created_id: '',
    deposit_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  get ctrls() {
    return this.searchForm.controls;
  }
  get fc() {
    return this.searchForm.controls;
  }

  // 選択項目のオブジェクト
  options = {
    cutoff_date_billing: [] as SelectOption[],
  };

  ngOnInit(): void {
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
    // 各コントロールの値を空文字に設定
    Object.values(this.ctrls).forEach((x) => {
      // 日付のfrom、toに対応するためにFormGroupの時は更にループ処理を実行
      if (x instanceof FormGroup) {
        Object.values(x.controls).forEach((child) => {
          child.patchValue('');
        });
      } else {
        x.patchValue('');
      }
    });
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
      if ('from_deposit_date' in filterParams) {
        let from = this.convertStringToDate(filterParams['from_deposit_date']);
        if (!isNaN(from.getTime())) {
          // 日付が有効かどうかをチェック
          this.ctrls.deposit_date.controls.from.setValue(from.toISOString());
        } else {
          this.ctrls.deposit_date.controls.from.setValue('');
        }
      }
      if ('to_deposit_date' in filterParams) {
        let to = this.convertStringToDate(filterParams['to_deposit_date']);
        if (!isNaN(to.getTime())) {
          // 日付が有効かどうかをチェック
          this.ctrls.deposit_date.controls.to.setValue(to.toISOString());
        } else {
          this.ctrls.deposit_date.controls.to.setValue('');
        }
      }
      this.setSearchArgs(filterParams);
    }

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

          // フィルターパラメータをロードしてフォームに設定
          if (filterParams) {
            Object.entries(filterParams).forEach(([key, value]) => {
              if (key === 'created_id') {
                const createdValue = this.employeeSuggests.find((x) => {
                  return Number(x.value) === Number(filterParams['created_id']);
                });
                this.ctrls.created_id.patchValue(String(createdValue?.value));
              }
              if (key === 'deposit_client_id') {
                const clientValue = this.clientSuggests.find((x) => {
                  return (
                    Number(x.value) ===
                    Number(filterParams['deposit_client_id'])
                  );
                });
                this.ctrls.deposit_client_id.patchValue(
                  String(clientValue?.value)
                );
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

  private saveFilterParams(filter: object) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(filter));
  }
  private loadFilterParams(): object | null {
    const params = localStorage.getItem(this.localStorageKey);
    return params ? JSON.parse(params) : null;
  }

  private clearFilterParams() {
    localStorage.clear();
  }

  convertStringToDate(dateString: string): Date {
    return new Date(Date.parse(dateString));
  }

  setSearchArgs(filterParams: any) {
    Object.entries(filterParams).forEach(([key, value]) => {
      if (
        key === 'from_deposit_date' ||
        key === 'to_deposit_date' ||
        key === 'created_id' ||
        key === 'deposit_client_id'
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
