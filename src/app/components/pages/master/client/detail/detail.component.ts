import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin } from 'rxjs';
import { Client, ClientApiResponse } from 'src/app/models/client';
import { ClientCustomTagApiResponse } from 'src/app/models/client-custom-tag';
import { ClientCustomTagService } from 'src/app/services/client-custom-tag.service';
import { ClientService } from 'src/app/services/client.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { DivisionService } from 'src/app/services/division.service';
import { CommonService } from 'src/app/services/shared/common.service';

type ClientDetailListItem<T> = {
  name_en: keyof T;
  name: string;
  value: string;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  id = this.route.snapshot.params['id'];
  updater = 'データ取得中...';
  title = 'データ取得中';

  // 削除ボタン用のオブザーバブル
  remove$ = this.service
    .remove(this.id)
    .pipe(catchError(this.service.handleErrorModal<ClientApiResponse>()));

  listItems: ClientDetailListItem<Client>[] = [
    { name_en: 'id', name: '得意先ID', value: '' },
    { name_en: 'name', name: '得意先名', value: '' },
    { name_en: 'name_kana', name: '得意先名カナ', value: '' },
    { name_en: 'pic_name', name: '担当者名', value: '' },
    { name_en: 'pic_name_kana', name: '担当者名カナ', value: '' },
    { name_en: 'client_cd', name: '得意先コード', value: '' },
    { name_en: 'billing_cd', name: '請求先コード', value: '' },
    { name_en: 'postal_code', name: '住所', value: '' },
    { name_en: 'mail', name: 'メールアドレス', value: '' },
    { name_en: 'tel', name: '電話番号', value: '' },
    { name_en: 'fax', name: 'FAX番号', value: '' },
    { name_en: 'cutoff_date_billing', name: '締日', value: '' },
    { name_en: 'division_payment_value', name: '支払区分', value: '' },
    { name_en: 'scheduled_payment_date', name: '支払予定日', value: '' },
    {
      name_en: 'next_credit_confirmation_date',
      name: '与信の次回確認日',
      value: '',
    },
    { name_en: 'next_billing_date', name: '次回請求日', value: '' },
    { name_en: 'payment_term', name: '支払いサイト', value: '' },
    { name_en: 'division_sales_tax_value', name: '消費税区分', value: '' },
    {
      name_en: 'division_sales_tax_calc_value',
      name: '消費税計算区分',
      value: '',
    },
    {
      name_en: 'division_sales_tax_fraction_value',
      name: '消費税端数区分',
      value: '',
    },
    {
      name_en: 'division_sales_fraction_value',
      name: '販売端数区分',
      value: '',
    },
    { name_en: 'credit', name: '売掛限度額', value: '' },
    { name_en: 'rank_division_id', name: 'ランク価格区分', value: '' },
    { name_en: 'division_print_value', name: '印刷区分', value: '' },
    { name_en: 'line_num', name: '明細行数', value: '' },
    { name_en: 'division_title_value', name: '敬称', value: '' },
    { name_en: 'custom_title', name: '指定時の敬称', value: '' },
    { name_en: 'remarks_1', name: '備考１', value: '' },
    { name_en: 'remarks_2', name: '備考２', value: '' },
    { name_en: 'created_at', name: '登録日時', value: '' },
    { name_en: 'employee_created_last_name', name: '登録者', value: '' },
    { name_en: 'updated_at', name: '最終更新日時', value: '' },
    { name_en: 'employee_updated_last_name', name: '最終更新者', value: '' },
  ];

  // カスタムタグ表示用の配列
  tags: string[] = [];

  // コンストラクタ
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ClientService,
    private customTags: ClientCustomTagService,
    private divisions: DivisionService
  ) {}

  // コンポーネントの初期化処理
  ngOnInit(): void {
    // 各APIサービスのオブザーバブルを作成
    const client$ = this.service
      .find(this.id)
      .pipe(catchError(this.service.handleErrorModal<ClientApiResponse>()));
    const customTag$ = this.customTags
      .getRelatedCustomTags(this.id)
      .pipe(
        catchError(
          this.customTags.handleErrorModal<ClientCustomTagApiResponse>()
        )
      );
    const divisions$ = this.divisions
      .getAsSelectOptions()
      .pipe(
        catchError(
          this.divisions.handleErrorModal({} as Record<string, SelectOption[]>)
        )
      );

    // APIコール
    this.common.loading = true;
    forkJoin({ ss: client$, ct: customTag$, dv: divisions$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe((x) => {
        // 得意先情報をセット
        const client = x.ss.data[0];
        const divisions = x.dv;
        this.title = client.name;
        this.updater = `${client.employee_updated_last_name} ${client.employee_updated_first_name}`;
        this.setListItemValue(client, divisions);
        // カスタムタグ用の配列を作成
        this.tags = x.ct.data.map(
          (x) => `${x.custom_tag_name}: ${x.custom_tag_value}`
        );
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `client`オブジェクト
   */
  private setListItemValue(data: Client, divisions: any) {
    // プロパティそのままのものを格納
    this.listItems
      .filter((x) => x.name_en)
      .forEach((item) => {
        item.value = (data[item.name_en] ?? '') + '';
      });
    // 値の修正
    this.listItems.forEach((item) => {
      // 値が未設定の場合は何もしない
      if (!item.value) {
        return;
      }
      // 住所
      if (item.name_en === 'postal_code') {
        const code = `〒${item.value.slice(0, 3)}-${item.value.slice(3)}`;
        const { province, locality, street_address, other_address } = data;
        item.value = `${code} ${province}${locality}${street_address}${other_address}`;
      }
      // 締日
      if (item.name_en === 'cutoff_date_billing') {
        item.value = this.setDaySuffix(data.cutoff_date_billing);
      }
      // 支払予定日
      if (item.name_en === 'scheduled_payment_date') {
        item.value = this.setDaySuffix(data.scheduled_payment_date);
      }
      // 次回請求日
      if (item.name_en === 'next_billing_date') {
        item.value = new Date(
          String(data.next_billing_date)
        ).toLocaleDateString();
      }
      // 与信の次回確認日
      if (item.name_en === 'next_credit_confirmation_date') {
        item.value = new Date(
          String(data.next_credit_confirmation_date)
        ).toLocaleDateString();
      }
      // 日時
      if (['created_at', 'updated_at'].includes(item.name_en)) {
        item.value = new Date(item.value).toLocaleString();
      }
      // 支払いサイト
      if (item.name_en === 'payment_term') {
        const tempValue = divisions['支払いサイト'].filter(
          (x: { value: number }) => x.value === Number(item.value)
        );
        item.value = tempValue[0].text;
      }
      // ランク価格区分
      if (item.name_en === 'rank_division_id') {
        const tempValue = divisions['ランク価格区分'].filter(
          (x: { value: number }) => x.value === Number(item.value)
        );
        item.value = tempValue[0].text;
      }
      // 登録者
      if (item.name_en === 'employee_created_last_name') {
        item.value = `${data.employee_created_last_name} ${data.employee_created_first_name}`;
      }
      // 更新者
      if (item.name_en === 'employee_updated_last_name') {
        item.value = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
      }
    });
  }

  /**
   * 締日など、日付の項目を整形
   * @param value
   * @returns
   */
  setDaySuffix(value: number | '') {
    if (!value) {
      return '';
    }
    switch (value) {
      case 98:
        return '無し';
      case 99:
        return '末日';
      default:
        return `${value}日`;
    }
  }
}
