import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { EmployeeService } from 'src/app/services/employee.service';
import { OrderFn } from '../../../../functions/order-functions';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { SupplierService } from 'src/app/services/supplier.service';
import { DivisionService } from 'src/app/services/division.service';
import { divisionConst } from 'src/app/const/division.const';
import { modalConst } from 'src/app/const/modal.const';
import { generalConst } from 'src/app/const/general.const';
import { CustomValidators } from 'src/app/app-custom-validator';
import { ProductService } from 'src/app/services/product.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { ProductApiResponse } from 'src/app/models/product';
import { SupplierApiResponse } from 'src/app/models/supplier';

/**
 * 検索フォームコンポーネント
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private productService: ProductService,
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

  // サジェスト選択肢
  employeeSuggests!: SelectOption[];

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
    id: '', // 個票No
    purchase_order_id: '', // 発注書No
    supplier_id: '', // 仕入先
    supplier_name: '', // 仕入先名
    order_status_division_id: '',
    product_id: '', // 商品ID
    product_name: '', // 商品名
    created_id: '', // 発注商品登録者
    receiving_employee_id: '', // 検品担当者
    shelf_value: '', // 棚番
    created_at: this.fb.group(
      // 登録日
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    receiving_date: this.fb.group(
      // 検品日
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
  });
  get ctrls() {
    return this.form.controls;
  }

  /**
   * 初期化処理
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
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.ORDER_STATUS,
        }),
      ])
        .pipe(
          catchError((error) => {
            error.emit(error);
            return of(error.error);
          })
        )
        .subscribe((res) => {
          console.log(res);
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.message);
            return;
          }

          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(400, modalConst.BODY.HAS_ERROR);
            return;
          }

          // 社員選択肢取得
          this.employeeSuggests = res[0];

          // ステータス選択肢取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[1];
          const statusDivisionOptions =
            statusDivisionsRes[divisionConst.ORDER_STATUS];

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
    console.log(searchValue);
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
      title: '発注個票一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * 絞り込み用結果を取得
   * 商品用
   * @returns
   */
  getProductSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: this.ctrls.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
  /**
   * 絞り込み用結果を取得
   * 仕入先用
   * @returns
   */
  getSupplierSuggests(): ApiInput<SupplierApiResponse> {
    return {
      observable: this.supplierService.getAll({
        name: this.ctrls.supplier_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
}
