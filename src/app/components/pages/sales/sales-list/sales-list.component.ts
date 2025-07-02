import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, finalize, Subject, tap } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { ProductApiResponse } from 'src/app/models/product';
import { SalesSlipApiResponse, SalesSlip } from 'src/app/models/sales-slip';
import { SalesSlipService } from 'src/app/services/sales-slip.service';
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
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss'],
})
export class SalesListComponent implements OnInit {
  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this.saveFilterParams(arg); // データを保存
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
  tableNameMapping: Mapping<SalesSlip>[] = [
    { name: 'sales_slip_cd', name_jp: '伝票番号' },
    { name: 'client_name_1', name_jp: '得意先名' },
    { name: 'member_name', name_jp: '会員名' },
    { name: 'sale_date', name_jp: '売上日時' },
    { name: 'store_cd', name_jp: '店舗番号' },
    { name: 'sales_slip_division_cd', name_jp: '伝票種別' },
    { name: 'slip_amount', name_jp: '伝票金額' },
    { name: 'slip_amount_tax_excluded', name_jp: '伝票金額(外税)' },
  ];

  tableFootNameMapping: Mapping<SalesSlip>[] = [
    { name: 'sales_slip_cd', name_jp: '--' },
    { name: 'client_name_1', name_jp: '--' },
    { name: 'member_name', name_jp: '--' },
    { name: 'sale_date', name_jp: '--' },
    { name: 'store_cd', name_jp: '--' },
    { name: 'sales_slip_division_cd', name_jp: 'total_name' },
    { name: 'slip_amount', name_jp: 'slip_amount' },
    { name: 'slip_amount_tax_excluded', name_jp: 'slip_amount_tax_excluded' },
  ];

  // エクスポート関連
  export$ = this.service.getAll(this._filter).pipe(
    catchError(this.service.handleErrorModal<SalesSlipApiResponse>()),
    finalize(() => (this.common.loading = false))
  );

