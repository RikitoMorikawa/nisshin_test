import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, finalize, of, Subject } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import {
  AccountsPayableBalance,
  AccountsPayableBalanceApiResponse,
} from 'src/app/models/accounts-payable-balance';
import { AccountsPayableBalanceService } from 'src/app/services/accounts-payable-balance.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountsPayableAggregateService } from 'src/app/services/accounts-payable-aggregate.service';

type PageAccountsPayableBalance = {
  id: number;
  supplier_id: number;
  previous_month_balance: number;
  payment_amount: number;
  purchase_amount: number;
  consumption_tax: number;
  reduced_tax: number;
  current_month_balance: number;
  created_at: string;
  created_id: number;
  supplier_name: string;
  supplier_name_kana: string;
  supplier_postal_code: string;
  supplier_province: string;
  supplier_locality: string;
  supplier_street_address: string;
  supplier_other_address: string;
  supplier_tel: string;
  supplier_fax: string;
  supplier_mail: string;
  supplier_cutoff_date_billing: number;
  supplier_scheduled_payment_date: string;
  supplier_remarks_1: string;
  supplier_remarks_2: string;
  supplier_pic_name: string;
  supplier_pic_name_kana: string;
  supplier_payee_1: string;
  supplier_payee_2: string;
  supplier_account_payable: number;
  supplier_logo_image_path: string;
  employee_created_last_name: string;
  employee_created_first_name: string;
  blank_discount_amount: string;
  blank_payment_amount: string;
  carryforward_amount: number;
  total_price: number;
};

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};

interface ReturnType {
  unit: boolean;
  align: string;
  text: number;
}

