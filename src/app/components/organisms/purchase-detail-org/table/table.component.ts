import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  //OnDestroy,
} from '@angular/core';
import {
  //catchError,
  //finalize,
  //of,
  Subject,
  Subscription,
  //switchMap,
  //tap,
  //filter,
  //take,
} from 'rxjs';
import {
  TableWithPaginationEvent,
  // TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  PurchaseDetail,
  PurchaseDetailApiResponse,
} from 'src/app/models/purchase-detail';
import {
  //TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';

export interface TableWithPaginationParams {
  data: PurchaseDetail[];
  total: number;
}
import {
  AbstractControl,
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { Router } from '@angular/router';

interface PriceData {
  order_price: FormControl<string | null>;
  quantity: FormControl<string | null>;
  total: FormControl<string | null>;
  string_view_total: FormControl<string | null>;
}

@Component({
  selector: 'app-purchase-detail-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
//export class TableComponent implements OnInit, OnDestroy {
export class TableComponent implements OnInit {
  @Input() loading = false;
  @Input() showTaxColumn: boolean = false;
  @Input() params!: Subject<TableWithPaginationParams>;
  @Input() purchaseDetailForms!: FormGroup;
  @Input() purchaseDetailRemoveForms!: FormGroup;
  @Output() pageChange = new EventEmitter<TableWithPaginationEvent>();
  @Input() isDiscount: boolean = false;
  @Input() total_cost: number = 0;
  /**
   * コンストラクタ
   * @param poService
   */
  constructor(
    private router: Router,
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  subscription = new Subscription();

  pageLimits: SelectOption[] = [
    { value: 50, text: '1ページに50レコード表示' },
    { value: 100, text: '1ページに100レコード表示' },
  ];

  frmPageLimit = new FormControl(this.pageLimits[0].value);
  // frmPageLimit = new FormControl(this.pageLimits[0].value, {
  //   updateOn: 'change',
  // });
  data: PurchaseDetail[] = [];
  total: number = 0;
  // ページネーション ダミー用
  meals: string[] = [];
  counts = {
    start: 0,
    end: 0,
  };

  itemsPerPage = Number(this.pageLimits[0].value);
  page = 1;

  // テーブルのイベント取得用
  sort = {} as TableSortStatus;
  /**
   * Angular ライフサイクルフック
   *
   */
  ngOnInit(): void {
    this.loadParams();
    this.frmPageLimit.valueChanges.subscribe((value) => {
      this.changeSelect(Number(value));
    });
  }

  private loadParams(): void {
    if (this.params === undefined) {
      //throw new Error('params is not defined');
      return;
    }

    this.params.subscribe((params) => {
      this.data = params.data;
      this.total = params.total;
      //console.log(params);
      //if (params.total !== this._params.total) {
      //  this.page = 1;
      //}
      //this._params = params;
      this.updateCounts();
    });
  }

  setLimit(event: any): void {
    const limit = event.target.value;
    // const params = {
    //   currentPage: 1,
    //   itemsPerPage: limit,
    // };
    //this.itemsPerPage = limit;
    //this.getPurchaseDetail();
  }

  /**
   * レコード表示数を変更して、ページの更新処理を呼び出す。
   * @param value 設定されるレコード表示数
   */
  private changeSelect(value: number) {
    this.page = Math.ceil(this.counts.start / value); // 現在のページを再計算
    this.page = this.page > 0 ? this.page : 1;
    this.itemsPerPage = value;
    this.updatePage(this.page);
  }

  updatePage(page: number) {
    this.page = page;
    this.pageChange.emit({
      page: this.page,
      itemsPerPage: this.itemsPerPage,
      sort: this.sort,
    });
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    // console.log(controlName);
    // console.log(form.get(controlName));
    return form.get(controlName) as FormControl;
  }

  getViewFormControlTypeValue(form: AbstractControl, controlName: string) {
    const control = this.getFormControlTypeValue(form, controlName);
    if (control == null) {
      return '';
    }

    return control.value;
  }

  get purchaseDetailForm(): FormGroup {
    return this.fb.group({
      // 修理区分タイプ
      id: [''],
      view_barcode: [''],
      view_total: [''],
      view_supplier_product_cd: [''],
      view_division_unit_value: [''],
      view_division_seal_print_value: [''],
      view_division_shelf_value: [''],
      view_division_shelf_col_value: [''],
      view_division_price_tag_value: [''],
      view_minimum_order_quantity: [''],
      view_quantity: [''],
      view_regulated_stock_num: [''],

      api_product_name: [''],
      purchase_order_id: [''],
      product_id: [''],
      order_quantity: [''],
      order_price: [''],
      receiving_date: [''],
      receiving_quantity: [''],

      string_view_total: [''], //表示用
      is_discount: [''],
      //receiving_employee_id: [''],
    });
  }

  /**
   * 件数表示用オブジェクトを更新する。
   */
  private updateCounts() {
    const start = (this.page - 1) * this.itemsPerPage + 1;
    this.counts.start = start < this.total ? start : this.total;
    const end = start + this.itemsPerPage - 1;
    this.counts.end = end < this.total ? end : this.total;
  }

  handleSelectedProductData(purchaseDetailForm: FormGroup, product: Product) {
    //customerOrderForm.tax_included_unit_price.patchValue(product.tax_included_unit_price);
    if (product === undefined) {
      return;
    }
    //console.log(product);
    purchaseDetailForm.controls['view_barcode'].patchValue(product.barcode);
    purchaseDetailForm.controls['view_supplier_product_cd'].patchValue(
      product.supplier_product_cd
    );
    purchaseDetailForm.controls['view_division_unit_value'].patchValue(
      product.division_unit_value
    );
    purchaseDetailForm.controls['view_division_seal_print_value'].patchValue(
      product.division_seal_print_value
    );
    purchaseDetailForm.controls['view_division_shelf_value'].patchValue(
      product.division_shelf_value
    );
    purchaseDetailForm.controls['view_division_shelf_col_value'].patchValue(
      product.division_shelf_col_value
    );
    purchaseDetailForm.controls['view_division_price_tag_value'].patchValue(
      product.division_price_tag_value
    );
    purchaseDetailForm.controls['view_minimum_order_quantity'].patchValue(
      product.minimum_order_quantity
    );
    purchaseDetailForm.controls['view_quantity'].patchValue(product.quantity);
    purchaseDetailForm.controls['view_regulated_stock_num'].patchValue(
      product.regulated_stock_num
    );

    //customerOrderForm.controls['product_name'].patchValue(product.name);
  }

  private handleCostChanges(cost: string | null, priceData: PriceData) {
    console.log('handleCostChanges');
    const quantity = priceData.quantity.value;
    let total = Number(quantity) * Number(cost);
    priceData.total.patchValue(String(total));
    priceData.string_view_total.patchValue(total.toLocaleString());
    this.setTotalCost();
  }

  private handleQuantityChanges(quantity: string | null, priceData: PriceData) {
    console.log('handleQuantityChanges');
    const cost = priceData.order_price.value;
    let total = Number(quantity) * Number(cost);
    priceData.total.patchValue(String(total));
    priceData.string_view_total.patchValue(total.toLocaleString());
    this.setTotalCost();
  }

  private setTotalCost() {
    let totalSum = 0;

    this.purchaseDetailArray.value.forEach((item: any) => {
      console.log(item.order_price + item.order_quantity);
      totalSum += Number(item.order_price) * Number(item.order_quantity);
    });
    this.total_cost = totalSum;
  }

  changeLine(form: AbstractControl) {
    const total =
      Number(form.value.order_price) * Number(form.value.order_quantity);
    const string_total = total.toLocaleString();
    const view_total = this.getFormControlTypeValue(form, 'view_total');
    const string_view_total = this.getFormControlTypeValue(
      form,
      'string_view_total'
    );

    view_total.patchValue(total);
    string_view_total.patchValue(string_total);

    this.setTotalCost();
  }

  /**
   * 商品名のサジェストを取得
   * @returns
   */
  getProduct(purchaseDetailForm: any): ApiInput<ProductApiResponse> {
    return {
      observable: this.productService.getAll({
        name: purchaseDetailForm.controls['api_product_name'].value, //this.fc.product_name.value,
        //$select: 'id,name',
      }),
      idField: 'id',
      nameField: 'name',
    };
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

  addDetail() {
    const purchaseDetailForm = this.purchaseDetailForm;
    const priceData = {
      order_price: purchaseDetailForm.controls['order_price'] as FormControl, // 単価
      quantity: purchaseDetailForm.controls['order_quantity'] as FormControl, // 数量
      total: purchaseDetailForm.controls['view_total'] as FormControl,
      string_view_total: purchaseDetailForm.controls[
        'string_view_total'
      ] as FormControl,
    };
    purchaseDetailForm.controls['order_price'].valueChanges.subscribe(
      (order_price: any) => {
        this.handleCostChanges(order_price, priceData);
      }
    );
    purchaseDetailForm.controls['order_quantity'].valueChanges.subscribe(
      (order_quantity: any) => {
        this.handleQuantityChanges(order_quantity, priceData);
      }
    );

    this.purchaseDetailArray.push(purchaseDetailForm);
    console.log(this.purchaseDetailArray);
  }

  removeDetail(index: number) {
    const purchaseDetailForm = this.purchaseDetailArray.controls[
      index
    ] as FormGroup;
    if (purchaseDetailForm.controls['id'].value !== '') {
      this.purchaseDetailRemoveArray.push(purchaseDetailForm);
    }
    this.purchaseDetailArray.removeAt(index);
  }

  get purchaseDetailArray(): FormArray {
    return this.purchaseDetailForms.get('forms') as FormArray;
  }

  get purchaseDetailArrayControls() {
    return this.purchaseDetailArray.controls as FormGroup[];
  }

  get purchaseDetailRemoveArray(): FormArray {
    return this.purchaseDetailRemoveForms.get('forms') as FormArray;
  }

  // 消費税区分列のヘッダーを表示するかどうかを判定するメソッド
  get shouldShowTaxHeader(): boolean {
    return this.showTaxColumn;
  }
}
