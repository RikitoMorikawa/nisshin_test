import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  EMPTY,
  Subject,
  Subscription,
  catchError,
  of,
  switchMap,
  finalize,
} from 'rxjs';
import {
  AccountsReceivableAggregateService,
  PaymentData,
} from 'src/app/services/accounts-receivable-aggregate.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { CommonService } from 'src/app/services/shared/common.service';
import {
  AccountsReceivableAggregate,
  AccountsReceivableAggregateApiResponse,
} from 'src/app/models/accounts-receivable-aggregate';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  // 初期値のパス
  topPagePath = '/setting';

  constructor(
    private errorService: ErrorService,
    private common: CommonService,
    private araService: AccountsReceivableAggregateService,
    private flashMessageService: FlashMessageService
  ) {}

  private subscription = new Subscription();

  private _filter = {};
  public bulkIds: string[] = new Array();

  // ローディング中フラグ
  isDuringAcquisition = false;

  // 絞り込みコンポーネントから値をサブミットされた時にストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるSubjectをhtmlで子コンポーネントへストリームを流す
  parentTableEvent = new Subject<object>();

  // PDF一括ダウンロード  get export$() {
  get exportPdf$() {
    return this.araService
      .getPdf('bulk-pdf', { id: this.bulkIds.join(',') })
      .pipe(
        catchError(this.araService.handleErrorModal('')),
        finalize(() => (this.common.loading = false))
      );
  }
  pdfFileNamePrefix = '請求書一括PDF';

  // エクスポート関連
  get export$() {
    return this.araService.getCsv('csv', { ...this._filter }).pipe(
      catchError(this.araService.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
    //return this.araService.getAll().pipe(
    //  catchError(
    //    this.araService.handleErrorModal<AccountsReceivableAggregateApiResponse>()
    //  ),
    //  finalize(() => (this.common.loading = false))
    //);
  }
  fileNamePrefix = '請求一覧';
  csvMappings: CsvMapping[] = [
    { name: 'id', prop_name: 'id' },
    { name: 'billing_id', prop_name: 'billing_id' },
    { name: 'client_id', prop_name: 'client_id' },
    { name: 'client_name', prop_name: 'client_name' },
    { name: 'billing_date', prop_name: 'billing_date' },
    { name: 'billing_amount', prop_name: 'billing_amount' },
    { name: 'payment_exp_date', prop_name: 'payment_exp_date' },
    { name: 'status_division_id', prop_name: 'status_division_id' },
  ];

  /**
   * ライフサイクルメソッド
   */
  ngOnInit(): void {
    this.subscription.add(
      // 絞り込みコンポーネントの変更を購読する
      this.parentSearchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        //console.log(res);
        this._filter = res;
        this.parentTableEvent.next(res);
      })
    );
  }
  // 子コンポーネントからのイベントを受け取ってbulkIdsを更新
  handleBulkIdsChange(newBulkIds: any[]) {
    this.bulkIds = newBulkIds;
  }
  /**
   * エクスポートの進捗応じた処理
   * @param status エクスポートコンポーネントから取得されるステータス
   */
  onExportStatusChange(status: ExportStatus) {
    if (status === ExportStatus.START) {
      // エラー発生時に備えて false の設定はオブザーバブルの finalize で処理
      this.common.loading = true;
    }
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param error
   */
  handleError(
    error: {
      status: number;
      title?: string;
      message?: string;
    },
    redirectPath?: string
  ) {
    const title = error.title ? error.title : 'エラー';
    const message = error.message ? error.message : 'エラーが発生しました。';
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: error.status,
      title: title,
      message: message,
      redirectPath: redirectPath ? redirectPath : undefined,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