@Component({
  selector: 'app-accounts-payable-balance',
  templateUrl: './accounts-payable-balance.component.html',
  styleUrls: ['./accounts-payable-balance.component.scss'],
})
export class AccountsPayableBalanceComponent implements OnInit {
  // 初期値のパス
  topPagePath = '/setting';
  // 初期値のパス
  listPagePath =
    this.topPagePath + '/accounts-payable-aggregate/accounts-payable-balance';

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi();
  }

  private readonly defaultSort = {
    column: '請求ID',
    order: 'desc',
  } as TableSortStatus;

  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;
  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    this.callApi();
  }

  // テーブル周りの変数
  tableParams = new Subject<TableWithPaginationParams>();
  tableNameMapping: Mapping<AccountsPayableBalance>[] = [
    { name: 'id', name_jp: '請求ID' },
    { name: 'supplier_id', name_jp: '仕入先ID' },
    { name: 'supplier_name', name_jp: '仕入先名' },
    { name: 'previous_month_balance', name_jp: '前月残高' },
    { name: 'payment_amount', name_jp: '支払金額' },
    { name: 'carryforward_amount', name_jp: '繰越金額' },
    { name: 'purchase_amount', name_jp: '仕入金額' },
    { name: 'consumption_tax', name_jp: '消費税額(10%)' },
    { name: 'reduced_tax', name_jp: '消費税額(8%)' },
    { name: 'total_price', name_jp: '合計' },
    { name: 'current_month_balance', name_jp: '当月残高' },
    { name: 'blank_discount_amount', name_jp: '値引き' },
    { name: 'blank_payment_amount', name_jp: '支払額' },
  ];

  // エクスポート関連
  get export$() {
    return this.service.getCsv('csv', { ...this._filter }).pipe(
      catchError(this.service.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = '買掛残高';

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private service: AccountsPayableBalanceService,
    private fb: FormBuilder,
    private flashMessageService: FlashMessageService,
    private accountsPayableAggregateService: AccountsPayableAggregateService,
    private errorService: ErrorService,
    private router: Router,
    private modalService: ModalService
  ) {}

  // フォームとバリデーションの設定
  form = this.fb.group({
    payment_date_picker: [''],
    payment_date: ['', [Validators.required]],
  });
  get ctrls() {
    return this.form.controls;
  }
  // エラーモーダルのタイトル
  errorModalTitle = '集計エラー：' + modalConst.TITLE.HAS_ERROR;

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.callApi();
    // 日付のサジェスト
    this.ctrls.payment_date_picker.valueChanges.subscribe(() => {
      // 年月に変更
      let pick_date = this.ctrls.payment_date_picker.value;
      if (pick_date) {
        const formattedDate = new Date(pick_date);
        let yearmonth =
          String(formattedDate.getFullYear()) +
          '/' +
          String(formattedDate.getMonth() + 1);
        this.ctrls.payment_date.setValue(yearmonth);
      }
    });
  }

  onClickSubmit() {
    this.common.loading = true;
    if (this.ctrls.payment_date_picker.value) {
      const post = new Date(this.ctrls.payment_date_picker.value);
      console.log(post);
      //let from_date = post.setDate(1);
      let from_date = post;
      const postData = {
        to_order_date: new Date(from_date).toLocaleDateString(),
      };
      console.log(postData);

      this.service
        .aggregate(postData)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorModalTitle, res.message);
            return;
          }
          const purpose: FlashMessagePurpose = 'success';

          let message =
            '集計完了後、ご登録のメールアドレスにメールを送信いたします。\n';
          message +=
            '※ メールが迷惑メールに振り分けられていることがあります。\n';
          message += '※ メールが送信されるまで数分かかる場合があります。';

          this.modalService.setModal(
            '集計が実施されました',
            message,
            purpose,
            '閉じる',
            '閉じる',
            false
          );
          this.router.navigateByUrl(this.listPagePath);
        });
    } else {
      this.common.loading = false;
    }
  }

  /**
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }
  /**
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
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
   *  // フィルタリングされたデータから合計を計算
   * @param filteredData
   * @param filter_name
   * @returns
   */
  private sum_totals(filteredData: any, filter_name: string) {
    const result = filteredData.reduce((total: number, item: any) => {
      return total + Number(item[filter_name]);
    }, 0);
    return result;
  }
  /**
   * 絞り込みフォーム、テーブルの現在の状態を元にパラメータを生成し、
   * APIから情報を取得して、テーブルの表示を更新する。
   */
  private callApi() {
    this.common.loading = true;
    let url_params: any = this.createApiParams();
    this.service
      .getAll(url_params)
      .pipe(
        catchError(
          this.service.handleErrorModal<AccountsPayableBalanceApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        console.log(url_params);
        delete url_params['limit'];
        console.log(url_params);
        this.service
          .getAll(url_params)
          .pipe(
            catchError(
              this.service.handleErrorModal<AccountsPayableBalanceApiResponse>()
            ),
            finalize(() => (this.common.loading = false))
          )
          .subscribe((allres) => {
            console.log(allres);

            const filteredData = allres.data.map((item) => ({
              previous_month_balance: Number(item.previous_month_balance)
                ? Number(item.previous_month_balance)
                : 0,
              payment_amount: Number(item.payment_amount)
                ? Number(item.payment_amount)
                : 0,
              carryforward_amount: Number(item.carryforward_amount)
                ? Number(item.carryforward_amount)
                : 0,
              purchase_amount: Number(item.purchase_amount)
                ? Number(item.purchase_amount)
                : 0,
              consumption_tax: Number(item.consumption_tax)
                ? Number(item.consumption_tax)
                : 0,
              reduced_tax: Number(item.reduced_tax)
                ? Number(item.reduced_tax)
                : 0,
              total_price: Number(item.total_price)
                ? Number(item.total_price)
                : 0,
              current_month_balance: Number(item.current_month_balance)
                ? Number(item.current_month_balance)
                : 0,
              blank_discount_amount: Number(item.blank_discount_amount)
                ? Number(item.blank_discount_amount)
                : 0,
              blank_payment_amount: Number(item.blank_payment_amount)
                ? Number(item.blank_payment_amount)
                : 0,
            }));
            let previous_month_balance = this.sum_totals(
              filteredData,
              'previous_month_balance'
            );
            let payment_amount = this.sum_totals(
              filteredData,
              'payment_amount'
            );
            let carryforward_amount = this.sum_totals(
              filteredData,
              'carryforward_amount'
            );
            let purchase_amount = this.sum_totals(
              filteredData,
              'purchase_amount'
            );
            let consumption_tax = this.sum_totals(
              filteredData,
              'consumption_tax'
            );
            let reduced_tax = this.sum_totals(filteredData, 'reduced_tax');
            let total_price = this.sum_totals(filteredData, 'total_price');
            let current_month_balance = this.sum_totals(
              filteredData,
              'current_month_balance'
            );
            let blank_discount_amount = this.sum_totals(
              filteredData,
              'blank_discount_amount'
            );
            let blank_payment_amount = this.sum_totals(
              filteredData,
              'blank_payment_amount'
            );

            const footer = [
              '合計',
              '',
              '',
              previous_month_balance.toLocaleString(),
              payment_amount.toLocaleString(),
              carryforward_amount.toLocaleString(),
              purchase_amount.toLocaleString(),
              consumption_tax.toLocaleString(),
              reduced_tax.toLocaleString(),
              total_price.toLocaleString(),
              current_month_balance.toLocaleString(),
              blank_discount_amount.toLocaleString(),
              blank_payment_amount.toLocaleString(),
            ];

            const params = this.createTableParams<PageAccountsPayableBalance>(
              res,
              this.tableNameMapping,
              this.modifiedTableBody,
              footer
            );
            this.tableParams.next(params);
          });
      });
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
    } else {
      column = tmpColumn;
    }

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
    modFn?: (data: T) => (mapping: Mapping<T>) => any,
    footer: any[] = []
  ) {
    // APIから取得した値を格納
    const header = mappings.map((x) => x.name_jp);
    // const body = res.data.map((record) =>
    //   mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    // );
    const body = res.data.map((record) => {
      // carryforward_amount と payment_amount の合計を total_price として追加
      (record as any).carryforward_amount =
        (record as any).previous_month_balance - (record as any).payment_amount;
      (record as any).total_price =
        (record as any).purchase_amount +
        (record as any).consumption_tax +
        (record as any).reduced_tax;
      return mappings.map(modFn ? modFn(record) : (x) => record[x.name]);
    });

    // 生成した TableParams を返却
    console.log(body);
    return { total: res.totalItems, header, body, footer };
  }

  /**
   * データの合計を計算し、フッター行を生成する

  private calculateFooter<T>(data: T[], mappings: Mapping<T>[]): any[] {
    // 合計行を初期化
    const totals = mappings.map((mapping, index) => {
      // 最初の列は「合計」テキストを表示
      if (index === 0) {
        return '合計';
      }
      if (index === 1 || index === 2) {
        return '';
      }

      // 金額列のみ合計を計算
      const fieldsToSum = [
        'previous_month_balance',
        'payment_amount',
        'carryforward_amount',
        'purchase_amount',
        'consumption_tax',
        'reduced_tax',
        'total_price',
        'current_month_balance',
        'blank_discount_amount',
        'blank_payment_amount',
      ];

      // マッピング名が合計対象かチェック
      if (fieldsToSum.includes(mapping.name as string)) {
        // データから該当する列の値を合計
        const sum = data.reduce((total, record) => {
          const value = record[mapping.name] || 0;
          return total + Number(value);
        }, 0);

        return sum.toLocaleString();
      }

      return '';
    });

    return totals;
  }   */

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: AccountsPayableBalance) {
    return (mapping: Mapping<AccountsPayableBalance>) => {
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      const fieldsToCheck = [
        'previous_month_balance',
        'payment_amount',
        'carryforward_amount',
        'purchase_amount',
        'consumption_tax',
        'reduced_tax',
        'total_price',
        'current_month_balance',
        'blank_discount_amount',
        'blank_payment_amount',
      ];
      if (fieldsToCheck.includes(mapping.name)) {
        const def = record[mapping.name] || 0;
        const result: ReturnType = {
          unit: false,
          align: 'right',
          text: Number(def),
        };
        return result;
      }
      // 仕入先名ならリンクに修正
      // if (mapping.name === 'supplier_name') {
      //   return {
      //     href: `/master/supplier/detail/${record.supplier_id}`,
      //     text: record.supplier_name,
      //   };
      // }
      return record[mapping.name];
    };
  }
  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  private handleError(status: number, title: string, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: this.listPagePath,
    });
  }
}
