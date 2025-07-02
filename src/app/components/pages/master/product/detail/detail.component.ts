import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, filter } from 'rxjs';
import { CustomTagApiResponse } from 'src/app/models/custom-tag';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { ProductCustomTagApiResponse } from 'src/app/models/product-custom-tag';
import { ProductCustomTagService } from 'src/app/services/product-custom-tag.service';
import { ProductService } from 'src/app/services/product.service';
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
  id = this.route.snapshot.params['id'];
  updater = 'データ取得中...';
  title = 'データ取得中';
  logo = 'assets/images/no_image.png';

  // seal_price_indication
  SEAL_PRICE_INDICATION_FALSE = '表示しない';
  SEAL_PRICE_INDICATION_TRUE = '表示する';

  // 削除ボタン用のオブザーバブル
  remove$ = this.service
    .remove(this.id)
    .pipe(catchError(this.service.handleErrorModal<ProductApiResponse>()));

  // リスト要素で表示する項目の一覧とマッピング表
  private listItems: listItem[] = [
    { name: '商品ID', prop_name: 'id' },
    { name: '商品名', prop_name: 'name' },
    { name: '商品名カナ', prop_name: 'name_kana' },
    { name: '仕入先ID', prop_name: 'supplier_id' },
    { name: '仕入先名', prop_name: 'supplier_name' },
    { name: '仕入先商品コード', prop_name: 'supplier_product_cd' },
    {
      name: '仕入先消費税区分',
      prop_name: 'division_supplier_sales_tax_value',
    },
    {
      name: '仕入先販売端数区分',
      prop_name: 'division_supplier_sales_fraction_value',
    },
    { name: '仕入先商品単価', prop_name: 'supplier_cost_price' },
    { name: '仕入先商品B単価', prop_name: 'b_supplier_cost_price' },
    { name: '仕入先商品C単価', prop_name: 'c_supplier_cost_price' },
    { name: '規格', prop_name: 'standard' },
    { name: '品番', prop_name: 'part_number' },
    { name: '商品消費税区分', prop_name: 'division_sales_tax_value' },
    { name: '販売端数区分', prop_name: 'division_sales_fraction_value' },
    { name: 'バーコード', prop_name: 'barcode' },
    { name: 'Bバーコード', prop_name: 'b_barcode' },
    { name: 'Cバーコード', prop_name: 'c_barcode' },
    { name: '入数', prop_name: 'quantity' },
    { name: 'B入数', prop_name: 'b_quantity' },
    { name: 'C入数', prop_name: 'c_quantity' },
    { name: '粗利率', prop_name: 'gross_profit_rate' },
    { name: 'B粗利率', prop_name: 'b_gross_profit_rate' },
    { name: 'C粗利率', prop_name: 'c_gross_profit_rate' },
    { name: '売価', prop_name: 'selling_price' },
    { name: 'B売価', prop_name: 'b_selling_price' },
    { name: 'C売価', prop_name: 'c_selling_price' },
    { name: '値引区分', prop_name: 'division_discount_value' },
    { name: '単位区分', prop_name: 'division_unit_value' },
    { name: 'B単位区分', prop_name: 'division_b_unit_value' },
    { name: 'C単位区分', prop_name: 'division_c_unit_value' },
    { name: '商品区分', prop_name: 'division_product_value' },
    { name: 'ポイント区分', prop_name: 'division_point_value' },
    { name: '保証書発行区分', prop_name: 'division_issuance_warranty_value' },
    { name: '大分類', prop_name: 'large_category_name' },
    { name: '中分類', prop_name: 'medium_category_name' },
    { name: '小分類', prop_name: 'small_category_name' },
    { name: '備考1', prop_name: 'remarks_1' },
    { name: '備考2', prop_name: 'remarks_2' },
    { name: '備考3（レジ備考）', prop_name: 'remarks_3' },
    { name: '備考4', prop_name: 'remarks_4' },
    { name: 'ラベルシール印刷区分', prop_name: 'division_seal_print_value' },
    { name: 'ラベルシール価格表示区分', prop_name: 'seal_price_indication' },
    { name: 'ポップシール区分', prop_name: 'division_price_tag_value' },
    { name: '発注対象バーコード', prop_name: 'ordering_target_barcode' },
    { name: '規定在庫数', prop_name: 'regulated_stock_num' },
    { name: '発注点', prop_name: 'ordering_point' },
    { name: '発注リードタイム', prop_name: 'order_lead_time' },
    { name: '陳列棚区分', prop_name: 'division_shelf_value' },
    { name: '陳列棚列区分', prop_name: 'division_shelf_col_value' },
    { name: 'カスタム大分類', prop_name: 'custom_large_category_name' },
    { name: 'カスタム中分類', prop_name: 'custom_medium_category_name' },
    { name: 'カスタム小分類', prop_name: 'custom_small_category_name' },
    { name: 'データ公開区分', prop_name: 'division_data_permission_value' },
    { name: '最小発注数', prop_name: 'minimum_order_quantity' },
    { name: '配送基本料金', prop_name: 'basic_shipping_fee' },
    { name: '配送追加料金', prop_name: 'shipping_surcharge' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '最終更新日時', prop_name: 'updated_at' },
    { name: '廃番設定日時', prop_name: 'out_of_service_at' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '最終更新者', prop_name: 'employee_updated_last_name' },
    { name: '廃番設定者', prop_name: 'employee_out_of_service_last_name' },
  ];
  get details() {
    return this.listItems as Required<listItem>[];
  }
  tags: { name: string; value: string }[] = [];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ProductService,
    private customTags: ProductCustomTagService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 各APIサービスのオブザーバブルを作成
    const products$ = this.service
      .find(this.id)
      .pipe(catchError(this.service.handleErrorModal<ProductApiResponse>()));
    const customTags$ = this.customTags
      .getRelatedCustomTags(this.id)
      .pipe(
        catchError(
          this.customTags.handleErrorModal<ProductCustomTagApiResponse>()
        )
      );

    // APIコール
    this.common.loading = true;
    forkJoin({ ps: products$, ct: customTags$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        // 商品マスタの情報をセット
        const data = x.ps.data[0];
        this.updater = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
        this.title =
          data.name + (data.name_kana ? `（${data.name_kana}）` : '');
        data.image_path ? (this.logo = data.image_path) : '';
        this.setListItemValue(data);
        // カスタムタグの情報をセット
        this.tags = x.ct.data.map((x) => ({
          name: 'カスタムタグ',
          value: `${x.custom_tag_name}: ${x.custom_tag_value}`,
        }));
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `Product`オブジェクト。
   */
  private setListItemValue(data: Product) {
    // プロパティそのままのものを格納
    this.listItems
      .filter((x) => x.name)
      .forEach((item) => {
        item.value = (data[item.prop_name] ?? '') + '';
      });

    // 値の修正
    this.listItems.forEach((item) => {
      // 値が未設定なら何もしない
      if (!item.value) {
        return;
      }

      // 金額系
      if (
        [
          'supplier_cost_price',
          'b_supplier_cost_price',
          'c_supplier_cost_price',
          'selling_price',
          'b_selling_price',
          'c_selling_price',
          'order_cost_price',
          'basic_shipping_fee',
          'shipping_surcharge',
        ].includes(item.prop_name)
      ) {
        item.value = `${Number(item.value).toLocaleString()} 円`;
      }

      if (item.prop_name === 'seal_price_indication') {
        if (item.value === '1') {
          item.value = this.SEAL_PRICE_INDICATION_TRUE;
        } else {
          item.value = this.SEAL_PRICE_INDICATION_FALSE;
        }
      }
      // 粗利率
      if (
        [
          'gross_profit_rate',
          'b_gross_profit_rate',
          'c_gross_profit_rate',
        ].includes(item.prop_name)
      ) {
        item.value = `${item.value} %`;
      }

      // 日時系
      if (
        ['created_at', 'updated_at', 'out_of_service_at'].includes(
          item.prop_name
        )
      ) {
        item.value = new Date(item.value).toLocaleString();
      }

      // 登録者
      if (item.prop_name === 'employee_created_last_name') {
        item.value = `${data.employee_created_last_name} ${data.employee_created_first_name}`;
      }

      // 更新者
      if (item.prop_name === 'employee_updated_last_name') {
        item.value = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
      }

      // 廃番登録者
      if (item.prop_name === 'employee_out_of_service_last_name') {
        item.value = `${data.employee_out_of_service_last_name} ${data.employee_out_of_service_first_name}`;
      }
    });
  }
}
