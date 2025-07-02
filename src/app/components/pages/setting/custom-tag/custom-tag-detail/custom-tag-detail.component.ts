import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, Observable } from 'rxjs';
import { CustomTag, CustomTagApiResponse } from 'src/app/models/custom-tag';
import { CustomTagService } from 'src/app/services/custom-tag.service';
import { CustomTagCommonService } from '../custom-tag-common.service';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * リスト表示項目（兼マッピング表）の型
 */
type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof CustomTag;
};

/**
 * カスタムタグ詳細コンポーネント
 */
@Component({
  selector: 'app-custom-tag-detail',
  templateUrl: './custom-tag-detail.component.html',
  styleUrls: ['./custom-tag-detail.component.scss'],
})
export class CustomTagDetailComponent implements OnInit {
  // 各種パラメータ
  id = this.route.snapshot.params['id'];
  updater?: string;
  title?: string;

  // リスト要素で表示する項目の一覧とマッピング表
  listItems: ListItem[] = [
    { name: 'カスタムタグID', prop_name: 'id' },
    { name: 'タグ名', prop_name: 'name' },
    { name: '値', prop_name: 'value' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '更新日時', prop_name: 'updated_at' },
    { name: '更新者', prop_name: 'employee_updated_last_name' },
  ];

  // 削除周りの変数
  removeMethod$: Observable<CustomTagApiResponse> = this.service
    .remove(this.id)
    .pipe(catchError(this.service.handleErrorModal<CustomTagApiResponse>()));

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private cucommon: CustomTagCommonService,
    private service: CustomTagService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(
        catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        const data = x.data[0];
        this.setListItemValue(data);
        this.title = `${data.name}：${data.value}`;
        if (data.employee_updated_last_name) {
          this.updater = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
        }
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `SalesSlip`オブジェクト。
   */
  private setListItemValue(data: CustomTag) {
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
