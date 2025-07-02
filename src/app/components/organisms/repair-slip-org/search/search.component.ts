import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription, catchError, finalize, forkJoin, of } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { repairSlipConst } from 'src/app/const/repair-slip-const';
import { CustomValidators } from 'src/app/app-custom-validator';
import { DivisionService } from 'src/app/services/division.service';
import { divisionConst } from 'src/app/const/division.const';
import { HttpErrorResponse } from '@angular/common/http';
import { modalConst } from 'src/app/const/modal.const';
import { generalConst } from 'src/app/const/general.const';
import { EmployeeService } from 'src/app/services/employee.service';
import { SupplierService } from 'src/app/services/supplier.service';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private supplierService: SupplierService,
    private divisionService: DivisionService,
    private common: CommonService
  ) {}

  // 購読を一元管理する Subscription
  private subscription = new Subscription();

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 受付担当者サジェスト
  employeeSuggests!: SelectOption[];

  // 修理依頼先(仕入先：問屋)サジェスト
  supplierSuggests!: SelectOption[];

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // ステータス選択肢
  statusOptions!: SelectOption[];

  // 精算ステータス選択肢
  settleStatusOptions!: SelectOption[];

  // バリデーション用
  errorConst = errorConst;

  // フォームグループ
  form = this.fb.group({
    id: '',
    member_id: '',
    mobile_number: '',
    last_name: '',
    reception_employee_id: '',
    supplier_id: '',
    status_division_id: '',
    settle_status_division_id: '',
    reception_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    arrival_expected_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    arrival_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
  });

  get ctrls() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // 選択肢初期化書実行
    this.initialization();
  }

  private initialization() {
    // ローディング開始
    this.common.loading = true;

    // サジェスト用サプライヤー、ステータス選択肢取得
    this.subscription.add(
      forkJoin([
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.supplierService.getAsSelectOptions(),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            error.emit(error);
            return of(error.error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.message);
            return;
          }

          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(400, modalConst.BODY.HAS_ERROR);
            return;
          }

          // レスポンスの配列の要素が3つあるか
          if (res.length !== 3) {
            this.handleError(400, modalConst.BODY.HAS_ERROR);
            return;
          }

          this.employeeSuggests = res[0];
          // ステータス選択肢取得
          this.statusOptions = res[1][divisionConst.REPAIR_SLIP_STATUS];
          // 精算ステータス選択肢取得
          this.settleStatusOptions = res[1][divisionConst.SETTLE_STATUS];
          // 修理依頼先(仕入先：問屋)
          this.supplierSuggests = res[2];
          const defaultSettleStatus = this.settleStatusOptions.find((x) => {
            return (
              x.text === repairSlipConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED
            );
          });

          //this.checkStatus();
          this.form.controls.settle_status_division_id.patchValue(
            String(defaultSettleStatus?.value)
          );
          this.handleClickSubmitButton();
        })
    );
  }

  /**
   * フォームの入力値をチェック
   * @param ctrl
   * @returns
   */
  invalid(ctrl: FormControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 絞り込みパネル開閉処理
   */
  panelOpenButtonOnClick() {
    if (this.hasPanelOpened) {
      this.hasPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
    } else {
      this.hasPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 絞り込みクリアボタンのクリックイベントに対応
   * @returns void
   */
  handleClickClearButton(): void {
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
  }

  /**
   * 絞り込み実行ボタンのクリックイベント対応
   * @returns void
   */
  handleClickSubmitButton(): void {
    const searchValue = this.form.value;
    const flatted = flattingFormValue(searchValue);
    this.searchEvent.emit(removeNullsAndBlanks(flatted));
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '修理受付票一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }
}
