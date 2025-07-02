import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  of,
  Subscription,
  // take,
  Subject,
  forkJoin,
} from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
// import {
//   CsvMapping,
//   ExportStatus,
// } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  ApiResponseIsInvalid,
  isParameterInvalid,
  convertToJpDate,
} from 'src/app/functions/shared-functions';

import {
  AccountsPayableAggregate,
  //AccountsPayableAggregateApiResponse,
} from 'src/app/models/accounts-payable-aggregate';
import { AccountsPayableAggregateService } from 'src/app/services/accounts-payable-aggregate.service';

import { Purchase, PurchaseApiResponse } from 'src/app/models/purchase';
import { PurchaseService } from 'src/app/services/purchase.service';
import {
  PurchaseDetail,
  PurchaseDetailApiResponse,
} from 'src/app/models/purchase-detail';
import { Repair, RepairApiResponse } from 'src/app/models/repair';
import { RepairService } from 'src/app/services/repair.service';
import {
  // ModalPurpose,
  ModalService,
} from 'src/app/services/modal.service';
import { PaymentDetail } from 'src/app/models/payment-detail';
import { PaymentDetailDomain } from 'src/app/domains/payment-detail.domain';
import { RepairDomain } from 'src/app/domains/repair.domain';
import { ErrorService } from 'src/app/services/shared/error.service';
// import {
//   FlashMessagePurpose,
//   FlashMessageService,
// } from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { PurchaseDetailService } from '../../../../../services/purchase-detail.service';

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
   * @param repairService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private accountsPayableAggregateService: AccountsPayableAggregateService,
    private purchaseService: PurchaseService,
    private purchaseDetailService: PurchaseDetailService,
    private repairService: RepairService,
    private errorService: ErrorService,
    private paymentDetailDomain: PaymentDetailDomain,
    private repairDomain: RepairDomain,

    // private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;

  // 支払データ一覧のパス
  topPagePath = '/setting';
  listPagePath = '/setting/accounts-payable-aggregate/payment-slip';

  // エラーモーダルのタイトル
  errorModalTitle = '支払伝票一覧：' + modalConst.TITLE.HAS_ERROR;

  // 表示用商品オブジェクト
  accountsPayableAggregate!: AccountsPayableAggregate; //{ [key: string]: string | number };
  purchase!: Purchase; //{ [key: string]: string | number };

  totalPrice: number = 0;

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi(false);
  }

  private _repairFilter = {};
  set repairFilter(repairs: TableData[][]) {
    console.log(repairs);
    this.repairs = repairs;
    this.repairsTotalItems = repairs.length;
  }

  private _paymentDetailFilter = {};
  set paymentDetailFilter(paymentDetails: TableData[][]) {
    this._paymentDetailPages.page = 1;
    console.log('this._paymentDetailPages:: ', this._paymentDetailPages);
    console.log(paymentDetails);
    this.paymentDetails = paymentDetails;
    this.paymentDetailsTotalItems = paymentDetails.length;
  }

  private readonly defaultSort = {
    column: '仕入ID',
    order: 'desc',
  } as TableSortStatus;

  private readonly defaultRepairSort = {
    column: '修理ID',
    order: 'desc',
  } as TableSortStatus;

  private readonly defaultPaymentDetailSort = {
    column: '支払ID',
    order: 'desc',
  } as TableSortStatus;

  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;

  private _repairPages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultRepairSort,
  } as TableWithPaginationEvent;

  private _paymentDetailPages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultPaymentDetailSort,
  } as TableWithPaginationEvent;

  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi(false);
  }

  set repairPages(arg: TableWithPaginationEvent) {
    console.log(arg);
    this._repairPages = arg;
  }

  set paymentDetailPages(arg: TableWithPaginationEvent) {
    console.log(arg);
    this._paymentDetailPages = arg;
  }

  onRepairPagesChange(event: any): void {
    console.log('Repair pages changed:', event);
    this._repairPages = event;
    // 必要な処理をここに記載
    // 例: API呼び出しやデータ更新
  }

  // 支払明細一覧のページ変更処理
  onPaymentDetailPagesChange(event: any): void {
    console.log('Payment detail pages changed:', event);
    this._paymentDetailPages = event;
    // 必要な処理をここに記載
    // 例: API呼び出しやデータ更新
  }

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  repairTableParams = new Subject<TableWithPaginationParams>();
  paymentDetailTableParams = new Subject<TableWithPaginationParams>();

  tableNameMapping: Mapping<Purchase>[] = [
    { name: 'is_discount', name_jp: '種別' },
    { name: 'id', name_jp: '仕入ID' },
    { name: 'purchase_date', name_jp: '仕入日' },
    { name: 'supplier_name', name_jp: '仕入先名' },
    { name: 'order_employee_last_name', name_jp: '仕入担当者' },
    { name: 'purchaseDetails', name_jp: '金額' },
  ];

  repairTableNameMapping: Mapping<Repair>[] = [
    { name: 'id', name_jp: '修理ID' },
    { name: 'arrival_date', name_jp: '入荷日' },
    { name: 'product_name', name_jp: '修理商品名' },
    { name: 'employee_created_last_name', name_jp: '登録者' },
  ];

  paymentDetailTableNameMapping: Mapping<PaymentDetail>[] = [
    { name: 'payment_id', name_jp: '支払ID' },
    { name: 'payment_date', name_jp: '支払日' },
    { name: 'payment_type_division_code', name_jp: '支払区分' },
    { name: 'payment_amount', name_jp: '支払額' },
    { name: 'employee_created_last_name', name_jp: '登録者' },
  ];

  repairsTotalItems: number = 0;
  repairsHeaders!: string[];
  repairs!: TableData[][];
  repairsOrg!: TableData[][];

  paymentDetailsTotalItems: number = 0;
  paymentDetailsHeaders!: string[];
  paymentDetails!: TableData[][];
  paymentDetailsOrg!: TableData[][];

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
    //this.setPathParams(true);
    this.callApi(true);
    //this.callRepairApi(true);
    this.getRepair();
    this.getPaymentDetail();
  }

  /**
   * 画面上のAPI呼出
   * @param id
   */
  private setPathParams(initFg: boolean) {
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
      this.getAccountsPayableAggregate(this.selectedId);
    }
  }

  /**
   * 画面上のAPI呼出
   * @param id
   */
  private callApi(initFg: boolean) {
    // this.setPathParams(initFg);
    // this.getPurchase();
    const selectedId = this.route.snapshot.params['id'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);

    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    this.selectedId = Number(selectedId);
    if (initFg) {
      this.getAccountsPayableAggregate(this.selectedId);
    }
    this.getPurchase();
  }

  /**
   * idで指定した1件の支払伝票データを取得
   * @param id
   */
  getAccountsPayableAggregate(id: number) {
    this.common.loading = true;
    this.subscription.add(
      this.accountsPayableAggregateService
        .find(id)
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
          this.accountsPayableAggregate = res.data[0];
        })
    );
  }

  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private getPurchase() {
    this.common.loading = true;
    this.purchaseService
      .getAll(this.createApiParams())
      .pipe(
        catchError(
          this.purchaseService.handleErrorModal<PurchaseApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const purchaseIds = res.data.map((purchase) => purchase.id);
        const purchaseDetailRequests = purchaseIds.map((id) =>
          this.purchaseDetailService
            .getAll({ purchase_id: id })
            .pipe(
              catchError(
                this.purchaseDetailService.handleErrorModal<PurchaseDetailApiResponse>()
              )
            )
        );

        forkJoin(purchaseDetailRequests).subscribe((purchaseDetailsArray) => {
          const purchaseDetailsMap = new Map();
          purchaseDetailsArray.forEach((purchaseDetails) => {
            purchaseDetails.data.forEach((detail) => {
              if (!purchaseDetailsMap.has(detail.purchase_id)) {
                purchaseDetailsMap.set(detail.purchase_id, []);
              }
              purchaseDetailsMap.get(detail.purchase_id).push(detail);
            });
          });

          const purchasesWithDetails = res.data.map((purchase) => ({
            ...purchase,
            purchaseDetails: purchaseDetailsMap.get(purchase.id) || [],
          }));

          const checkIsDiscount = purchasesWithDetails.forEach((purcase) => {
            let is_discount = 0;
            const purchase = purcase.purchaseDetails.forEach((detail: any) => {
              if (detail.is_discount) {
                is_discount = 1;
              }
            });
            purcase.is_discount = is_discount;
          });

          const params = this.createPurchasesTableParams<Purchase>(
            { ...res, data: purchasesWithDetails },
            this.tableNameMapping,
            this.modifiedTableBody
          );
          this.tableParams.next(params);
        });
      });
  }

  private getRepair() {
    //    this.common.loading = true;
    //    console.log('getRepair this._repairFilter:: ', this._repairFilter);
    //    this.subscription.add(
    //      this.repairService
    //        .getAll({
    //          ...this._repairFilter,
    //          accounts_payable_aggregate_id: this.selectedId,
    //          sort: 'id:desc',
    //        })
    //        .pipe(
    //          catchError((error: HttpErrorResponse) => {
    //            return of(error);
    //          }),
    //          finalize(() => (this.common.loading = false))
    //        )
    //        .subscribe((res) => {
    //          console.log(res);
    //          if (res instanceof HttpErrorResponse) {
    //            const errorTitle: string = res.error
    //              ? res.error.title
    //              : 'エラーが発生しました。';
    //            this.handleError(res.status, errorTitle, this.listPagePath);
    //            return;
    //          }
    //
    //          const params = this.createTableParams<Repair>(
    //            res,
    //            this.repairTableNameMapping,
    //            this.modifiedRepairTableBody
    //          );
    //          this.repairsOrg = params.body;
    //          this.repairs = this.repairsOrg;
    //          this.repairsHeaders = params.header;
    //          this.repairsTotalItems = params.total;
    //        })
    //    );

    const apiParams = {
      ...this._repairFilter,
      accounts_payable_aggregate_id: this.selectedId,
      sort: 'id:desc',
    };
    this.repairDomain.getTableData(
      this.subscription,
      this._repairFilter,
      this.repairTableNameMapping,
      apiParams,
      (params: any) => {
        this.repairsOrg = params.body;
        this.repairs = this.repairsOrg;
        this.repairsHeaders = params.header;
        this.repairsTotalItems = params.total;
      },
      (record: Repair) =>
        this.repairDomain.modifiedTableBody(
          record,
          'accounts-payable-aggregate/payment-slip',
          'id'
        ) // link と link_column を指定
      //this.repairDomain.modifiedTableBody.bind(this.repairDomain, 'accounts-payable-aggregate/payment-slip', 'id') // link と link_column を指定
      // this.repairDomain.modifiedTableBody.bind(this.repairDomain, 'accounts-payable-aggregate/payment-slip', 'id') // link と link_column を指定
    );
  }

  private getPaymentDetail() {
    const apiParams = {
      ...this._paymentDetailFilter,
      accounts_payable_aggregate_id: this.selectedId,
      sort: 'id:desc',
    };
    this.paymentDetailDomain.getTableData(
      this.subscription,
      this._paymentDetailFilter,
      this.paymentDetailTableNameMapping,
      apiParams,
      (params: any) => {
        this.paymentDetailsOrg = params.body;
        this.paymentDetails = this.paymentDetailsOrg;
        this.paymentDetailsHeaders = params.header;
        this.paymentDetailsTotalItems = params.total;
      }
    );
  }

  /**
   * APIコール用のパラメータを生成する。
   * @returns APIコールのパラメータとなるオブジェクト。
   */
  private createApiParams() {
    if (Object.keys(this._pages.sort).length === 0) {
      this._pages.sort = this.defaultSort;
    }

    // ソート列の物理名を取得
    const tmpColumn = this.tableNameMapping.find(
      (x) => x.name_jp === this._pages.sort.column
    )?.name;

    let column;
    if (tmpColumn === 'supplier_name') {
      column = 'supplier_name_kana';
    } else if (tmpColumn === 'order_employee_last_name') {
      column = 'order_employee_last_name_kana';
    } else {
      column = tmpColumn;
    }

    // console.log(this._filter);
    // APIコール用のパラメータを生成して返却
    return {
      ...this._filter,
      accounts_payable_aggregate_id: this.selectedId,
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

  private createPurchasesTableParams<T>(
    res: ApiResponse<T>,
    mappings: Mapping<T>[],
    modFn?: (data: T) => (mapping: Mapping<T>) => any
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    const body = res.data.map((record) => {
      return mappings.map(modFn ? modFn(record) : (x) => record[x.name]);
    });

    const sumData = res.data.map((purchase: any) => {
      if (purchase.hasOwnProperty('purchaseDetails')) {
        return purchase.purchaseDetails;
      }
    }) as PurchaseDetail[];

    const flatSumData = sumData.flatMap((details) => details);
    // 合計を計算する

    const totalSum = flatSumData.reduce((sum, detail) => sum + detail.total, 0);

    let totals = 0;
    const totalSums = flatSumData.forEach((detail, sum) => {
      if (detail.is_discount) {
        totals += -detail.total;
      } else {
        totals += detail.total;
      }
    });
    // ここに合計行の計算処理を追加
    const footer = this.calculateFooter(totals, mappings);
    // 生成した TableParams を返却
    return { total: res.totalItems, header, body, footer };
  }

  /**
   * データの合計を計算し、フッター行を生成する
   */
  private calculateFooter<T>(totalSum: number, mappings: Mapping<T>[]): any[] {
    // 合計行を初期化
    const totals = mappings.map((mapping, index) => {
      // 最初の列は「合計」テキストを表示
      if (index === 3) {
        return '合計';
      }
      if (index <= 2) {
        return '';
      }

      // 金額列のみ合計を計算
      const fieldsToSum = ['purchaseDetails'];

      // マッピング名が合計対象かチェック
      if (fieldsToSum.includes(mapping.name as string)) {
        return totalSum.toLocaleString();
      }

      return '';
    });

    return totals;
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: Purchase) {
    const parentIdName = 'accounts_payable_aggregate_id';
    let isDiscount: boolean = false;
    return (mapping: Mapping<Purchase>) => {
      let selected: boolean = false;

      if (mapping.name === 'is_discount') {
        if (record[mapping.name]) {
          isDiscount = true;
        }
      }

      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      if (mapping.name === 'is_discount') {
        if (record[mapping.name]) {
          isDiscount = true;
          return '返金/値引き';
        } else {
          return '通常';
        }
      }

      // 仕入IDならリンクに修正
      if (mapping.name === 'id') {
        // console.log(parentIdName);
        // console.log(mapping.name);
        // console.log(record);
        return {
          href: `../${record[parentIdName]}/purchase/${record[mapping.name]}`,
          text: record[mapping.name] + '',
        };
      }
      // 仕入先名ならリンクに修正
      if (mapping.name === 'supplier_name') {
        return {
          href: `/master/supplier/detail/${record.supplier_id}`,
          text: record.supplier_name,
        };
      }

      if (mapping.name === 'purchase_date') {
        return convertToJpDate(record[mapping.name]);
      }

      if (mapping.name === 'purchaseDetails') {
        const totalAmount = record.purchaseDetails?.reduce(
          (sum, detail) => sum + detail.total,
          0
        );
        if (totalAmount) {
          let text: number = totalAmount;
          // 返金・値引きフラグ
          if (isDiscount) {
            text = -text;
          }
          return {
            unit: false,
            align: 'right',
            text: text,
          };
        } else {
          return '';
        }
      }

      return record[mapping.name];
    };
  }

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  // private modifiedRepairTableBody(record: Repair) {
  //   const parentIdName = 'accounts_payable_aggregate_id';
  //   return (mapping: Mapping<Repair>) => {
  //     let selected: boolean = false;
  //     // 値が空なら何もしない
  //     if (record[mapping.name] === '') {
  //       return record[mapping.name];
  //     }
  //     // 仕入IDならリンクに修正
  //     if (mapping.name === 'id') {
  //       return {
  //         href: `../${record[parentIdName]}/repair/${record[mapping.name]}`,
  //         text: record[mapping.name] + '',
  //       };
  //     }
  //     // 仕入先名ならリンクに修正
  //     if (mapping.name === 'supplier_name') {
  //       return {
  //         href: `/master/supplier/detail/${record.supplier_id}`,
  //         text: record.supplier_name,
  //       };
  //     }

  //     if (mapping.name === 'arrival_date') {
  //       return convertToJpDate(record[mapping.name]);
  //     }

  //     return record[mapping.name];
  //   };
  // }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '支払伝票一覧：' + modalConst.TITLE.HAS_ERROR,
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
    return convertToJpDate(dateInfo);
  }
}