  fileNamePrefix = '売上伝票';
  csvMappings: CsvMapping[] = [
    { name: 'id', prop_name: 'id' },
    { name: 'sales_slip_cd', prop_name: 'sales_slip_cd' },
    { name: 'sale_date', prop_name: 'sale_date' },
    { name: 'business_date', prop_name: 'business_date' },
    { name: 'store_cd', prop_name: 'store_cd' },
    { name: 'terminal_cd', prop_name: 'terminal_cd' },
    { name: 'sales_slip_division_cd', prop_name: 'sales_slip_division_cd' },
    { name: 'input_employee_cd', prop_name: 'input_employee_cd' },
    { name: 'input_employee_name', prop_name: 'input_employee_name' },
    { name: 'number_of_people', prop_name: 'number_of_people' },
    { name: 'quality_customer_cd', prop_name: 'quality_customer_cd' },
    { name: 'payment_division_cd', prop_name: 'payment_division_cd' },
    { name: 'total_quantity', prop_name: 'total_quantity' },
    { name: 'total_cost', prop_name: 'total_cost' },
    { name: 'total_discount', prop_name: 'total_discount' },
    {
      name: 'tax_excluded_target_amount',
      prop_name: 'tax_excluded_target_amount',
    },
    { name: 'tax_excluded_target_tax', prop_name: 'tax_excluded_target_tax' },
    {
      name: 'tax_included_target_amount',
      prop_name: 'tax_included_target_amount',
    },
    { name: 'tax_included_target_tax', prop_name: 'tax_included_target_tax' },
    { name: 'slip_amount', prop_name: 'slip_amount' },
    { name: 'slip_amount_tax_excluded', prop_name: 'slip_amount_tax_excluded' },
    { name: 'cash', prop_name: 'cash' },
    { name: 'change', prop_name: 'change' },
    { name: 'miscellaneous_income', prop_name: 'miscellaneous_income' },
    { name: 'gift_1', prop_name: 'gift_1' },
    { name: 'gift_2', prop_name: 'gift_2' },
    { name: 'gift_3', prop_name: 'gift_3' },
    { name: 'gift_4', prop_name: 'gift_4' },
    { name: 'credit', prop_name: 'credit' },
    { name: 'accounts_receivable', prop_name: 'accounts_receivable' },
    { name: 'decimal_point_fraction', prop_name: 'decimal_point_fraction' },
    { name: 'tax_fraction', prop_name: 'tax_fraction' },
    { name: 'tax_division_cd', prop_name: 'tax_division_cd' },
    { name: 'tax_rate', prop_name: 'tax_rate' },
    {
      name: 'tax_calculating_division_cd',
      prop_name: 'tax_calculating_division_cd',
    },
    { name: 'for_slip_return_limit', prop_name: 'for_slip_return_limit' },
    { name: 'member_id', prop_name: 'member_id' },
    { name: 'member_cd', prop_name: 'member_cd' },
    { name: 'member_name', prop_name: 'member_name' },
    { name: 'client_cd', prop_name: 'client_cd' },
    { name: 'billing_cd', prop_name: 'billing_cd' },
    { name: 'client_name_1', prop_name: 'client_name_1' },
    { name: 'client_name_2', prop_name: 'client_name_2' },
    { name: 'register_closing_times', prop_name: 'register_closing_times' },
    {
      name: 'accounts_receivable_closing_date',
      prop_name: 'accounts_receivable_closing_date',
    },
    {
      name: '   accounts_receivable_year_month',
      prop_name: 'accounts_receivable_year_month',
    },
    { name: 'last_point', prop_name: 'last_point' },
    { name: 'current_grant_point', prop_name: 'current_grant_point' },
    { name: 'input_point', prop_name: 'input_point' },
    { name: 'used_point', prop_name: 'used_point' },
    { name: 'point_balance', prop_name: 'point_balance' },
    { name: 'point_target_amount', prop_name: 'point_target_amount' },
    { name: 'point_magnification', prop_name: 'point_magnification' },
    { name: 'billing_field_cd', prop_name: 'billing_field_cd' },
    { name: 'slip_creation_time', prop_name: 'slip_creation_time' },
    { name: 'slip_update_time', prop_name: 'slip_update_time' },
    { name: 'deleted_flag', prop_name: 'deleted_flag' },
    {
      name: 'coordination_flag',
      prop_name: 'coordination_flag',
    },
    { name: 'created_at', prop_name: 'created_at' },
    { name: 'member_last_name', prop_name: 'member_last_name' },
    { name: 'member_first_name', prop_name: 'member_first_name' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private service: SalesSlipService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    const savedFilter = this.loadFilterParams();
    if (savedFilter) {
      this._filter = savedFilter;
    }
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
   * SalesSlip 配列の特定のフィールドの合計を計算します。
   * sales_slip_division_cd が 1 の場合、その値は合計から差し引かれます。
   * それ以外の場合、その値は合計に加算されます。
   *
   * @param data - SalesSlip オブジェクトの配列。
   * @param field - 合計する SalesSlip のフィールド。
   * @returns 計算された合計。
   */
  private calculateFooterTotals(
    data: SalesSlip[],
    field: keyof SalesSlip
  ): number {
    return data.reduce((sum, record) => {
      if (record.sales_slip_division_cd === 1) {
        return sum - Number(record[field] || 0);
      }
      return sum + Number(record[field] || 0);
    }, 0);
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
        catchError(this.service.handleErrorModal<SalesSlipApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<SalesSlip>(
          res,
          this.tableNameMapping,
          this.modifiedTableBody
        );
        this.tableParams.next(params);
        // エクスポートの更新
        this.export$ = this.service
          .getAll(this.createExportCsvApiParams())
          .pipe(
            catchError(this.service.handleErrorModal<SalesSlipApiResponse>()),
            finalize(() => (this.common.loading = false))
          );
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
   * APIコール用のパラメータを生成する。
   * CSV用ページやリミット制限なし
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createExportCsvApiParams() {
    // ソート列の物理名を取得
    const column = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;

    // APIコール用のパラメータを生成して返却
    return {
      ...this._filter,
      sort: column ? `${column}:${this._pages.sort.order}` : '',
    };
  }

  /*
  APIレスポンスからテーブルコンポーネントへ渡すオブジェクトをローカルストレージに保存と取得
  */
  private saveFilterParams(filter: object) {
    localStorage.setItem('filterParams', JSON.stringify(filter));
  }
  private loadFilterParams(): object | null {
    const params = localStorage.getItem('filterParams');
    return params ? JSON.parse(params) : null;
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト。
   * @param mappings APIの項目名とテーブルのヘッダ名のマッピングオブジェクト。
   * @param modFn APIレスポンスのレコードをテーブルボディへ格納する際の変換を行う関数。
   * @returns 生成された`TableWithPaginationParams`オブジェクト。
   */
  private createTableParams<T extends SalesSlip>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any
  ): TableWithPaginationParams {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );

    // フッターの集計を計算

    const footer = mappings.map((x) => {
      if (x.name === 'slip_amount_tax_excluded') {
        return this.calculateFooterTotals(res.data, x.name as keyof SalesSlip);
      }
      if (x.name === 'slip_amount') {
        return this.calculateFooterTotals(res.data, x.name as keyof SalesSlip);
      }
      if (x.name === 'sales_slip_division_cd') {
        return '表示合計値';
      }
      return x.name_jp === '--' ? '--' : '';
    });
    // 生成した TableParams を返却
    return { total: res.totalItems, header, body, footer };
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: SalesSlip) {
    return (mapping: Mapping<SalesSlip>) => {
      // 伝票番号ならリンクに修正

      if (mapping.name === 'sales_slip_cd') {
        return {
          href: `./detail/${record[mapping.name]}/${record.id}`,
          text: record[mapping.name] + '',
        };
      }
      if (mapping.name === 'sales_slip_division_cd') {
        let result = '0:通常';
        if (record[mapping.name] == 1) {
          result = '1:返品';
        }
        return result;
      }
      if (mapping.name === 'slip_amount') {
        let def = 0;
        if (record.slip_amount) {
          def = record.slip_amount;
        }
        return {
          unit: false,
          align: 'right',
          text: Number(def),
        };
      }
      if (mapping.name === 'slip_amount_tax_excluded') {
        let def = 0;
        if (record.slip_amount_tax_excluded) {
          def = record.slip_amount_tax_excluded;
        }
        return {
          unit: false,
          align: 'right',
          text: Number(def),
        };
      }

      return record[mapping.name];
    };
  }
}
