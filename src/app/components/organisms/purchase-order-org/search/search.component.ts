import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import { OrderFn } from 'src/app/functions/order-functions';
import { EmployeeService } from 'src/app/services/employee.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { errorConst } from 'src/app/const/error.const';
import { DivisionService } from 'src/app/services/division.service';
import { divisionConst } from 'src/app/const/division.const';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private divisionService: DivisionService
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

  supplierSuggests!: SelectOption[];

  employeeSuggests!: SelectOption[];

  // ローディング中フラグ
  // isDuringAcquisition = false;

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // ステータス選択肢
  statusOptions!: SelectOption[];

  // バリデーション用
  errorConst = errorConst;

  // フォームグループ
  form = this.fb.group({
    id: '',
    order_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    preferred_delivery_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    store_id: '',
    supplier_id: '',
    order_employee_id: '',
    purchase_order_status_division_id: '',
  });

  get ctrls() {
    return this.form.controls;
  }

  /**
   * Angular ライフサイクルフック
   */
  ngOnInit(): void {
    // 選択肢初期化書実行
    this.initialization();
  }

  /**
   * Angular ライフサイクルフック
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initialization() {
    // サジェスト用サプライヤー、ステータス選択肢取得
    this.subscription.add(
      forkJoin([
        this.supplierService.getAsSelectOptions(),
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.PURCHASE_ORDER_STATUS,
        }),
      ])
        .pipe(
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

          // サプライヤー選択肢取得
          this.supplierSuggests = res[0];

          // 社員選択肢取得
          this.employeeSuggests = res[1];

          // ステータス選択肢取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[2];
          const statusDivisionOptions =
            statusDivisionsRes[divisionConst.PURCHASE_ORDER_STATUS];

          // ステータス選択肢に初期値を追加
          const defaultOption: SelectOption[] = [
            {
              value: '',
              text: generalConst.PLEASE_SELECT,
            },
          ];
          this.statusOptions = defaultOption.concat(statusDivisionOptions);
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
    const flatted = OrderFn.flattingFormValue(searchValue);
    this.searchEvent.emit(OrderFn.removeNullsAndBlanks(flatted));
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '発注書一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }
}
