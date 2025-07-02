import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  Input,
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
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-sliplist-search',
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
    private employeeService: EmployeeService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService
  ) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  // エラー文言
  errorConst = errorConst;
  regExConst = regExConst;

  // フォーム関連
  searchForm = this.fb.group({
    sale_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
    business_date: this.fb.group(
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

  ngOnInit(): void {
    // 検索条件肢初期化実行
    this.searchForm = this.setSearchClear();
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
    this.searchForm = this.setSearchClear();
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    // 親コンポーネントへ送信
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
   * 検索条件初期化
   */
  setSearchClear() {
    return this.fb.group({
      sale_date: this.fb.group(
        { from: '', to: '' },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
      business_date: this.fb.group(
        { from: '', to: '' },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
    });
  }
}
