import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { SalesDetail } from 'src/app/models/sales-detail';
import { SalesDetailService } from 'src/app/services/sales-detail.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { DivisionService } from 'src/app/services/division.service';
import { Division } from 'src/app/models/division';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
/**
 * リスト表示項目（兼マッピング表）の型
 */
type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof SalesDetail;
};

/**
 * 売上明細詳細コンポーネント
 */
@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss'],
})
export class SalesDetailComponent implements OnInit {
  // 各種パラメータ
  private id = this.route.snapshot.params['id'];
  sales_slip_cd = this.route.snapshot.params['code'];
  gyo_cd!: number;

  // リスト要素で表示する項目の一覧とマッピング表
  listItems: ListItem[] = [
    // { name: '売上明細ID', prop_name: 'id' },
    // { name: '伝票番号', prop_name: 'sales_slip_cd' },
    // { name: '行番号', prop_name: 'gyo_cd' },
    { name: '売上日時(実時間)', prop_name: 'sale_date' },
    { name: '売上年(実時間)', prop_name: 'sale_year' },
    { name: '売上月(実時間)', prop_name: 'sale_month' },
    { name: '売上年月(実時間)', prop_name: 'sale_month_and_year' },
    { name: '売上日(実時間)', prop_name: 'sale_day' },
    { name: '売上時間(実時間)', prop_name: 'sale_hour' },
    { name: '営業日時(レジ締め時間)', prop_name: 'business_date' },
    { name: '営業年(レジ締め時間)', prop_name: 'business_year' },
    { name: '営業月(レジ締め時間)', prop_name: 'business_month' },
    { name: '営業年月(レジ締め時間)', prop_name: 'business_month_and_year' },
    { name: '営業日(レジ締め時間)', prop_name: 'business_day' },
    { name: '営業時間(レジ締め時間)', prop_name: 'business_hour' },
    { name: '店舗番号', prop_name: 'store_cd' },
    { name: '端末番号', prop_name: 'terminal_cd' },
    { name: '伝票種別', prop_name: 'sales_slip_division_cd' },
    { name: '入力担当者CD', prop_name: 'input_employee_cd' },
    { name: '入力担当者名', prop_name: 'input_employee_name' },
    { name: '人数', prop_name: 'number_of_people' },
    { name: '客層CD', prop_name: 'quality_customer_cd' },
    { name: '商品番号', prop_name: 'product_cd' },
    { name: 'バラバーコード', prop_name: 'barcode' },
    { name: '商品名', prop_name: 'product_name' },
    { name: 'フリガナ', prop_name: 'product_name_kana' },
    { name: '大分類CD', prop_name: 'large_category_cd' },
    { name: '中分類CD', prop_name: 'medium_category_cd' },
    { name: '小分類CD', prop_name: 'small_category_cd' },
    { name: '仕入先CD', prop_name: 'supplier_cd' },
    { name: '規格', prop_name: 'standard' },
    { name: '品番', prop_name: 'part_number' },
    { name: '入数', prop_name: 'quantity_per_carton' },
    { name: '納品ケース数', prop_name: 'delivery_case_number' },
    { name: '単位', prop_name: 'unit_cd' },
    { name: '単位区分', prop_name: 'unit_division_cd' },
    { name: '納品実数', prop_name: 'delivery_real_number' },
    { name: '倉庫CD', prop_name: 'warehouse_cd' },
    { name: '税抜原価', prop_name: 'tax_excluded_cost' },
    { name: '単価', prop_name: 'unit_price' },
    { name: '伝票明細合計売上', prop_name: 'slip_item_total_sales' },
    {
      name: '伝票明細合計売上(税抜)',
      prop_name: 'slip_item_tax_excluded_total_sales',
    },
    { name: '値引額', prop_name: 'discount_amount' },
    { name: '値引き種類', prop_name: 'discount_type' },
    { name: '消費税区分', prop_name: 'tax_division_cd' },
    { name: '外税対象金額', prop_name: 'tax_excluded_target_amount' },
    { name: '外税対象税', prop_name: 'tax_excluded_target_tax' },
    { name: '内税対象金額', prop_name: 'tax_included_target_amount' },
    { name: '内税対象税', prop_name: 'tax_included_target_tax' },
    { name: '特売マスタコード', prop_name: 'special_sale_cd' },
    { name: '顧客プライマリ', prop_name: 'member_id' },
    { name: '顧客番号', prop_name: 'member_cd' },
    { name: '顧客名', prop_name: 'member_name' },
    { name: '得意先コード', prop_name: 'client_cd' },
    { name: '請求先コード', prop_name: 'billing_cd' },
    { name: 'レジ締回数', prop_name: 'register_closing_times' },
    { name: '売掛締日', prop_name: 'accounts_receivable_closing_date' },
    { name: '売掛年月', prop_name: 'accounts_receivable_year_month' },
    { name: '保証書印字', prop_name: 'warranty_printing_division_cd' },
    { name: '伝票作成日時', prop_name: 'slip_creation_time' },
    { name: '伝票更新日時', prop_name: 'slip_update_time' },
    { name: '基幹システム連携フラグ', prop_name: 'coordination_flag' },
    { name: '登録日時', prop_name: 'created_at' },
    // { name: '顧客名 姓', prop_name: 'member_last_name' },
    // { name: '顧客名 名', prop_name: 'member_first_name' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: SalesDetailService,
    private division: DivisionService
  ) {}
  /**
   * dividion list
   */
  division_items: any[] = [];
  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        this.division
          .getAll({ name: '単位区分' })
          .pipe(finalize(() => (this.common.loading = false)))
          .subscribe((res) => {
            this.division_items = res.data.filter((x: Division) => {
              return x.name == '単位区分';
            });
            this.setListItemValue(x.data[0]);
            this.gyo_cd = x.data[0].gyo_cd;
          });
      });
  }

  private getDivisionText(division_code: string) {
    const result = this.division_items.find((x: any) => {
      return x.division_code == Number(division_code);
    });
    return result.value;
  }
  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `SalesSlip`オブジェクト。
   */
  private setListItemValue(data: SalesDetail) {
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
      if (
        [
          '税抜原価',
          '単価',
          '伝票明細合計売上',
          '伝票明細合計売上(税抜)',
          '値引額',
          '外税対象金額',
          '外税対象税',
          '内税対象金額',
          '内税対象税',
          '端末番号',
          '人数',
        ].includes(item.name)
      ) {
        item.value = `${Number(item.value).toLocaleString()}`;
      }

      // 日時系
      if (['伝票作成日時', '伝票更新日時', '登録日時'].includes(item.name)) {
        item.value = new Date(item.value).toLocaleString();
      }

      // その他
      if (item.name === '伝票種別') {
        item.value = Number(item.value) ? '返品' : '通常';
      }
      if (item.name === '単位') {
        item.value = this.getDivisionText(item.value);
      }

      if (item.name === '単位区分') {
        const values = ['ケース', 'ジャケット', 'バラ'];
        item.value = values[Number(item.value)];
      }

      if (item.name === '消費税区分') {
        const values = ['外税', '内税', '非課税'];
        item.value = values[Number(item.value)];
      }

      if (item.name === '保証書印字') {
        item.value = Number(item.value) ? 'あり' : 'なし';
      }

      if (item.name === '基幹システム連携フラグ') {
        const values = ['なし', 'レンタル', '修理', '客注'];
        item.value = values[Number(item.value)];
      }
    });
  }
}
