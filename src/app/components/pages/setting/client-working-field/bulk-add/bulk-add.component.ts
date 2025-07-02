import { Component } from '@angular/core';
import { ClientWorkingFieldService } from 'src/app/services/client-working-field.service';
import { ApiCallStatus } from '../../../master/template/add-edit/add-edit.component';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent {
  fileNamePrefix = '得意先現場';
  apiService = this.service;
  descriptions = [
    {
      title: 'id',
      description: '得意先現場ID（半角数字）※空欄にすると新規登録になります。',
    },
    {
      title: 'name',
      description: '現場名（255文字以内の文字列）',
      required: true,
    },
    {
      title: 'client_id',
      description: '得意先ID（半角数字）',
      required: true,
    },
  ];

  // コンストラクタ
  constructor(
    private common: CommonService,
    private service: ClientWorkingFieldService
  ) {}

  /**
   * 一括登録のステータス変更に応じた処理
   * @param status 一括登録テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    if (status === ApiCallStatus.START) {
      this.common.loading = true;
    }
    if (status === ApiCallStatus.END) {
      this.common.loading = false;
    }
  }
}
