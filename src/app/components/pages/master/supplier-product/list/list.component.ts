import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, Subject } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  ItemsPerPageDefault,
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { regExConst } from 'src/app/const/regex.const';
import { DivisionService } from 'src/app/services/division.service';
import { LargeCategoryService } from 'src/app/services/large-category.service';
import { MediumCategoryService } from 'src/app/services/medium-category.service';
import { ProductService } from 'src/app/services/product.service';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { CommonService, Mapping } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  id = this.route.snapshot.params['id'];

  // 絞り込みフォームのコントロール
  form = this.fb.group({
    name: '',
    name_kana: '',
    supplier_product_cd: '',
    barcode: [
      '',
      [
        Validators.pattern(regExConst.NUMERIC_REG_EX),
        Validators.minLength(8),
        Validators.maxLength(13),
      ],
    ],
    large_category_id: '',
    medium_category_id: '',
    product_division_id: '',
  });
  get fc() {
    return this.form.controls;
  }

  // 選択肢項目のオブジェクト
  options = {
    large_category_id: [] as SelectOption[],
    medium_category_id: [] as SelectOption[],
    product_division_id: [] as SelectOption[],
  };

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  columnNameMappings: Mapping<Product>[] = [
    { name: 'barcode', name_jp: 'JANコード' },
    { name: 'supplier_product_cd', name_jp: '仕入先商品コード' },
    { name: 'name', name_jp: '商品名' },
    { name: 'supplier_cost_price', name_jp: '価格' }, // 仕入先商品テーブル.priceに対応
    { name: 'c_supplier_cost_price', name_jp: 'ケース価格' }, // 仕入先商品テーブル.c_priceに対応
    { name: 'part_number', name_jp: '品番' },
    { name: 'standard', name_jp: '規格' },
  ];

  // ページネーションの状態
  private pages = {
    page: 1,
    itemsPerPage: ItemsPerPageDefault,
    sort: {},
  } as TableWithPaginationEvent;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ProductService,
    private divisions: DivisionService,
    private largeCates: LargeCategoryService,
    private midCates: MediumCategoryService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.initOptions();
    this.updateTable();
  }

  /**
   * 絞り込み条件変更時の処理
   */
  listenSubmitEvent() {
    this.pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.updateTable();
  }

  /**
   * テーブルの状態変更時の処理
   * @param event テーブルから受け取るイベント
   */
  listenPageChange(event: TableWithPaginationEvent) {
    this.pages = event;
    this.updateTable();
  }

  /**
   * 選択肢項目を初期化
   */
  private initOptions() {
    // 各APIのオブザーバブルを作成
    const lc$ = this.largeCates
      .getAsSelectOptions()
      .pipe(catchError(this.largeCates.handleErrorModal<SelectOption[]>()));
    const mc$ = this.midCates
      .getAsSelectOptions()
      .pipe(catchError(this.midCates.handleErrorModal<SelectOption[]>()));
    const div$ = this.divisions
      .getAsSelectOptions()
      .pipe(
        catchError(
          this.divisions.handleErrorModal<Record<string, SelectOption[]>>()
        )
      );

    // APIコールと選択肢の作成
    this.common.loading = true;
    forkJoin({ lc$, mc$, div$ })
      .pipe(finalize(() => (this.common.loading = false)))
      .subscribe(({ lc$, mc$, div$ }) => {
        this.options.large_category_id = lc$;
        this.options.medium_category_id = mc$;
        this.options.product_division_id = div$['商品区分'];
        Object.values(this.options).map((x) =>
          x.unshift({ value: '', text: '選択してください' })
        );
      });
  }

  /**
   * APIからデータを取得し、テーブル表示用データを更新する。
   */
  private updateTable() {
    // パラメータの作成
    const filter = this.form.value as Partial<Product>;
    const params = this.common.createApiParams(
      filter,
      this.pages,
      this.columnNameMappings
    );

    // APIコールとテーブルの更新
    this.common.loading = true;
    this.service
      .get(this.id, params)
      .pipe(
        catchError(this.service.handleErrorModal<ProductApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        this.tableParams.next(
          this.common.createTableParams(
            x,
            this.columnNameMappings,
            this.modifiedTableBody
          )
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

      // バーコードならリンクに修正
      if (mapping.name === 'barcode') {
        return {
          href: `./${record.id}`,
          text: record[mapping.name] + '',
        };
      }

      // 金額系
      if (['price', 'c_price'].includes(mapping.name)) {
        return `${record[mapping.name].toLocaleString()} 円`;
      }

      return record[mapping.name] + '';
    };
  }
}
