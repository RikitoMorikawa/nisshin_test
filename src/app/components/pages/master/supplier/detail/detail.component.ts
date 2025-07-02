import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin } from 'rxjs';
import { Supplier, SupplierApiResponse } from 'src/app/models/supplier';
import { SupplierCustomTagApiResponse } from 'src/app/models/supplier-custom-tag';
import { SupplierCustomTagService } from 'src/app/services/supplier-custom-tag.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { CommonService } from 'src/app/services/shared/common.service';

type SupplierDetailItems<T> = {
  name: keyof T;
  name_jp: string;
  value?: string;
  visibility: Visibility;
};

type Visibility = 'visible' | 'hidden';

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
  receivable = '-';

  // 削除ボタン用のオブザーバブル
  remove$ = this.service
    .remove(this.id)
    .pipe(catchError(this.service.handleErrorModal<SupplierApiResponse>()));

  // リスト要素で表示する項目の一覧とマッピング表
  listItems: SupplierDetailItems<Supplier>[] = [
    { name: 'name', name_jp: '仕入先名', visibility: 'visible' },
    { name: 'name_kana', name_jp: '仕入先名カナ', visibility: 'visible' },
    { name: 'postal_code', name_jp: '住所', visibility: 'visible' },
    { name: 'tel', name_jp: '電話番号', visibility: 'visible' },
    { name: 'fax', name_jp: 'FAX番号', visibility: 'visible' },
    { name: 'mail', name_jp: 'メールアドレス', visibility: 'visible' },
    {
      name: 'cutoff_date_billing',
      name_jp: '支払情報',
      visibility: 'visible',
    },
    {
      name: 'division_sales_fraction_value',
      name_jp: '販売端数区分',
      visibility: 'visible',
    },
    {
      name: 'division_sales_tax_value',
      name_jp: '消費税区分',
      visibility: 'visible',
    },
    {
      name: 'division_sales_tax_calc_value',
      name_jp: '消費税計算区分',
      visibility: 'visible',
    },
    {
      name: 'division_sales_tax_fraction_value',
      name_jp: '消費税端数区分',
      visibility: 'visible',
    },
    { name: 'pic_name', name_jp: '担当者名', visibility: 'visible' },
    { name: 'pic_name_kana', name_jp: '担当者名カナ', visibility: 'visible' },
    { name: 'payee_1', name_jp: '振込先1', visibility: 'visible' },
    { name: 'payee_2', name_jp: '振込先2', visibility: 'visible' },
    { name: 'remarks_1', name_jp: '備考1', visibility: 'hidden' },
    { name: 'remarks_2', name_jp: '備考2', visibility: 'hidden' },
    {
      name: 'last_login_at',
      name_jp: '最終ログイン日時',
      visibility: 'visible',
    },
    { name: 'created_at', name_jp: '登録日時', visibility: 'hidden' },
    {
      name: 'employee_created_last_name',
      name_jp: '登録者',
      visibility: 'hidden',
    },
    { name: 'updated_at', name_jp: '最終更新日時', visibility: 'hidden' },
    {
      name: 'employee_updated_last_name',
      name_jp: '最終更新者',
      visibility: 'hidden',
    },
  ];
  tags: string[] = [];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: SupplierService,
    private customTags: SupplierCustomTagService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 各APIサービスのオブザーバブルを作成
    const supplier$ = this.service
      .find(this.id)
      .pipe(catchError(this.service.handleErrorModal<SupplierApiResponse>()));
    const customTag$ = this.customTags
      .getRelatedCustomTags(this.id)
      .pipe(
        catchError(
          this.customTags.handleErrorModal<SupplierCustomTagApiResponse>()
        )
      );

    // APIコール
    this.common.loading = true;
    forkJoin({ ss: supplier$, ct: customTag$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        // 仕入先情報をセット
        const supplier = x.ss.data[0];
        this.title = supplier.name;
        this.updater = `${supplier.employee_updated_last_name} ${supplier.employee_updated_first_name}`;
        if (supplier.account_payable) {
          this.receivable = supplier.account_payable.toLocaleString();
        }
        if (supplier.logo_image_path) {
          this.logo = supplier.logo_image_path;
        }
        this.setListItemValue(supplier);

        // カスタムタグ用の配列を作成
        this.tags = x.ct.data.map(
          (x) => `${x.custom_tag_name}: ${x.custom_tag_value}`
        );
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `Supplier`オブジェクト。
   */
  private setListItemValue(data: Supplier) {
    // プロパティそのままのものを格納
    this.listItems
      .filter((x) => x.name)
      .forEach((item) => {
        item.value = (data[item.name] ?? '') + '';
      });

    // 値の修正
    this.listItems.forEach((item) => {
      // 値が未設定なら何もしない
      if (!item.value) {
        return;
      }

      // 住所
      if (item.name === 'postal_code') {
        const code = `〒${item.value.slice(0, 3)}-${item.value.slice(3)}`;
        const { province, locality, street_address, other_address } = data;
        item.value = `${code} ${province}${locality}${street_address} ${other_address}`;
      }

      // 支払情報
      if (item.name === 'cutoff_date_billing') {
        const formatter = (value: number | '') => {
          if (!value) {
            return '';
          }
          return value === 99 ? '末日' : `${value}日`;
        };
        const cutoff = `${formatter(data.cutoff_date_billing)}締め`;
        let payment = '';
        if (data.division_payment_site_value || data.scheduled_payment_date) {
          payment = `${data.division_payment_site_value}${formatter(
            data.scheduled_payment_date
          )}払い`;
        }
        item.value = `${cutoff}${payment}（${data.division_payment_value}）`;
      }

      // 日時系
      if (['created_at', 'updated_at', 'last_login_at'].includes(item.name)) {
        item.value = new Date(item.value).toLocaleString();
      }

      // 登録者
      if (item.name === 'employee_created_last_name') {
        item.value = `${data.employee_created_last_name} ${data.employee_created_first_name}`;
      }

      // 更新者
      if (item.name === 'employee_updated_last_name') {
        item.value = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
      }
    });
  }
}
