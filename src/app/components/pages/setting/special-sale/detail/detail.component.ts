import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, Observable } from 'rxjs';
import {
  SpecialSale,
  SpecialSaleApiResponse,
} from 'src/app/models/special-sale';
import { SpecialSaleService } from 'src/app/services/special-sale.service';
import { CommonService } from 'src/app/services/shared/common.service';
/**
 * リスト表示項目（兼マッピング表）の型
 */
type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof SpecialSale;
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
    { name: '特売ID', prop_name: 'id' },
    { name: '店舗名', prop_name: 'store_name' },
    { name: '商品名', prop_name: 'product_name' },
    { name: 'JANコード', prop_name: 'barcode' },
    { name: '開始日', prop_name: 'start_date' },
    { name: '終了日', prop_name: 'end_date' },
    { name: '行番号', prop_name: 'gyo_cd' },
    { name: '特売価格', prop_name: 'special_sale_price' },
    { name: '特売原価', prop_name: 'special_sale_const_price' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '更新日時', prop_name: 'updated_at' },
    { name: '更新者', prop_name: 'employee_updated_last_name' },
  ];

  // 削除周りの変数
  removeMethod$: Observable<SpecialSaleApiResponse> = this.service
    .remove(this.id)
    .pipe(catchError(this.service.handleErrorModal<SpecialSaleApiResponse>()));

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: SpecialSaleService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(
        catchError(this.service.handleErrorModal<SpecialSaleApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        const data = x.data[0];
        this.setListItemValue(data);
        this.title = `特売コード：${data.special_sale_cd}`;
        if (data.employee_updated_last_name) {
          this.updater = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
        }
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `SalesSlip`オブジェクト。
   */
  private setListItemValue(data: SpecialSale) {
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
      if (['特売価格', '特売原価'].includes(item.name)) {
        item.value = `${Number(item.value).toLocaleString()}`;
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
