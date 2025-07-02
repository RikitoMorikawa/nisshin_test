import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * 詳細一覧項目の型
 */
type listItem = {
  name: string;
  value?: string;
  prop_name: keyof Product;
};

/**
 * 詳細情報コンポーネント
 */
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  id = this.route.snapshot.params['pid'];
  title = '';
  listPagePath = '../'; // 仕入先商品一覧へのパス（ここだけ移動階層数が違う）

  // 詳細情報の一覧表示項目
  _details: listItem[] = [
    { name: '商品ID', prop_name: 'id' },
    { name: '商品コード', prop_name: 'supplier_product_cd' },
    { name: '商品名', prop_name: 'name' },
    { name: '商品名カナ', prop_name: 'name_kana' },
    { name: '仕入先ID', prop_name: 'supplier_id' },
    { name: '仕入先名', prop_name: 'supplier_name' },
    { name: 'バーコード', prop_name: 'barcode' },
    { name: '規格', prop_name: 'standard' },
    { name: '品番', prop_name: 'part_number' },
    { name: '仕入先商品単価', prop_name: 'supplier_cost_price' },
    { name: '単位区分', prop_name: 'division_unit_value' },
    { name: '商品消費税区分', prop_name: 'division_sales_tax_value' },
    { name: '販売端数区分', prop_name: 'division_sales_fraction_value' },
    { name: 'Cバーコード', prop_name: 'c_barcode' },
    { name: 'C入数', prop_name: 'c_quantity' },
    { name: 'C価格', prop_name: 'c_selling_price' },
    { name: 'C単位区分', prop_name: 'c_unit_division_id' },
    { name: '最小発注数', prop_name: 'minimum_order_quantity' },
    { name: '発注単位区分', prop_name: 'order_unit' },
    { name: '発注リードタイム', prop_name: 'order_lead_time' },
    { name: '商品区分', prop_name: 'division_product_value' },
    { name: '備考1', prop_name: 'remarks_1' },
    { name: '備考2', prop_name: 'remarks_2' },
    { name: '備考3（レジ備考）', prop_name: 'remarks_3' },
    { name: '備考4', prop_name: 'remarks_4' },
    { name: '作成日時', prop_name: 'created_at' },
    { name: '更新日時', prop_name: 'updated_at' },
  ];
  get details() {
    return this._details as Required<listItem>[];
  }

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ProductService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        const data = x.data[0];
        this.title =
          data.name + (data.name_kana ? `（${data.name_kana}）` : '');
        this.setDetailsValue(data);
      });
  }

  /**
   * リスト項目として表示する値を生成し、セットする。
   * @param data `SupplierProduct`オブジェクト。
   */
  private setDetailsValue(data: Product) {
    // プロパティそのままのものを格納
    this._details
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (data[item.prop_name] ?? '') + '';
      });

    // 値の修正
    this._details.forEach((item) => {
      // 値が未設定なら何もしない
      if (!item.value) {
        return;
      }

      // 金額系
      if (['price', 'c_price'].includes(item.prop_name)) {
        item.value = `${Number(item.value).toLocaleString()} 円`;
      }

      // 日時系
      if (['created_at', 'updated_at'].includes(item.prop_name)) {
        item.value = new Date(item.value).toLocaleString();
      }

      // リードタイム
      if (item.prop_name === 'order_lead_time') {
        item.value = `${item.value} 日`;
      }
    });
  }
}
