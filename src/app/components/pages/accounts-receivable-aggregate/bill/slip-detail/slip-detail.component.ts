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
import { Bill } from 'src/app/models/bill';
import { BillDetail, BillDetailApiResponse } from 'src/app/models/bill-detail';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { BillService } from 'src/app/services/bill.service';
import { BillDetailService } from 'src/app/services/bill-detail.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
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
  selector: 'app-slip-detail',
  templateUrl: './slip-detail.component.html',
  styleUrls: ['./slip-detail.component.scss'],
})
export class SlipDetailComponent implements OnInit, OnDestroy {
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
    private billService: BillService,
    private billDetailService: BillDetailService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;
  salesSlipCd!: number;

  // 初期値のパス
  id = this.route.snapshot.params['id'];
  billid = this.route.snapshot.params['bill_id'];
  topPagePath = '/setting';
  listPagePath = '../../../../../bill';
  slipListPagePath = this.listPagePath + '/slip-list/' + this.billid;

  // エラーモーダルのタイトル
  errorModalTitle = '請求伝票詳細：' + modalConst.TITLE.HAS_ERROR;

  // 表示用商品オブジェクト
  bill!: Bill; //{ [key: string]: string | number };
  total_amount!: number;
  total_amount_tax!: number;
  subtotal!: number;
  tax8_without_tax!: number;
  tax10_without_tax!: number;
  tax_8!: number;
  tax_10!: number;

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi(false);
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

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  tableNameMapping: Mapping<BillDetail>[] = [
    { name: 'gyo_cd', name_jp: '行番号' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'quantity_per_carton', name_jp: '数量' },
    { name: 'unit_cd', name_jp: '単位' },
    { name: 'unit_price', name_jp: '単価' },
    { name: 'slip_item_total_sales', name_jp: '金額' },
  ];

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

    // 取得したパスパラメータをメンバへセット
    this.callApi(true);
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
    this.salesSlipCd = this.route.snapshot.params['sales_slip_cd'];
    if (initFg) {
      this.getBill(this.selectedId);
    }
    this.getBillDetail();
  }

  /**
   * idで指定した1件の請求データを取得
   * @param id
   */
  getBill(sales_slip_cd: number) {
    this.common.loading = true;
    this.subscription.add(
      this.billService
        .find(sales_slip_cd)
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
          this.bill = res.data[0];

          this.subtotal = Number(this.bill.slip_amount_tax_excluded);
          this.total_amount = Number(this.bill.slip_amount);

          this.total_amount_tax =
            Number(this.bill.tax_excluded_target_tax) +
            Number(this.bill.tax_included_target_tax);

          this.tax_8 =
            Number(this.bill.sales_slip_tax_rate_8_tax_excluded_target_tax) +
            Number(this.bill.sales_slip_tax_rate_8_tax_included_target_amount);
          this.tax_10 =
            Number(this.bill.sales_slip_tax_rate_10_tax_excluded_target_tax) +
            Number(this.bill.sales_slip_tax_rate_10_tax_included_target_tax);

          this.tax8_without_tax =
            Number(this.bill.sales_slip_tax_rate_8_tax_excluded_target_amount) +
            Number(this.bill.sales_slip_tax_rate_8_tax_included_target_amount) -
            this.tax_8;
          this.tax10_without_tax =
            Number(
              this.bill.sales_slip_tax_rate_10_tax_excluded_target_amount
            ) +
            Number(
              this.bill.sales_slip_tax_rate_10_tax_included_target_amount
            ) -
            this.tax_10;

          if (this.bill.sales_slip_division_cd === 1) {
            this.subtotal = this.subtotal ? -this.subtotal : 0;
            this.total_amount = this.total_amount ? -this.total_amount : 0;
            this.total_amount_tax = this.total_amount_tax
              ? -this.total_amount_tax
              : 0;
            this.tax_8 = this.tax_8 ? -this.tax_8 : 0;
            this.tax_10 = this.tax_10 ? -this.tax_10 : 0;
            this.tax8_without_tax = this.tax8_without_tax
              ? -this.tax8_without_tax
              : 0;
            this.tax10_without_tax = this.tax10_without_tax
              ? -this.tax10_without_tax
              : 0;
          }
        })
    );
  }

  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private getBillDetail() {
    this.common.loading = true;

    this.billDetailService
      .getAll(this.createApiParams())
      .pipe(
        catchError(
          this.billDetailService.handleErrorModal<BillDetailApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const params = this.createTableParams<BillDetail>(
          res,
          this.tableNameMapping,
          this.modifiedTableBody
        );
        this.tableParams.next(params);
        console.log(this.tableParams);
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
      sales_slip_cd: this.salesSlipCd,
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
  private modifiedTableBody(record: BillDetail) {
    return (mapping: Mapping<BillDetail>) => {
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }

      // 商品IDならリンクに修正
      if (mapping.name === 'product_name') {
        return {
          href: `/master/product/detail/${record.product_cd}`,
          text: record.product_name,
        };
      }
      // 金額系

      if (mapping.name === 'slip_item_total_sales') {
        let total_salse: number = Number(record.slip_item_total_sales);
        if (Number(record.sales_slip_division_cd) === 1) {
          total_salse = -total_salse;
        }
        return {
          unit: false,
          align: 'right',
          text: Number(total_salse),
        };
      }
      if (mapping.name === 'unit_price') {
        const unir_price = record.unit_price;
        return {
          unit: false,
          align: 'right',
          text: Number(unir_price),
        };
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
      if (tmpDateInfo.length > 8) {
        tmpDateInfo =
          tmpDateInfo.substring(0, 4) +
          '-' +
          tmpDateInfo.substring(4, 6) +
          '-' +
          tmpDateInfo.substring(6, 8);
      }
      dateInfo = new Date(tmpDateInfo as string).toLocaleDateString();
    }
    return dateInfo;
  }
}
