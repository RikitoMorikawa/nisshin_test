import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, catchError, finalize } from 'rxjs';
import { MemberService } from 'src/app/services/member.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { MemberApiResponse } from 'src/app/models/member';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
})
export class MemberListComponent implements OnInit, OnDestroy {
  // 絞り込みコンポーネントから値をサブミットされた時にストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるSubjectをhtmlで子コンポーネントへストリームを流す
  parentTableEvent = new Subject<object>();
  // 購読を一括して保持
  subscription = new Subscription();

  // エクスポート関連
  get export$() {
    return this.service.getAll(this.searchCriteria).pipe(
      catchError(this.service.handleErrorModal<MemberApiResponse>()),
      finalize(() => (this.common.loading = false))
    );
  }
  private searchCriteria = {}; // 絞り込み条件を保持
  fileNamePrefix = '会員';
  csvMappings: CsvMapping[] = [
    { name: 'id', prop_name: 'id' },
    { name: 'member_cd', prop_name: 'member_cd' },
    { name: 'last_name', prop_name: 'last_name' },
    { name: 'first_name', prop_name: 'first_name' },
    { name: 'last_name_kana', prop_name: 'last_name_kana' },
    { name: 'first_name_kana', prop_name: 'first_name_kana' },
    { name: 'postal_code', prop_name: 'postal_code' },
    { name: 'province', prop_name: 'province' },
    { name: 'locality', prop_name: 'locality' },
    { name: 'street_address', prop_name: 'street_address' },
    { name: 'other_address', prop_name: 'other_address' },
    { name: 'tel', prop_name: 'tel' },
    { name: 'mail', prop_name: 'mail' },
    { name: 'point', prop_name: 'point' },
    { name: 'status_division_id', prop_name: 'status_division_id' },
    { name: 'remarks_1', prop_name: 'remarks_1' },
    { name: 'remarks_2', prop_name: 'remarks_2' },
    { name: 'oid', prop_name: 'oid' },
    {
      name: 'identification_document_confirmation_date',
      prop_name: 'identification_document_confirmation_date',
    },
    { name: 'created_at', prop_name: 'created_at' },
    { name: 'created_id', prop_name: 'created_id' },
    { name: 'updated_at', prop_name: 'updated_at' },
    { name: 'updated_id', prop_name: 'updated_id' },
  ];

  /**
   * コンストラクタ
   * @param errorService
   */
  constructor(
    private errorService: ErrorService,
    private service: MemberService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.subscription.add(
      // 絞り込みコンポーネントの変更を購読
      this.parentSearchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        this.parentTableEvent.next(res);
        // 絞り込み条件をエクスポート用に保持
        this.searchCriteria = res;
      })
    );
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
   * コンポーネントの終了処理
   * @returns void
   */
  ngOnDestroy(): void {
    // 絞り込みコンポーネントの購読解除
    this.subscription.unsubscribe();
  }
}
