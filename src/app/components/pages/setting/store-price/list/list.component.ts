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
import { StorePrice, StorePriceApiResponse } from 'src/app/models/store-price';
import { StorePriceService } from 'src/app/services/store-price.service';
import { StorePriceCommonService } from '../store-price-common.service';
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
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
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
  tableNameMapping: Mapping<StorePrice>[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'store_name', name_jp: '店舗名' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'selling_price', name_jp: '売価' },
    { name: 'b_selling_price', name_jp: 'B売価' },
    { name: 'c_selling_price', name_jp: 'C売価' },
  ];

  // エクスポート関連
  get export$() {
    return this.service.getAll(this._filter).pipe(
      catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = '店舗別売価';
  csvMappings: CsvMapping[] = [
    { name: 'id', prop_name: 'id' },
    { name: 'store_id', prop_name: 'store_id' },
    { name: 'store_name', prop_name: 'store_name' },
    { name: 'product_id', prop_name: 'product_id' },
    { name: 'product_name', prop_name: 'product_name' },
    { name: 'sales_tax_division_id', prop_name: 'sales_tax_division_id' },
    { name: 'division_sales_tax_value', prop_name: 'division_sales_tax_value' },
    {
      name: 'sales_fraction_division_id',
      prop_name: 'sales_fraction_division_id',
    },
    {
      name: 'division_sales_fraction_value',
      prop_name: 'division_sales_fraction_value',
    },
    { name: 'gross_profit_rate', prop_name: 'gross_profit_rate' },
    { name: 'b_gross_profit_rate', prop_name: 'b_gross_profit_rate' },
    { name: 'c_gross_profit_rate', prop_name: 'c_gross_profit_rate' },
    { name: 'selling_price', prop_name: 'selling_price' },
    { name: 'b_selling_price', prop_name: 'b_selling_price' },
    { name: 'c_selling_price', prop_name: 'c_selling_price' },
    {
      name: 'supplier_sales_tax_division_id',
      prop_name: 'supplier_sales_tax_division_id',
    },
    {
      name: 'division_supplier_sales_tax_value',
      prop_name: 'division_supplier_sales_tax_value',
    },
    {
      name: 'supplier_sales_fraction_division_id',
      prop_name: 'supplier_sales_fraction_division_id',
    }, // tax_fraction に差し替え？（→コメントの真意は不明だけれど、20230817時点でAPIからはtax_fractionを含む項目は入ってきていないので、このままで大丈夫なのではないか）
    {
      name: 'division_supplier_sales_fraction_value',
      prop_name: 'division_supplier_sales_fraction_value',
    },
    { name: 'supplier_cost_price', prop_name: 'supplier_cost_price' },
    { name: 'b_supplier_cost_price', prop_name: 'b_supplier_cost_price' },
    { name: 'c_supplier_cost_price', prop_name: 'c_supplier_cost_price' },
    { name: 'created_at', prop_name: 'created_at' },
    { name: 'created_id', prop_name: 'created_id' },
    {
      name: 'employee_created_last_name',
      prop_name: 'employee_created_last_name',
    },
    {
      name: 'employee_created_first_name',
      prop_name: 'employee_created_first_name',
    },
    { name: 'updated_at', prop_name: 'updated_at' },
    { name: 'updated_id', prop_name: 'updated_id' },
    {
      name: 'employee_updated_last_name',
      prop_name: 'employee_updated_last_name',
    },
    {
      name: 'employee_updated_first_name',
      prop_name: 'employee_updated_first_name',
    },
    { name: 'deleted_at', prop_name: 'deleted_at' },
    { name: 'deleted_id', prop_name: 'deleted_id' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private spcommon: StorePriceCommonService,
    private service: StorePriceService
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
        catchError(this.service.handleErrorModal<StorePriceApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<StorePrice>(
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
  private modifiedTableBody(record: StorePrice) {
    return (mapping: Mapping<StorePrice>) => {
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

      // 商品IDならリンクに修正
      if (mapping.name === 'product_name') {
        return {
          href: `/master/product/detail/${record.product_id}`,
          text: record.product_name,
        };
      }

      // 金額系
      if (/.*selling_price/.test(mapping.name)) {
        const price = record[mapping.name];
        //return `${Number(record[mapping.name]).toLocaleString()} 円`;
        return {
          unit: false,
          align: 'right',
          text: Number(price),
        };
      }

      return record[mapping.name];
    };
  }
}
