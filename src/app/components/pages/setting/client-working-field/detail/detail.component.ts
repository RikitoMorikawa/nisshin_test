import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ClientWorkingField,
  ClientWorkingFieldApiResponse,
} from 'src/app/models/client-working-field';
import { ClientWorkingFieldService } from 'src/app/services/client-working-field.service';
import { catchError, finalize } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';

// 詳細一覧項目の型
type listItem = {
  name: string;
  value?: string;
  prop_name: keyof ClientWorkingField;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  id = this.route.snapshot.params['id'];
  title = 'データ取得中';
  updater = '未登録';

  // 削除ボタン用のオブザーバブル
  remove$ = this.service
    .remove(this.id)
    .pipe(
      catchError(this.service.handleErrorModal<ClientWorkingFieldApiResponse>())
    );

  // 詳細情報の一覧表示項目
  private _details: listItem[] = [
    { name: '現場ID', prop_name: 'id' },
    { name: '現場名', prop_name: 'name' },
    { name: '得意先ID', prop_name: 'client_id' },
    { name: '得意先名', prop_name: 'client_name' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '更新日時', prop_name: 'updated_at' },
    { name: '更新者', prop_name: 'employee_updated_last_name' },
  ];
  get details() {
    return this._details as Required<listItem>[];
  }

  /**
   * コンストラクタ
   * @param route
   * @param common
   * @param service
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ClientWorkingFieldService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(
        catchError(
          this.service.handleErrorModal<ClientWorkingFieldApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const data = res.data[0];
        this.setDetailsValue(data);
        this.title = data.name;
        if (data.employee_updated_last_name) {
          this.updater = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
        }
      });
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `ClientWorkingField`オブジェクト。
   */
  private setDetailsValue(data: ClientWorkingField) {
    // プロパティそのままを格納
    this._details
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (data[item.prop_name] ?? '') + '';
      });
    // 値を整形
    this._details.forEach((item) => {
      // 空白なら何もしない
      if (!item.value) {
        return;
      }
      // 日時
      if (['created_at', 'updated_at'].includes(item.prop_name)) {
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
    });
  }
}
