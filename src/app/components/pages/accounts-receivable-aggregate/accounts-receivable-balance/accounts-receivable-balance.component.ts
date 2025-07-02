import { HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { catchError, finalize, Subject, of } from 'rxjs';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import {
  CsvMapping,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import {
  AccountsReceivableBalance,
  AccountsReceivableBalanceApiResponse,
} from 'src/app/models/accounts-receivable-balance';
import { AccountsReceivableBalanceService } from 'src/app/services/accounts-receivable-balance.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { AccountsReceivableAggregateService } from '../../../../services/accounts-receivable-aggregate.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { AuthorService } from 'src/app/services/author.service';
import { Employee } from 'src/app/models/employee';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';

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
  selector: 'app-accounts-receivable-balance',
  templateUrl: './accounts-receivable-balance.component.html',
  styleUrls: ['./accounts-receivable-balance.component.scss'],
})
export class AccountsReceivableBalanceComponent implements OnInit {
  // 初期値のパス
  topPagePath = '/setting';
  listPagePath =
    this.topPagePath +
    '/accounts-receivable-aggregate/accounts-receivable-balance';

  // 絞り込みの状態
  private _filter = {};
  set filter(arg: object) {
    this._filter = arg;
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.callApi();
  }

  private readonly defaultSort = {
    column: '',
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
  tableNameMapping: Mapping<AccountsReceivableBalance>[] = [
    { name: 'client_client_cd', name_jp: '請求先コード' },
    { name: 'client_name', name_jp: '請求先名' },
    { name: 'previous_month_balance', name_jp: '前月残高' },
    { name: 'deposit_amount', name_jp: '入金金額' },
    { name: 'sales_amount', name_jp: '売上金額' },
    { name: 'consumption_tax', name_jp: '消費税額' },
    { name: 'reduced_tax_1', name_jp: '軽減税率消費税額' },
    { name: 'current_month_balance', name_jp: '当月残高' },
  ];

  // エクスポート関連
  get export$() {
    return this.service.getCsv('csv', { ...this._filter }).pipe(
      catchError(this.service.handleErrorModal('')),
      finalize(() => (this.common.loading = false))
    );
  }
  fileNamePrefix = '売上伝票';

  /**
   * コンストラクタ
   */
  constructor(
    private common: CommonService,
    private service: AccountsReceivableBalanceService,
    private fb: FormBuilder,
    private accountsReceivableAggregateService: AccountsReceivableAggregateService,
    private flashMessageService: FlashMessageService,
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
    /**date pickr  */

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
      //let from_date = post.setDate(1);
      let from_date = post;
      const postData = {
        to_sale_date: new Date(from_date).toLocaleDateString(),
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
          this.service.handleErrorModal<AccountsReceivableBalanceApiResponse>()
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
              this.service.handleErrorModal<AccountsReceivableBalanceApiResponse>()
            ),
            finalize(() => (this.common.loading = false))
          )
          .subscribe((allres) => {
            console.log(allres);
            const filteredData = allres.data.map((item) => ({
              previous_month_balance: Number(item.previous_month_balance),
              deposit_amount: Number(item.deposit_amount),
              sales_amount: Number(item.sales_amount),
              consumption_tax: Number(item.consumption_tax),
              reduced_tax_1: Number(item.reduced_tax_1),
              current_month_balance: Number(item.current_month_balance),
            }));
            let total_previous_month_balance = this.sum_totals(
              filteredData,
              'previous_month_balance'
            );
            let total_deposit_amount = this.sum_totals(
              filteredData,
              'deposit_amount'
            );
            let total_sales_amount = this.sum_totals(
              filteredData,
              'sales_amount'
            );
            let total_consumption_tax = this.sum_totals(
              filteredData,
              'consumption_tax'
            );
            let total_reduced_tax_1 = this.sum_totals(
              filteredData,
              'reduced_tax_1'
            );
            let total_current_month_balance = this.sum_totals(
              filteredData,
              'current_month_balance'
            );

            const footer = [
              '合計',
              '',
              total_previous_month_balance.toLocaleString(),
              total_deposit_amount.toLocaleString(),
              total_sales_amount.toLocaleString(),
              total_consumption_tax.toLocaleString(),
              total_reduced_tax_1.toLocaleString(),
              total_current_month_balance.toLocaleString(),
            ];

            const params = this.createTableParams<AccountsReceivableBalance>(
              res,
              this.tableNameMapping,
              this.modifiedTableBody,
              footer
            );
            this.tableParams.next(params);
            this.common.loading = false;
          });
        //
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
    if (tmpColumn === 'client_client_cd') {
      column = 'client_cd';
    } else if (tmpColumn === 'client_name') {
      column = 'name_kana';
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
    const body = res.data.map((record) =>
      mappings.map(modFn ? modFn(record) : (x) => record[x.name])
    );
    // 生成した TableParams を返却
    return { total: res.totalItems, header, body, footer };
  }

  /**
   * データの合計を計算し、フッター行を生成する

  private calculateFooter<T>(data: T[], mappings: Mapping<T>[]): any[] {
    // 合計行を初期化
    const totals = mappings.map((mapping, index) => {
      // 最初の列（請求先コード）
      if (index === 0) {
        return '合計'; // 単純な文字列
      }

      // 2列目（請求先名）
      if (index === 1) {
        return ''; // 空文字列
      }

      // 金額列のみ合計を計算
      const fieldsToSum = [
        'previous_month_balance',
        'deposit_amount',
        'sales_amount',
        'consumption_tax',
        'reduced_tax_1',
        'current_month_balance',
      ];

      // マッピング名が合計対象かチェック
      if (fieldsToSum.includes(mapping.name as string)) {
        // データから該当する列の値を合計
        const sum = data.reduce((total, record) => {
          const value = record[mapping.name] || 0;
          return total + Number(value);
        }, 0);

        // 数値をそのまま返す（文字列でも可）
        return sum.toLocaleString();
      }

      // 合計対象でない列は空を返す
      return '';
    });

    return totals;
  }   */

  /**
   * APIレスポンスからテーブルデータのbodyを生成する際に実行される処理を返却する。
   * @param record APIレスポンスのデータオブジェクト。
   * @returns `createTableParams`の`modFn`へ引き渡す関数。
   */
  private modifiedTableBody(record: AccountsReceivableBalance) {
    return (mapping: Mapping<AccountsReceivableBalance>) => {
      // 値が空なら何もしない
      if (record[mapping.name] === '') {
        return record[mapping.name];
      }
      // 得意先IDならリンクに修正
      // if (mapping.name === 'client_name') {
      //   return {
      //     href: `/master/client/detail/${record.client_id}`,
      //     text: record.client_name,
      //   };
      // }

      const fieldsToCheck = [
        'deposit_amount',
        'previous_month_balance',
        'sales_amount',
        'consumption_tax',
        'reduced_tax_1',
        'current_month_balance',
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
