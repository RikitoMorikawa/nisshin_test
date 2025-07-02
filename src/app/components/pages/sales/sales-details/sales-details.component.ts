import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, Subject } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import {
  SalesDetail,
  SalesDetailApiResponse,
} from 'src/app/models/sales-detail';
import { SalesDetailService } from 'src/app/services/sales-detail.service';
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
  selector: 'app-sales-details',
  templateUrl: './sales-details.component.html',
  styleUrls: ['./sales-details.component.scss'],
})
export class SalesDetailsComponent implements OnInit {
  // 各種パラメータ
  sales_slip_cd = this.route.snapshot.params['code'];

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
  tableNameMapping: Mapping<SalesDetail>[] = [
    { name: 'gyo_cd', name_jp: '行番号' },
    { name: 'barcode', name_jp: 'バラバーコード' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'delivery_real_number', name_jp: '数量' },
    { name: 'unit_price', name_jp: '単価' },
    { name: 'tax_excluded_cost', name_jp: '税抜原価' },
    { name: 'slip_item_total_sales', name_jp: '合計売上' },
    { name: 'slip_item_tax_excluded_total_sales', name_jp: '合計売上(税抜)' },
  ];

  // エクスポート関連
  export$ = this.service.getAll({ sales_slip_cd: this.sales_slip_cd }).pipe(
    catchError(this.service.handleErrorModal<SalesDetailApiResponse>()),
    finalize(() => (this.common.loading = false))
  );
  fileNamePrefix = '売上明細';
  csvMappings: CsvMapping[] = [
    { name: '売上明細ID', prop_name: 'id' },
    { name: '伝票番号', prop_name: 'sales_slip_cd' },
    { name: '行番号', prop_name: 'gyo_cd' },
    { name: '売上日時(実時間)', prop_name: 'sale_date' },
    { name: '売上年(実時間)', prop_name: 'sale_year' },
    { name: '売上月(実時間)', prop_name: 'sale_month' },
    { name: '売上年月(実時間)', prop_name: 'sale_month_and_year' },
    { name: '売上日(実時間)', prop_name: 'sale_day' },
    { name: '売上時間(実時間)', prop_name: 'sale_hour' },
    { name: '営業日時(レジ締め時間)', prop_name: 'business_date' },
    { name: '営業年(レジ締め時間)', prop_name: 'business_year' },
    { name: '営業月(レジ締め時間)', prop_name: 'business_month' },
    { name: '営業年月(レジ締め時間)', prop_name: 'business_month_and_year' },
    { name: '営業日(レジ締め時間)', prop_name: 'business_day' },
    { name: '営業時間(レジ締め時間)', prop_name: 'business_hour' },
    { name: '店舗番号', prop_name: 'store_cd' },
    { name: '端末番号', prop_name: 'terminal_cd' },
    { name: '伝票種別 0:通常 1:返品', prop_name: 'sales_slip_division_cd' },
    { name: '入力担当者CD', prop_name: 'input_employee_cd' },
    { name: '入力担当者名', prop_name: 'input_employee_name' },
    { name: '人数', prop_name: 'number_of_people' },
    { name: '客層CD', prop_name: 'quality_customer_cd' },
    { name: '商品番号', prop_name: 'product_cd' },
    { name: 'バラバーコード', prop_name: 'barcode' },
    { name: '商品名', prop_name: 'product_name' },
    { name: 'フリガナ', prop_name: 'product_name_kana' },
    { name: '大分類CD', prop_name: 'large_category_cd' },
    { name: '中分類CD', prop_name: 'medium_category_cd' },
    { name: '小分類CD', prop_name: 'small_category_cd' },
    { name: '仕入先CD', prop_name: 'supplier_cd' },
    { name: '規格', prop_name: 'standard' },
    { name: '品番', prop_name: 'part_number' },
    { name: '入数', prop_name: 'quantity_per_carton' },
    { name: '納品ケース数', prop_name: 'delivery_case_number' },
    { name: '単位', prop_name: 'unit_cd' },
    {
      name: '単位区分 （0:ｹｰｽ 1:ｼﾞｬｹｯﾄ 2:ﾊﾞﾗ）',
      prop_name: 'unit_division_cd',
    },
    { name: '納品実数', prop_name: 'delivery_real_number' },
    { name: '倉庫CD', prop_name: 'warehouse_cd' },
    { name: '税抜原価', prop_name: 'tax_excluded_cost' },
    { name: '単価', prop_name: 'unit_price' },
    { name: '伝票明細合計売上', prop_name: 'slip_item_total_sales' },
    {
      name: '伝票明細合計売上(税抜)',
      prop_name: 'slip_item_tax_excluded_total_sales',
    },
    { name: '値引額', prop_name: 'discount_amount' },
    { name: '値引き種類', prop_name: 'discount_type' },
    {
      name: '消費税区分2 (0：外税、1：内税、2：非課税)',
      prop_name: 'tax_division_cd',
    },
    { name: '外税対象金額', prop_name: 'tax_excluded_target_amount' },
    { name: '外税対象税', prop_name: 'tax_excluded_target_tax' },
    { name: '内税対象金額', prop_name: 'tax_included_target_amount' },
    { name: '内税対象税', prop_name: 'tax_included_target_tax' },
    { name: '特売マスタコード', prop_name: 'special_sale_cd' },
    { name: '顧客プライマリ', prop_name: 'member_id' },
    { name: '顧客番号', prop_name: 'member_cd' },
    { name: '顧客名', prop_name: 'member_name' },
    { name: '得意先コード', prop_name: 'client_cd' },
    { name: '請求先コード', prop_name: 'billing_cd' },
    { name: 'レジ締回数', prop_name: 'register_closing_times' },
    { name: '売掛締日', prop_name: 'accounts_receivable_closing_date' },
    { name: '売掛年月', prop_name: 'accounts_receivable_year_month' },
    {
      name: '保証書印字(0：なし、1：あり）',
      prop_name: 'warranty_printing_division_cd',
    },
    { name: '伝票作成日時', prop_name: 'slip_creation_time' },
    { name: '伝票更新日時', prop_name: 'slip_update_time' },
    { name: '削除フラグ(0:有効、1:削除)', prop_name: 'deleted_flag' },
    {
      name: '基幹システム連携フラグ 例） 0：なし、1：ﾚﾝﾀﾙ、2：修理、3：客注',
      prop_name: 'coordination_flag',
    },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '顧客名 姓', prop_name: 'member_last_name' },
    { name: '顧客名 名', prop_name: 'member_first_name' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: SalesDetailService
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
   * テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private callApi() {
    this.common.loading = true;
    this.service
      .getAll(this.createApiParams())
      .pipe(
        catchError(this.service.handleErrorModal<SalesDetailApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<SalesDetail>(
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
      sales_slip_cd: this.sales_slip_cd,
      limit: this._pages.itemsPerPage,
      offset: (this._pages.page - 1) * this._pages.itemsPerPage,
      sort: column ? `${column}:${this._pages.sort.order} ` : '',
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
    const footerRow = this.calculateFooter(res.data, mappings);
    return { total: res.totalItems, header, body, footer: footerRow };
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: SalesDetail) {
    return (mapping: Mapping<SalesDetail>) => {
      // 行番号なら詳細へのリンクに修正
      if (mapping.name === 'gyo_cd') {
        return {
          href: `./${record.id}`,
          text: record[mapping.name] + '',
        };
      }

      if (
        mapping.name === 'unit_price' ||
        mapping.name === 'tax_excluded_cost' ||
        mapping.name === 'slip_item_total_sales' ||
        mapping.name === 'slip_item_tax_excluded_total_sales'
      ) {
        let def: any = 0;
        if (record[mapping.name]) {
          def = record[mapping.name] ? record[mapping.name] : 0;
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

  /**
   * データの合計を計算し、フッター行を生成する
   */
  private calculateFooter<T>(data: T[], mappings: Mapping<T>[]): any[] {
    const footerRow = mappings.map((mapping, index) => {
      if (index === 0) {
        return '合計';
      }

      const nameStr = mapping.name.toString();

      if (nameStr === 'unit_price') {
        // 通常の単価の合計を計算
        const total = data.reduce((sum, record) => {
          return sum + (Number(record[mapping.name]) || 0);
        }, 0);

        return total.toLocaleString('ja-JP', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }

      const fieldsToSum = [
        'tax_excluded_cost',
        'slip_item_total_sales',
        'slip_item_tax_excluded_total_sales',
      ];

      if (fieldsToSum.includes(nameStr)) {
        const sum = data.reduce((total, record) => {
          return total + (Number(record[mapping.name]) || 0);
        }, 0);

        return sum.toLocaleString('ja-JP');
      }

      return '';
    });

    return footerRow;
  }
}
