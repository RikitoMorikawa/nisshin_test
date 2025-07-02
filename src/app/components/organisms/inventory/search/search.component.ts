import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnInit,
  AfterViewInit,
  Output,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { EmployeeService } from 'src/app/services/employee.service';
import { InventoryFn } from '../../../../functions/inventory-functions';
import { ProductService } from 'src/app/services/product.service';

/**
 * 検索フォームコンポーネント
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, AfterViewInit {
  @Output() event = new EventEmitter();
  @Output() err = new EventEmitter<HttpErrorResponse>();
  options = {} as InventoryFn.Options;

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // フォームグループ
  form = this.fb.group({
    management_cd: '',
    product_id: '',
    stock_quantity: '',
    receiving_quantity: '',
    inventory_rep_id: '',
    receiving_rep_id: '',
    cancel_rep_id: '',
    inventory_execution_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [
          InventoryFn.customValids.afterToday(),
          InventoryFn.customValids.beforeFromDate(),
        ],
      }
    ),
    inventory_complete_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [
          InventoryFn.customValids.afterToday(),
          InventoryFn.customValids.beforeFromDate(),
        ],
      }
    ),
    created_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [
          InventoryFn.customValids.afterToday(),
          InventoryFn.customValids.beforeFromDate(),
        ],
      }
    ),
    updated_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [
          InventoryFn.customValids.afterToday(),
          InventoryFn.customValids.beforeFromDate(),
        ],
      }
    ),
  });
  get ctrls() {
    return this.form.controls;
  }

  // バリデーション用
  errorConst = errorConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private productService: ProductService
  ) {}

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    // 社員APIをサブスクライブして、レスポンスから選択肢の項目を生成。
    this.employeeService
      .getAsSelectOptions()
      .pipe(
        catchError((err) => {
          err.emit(err); // エラーを親コンポーネントへ通知
          return of(err.error);
        })
      )
      .subscribe(
        (res) =>
          (this.options = InventoryFn.initOptions(res, {
            text: '選択してください',
            value: '',
          }))
      );

    // 商品APIをサブスクライブして、レスポンスから選択肢の項目を生成。
    this.productService
      .getAsSelectOptions()
      .pipe(
        catchError((err) => {
          err.emit(err); // エラーを親コンポーネントへ通知
          return of(err.error);
        })
      )
      .subscribe((res) => {
        this.options.product = res;
      });
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
    this.form.reset();
    Object.values(this.ctrls).forEach((x) => x.patchValue('')); // SELECT がある階層は空文字で初期化
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    this.search();
    this.isOpen = false;
  }

  /**
   * 初期表示時の検索
   */
  ngAfterViewInit() {
    const initValue = {
      inventory_execution_date: {
        from: '2022-12-01',
      },
    };
    this.form.patchValue(initValue);
    this.search();
  }

  /**
   * 検索
   */
  search() {
    const values = this.form.value;
    const flatted = InventoryFn.flattingFormValue(values);
    this.event.emit(InventoryFn.removeNullsAndBlanks(flatted));
  }
}
