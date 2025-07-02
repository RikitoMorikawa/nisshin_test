import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, map } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { regExConst } from 'src/app/const/regex.const';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { DivisionService } from 'src/app/services/division.service';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { ProductService } from 'src/app/services/product.service';
import { SmallCategoryService } from 'src/app/services/small-category.service';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { SupplierApiResponse } from 'src/app/models/supplier';
import { SupplierService } from 'src/app/services/supplier.service';
import { CommonService, Mapping } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  // 絞り込みフォームのコントロール
  form = this.fb.group({
    id: '',
    name: '',
    supplier_id: '',
    supplier_name: '',
    barcode: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    large_category_id: '',
    medium_category_id: '',
    small_category_id: '',
    shelf_division_id: '',
    part_number: '',
    standard: '',
    custom_tag_id: '',
  });
  get fc() {
    return this.form.controls;
  }

  // 選択肢項目のオブジェクト
  options = {
    large_category_id: [] as SelectOption[],
    medium_category_id: [] as SelectOption[],
    small_category_id: [] as SelectOption[],
    shelf_division_id: [] as SelectOption[],
  };

  // エクスポート用のオブザーバブル
  get export$() {
    const params = this.common.formatFormData(this.form.value);
    return this.service.getCsv('csv', params).pipe(
      catchError(this.service.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = '商品';

  // テーブル周りの変数
  tableParams = {} as TableWithPaginationParams;
  columnNameMappings: Mapping<Product>[] = [
    { name: 'id', name_jp: 'ID' },
    { name: 'name', name_jp: '商品名' },
    { name: 'barcode', name_jp: 'JANコード' },
    { name: 'selling_price', name_jp: '価格' },
    { name: 'supplier_cost_price', name_jp: '原価' },
    { name: 'supplier_id', name_jp: '仕入先ID' },
    { name: 'supplier_product_cd', name_jp: '仕入先商品コード' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private service: ProductService,
    private largeCates: LargeCategoryService,
    private midCates: MediumCategoryService,
    private smallCates: SmallCategoryService,
    private divisions: DivisionService,
    private suppliers: SupplierService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.initOptions();
  }

  /**
   * APIからデータを取得し、テーブル表示用データを更新する。
   */
  updateTable(event: TableWithPaginationEvent) {
    // フォームオブジェクトの取得
    let filter = this.form.value as Partial<Product>;
    // custom_tag のリスト化
    const v_obj_list = (s_obj: string): string[] => {
      if (s_obj.indexOf(',')) {
        return s_obj.split(',');
      } else {
        return [s_obj];
      }
    };
    // custom_tag キーの取得
    const custom_tag: string | null | undefined = this.form.value.custom_tag_id;
    // 登録済みフィルターのcustom_tagを除外
    delete filter['custom_tag_id'];
    // パラメータの格納
    let params = this.common.createApiParams(
      filter,
      event,
      this.columnNameMappings
    );
    // custom_tag　値がある場合 custom_tag_id[index] キーの
    // オブジェクトを生成　params に追加する
    if (custom_tag) {
      const custom_tags = v_obj_list(custom_tag);
      let param_iundex = 0;
      for (let index in custom_tags) {
        if (custom_tags[index] === '') {
          continue;
        }
        let obj_name = 'custom_tag_id[' + String(param_iundex) + ']';
        let obj_value = custom_tags[index];
        let obj: Object = { [`${obj_name}`]: obj_value };
        Object.assign(params, { [`${obj_name}`]: obj_value });
        param_iundex++;
      }
    }

    // APIコールとテーブルの更新
    this.common.loading = true;
    this.service
      .getAll(params)
      .pipe(
        catchError(this.service.handleErrorModal<ProductApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
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
   * 各APIから情報を取得して、選択肢項目を設定する。
   */
  private initOptions() {
    // 各APIのオブザーバブルを作成
    const lc$ = this.largeCates
      .getAsSelectOptions()
      .pipe(catchError(this.largeCates.handleErrorModal<SelectOption[]>()));
    const mc$ = this.midCates
      .getAsSelectOptions()
      .pipe(catchError(this.midCates.handleErrorModal<SelectOption[]>()));
    const sc$ = this.smallCates
      .getAsSelectOptions()
      .pipe(catchError(this.smallCates.handleErrorModal<SelectOption[]>()));
    const div$ = this.divisions.getAsSelectOptions().pipe(
      map((x) => x['陳列棚区分']),
      catchError(this.divisions.handleErrorModal<SelectOption[]>())
    );

    // APIコールと選択肢の作成
    this.common.loading = true;
    forkJoin({ lc$, mc$, sc$, div$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe(({ lc$, mc$, sc$, div$ }) => {
        this.options.large_category_id = lc$;
        this.options.medium_category_id = mc$;
        this.options.small_category_id = sc$;
        this.options.shelf_division_id = div$;
        Object.values(this.options).map((x) =>
          x.unshift({ value: '', text: '選択してください' })
        );
      });
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: Product) {
    return (mapping: Mapping<Product>) => {
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

      // 金額系
      if (['selling_price', 'supplier_cost_price'].includes(mapping.name)) {
        return `${record[mapping.name].toLocaleString()} 円`;
      }

      return record[mapping.name];
    };
  }

  /**
   * 絞り込み用結果を取得
   * 商品用
   * @returns
   */
  getProductSuggests(): ApiInput<ProductApiResponse> {
    return {
      observable: this.service.getAll({
        name: this.fc.name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 絞り込み用結果を取得
   * 仕入先用
   * @returns
   */
  getSupplierSuggests(): ApiInput<SupplierApiResponse> {
    return {
      observable: this.suppliers.getAll({
        name: this.fc.supplier_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
}
