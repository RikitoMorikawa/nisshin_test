import { Component } from '@angular/core';
import { catchError, finalize } from 'rxjs';
import { ClientWorkingFieldService } from 'src/app/services/client-working-field.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { CustomValidators } from 'src/app/app-custom-validator';
import {
  ClientWorkingField,
  ClientWorkingFieldApiResponse,
} from 'src/app/models/client-working-field';
import { errorConst } from 'src/app/const/error.const';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { ClientService } from 'src/app/services/client.service';
import { ClientApiResponse } from 'src/app/models/client';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { CommonService, Mapping } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  fileNamePrefix = '得意先現場';
  errorConst = errorConst;

  // 絞り込みフォームのコントロール
  form = this.fb.group({
    id: '',
    name: '',
    client_id: '',
    client_name: '',
    created_at: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
    updated_at: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  get fc() {
    return this.form.controls;
  }

  // エクスポート用のオブザーバブル
  get export$() {
    const params = this.common.formatFormData(this.form.value);
    return this.service.getCsv('csv', params).pipe(
      catchError(this.service.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
  }

  // テーブルまわりの変数
  tableParams = {} as TableWithPaginationParams;
  columnNameMappings: Mapping<ClientWorkingField>[] = [
    { name: 'id', name_jp: '現場ID' },
    { name: 'name', name_jp: '現場名' },
    { name: 'client_id', name_jp: '得意先ID' },
    { name: 'client_name', name_jp: '得意先名' },
    { name: 'created_at', name_jp: '登録日' },
    { name: 'updated_at', name_jp: '更新日' },
  ];

  /**
   * コンストラクタ
   * @param service
   * @param common
   * @param fb
   * @param clientService
   */
  constructor(
    private service: ClientWorkingFieldService,
    private common: CommonService,
    private fb: FormBuilder,
    private clientService: ClientService
  ) {}

  /**
   * APIからデータを取得し、テーブル表示用データを更新する。
   */
  updateTable(event: TableWithPaginationEvent) {
    this.common.loading = true;
    // パラメータの作成
    const filter = this.form.value as Partial<ClientWorkingField>;
    const flatted = flattingFormValue(filter);
    const trimmed = removeNullsAndBlanks(flatted);
    const params = this.common.createApiParams(
      trimmed,
      event,
      this.columnNameMappings
    );
    // APIコールとテーブルの更新
    this.service
      .getAll(params)
      .pipe(
        catchError(
          this.service.handleErrorModal<ClientWorkingFieldApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        this.tableParams = this.common.createTableParams(
          res,
          this.columnNameMappings,
          this.modifiedTableBody
        );
      });
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: ClientWorkingField) {
    return (mapping: Mapping<ClientWorkingField>) => {
      // 値が空白なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }

      // IDをリンクに修正
      if (mapping.name === 'id') {
        return {
          href: `./detail/${record[mapping.name]}`,
          text: record[mapping.name] + '',
        };
      }

      // 日付の表記を変換
      if (['created_at', 'updated_at'].includes(mapping.name)) {
        return new Date(record[mapping.name] as string).toLocaleDateString();
      }

      return record[mapping.name];
    };
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
   * 絞り込み用結果を取得
   * 得意先用
   * @returns
   */
  getClientSuggests(): ApiInput<ClientApiResponse> {
    return {
      observable: this.clientService.getAll({
        name: this.fc.client_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 絞り込み用結果を取得
   * 現場用
   * @returns
   */
  getWorkingFieldSuggests(): ApiInput<ClientWorkingFieldApiResponse> {
    return {
      observable: this.service.getAll({
        name: this.fc.name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
}
