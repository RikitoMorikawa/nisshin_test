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
import { modalConst } from 'src/app/const/modal.const';
import { OrderFn } from 'src/app/functions/order-functions';
import { EmployeeService } from 'src/app/services/employee.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { errorConst } from 'src/app/const/error.const';
import { DivisionService } from 'src/app/services/division.service';
import { HttpErrorResponse } from '@angular/common/http';
import { divisionConst } from 'src/app/const/division.const';
import { customerOrderReceptionSlipConst } from 'src/app/const/customer-order-reception-slip.const';
import { CustomerOrderService } from 'src/app/services/customer-order.service';
import { CustomerOrder } from 'src/app/models/customer-order';
import { SupplierService } from 'src/app/services/supplier.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private divisionService: DivisionService,
    private customerOrderService: CustomerOrderService,
    private supplierService: SupplierService,
    private productService: ProductService
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

  // ストレージキー
  private localStorageKey = 'filterParams-customer-order-reception-slip';

  employeeSuggests!: SelectOption[];

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // ステータス選択肢
  statusOptions!: SelectOption[];
  // 清算選択
  settleStatusOptions!: SelectOption[];

  // バリデーション用
  errorConst = errorConst;

  corsConst = customerOrderReceptionSlipConst;

  // フォームグループ
  form = this.fb.group({
    id: '',
    management_cd: '',
    last_name: '',
    status_division_id: '',
    total_amount_including_tax: '',
    delivery_division_id: '',
    settle_status_division_id: '',
    incident_division_id: '',
    tel: '',
    remarks_1: '',
    remarks_2: '',
    supplier_id: '',
    quotation_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    reception_employee_id: '',
    quotation_expiration_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    created_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
  });

  // supplier_id_list
  supplier_id_list: number[] = [];
  supplierOptions: SelectOption[] = [];
  product: any[] = [];
  cor_slip_id: any[] = [];
  /**
   * form.controls のゲッター
   */
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

  /**
   * 絞り込みフォーム初期化処理
   */
  private initialization() {
    // サジェスト用得意先、担当者、ステータス選択肢取得
    this.subscription.add(
      forkJoin([
        this.employeeService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.CUSTOMER_ORDER_RECEPTION_SLIP_STATUS,
        }),
        this.divisionService.getAsSelectOptions({
          name: divisionConst.SETTLE_STATUS,
        }),
        this.customerOrderService.getAll(),
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
          if (res.length !== 4) {
            this.handleError(400, modalConst.BODY.HAS_ERROR);
            return;
          }

          // 社員選択肢取得
          this.employeeSuggests = res[0];

          // ステータス選択肢取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[1];
          const statusDivisionOptions =
            statusDivisionsRes[
              divisionConst.CUSTOMER_ORDER_RECEPTION_SLIP_STATUS
            ];

          this.statusOptions = statusDivisionOptions;
          //
          const settleStatusDivisionsRes: Record<string, SelectOption[]> =
            res[2];
          const settleStatusDivisionsOptions =
            settleStatusDivisionsRes[divisionConst.SETTLE_STATUS];
          this.settleStatusOptions = settleStatusDivisionsOptions;

          // order からリストを抽出する
          let supplier_ids: number[] = [];
          let product_ids: number[] = [];
          const d = res[3].data.filter((x: CustomerOrder) => {
            if (x.supplier_id) {
              supplier_ids.push(x.supplier_id);
            }
            if (x.product_id) {
              product_ids.push(x.product_id);
            }
            this.cor_slip_id.push({
              product_id: x.product_id,
              customer_slip_id: x.customer_order_reception_slip_id,
            });
            return;
          });
          // 重複削除
          let product_sids: number[] = Array.from(new Set(product_ids));
          let product_id: string = product_sids.join(',');
          if (product_id) {
            // 仕入先データも読み込んでから最終処理
            this.getSupplierList(product_id);
          } else {
            // 仕入先データがない場合は即座に最終処理
            this.completeInitialization();
          }
        })
    );
  }

  getSupplierList(product_id: string) {
    this.subscription.add(
      forkJoin([this.productService.getAll({ id: product_id })])
        .pipe()
        .subscribe((res) => {
          for (let i in res[0].data) {
            this.product.push({
              product_id: res[0].data[i].id,
              supplier_id: res[0].data[i].supplier_id,
            });
          }
          /** 仕入れ先リストの生成 Option*/
          this.getSupplierOption(this.product);
        })
    );
  }
  getSupplierOption(product: any) {
    let supplierlists: number[] = [];
    const a = product.filter((x: any) => {
      supplierlists.push(x.supplier_id);
    });
    let supplier_sids: number[] = Array.from(new Set(supplierlists));
    let supplier_id: string = supplier_sids.join(',');
    this.subscription.add(
      forkJoin([this.supplierService.getAll({ id: supplier_id })])
        .pipe()
        .subscribe((res) => {
          this.supplierOptions = [];
          for (let i in res[0].data) {
            this.supplierOptions.push({
              value: res[0].data[i].id,
              text: res[0].data[i].name,
            });
          }
          // 全てのデータが揃ったので最終処理を実行
          this.completeInitialization();
        })
    );
  }

  /**
   * 全データ読み込み完了後の最終処理
   */
  private completeInitialization(): void {
    // 保存された検索条件を取得
    const savedParams = this.loadFilterParams();

    if (savedParams) {
      // 保存されたパラメータでフォームを復元
      this.restoreFormValues(savedParams);
      this.handleClickSubmitButton();
    } else {
      // デフォルト検索実行
      this._initSearch();
    }
  }

  /**
   * 保存されたフォーム値
   */
  private restoreFormValues(params: any): void {
    // 全てのフィールドを復元
    Object.keys(params).forEach((key) => {
      const control = this.form.get(key);
      if (control && params[key] !== undefined) {
        let value = params[key];

        // プルダウン系の処理
        if (
          [
            'status_division_id',
            'settle_status_division_id',
            'supplier_id',
            'reception_employee_id',
          ].includes(key)
        ) {
          // 空文字や無効な値の場合はスキップ
          if (
            params[key] === '' ||
            params[key] === null ||
            params[key] === undefined
          ) {
            return;
          }
          value = Number(params[key]);
          // 変換後が0またはNaNの場合もスキップ
          if (value === 0 || isNaN(value)) {
            return;
          }
          // optionに存在するかチェック
          let options: SelectOption[] = [];
          if (key === 'status_division_id') options = this.statusOptions;
          else if (key === 'settle_status_division_id')
            options = this.settleStatusOptions;
          else if (key === 'supplier_id') options = this.supplierOptions;
          else if (key === 'reception_employee_id')
            options = this.employeeSuggests;
          const foundOption = options?.find(
            (opt) => Number(opt.value) === value
          );
          if (!foundOption) {
            return;
          }
        }

        control.patchValue(value);
      }
    });
    setTimeout(() => {
      this.forceUpdateSelectSuggestComponents();
    }, 100);
  }

  /**
   * select-suggestコンポーネントの表示を更新
   */
  private forceUpdateSelectSuggestComponents(): void {
    // 各プルダウンの値をオブジェクト形式で再設定
    this.setSelectSuggestValue('status_division_id', this.statusOptions);
    this.setSelectSuggestValue(
      'settle_status_division_id',
      this.settleStatusOptions
    );
    this.setSelectSuggestValue('supplier_id', this.supplierOptions);
    this.setSelectSuggestValue('reception_employee_id', this.employeeSuggests);
  }

  /**
   * select-suggestコンポーネントの値を設定
   */
  private setSelectSuggestValue(
    fieldName: string,
    options: SelectOption[]
  ): void {
    const control = this.form.get(fieldName);
    if (!control || !options?.length) {
      return;
    }
    const currentValue = control.value;
    // 無効な値（0、null、undefined、空文字）の場合はスキップ
    if (!currentValue || currentValue === 0 || currentValue === '') {
      return;
    }
    const foundOption = options.find(
      (opt) => Number(opt.value) === Number(currentValue)
    );
    if (foundOption) {
      const selectValue = {
        value: foundOption.value,
        text: foundOption.text,
      };
      control.patchValue(selectValue, { emitEvent: true });
      // その後、正しい値に戻す
      setTimeout(() => {
        control.patchValue(foundOption.value, { emitEvent: false });
      }, 50);
    }
  }

  /**
   * 仕入れ先からcustomer_slip_idを抽出する。
   */
  supplierChange(event: any) {
    /**選択 > supplier_id > product_is > slip_id */
    let supplier_id = Number((event.target as HTMLInputElement).value);
    let product_list: number[] = [];
    let slip_id_list: number[] = [];
    let n = this.product.filter((x) => {
      if (x.supplier_id === supplier_id) {
        product_list.push(x.product_id);
      }
      return x.supplier_id === supplier_id;
    });
    // slip_id のリストを取得する
    for (let i in product_list) {
      let slip = this.cor_slip_id.filter((x) => {
        if (product_list[i] === x.product_id) {
          slip_id_list.push(x.customer_slip_id);
        }
      });
    }
    let slip_ids: number[] = Array.from(new Set(slip_id_list));
    let slip_id_list_string: string = slip_ids.join(',');
    this.ctrls.id.patchValue(slip_id_list_string);
  }

  /**
   *
   * 初期検索状態設定
   * 初期検索状態を設定しているので、
   * src/app/components/organisms/customer-order-reception-slip-org/table/table.component.ts
   * で行っている初期化処理はコメントアウトしています。
   *
   */
  private _initSearch(): void {
    if (this.statusOptions === undefined) {
      return;
    }
    const statusDivision = this.statusOptions.find((x) => {
      // 入荷済み のコードが決まるまでの 暫定対応
      return x.text === this.corsConst.STATUS.AVAILABLE;
    });
    if (statusDivision !== undefined) {
      this.ctrls.status_division_id.patchValue(String(statusDivision.value));
    }
    this.handleClickSubmitButton();
  }
  /**
   * フォームの入力値をチェック
   * @param ctrl
   * @returns
   */
  invalid(ctrl: FormControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  changeNumber(ctrl: FormControl): void {
    console.log(ctrl.value);
    this.ctrls.tel.setValue(ctrl.value);
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
    // ローカルストレージクリア
    this.clearFilterParams();
  }

  /**
   * 絞り込み実行ボタンのクリックイベント対応
   * @returns void
   */
  handleClickSubmitButton(): void {
    const searchValue = this.form.value;
    const flatted = OrderFn.flattingFormValue(searchValue);
    const filterParams = OrderFn.removeNullsAndBlanks(flatted);
    // 現在のフォーム状態を保存
    this.saveFilterParams(this.form.value);
    this.searchEvent.emit(filterParams);
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '客注受付票一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * 検索条件をローカルストレージに保存
   */
  private saveFilterParams(filter: any): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(filter));
  }
  /**
   * ローカルストレージから検索条件を取得
   */
  private loadFilterParams(): any | null {
    const params = localStorage.getItem(this.localStorageKey);
    return params ? JSON.parse(params) : null;
  }
  /**
   * ローカルストレージから検索条件をクリア
   */
  private clearFilterParams(): void {
    localStorage.removeItem(this.localStorageKey);
  }
}
