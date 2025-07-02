import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import {
  Observable,
  Subject,
  tap,
  switchMap,
  catchError,
  of,
  finalize,
  Subscription,
} from 'rxjs';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import {
  Liquidation,
  LiquidationApiResponse,
} from 'src/app/models/liquidation';
import { ModalService } from 'src/app/services/modal.service';
import { LiquidationService } from 'src/app/services/liquidation.service';
import { FormBuilder } from '@angular/forms';
import { errorConst } from 'src/app/const/error.const';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { TableData } from 'src/app/components/atoms/table/table.component';
import { LiquidationFn } from 'src/app/functions/liquidation-functions';
import { DivisionService } from 'src/app/services/division.service';

@Component({
  selector: 'app-liquidation',
  templateUrl: './liquidation.component.html',
  styleUrls: ['./liquidation.component.scss'],
})
export class LiquidationComponent implements OnInit, OnDestroy {
  terms?: object;
  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';
  liquidation$!: Observable<LiquidationApiResponse>;
  @Output() err = new EventEmitter<HttpErrorResponse>();
  @Output() event = new EventEmitter();
  options = {} as LiquidationFn.Options;

  tableNameMapping: { name: keyof Liquidation; name_jp: string }[] = [
    { name: 'id', name_jp: '精算項目ID' }, // createTableParams 内で値を修正
    { name: 'name', name_jp: '名称' },
    { name: 'abbreviation_name', name_jp: '略称' },
    { name: 'division_display_value', name_jp: '表示区分' },
    { name: 'division_liquidation_value', name_jp: '清算区分' },
    //{ name: 'product_name', name_jp: '商品名' },
    //{ name: 'order_quantity', name_jp: '発注数量' },
    //{ name: 'receiving_quantity', name_jp: '受入数量' }, // createTableParams 内で値を修正
    //{ name: 'order_date', name_jp: '発注日時' }, // createTableParams 内で値を修正
    //{ name: 'name', name_jp: '仕入先名' },
    //{ name: 'mail', name_jp: 'メールアドレス' },
    //{ name: 'tel', name_jp: '電話番号' },
    //{ name: 'pic_name', name_jp: '担当者名' }, // createTableParams 内で値を修正
    //{ name: 'province', name_jp: '住所' }, // createTableParams 内で値を修正
  ];
  filename = '';
  eventListener = new Subject<object>();

  // テーブル周りで使用する変数
  tableParams = new Subject<TableWithPaginationParams>();
  loading = false;

  // フォームグループ
  form = this.fb.group({
    name: '',
    abbreviation_name: '',
    display_division_id: '',
    liquidation_division_id: '',
    cancel_rep_id: '',
    created_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [
          LiquidationFn.customValids.afterToday(),
          LiquidationFn.customValids.beforeFromDate(),
        ],
      }
    ),
    updated_at: this.fb.group(
      { from: '', to: '' },
      {
        validators: [
          LiquidationFn.customValids.afterToday(),
          LiquidationFn.customValids.beforeFromDate(),
        ],
      }
    ),
  });
  private filter = {};
  private subscription?: Subscription;

  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: { column: '精算項目ID', order: 'desc' },
  } as TableWithPaginationEvent;

  get ctrls() {
    return this.form.controls;
  }

  // バリデーション用
  errorConst = errorConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private modal: ModalService,
    private liquidationService: LiquidationService,
    private divisionService: DivisionService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.changeTerms(this.pages);
    this.eventListener.next(this.pages); // 初回のデータを取得
    //this.filename = `supplier_${formatDate(
    //  new Date(),
    //  'yyyyMMdd',
    //  'ja-JP'
    //)}.csv`;
    this.divisionService
      .getAsSelectOptions()
      .pipe(
        catchError((err) => {
          err.emit(err); // エラーを親コンポーネントへ通知
          return of(err.error);
        })
      )
      .subscribe(
        (res) =>
          (this.options = LiquidationFn.initOptions(res, {
            text: '選択してください',
            value: '',
          }))
      );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    // サブジェクトへコンプリートを流す
    this.eventListener.complete();
  }

  /**
   * 絞り込み条件変更時に実行される処理
   * @param terms 絞り込み条件のオブジェクト
   */
  changeTerms(terms: object) {
    //this.terms = terms;
    this.eventListener.next(terms);
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.loading = true)),
        switchMap((x) =>
          this.liquidationService.getAll(this.createApiParams(x))
        ), // APIコールへスイッチ
        catchError(this.notifyHandleError())
      )
      .subscribe({
        next: (res) => {
          this.tableParams.next(this.createTableParams(res));
          this.loading = false;
        },
        // エラー発生時 complete が走るため、再度サブスクライブを設定
        complete: () => this.changeTerms(this.pages),
      });
  }

  ///**
  // * エクスポートのイベントを検知しローディング表示を切り替える
  // * @param status `ExportLinkOrgComponent`から受け取るイベント
  // */
  //exportEventListener(status: ExportStatus) {
  //  this.loading = !!status;
  //}

  /**
   * モーダルを表示し、ユーザーへ通信エラーを通知する。
   * @param err
   */
  handleError(err: HttpErrorResponse) {
    this.modal.setModal(
      `通信エラー(${err.status})`,
      err.message,
      'danger',
      '閉じる',
      ''
    );
  }

  /**
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`OrderApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private notifyHandleError() {
    return (err: HttpErrorResponse) => {
      this.err.emit(err);
      return of({ data: [] as Liquidation[] } as LiquidationApiResponse);
    };
  }

  /**
   * パネル開閉ボタンクリック時の処理
   */
  searchButtonOnClick() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  /**
   * 「絞り込みクリア」ボタンクリック時の処理
   */
  onClickReset() {
    Object.values(this.ctrls).forEach((x) => x.patchValue(''));
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    const values = this.form.value;
    const flatted = LiquidationFn.flattingFormValue(values);
    this.event.emit(LiquidationFn.removeNullsAndBlanks(flatted));
    this.changeTerms(flatted);
  }

  /**
   * オブジェクトが`TableWithPaginationEvent`のインスタンスかを確認する。
   * @param arg 検証対象のオブジェクト。
   * @returns
   */
  isTableWithPaginationEvent(arg: object): arg is TableWithPaginationEvent {
    const { page, itemsPerPage, sort } = arg as TableWithPaginationEvent;
    return (
      typeof page === 'number' &&
      typeof itemsPerPage === 'number' &&
      typeof sort === 'object'
    );
  }

  /**
   * APIコール用のパラメータを生成する。
   * @param arg 各イベントから取得されたオブジェクト。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams(arg: object) {
    if (this.isTableWithPaginationEvent(arg)) {
      this.pages = arg;
    } else {
      this.filter = arg;
      this.pages.page = 1;
    }
    const column = this.tableNameMapping.find(
      (obj) => obj.name_jp === this.pages.sort.column
    )?.name;
    return {
      ...this.filter,
      limit: this.pages.itemsPerPage,
      offset: (this.pages.page - 1) * this.pages.itemsPerPage,
      sort: column ? `${column}:${this.pages.sort.order}` : '',
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: LiquidationApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, index) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('精算項目ID');
      row[column] = { href: `./detail/${row[column]}`, text: row[column] + '' };

      // const order = res.data[index];
      // row[column] = `${order.order_date}`;
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }
}
