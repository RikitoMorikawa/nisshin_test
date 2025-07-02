import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, finalize, Subject } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { CustomTag, CustomTagApiResponse } from 'src/app/models/custom-tag';
import { CustomTagService } from 'src/app/services/custom-tag.service';
import { CustomTagCommonService } from '../custom-tag-common.service';
import { CommonService } from 'src/app/services/shared/common.service';

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};

@Component({
  selector: 'app-custom-tag-list',
  templateUrl: './custom-tag-list.component.html',
  styleUrls: ['./custom-tag-list.component.scss'],
})
export class CustomTagListComponent implements OnInit {
  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi();
  }

  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;
  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi();
  }

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  tableNameMapping: Mapping<CustomTag>[] = [
    { name: 'id', name_jp: 'タグID' },
    { name: 'name', name_jp: 'タグ名' },
    { name: 'value', name_jp: 'タグ値' },
    { name: 'created_at', name_jp: '登録日時' },
    { name: 'updated_at', name_jp: '更新日時' },
  ];

  // エクスポート関連
  get export$() {
    return this.service.getAll(this._filter).pipe(
      catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = 'カスタムタグ';
  csvMappings: CsvMapping[] = [
    { name: 'id', prop_name: 'id' },
    { name: 'name', prop_name: 'name' },
    { name: 'value', prop_name: 'value' },
    { name: 'created_at', prop_name: 'created_at' },
    { name: 'created_id', prop_name: 'created_id' },
    { name: 'updated_at', prop_name: 'updated_at' },
    { name: 'updated_id', prop_name: 'updated_id' },
    { name: 'deleted_at', prop_name: 'deleted_at' },
    { name: 'deleted_id', prop_name: 'deleted_id' },
    {
      name: 'employee_created_last_name',
      prop_name: 'employee_created_last_name',
    },
    {
      name: 'employee_created_first_name',
      prop_name: 'employee_created_first_name',
    },
    {
      name: 'employee_updated_last_name',
      prop_name: 'employee_updated_last_name',
    },
    {
      name: 'employee_updated_first_name',
      prop_name: 'employee_updated_first_name',
    },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private cucommon: CustomTagCommonService,
    private service: CustomTagService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.callApi();
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
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private callApi() {
    this.common.loading = true;
    this.service
      .getAll(this.createApiParams())
      .pipe(
        catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<CustomTag>(
          res,
          this.tableNameMapping,
          this.modifiedTableBody
        );
        this.tableParams.next(params);
      });
  }

  /**
   * APIコール用のパラメータを生成する。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams() {
    // ソート列の物理名を取得
    const column = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;

    // APIコール用のパラメータを生成して返却
    return {
      ...this._filter,
      limit: this._pages.itemsPerPage,
      offset: (this._pages.page - 1) * this._pages.itemsPerPage,
      sort: column ? `${column}:${this._pages.sort.order}` : '',
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト。
   * @param mappings APIの項目名とテーブルのヘッダ名のマッピングオブジェクト。
   * @param modFn APIレスポンスのレコードをテーブルボディへ格納する際の変換を行う関数。
   * @returns 生成された`TableWithPaginationParams`オブジェクト。
   */
  private createTableParams<T>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );
    // 生成した TableParams を返却
    return { total: res.totalItems, header, body };
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: CustomTag) {
    return (mapping: Mapping<CustomTag>) => {
      // IDならリンクに修正
      if (mapping.name === 'id') {
        return {
          href: `./detail/${record[mapping.name]}`,
          text: record[mapping.name] + '',
        };
      }

      // 日付項目の書式変更
      if (
        ['created_at', 'updated_at'].includes(mapping.name) &&
        record[mapping.name]
      ) {
        return new Date(record[mapping.name]).toLocaleString();
      }

      return record[mapping.name];
    };
  }
}
