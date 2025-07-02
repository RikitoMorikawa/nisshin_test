import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, Observable } from 'rxjs';
import { StorePrice, StorePriceApiResponse } from 'src/app/models/store-price';
import { StorePriceService } from 'src/app/services/store-price.service';
import { StorePriceCommonService } from '../store-price-common.service';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * リスト表示項目（兼マッピング表）の型
 */
type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof StorePrice;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  // 各種パラメータ
  id = this.route.snapshot.params['id'];
  updater?: string;
  title?: string;

  // リスト要素で表示する項目の一覧とマッピング表
  listItems: ListItem[] = [
    { name: '店舗名', prop_name: 'store_name' },
    { name: '商品名', prop_name: 'product_name' },
    { name: '売価', prop_name: 'selling_price' },
    { name: 'B売価', prop_name: 'b_selling_price' },
    { name: 'C売価', prop_name: 'c_selling_price' },
    { name: '荒利率', prop_name: 'gross_profit_rate' },
    { name: 'B荒利率', prop_name: 'b_gross_profit_rate' },
    { name: 'C荒利率', prop_name: 'c_gross_profit_rate' },
    { name: '商品消費税区分', prop_name: 'division_sales_tax_value' },
    { name: '商品消費税端数区分', prop_name: 'division_sales_fraction_value' },
    { name: '仕入先商品単価', prop_name: 'supplier_cost_price' },
    { name: '仕入先商品B単価', prop_name: 'b_supplier_cost_price' },
    { name: '仕入先商品C単価', prop_name: 'c_supplier_cost_price' },
    {
      name: '仕入先消費税区分',
      prop_name: 'division_supplier_sales_tax_value',
    },
    {
      name: '仕入先消費税端数区分',
      prop_name: 'division_supplier_sales_fraction_value',
    },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '更新日時', prop_name: 'updated_at' },
    { name: '更新者', prop_name: 'employee_updated_last_name' },
  ];

  // 削除周りの変数
  removeMethod$: Observable<StorePriceApiResponse> = this.service
    .remove(this.id)
    .pipe(catchError(this.service.handleErrorModal<StorePriceApiResponse>()));

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private spcommon: StorePriceCommonService,
    private service: StorePriceService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(
        catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        const data = x.data[0];
        this.setListItemValue(data);
        this.title = `店舗売価ID：${data.id}`;
        if (data.employee_updated_last_name) {
          this.updater = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
        }
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `SalesSlip`オブジェクト。
   */
  private setListItemValue(data: StorePrice) {
    // プロパティそのままのものを格納
    this.listItems
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (data[item.prop_name!] ?? '') + '';
      });

    // 値の修正
    this.listItems.forEach((item) => {
      // 値が未設定なら何もしない
      if (!item.value) {
        return;
      }

      // 金額系
      if (/.*売価/.test(item.name) || /仕入先.*単価/.test(item.name)) {
        item.value = `${Number(item.value).toLocaleString()}`;
      }

      // 荒利率
      if (/.*荒利率/.test(item.name)) {
        item.value = item.value + '％';
      }

      // 日時系
      if (['登録日時', '更新日時'].includes(item.name)) {
        item.value = new Date(item.value).toLocaleString();
      }

      // 登録者
      if (item.name === '登録者') {
        item.value = `${data.employee_created_last_name} ${data.employee_created_first_name}`;
      }

      // 更新者
      if (item.name === '更新者') {
        item.value = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
      }
    });
  }
}
