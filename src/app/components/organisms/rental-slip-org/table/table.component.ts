import { HttpErrorResponse } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, Subscription, catchError, of, switchMap, tap } from 'rxjs';
import {
  TableData,
  TableSortStatus,
} from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { modalConst } from 'src/app/const/modal.const';
import { rentalSlipConst } from 'src/app/const/rental-slip.const';
import { RentalSlip, RentalSlipApiResponse } from 'src/app/models/rental-slip';
import { Rental } from 'src/app/models/rental';
import { RentalSlipService } from 'src/app/services/rental-slip.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { RentalService } from 'src/app/services/rental.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  constructor(
    private rsService: RentalSlipService,
    private rService: RentalService,
    public common: CommonService,
    public fb: FormBuilder
  ) {}

  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  public subscription: Subscription = new Subscription();
  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 絞り込み用オブジェクト
  public filter = {};

  private readonly defaultSort = {
    column: 'レンタル受付票ID',
    order: 'desc',
  } as TableSortStatus;

  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof RentalSlip; name_jp: string }[] = [
    { name: 'id', name_jp: 'レンタル受付票ID' },
    { name: 'customer_type_division_id', name_jp: 'お客様タイプ' },
    { name: 'client_id', name_jp: 'お客様名' },
    { name: 'reception_date', name_jp: '受付日時' },
    { name: 'reception_employee_id', name_jp: '受付担当者' },
    { name: 'status_division_id', name_jp: 'ステータス' },
  ];

  // リアクティブフォーム
  //searchForms = new FormGroup({
  //  rental_status: new FormControl(''),
  //});
  searchForms = this.fb.group({
    rental_status: '',
  });
  //簡易サーチのOption
  searchOptions: SelectOption[] = [
    { text: 'リセット', value: 'none' },
    { text: '翌日貸出', value: 'nextdate' },
    { text: '未引き取り', value: 'notpickup' },
    { text: '延滞', value: 'detention' },
  ];

  get fc() {
    return this.searchForms.controls;
  }
  // 選択肢
  searchValue!: string;
  //簡易サーチ結果
  rental_slip_id_list!: any;

  DELINQUENCY_OVERDUDE: number = 1;
  DELINQUENCY_NOT_OVERDUDE: number = 0;

  ngOnInit(): void {
    this.subscribeEventListener(); // イベントを購読
    // src/app/components/organisms/rental-slip-org/search/search.component.ts
    // で初期状態で特定のフィルタリングを設定しているので、こちらはコメントアウト
    // this.eventListener.next(this.pages); // 初回のデータを取得
  }

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener() {
    this.subscription?.unsubscribe(); // 念のため

    /**
     * reset > rentalへのリクエスト解除
     * none > 探したがない場合
     */
    if (this.rental_slip_id_list) {
      if (this.rental_slip_id_list[0] == 'reset') {
        this.filter = {};
      } else if (this.rental_slip_id_list[0] == 'none') {
        this.filter = { id: 0 };
      } else {
        Object.assign(this.filter, { id: this.rental_slip_id_list.join(',') });
      }
    }

    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) => {
          return this.rsService.getAll(this.createApiParams(x));
        }), // APIコールへスイッチ
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        tap(() => (this.common.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          this.tableParams.next(this.createTableParams(res));
        },
        // エラー発生時 complete が走るため、再度サブスクライブを設定
        complete: () => this.subscribeEventListener(),
      });
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
    if (Object.keys(this.pages.sort).length === 0) {
      this.pages.sort = this.defaultSort;
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
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  private handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: 'レンタル受付票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: RentalSlipApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );

    body.forEach((row, index) => {
      let column: number = -1;

      // IDをリンクへ変更
      column = header.indexOf('レンタル受付票ID');
      row[column] = {
        href: `./detail/${row[column]}`,
        text: row[column] + '',
      };

      // お客様タイプの表示名取得
      column = header.indexOf('お客様タイプ');
      row[column] = String(res.data[index].division_customer_type_value);

      // お客様名の取得
      column = header.indexOf('お客様名');
      switch (res.data[index].division_customer_type_code) {
        case rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.CLIENT:
          row[column] = String(res.data[index].client_name);
          break;
        case rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.MEMBER:
          row[column] =
            String(res.data[index].member_last_name) +
            ' ' +
            String(res.data[index].member_first_name);
          break;
        case rentalSlipConst.CUSTOMER_TYPE_DIVISION.CODE.GENERAL:
          row[column] =
            String(res.data[index].last_name) +
            ' ' +
            String(res.data[index].first_name);
          break;
        default:
          row[column] = '不明';
      }

      // 受付日のフォーマット変換
      column = header.indexOf('受付日時');
      if (row[column] === '') {
        row[column] = '';
      } else if (row[column] === 'NaT') {
        row[column] = '';
      } else {
        row[column] = new Date(row[column] as string).toLocaleString();
      }

      // 受付担当者の姓・名結合
      column = header.indexOf('受付担当者');
      row[column] =
        res.data[index].employee_reception_last_name +
        ' ' +
        res.data[index].employee_reception_first_name;

      // ステータスの表示名取得
      column = header.indexOf('ステータス');
      row[column] = String(res.data[index].division_status_value);
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  get searchFormFc() {
    return this.searchForms.controls;
  }

  /**
   * change Event
   */
  simplifiedSorting(e: any) {
    this.searchValue = e.target.value;
    let param = {};
    let from_date = '';
    let to_date = '';
    switch (this.searchValue) {
      case 'detention':
        param = { delinquency_flag: this.DELINQUENCY_OVERDUDE };
        break;

      case 'nextdate':
        /*** 翌日 backend query where >> from >= to <=
         ** today 2023/01/01 00:00:00
         ** from 2023/01/02 00:00:00
         ** to 2023/01/03 00:00:00
         ***/
        from_date = this.getDate(1) + ' 00:00:00';
        to_date = this.getDate(2) + ' 00:00:00';
        param = {
          from_scheduled_rental_date: from_date,
          to_scheduled_rental_date: to_date,
        };
        break;

      case 'notpickup':
        // 前日
        to_date = this.getDate(0) + ' 00:00:00';
        param = {
          delinquency_flag: this.DELINQUENCY_NOT_OVERDUDE,
          to_scheduled_rental_date: to_date,
        };
        break;

      default:
        param = false;
        this.rental_slip_id_list = ['reset'];
        this.ngOnInit();
        return;
    }
    this.getRentalParams(param);
  }
  /**
   * rental_slip_idのユニークを取得する
   * @param arrays Rental[] 型
   * @returns rental_slip_idのリスト(any)を返す
   */
  getUniqRentalSlipIds(arrays: any) {
    const knownElements = new Map();
    const uniquedArray = [];
    for (const elem of arrays) {
      if (knownElements.has(elem.rental_slip_id)) continue;
      uniquedArray.push(elem.rental_slip_id);
      knownElements.set(elem.rental_slip_id, true);
    }
    return uniquedArray;
  }
  /**
   * num 加算した日付を返す
   * @param num 加算日
   * @returns yyyy/m/d
   */
  getDate(num: number) {
    let dt = new Date();
    let next_date = new Date(
      dt.setDate(dt.getDate() + num)
    ).toLocaleDateString();
    return next_date;
  }
  /**
   * Rentalテーブルからデータを取得しrental_slip_id_listに格納
   * @param param Rental API に投げるパラメーター Json
   * @returns yyyy/m/d
   */
  getRentalParams(param: object) {
    this.common.loading = true;
    this.subscription.add(
      this.rService.getAll(param).subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          this.handleError(res.status, res.error.message);
          return;
        }
        this.rental_slip_id_list = this.getUniqRentalSlipIds(res.data);
        //リストが空の場合
        if (this.rental_slip_id_list.length == 0) {
          this.rental_slip_id_list = ['none'];
        }
        this.ngOnInit();
      })
    );
  }
}
