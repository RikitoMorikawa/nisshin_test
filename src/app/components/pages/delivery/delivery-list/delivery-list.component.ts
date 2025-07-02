import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { DeliveryApiResponse } from 'src/app/models/delivery';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
})
export class DeliveryListComponent implements OnInit, OnDestroy {
  /**
   *
   * @param errorService
   */
  constructor(private errorService: ErrorService) {}

  // 絞り込みコンポーネントから値をサブミットされた時にストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるSubjectをhtmlで子コンポーネントへストリームを流す
  parentTableEvent = new Subject<object>();

  subscription = new Subscription();

  delivery$!: Observable<DeliveryApiResponse>;
  csvMappings: CsvMapping[] = [
    { name: 'ID', prop_name: 'id' },
    { name: '売上伝票番号', prop_name: 'sales_slip_sales_slip_cd' },
    { name: '会員名 姓', prop_name: 'member_last_name' },
    { name: '会員名 名', prop_name: 'member_first_name' },
    { name: '配送住所', prop_name: 'address' },
    { name: '電話番号', prop_name: 'tel' },
    { name: '配送指定日時', prop_name: 'delivery_specified_time' },
    { name: '配送開始日時', prop_name: 'delivery_start_time' },
    { name: '配送完了日時', prop_name: 'delivery_complete_time' },
    { name: '配送担当者 姓', prop_name: 'employee_delivery_last_name' },
    { name: '配送担当者 名', prop_name: 'employee_delivery_first_name' },
    { name: '備考1', prop_name: 'remarks_1' },
    { name: '備考2', prop_name: 'remarks_2' },
  ];
  filename = '配送一覧';
  loading = false;

  ngOnInit(): void {
    this.subscription.add(
      // 絞り込みコンポーネントの変更を購読する
      this.parentSearchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        this.parentTableEvent.next(res);
      })
    );
  }

  /**
   * エクスポートのイベントを検知しローディング表示を切り替える
   * @param status `ExportLinkOrgComponent`から受け取るイベント
   */
  exportEventListener(status: ExportStatus) {
    this.loading = !!status;
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 絞り込みコンポーネントの購読解除
    this.subscription.unsubscribe();
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param error
   */
  handleError(error: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: error.status,
      title: error.title,
      message: error.message,
      redirectPath: error.redirectPath ? error.redirectPath : undefined,
    });
  }
}
