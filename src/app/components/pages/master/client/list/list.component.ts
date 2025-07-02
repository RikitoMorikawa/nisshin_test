import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, finalize } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { provinces } from 'src/app/models/province';
import { Client, ClientApiResponse } from 'src/app/models/client';
import { ClientService } from 'src/app/services/client.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { errorConst } from 'src/app/const/error.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { CommonService, Mapping } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  fileNamePrefix = '得意先';
  errorConst = errorConst;
  // フォームのコントロール
  form = this.fb.group({
    name: '',
    client_cd: '',
    billing_cd: '',
    province: '',
    locality: '',
    tel: '',
    cutoff_date_billing: '',
    next_credit_confirmation_date: this.fb.group(
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

  // テーブル周りの変数
  tableParams = {} as TableWithPaginationParams;
  columnNameMappings: Mapping<Client>[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'name', name_jp: '得意先名' },
    { name: 'mail', name_jp: 'メールアドレス' },
    { name: 'tel', name_jp: '電話番号' },
    { name: 'pic_name', name_jp: '担当者名' },
    { name: 'province', name_jp: '住所' },
    { name: 'next_credit_confirmation_date', name_jp: '与信の次回確認日' },
  ];

  // 選択項目のオブジェクト
  options = {
    province: [] as SelectOption[],
    cutoff_date_billing: [] as SelectOption[],
  };

  /**
   * コンストラクタ
   * @param fb
   * @param common
   * @param service
   */
  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private service: ClientService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 選択項目の初期化
    this.initOptions();
  }

  /**
     各APIから情報を取得して、選択肢項目を設定する。
    */
  private initOptions() {
    // 都道府県
    this.options.province = provinces.map<SelectOption>((x) => ({
      value: x,
      text: x,
    }));

    // 締日
    for (let i = 1; i < 31; i++) {
      this.options.cutoff_date_billing.push({ value: i, text: i + '日' });
    }
    this.options.cutoff_date_billing.push(
      { value: 99, text: '末日' },
      { value: 98, text: '無し' }
    );

    // 初期値の設定
    Object.values(this.options).map((y) =>
      y.unshift({ value: '', text: '選択してください' })
    );
  }

  /**
   * APIからデータを取得し、テーブル表示用データを更新する。
   */
  updateTable(event: TableWithPaginationEvent) {
    // パラメータの作成
    const filter = this.form.value as Partial<Client>;
    const flattered = flattingFormValue(filter);
    const trimmed = removeNullsAndBlanks(flattered);
    const params = this.common.createApiParams(
      trimmed,
      event,
      this.columnNameMappings
    );
    // APIコールとテーブルの更新
    this.common.loading = true;
    this.service
      .getAll(params)
      .pipe(
        catchError(this.service.handleErrorModal<ClientApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        console.log(x);
        this.tableParams = this.common.createTableParams(
          x,
          this.columnNameMappings,
          this.modifiedTableBody
        );
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
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: Client) {
    return (mapping: Mapping<Client>) => {
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }

      // IDならリンクに修正
      if (mapping.name === 'id') {
        return {
          href: `./detail/${record[mapping.name]}`,
          text: record[mapping.name] + '',
        };
      }

      // 都道府県なら住所に修正
      if (mapping.name === 'province') {
        const {
          postal_code,
          province,
          locality,
          street_address,
          other_address,
        } = record;
        const postcode = postal_code
          ? `〒${postal_code.slice(0, 3)}-${postal_code.slice(3)} `
          : '';
        return `${postcode}${province}${locality}${street_address} ${other_address}`;
      }

      // 日付の表記を変換
      if (['next_credit_confirmation_date'].includes(mapping.name)) {
        return new Date(record[mapping.name] as string).toLocaleDateString();
      }

      return record[mapping.name];
    };
  }
}
