import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  of,
  Subscription,
  take,
  Subject,
} from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  ApiResponseIsInvalid,
  isParameterInvalid,
} from 'src/app/functions/shared-functions';
import { AccountsReceivableAggregate } from 'src/app/models/accounts-receivable-aggregate';
import { AccountsReceivableAggregateService } from 'src/app/services/accounts-receivable-aggregate.service';
import { Bill, BillApiResponse } from 'src/app/models/bill';
import { BillService } from 'src/app/services/bill.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';
import {
  DepositDetail,
  DepositDetailApiResponse,
} from 'src/app/models/deposit-detail';
import { DepositDetailService } from 'src/app/services/deposit-detail.service';
import { DepositDetailDomain } from 'src/app/domains/deposit-detail.domain';
import { accountsReceivableAggregateConst } from 'src/app/const/accounts-receivable-aggregate.const';
import {
  TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';

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
  selector: 'app-slip-list',
  templateUrl: './slip-list.component.html',
  styleUrls: ['./slip-list.component.scss'],
})
export class SlipListComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param route
   * @param router
   * @param modalService
   * @param depositDetailService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private billService: BillService,
    private depositDetailService: DepositDetailService,
    private depositDetailDomain: DepositDetailDomain,
    private accountsReceivableAggregateService: AccountsReceivableAggregateService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;

  // 請求一覧のパス
  topPagePath = '/setting';
  listPagePath = '../../../bill';

  // エラーモーダルのタイトル
  errorModalTitle = '請求伝票一覧：' + modalConst.TITLE.HAS_ERROR;

  // 表示用商品オブジェクト
  accountsReceivableAggregate!: AccountsReceivableAggregate; //{ [key: string]: string | number };
  bill!: Bill; //{ [key: string]: string | number };

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi(false);
  }

  private _depositDetailFilter = {};
  set depositDetailFilter(depositDetails: TableData[][]) {
    this.depositDetails = depositDetails;
    this.depositDetailsTotalItems = depositDetails.length;
  }

  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;

  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi(false);
  }

  private readonly defaultDepositDetailSort = {
    column: '入金ID',
    order: 'desc',
  } as TableSortStatus;

  private _depositDetailPages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultDepositDetailSort,
  } as TableWithPaginationEvent;

  set depositDetailPages(arg: TableWithPaginationEvent) {
    //console.log(arg);
    this._depositDetailPages = arg;
  }

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  tableNameMapping: Mapping<Bill>[] = [
    { name: 'sales_slip_cd', name_jp: '伝票番号' },
    { name: 'sale_date', name_jp: '売上日' },
    { name: 'client_name_1', name_jp: '得意先名' },
    { name: 'business_date', name_jp: '営業日' },
    { name: 'total_quantity', name_jp: '合計数量' },
    { name: 'slip_amount', name_jp: '伝票金額' },
    { name: 'slip_amount_tax_excluded', name_jp: '伝票金額(外税)' },
    {
      name: 'sales_slip_tax_rate_8_tax_excluded_target_amount',
      name_jp: '8%小計',
    },
    {
      name: 'sales_slip_tax_rate_8_tax_excluded_target_tax',
      name_jp: '8%消費税',
    },
    {
      name: 'sales_slip_tax_rate_10_tax_excluded_target_amount',
      name_jp: '10%小計',
    },
    {
      name: 'sales_slip_tax_rate_10_tax_excluded_target_tax',
      name_jp: '10%消費税',
    },
  ];

  depositDetailTableNameMapping: Mapping<DepositDetail>[] = [
    { name: 'deposit_id', name_jp: '入金ID' },
    { name: 'deposit_date', name_jp: '入金日' },
    { name: 'deposit_detail_division_code', name_jp: '入金区分' },
    { name: 'deposit_amount', name_jp: '入金金額' },
    { name: 'employee_created_last_name', name_jp: '登録者' },
    // { name: 'product_name', name_jp: '修理商品名' },
    // { name: 'employee_created_last_name', name_jp: '登録者' },
  ];

  depositDetailsTotalItems: number = 0;
  depositDetailsHeaders!: string[];
  depositDetails!: TableData[][];
  depositDetailsOrg!: TableData[][];

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          ) // キャンセルモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    // 画面上のAPI呼出
    this.callApi(true);
    this.getDepositDetail();
  }

  /**
   * 画面上のAPI呼出
   * @param id
   */
  private callApi(initFg: boolean) {
    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.params['id'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);

    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);
    if (initFg) {
      this.getAccountsReceivableAggregate(this.selectedId);
    }
    this.getBill();
  }

  /**
   * idで指定した1件の売掛集計データを取得
   * @param id
   */
  getAccountsReceivableAggregate(accounts_receivable_aggregate_id: number) {
    this.common.loading = true;
    this.subscription.add(
      this.accountsReceivableAggregateService
        .find(accounts_receivable_aggregate_id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.accountsReceivableAggregate = res.data[0];
        })
    );
  }

  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private getBill() {
    this.common.loading = true;
    this.billService
      .getAll(this.createApiParams())
      .pipe(
        catchError(this.billService.handleErrorModal<BillApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<Bill>(
          res,
          this.tableNameMapping,
          this.modifiedTableBody
        );
        this.tableParams.next(params);
      });
  }

  private getDepositDetail() {
    this.common.loading = true;
    this.subscription.add(
      this.depositDetailService
        .getAll({
          ...this._depositDetailFilter,
          accounts_receivable_aggregate_id: this.selectedId,
          sort: 'id:desc',
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(res.status, errorTitle, this.listPagePath);
            return;
          }

          const params = this.createTableParams<DepositDetail>(
            res,
            this.depositDetailTableNameMapping,
            (data: DepositDetail) =>
              this.depositDetailDomain.modifiedTableBody(data)
            // (data: DepositDetail) => this.depositDetailDomain.modifiedTableBody(data, "./detail-view", "deposit_id")
          );
          this.depositDetailsOrg = params.body;
          this.depositDetails = this.depositDetailsOrg;
          this.depositDetailsHeaders = params.header;
          this.depositDetailsTotalItems = params.total;
        })
    );
  }

  /**
   * APIコール用のパラメータを生成する。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams() {
    // ソート列の物理名を取得
    const tmpColumn = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;

    let column;
    if (tmpColumn === 'client_name_1') {
      column = 'client_name_kana';
    } else {
      column = tmpColumn;
    }

    // APIコール用のパラメータを生成して返却
    return {
      ...this._filter,
      accounts_receivable_aggregate_id: this.selectedId,
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
  private modifiedTableBody(record: Bill) {
    return (mapping: Mapping<Bill>) => {
      let negative_sign = '';
      if (record.sales_slip_division_cd === 1) {
        negative_sign = '-';
      }
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      // 伝票番号ならリンクに修正
      if (mapping.name === 'sales_slip_cd') {
        return {
          href: `../../slip-detail/${record.accounts_receivable_aggregate_id}/${record.id}/${record.sales_slip_cd}`,
          text: record[mapping.name] + '',
        };
      }
      // 得意先IDならリンクに修正
      // if (mapping.name === 'client_name_1') {
      //   return {
      //     href: `/master/client/detail/${record.client_cd}`,
      //     text: record.client_name_1,
      //   };
      // }

      // 価格の場合の表示
      if (mapping.name === 'slip_amount') {
        const slip_amount = record.slip_amount
          ? negative_sign + record.slip_amount
          : '0';
        return {
          unit: false,
          align: 'right',
          text: Number(slip_amount),
        };
      }

      if (mapping.name === 'slip_amount_tax_excluded') {
        const slip_amount_tax_excluded = record.slip_amount_tax_excluded
          ? negative_sign + record.slip_amount_tax_excluded
          : '0';
        return {
          unit: false,
          align: 'right',
          text: Number(slip_amount_tax_excluded),
        };
      }
      if (mapping.name === 'sales_slip_tax_rate_8_tax_excluded_target_amount') {
        const tmp_sales_slip_tax_rate_8 =
          record.sales_slip_tax_rate_8_tax_excluded_target_amount -
          record.sales_slip_tax_rate_8_tax_excluded_target_tax;
        const sales_slip_tax_rate_8 = tmp_sales_slip_tax_rate_8
          ? negative_sign + tmp_sales_slip_tax_rate_8
          : '0';
        return {
          unit: false,
          align: 'right',
          text: Number(sales_slip_tax_rate_8),
        };
      }
      if (mapping.name === 'sales_slip_tax_rate_8_tax_excluded_target_tax') {
        const sales_slip_tax_rate_8_tax_excluded_target_tax =
          record.sales_slip_tax_rate_8_tax_excluded_target_tax
            ? negative_sign +
              record.sales_slip_tax_rate_8_tax_excluded_target_tax
            : '0';
        return {
          unit: false,
          align: 'right',
          text: Number(sales_slip_tax_rate_8_tax_excluded_target_tax),
        };
      }
      if (
        mapping.name === 'sales_slip_tax_rate_10_tax_excluded_target_amount'
      ) {
        let tmp_sales_slip_tax_rate_10 =
          record.sales_slip_tax_rate_10_tax_excluded_target_amount -
          record.sales_slip_tax_rate_10_tax_excluded_target_tax;
        const sales_slip_tax_rate_10 = tmp_sales_slip_tax_rate_10
          ? negative_sign + tmp_sales_slip_tax_rate_10
          : '0';
        return {
          unit: false,
          align: 'right',
          text: Number(sales_slip_tax_rate_10),
        };
      }
      if (mapping.name === 'sales_slip_tax_rate_10_tax_excluded_target_tax') {
        const sales_slip_tax_rate_10_tax_excluded_target_tax =
          record.sales_slip_tax_rate_10_tax_excluded_target_tax
            ? negative_sign +
              record.sales_slip_tax_rate_10_tax_excluded_target_tax
            : '0';
        return {
          unit: false,
          align: 'right',
          text: Number(sales_slip_tax_rate_10_tax_excluded_target_tax),
        };
      }

      return record[mapping.name];
    };
  }

  /**
   * 削除リンククリック時の処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = '請求' + modalConst.TITLE.DELETE;

    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'danger';

    // 削除確認モーダル呼び出し
    this.modalService.setModal(
      modalTitle,
      modalConst.BODY.DELETE,
      modalPurposeDanger,
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          ) // 削除モーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除処理を購読

            this.accountsReceivableAggregateService
              .remove(this.selectedId)
              .pipe(
                // エラー対応
                catchError((error: HttpErrorResponse) => {
                  // 空の値を返却
                  return of(error);
                }),
                finalize(() => (this.common.loading = false))
              )
              .subscribe((res) => {
                // ローディング終了
                this.common.loading = false;
                if (res instanceof HttpErrorResponse) {
                  this.handleError(res.status, res.error.message);
                } else {
                  const purpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    purpose,
                    1500
                  );
                  this.router.navigateByUrl(this.listPagePath);
                }
              });
          }
        })
    );
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedDepositDetailTableBody(record: DepositDetail) {
    return (mapping: Mapping<DepositDetail>) => {
      let selected: boolean = false;
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      // 仕入IDならリンクに修正
      // if (mapping.name === 'id') {
      //   // console.log(parentIdName);
      //   // console.log(mapping.name);
      //   // console.log(record);
      //   return {
      //     href: `../${record[parentIdName]}/deposit/${record[mapping.name]}`,
      //     text: record[mapping.name] + '',
      //   };
      // }
      // // 仕入先名ならリンクに修正
      // if (mapping.name === 'supplier_name') {
      //   return {
      //     href: `/master/supplier/detail/${record.supplier_id}`,
      //     text: record.supplier_name,
      //   };
      // }

      if (mapping.name === 'deposit_date') {
        let depositDate;
        if (record.deposit_date === '') {
          depositDate = '';
        } else if (record.deposit_date === 'NaT') {
          depositDate = '';
        } else {
          depositDate = new Date(
            record.deposit_date as string
          ).toLocaleDateString();
        }
        return depositDate;
      }

      if (mapping.name === 'deposit_amount') {
        let def = 0;
        if (record.deposit_amount) {
          def = record.deposit_amount;
        }
        return {
          unit: false,
          align: 'right',
          text: Number(def),
        };
      }

      if (mapping.name === 'deposit_detail_division_code') {
        // 表示区分選択肢
        let aggregateOptions = [
          {
            value: accountsReceivableAggregateConst.STATUS_CODE.CASH,
            text: accountsReceivableAggregateConst.STATUS.CASH,
          },
          {
            value: accountsReceivableAggregateConst.STATUS_CODE.DISCOUNT,
            text: accountsReceivableAggregateConst.STATUS.DISCOUNT,
          },
          {
            value: accountsReceivableAggregateConst.STATUS_CODE.TRANSFER,
            text: accountsReceivableAggregateConst.STATUS.TRANSFER,
          },
        ];
        return aggregateOptions.find(
          (x) => x.value === record.deposit_detail_division_code
        )?.text;
      }

      return record[mapping.name];
    };
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '請求伝票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントが破棄される時に実行
   */
  ngOnDestroy(): void {
    // 一元管理した購読を全て解除
    this.subscription.unsubscribe();
  }

  /**
   * 日付フォーマット変換
   */
  getDateFormat(tmpDateInfo: String) {
    let dateInfo;
    if (tmpDateInfo === '') {
      dateInfo = '';
    } else if (tmpDateInfo === 'NaT') {
      dateInfo = '';
    } else {
      dateInfo = new Date(tmpDateInfo as string).toLocaleDateString();
    }
    return dateInfo;
  }
}
