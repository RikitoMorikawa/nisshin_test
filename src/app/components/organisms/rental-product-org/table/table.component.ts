import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  catchError,
  finalize,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
  filter,
  take,
  forkJoin,
} from 'rxjs';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TableData } from 'src/app/components/atoms/table/table.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { statusCahngeString } from 'src/app/const/modal.const';
import { divisionConst } from 'src/app/const/division.const';
import {
  RentalProduct,
  RentalProductApiResponse,
  RentalProductChangeStatus,
} from 'src/app/models/rental-product';
import { RentalProductService } from 'src/app/services/rental-product.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { Router } from '@angular/router';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { DivisionService } from 'src/app/services/division.service';
import { Division } from 'src/app/models/division';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { regExConst } from 'src/app/const/regex.const';
import { rentalProductConst } from 'src/app/const/rental-product.const';

export type StatusChangeFormType = {
  status_division_id: FormControl;
  idlist: FormControl;
};

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private rentalProductService: RentalProductService,
    public common: CommonService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private divisionService: DivisionService
  ) {}

  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  private subscription = new Subscription();
  // エラーイベントを親コンポーネントへ送信するEmitter初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 絞り込み用オブジェクト
  private filter = {};
  // 一覧表示用パラメータオブジェクト
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: { column: 'レンタル商品ID', order: 'desc' },
  } as TableWithPaginationEvent;

  // テーブルのページネーションイベント購読用インスタンス初期化
  tableParams = new Subject<TableWithPaginationParams>();

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof RentalProduct; name_jp: string }[] = [
    { name: 'id', name_jp: '選択' },
    { name: 'id', name_jp: 'レンタル商品ID' },
    { name: 'status_division_id', name_jp: 'ステータス' },
    { name: 'name', name_jp: '商品名' },
    { name: 'selling_price', name_jp: 'レンタル料金' },
    { name: 'delivery_charge', name_jp: '配送料' },
    { name: 'data_permission_division_id', name_jp: '公開区分' },
  ];

  //チェックボックス選択内容(is)をリスト格納
  items: any = [];
  selectitems?: string;

  listItem: any = [];

  // ステータス変更用フォーム
  changeList!: FormGroup<StatusChangeFormType>;

  selectLists!: any;
  list_string: string = '';
  button_status: boolean = true;

  // 送信済みステータスフラグ
  isSent!: boolean;
  statusLists!: SelectOption[];

  // selectedItem
  selectedItem!: number;

  /**
   * レンタル受付票のステータス更新用フォームグループを作成する
   */
  createStatusForm(fb: FormBuilder): FormGroup<StatusChangeFormType> {
    return fb.group({
      status_division_id: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(11),
        ],
      ],
      idlist: ['', [Validators.required]],
    });
  }

  // ステータスフォームのゲッター
  get statusFc(): StatusChangeFormType {
    return this.changeList.controls;
  }

  ngOnInit(): void {
    this.changeList = this.createStatusForm(this.fb);
    this.subscribeEventListener(); // イベントを購読
    this.eventListener.next(this.pages); // 初回のデータを取得
  }

  /**
   * get division
   */
  getstatus() {
    this.subscription.add(
      forkJoin([
        this.divisionService.getAsSelectOptions({
          name: divisionConst.RENTAL_PRODUCT_STATUS,
        }),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          this.statusLists = res[0][divisionConst.RENTAL_PRODUCT_STATUS];

          /** 初期値設定 */
          const rentanableitem = res[0][
            divisionConst.RENTAL_PRODUCT_STATUS
          ].find((x: any) => {
            return x.code === rentalProductConst.STATUS_CODE.RENTABLE;
          });
          this.statusFc.status_division_id.setValue(rentanableitem.value);

          /** セレクトボックスの入力監視 */
          this.statusFc.status_division_id.valueChanges.subscribe((value) => {
            const itemvalue = res[0][divisionConst.RENTAL_PRODUCT_STATUS].find(
              (x: any) => {
                return x.value === Number(value);
              }
            );
            this.selectedItem = itemvalue.value;
          });
        })
    );
  }
  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener() {
    this.subscription?.unsubscribe(); // 念のため

    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.common.loading = true)),
        switchMap((x) =>
          this.rentalProductService.getAll(this.createApiParams(x))
        ), // APIコールへスイッチ
        catchError((error: HttpErrorResponse) => {
          return of(error);
        }),
        finalize(() => (this.common.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }

          this.getstatus();
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
      title: 'レンタル商品一覧：' + statusCahngeString.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: RentalProductApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    this.selectitems = this.statusFc.idlist.value;
    if (this.selectitems != undefined) {
      this.selectLists = this.selectitems?.split(',');
    }
    body.forEach((row, index) => {
      let column: number = -1;

      //発注書Noをcheckbox用に格納
      column = header.indexOf('レンタル商品ID');
      let nam = row[column]?.toLocaleString();

      let selected: boolean = false;
      if (this.selectLists.includes(nam)) {
        selected = true;
      }

      // checkbox
      column = header.indexOf('選択');
      row[column] = {
        checkbox: true,
        name: 'checkbox',
        value: row[column] + '',
        selected: selected,
      };
      // IDをリンクへ変更
      column = header.indexOf('レンタル商品ID');
      row[column] = {
        href: `./detail/${row[column]}`,
        text: row[column] + '',
      };
      column = header.indexOf('ステータス');
      row[column] = String(res.data[index].division_status_value);
      column = header.indexOf('レンタル料金');
      row[column] = String(row[column]?.toLocaleString()) + ' 円';
      column = header.indexOf('配送料');
      row[column] = String(row[column]?.toLocaleString()) + ' 円';
      column = header.indexOf('公開区分');
      row[column] = String(res.data[index].division_data_permission_value);
    });
    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  selectItemList(newItem: string) {
    let index = this.items.indexOf(newItem);
    if (index === -1) {
      this.items.push(newItem);
    } else {
      this.items.splice(index, 1);
    }
    if (this.items.length > 0) {
      this.list_string = this.items.join(',');
      this.button_status = false;
    } else {
      this.list_string = '';
      this.button_status = true;
    }
    this.changeList.controls.idlist.setValue(this.list_string);
    this.selectitems = this.list_string;
  }

  onSubmit() {
    alert(JSON.stringify(this.changeList.value));
  }

  reset() {
    this.ngOnDestroy();
    this.ngOnInit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  resetSelectItems(): void {
    //reset selectItem
    this.selectitems = '';
    this.listItem = [];
    this.list_string = '';
    this.items = [];
    this.changeList.controls.idlist.setValue('');
    /*this.changeList.setValue({
      idlist: '',
    });*/
  }

  /**
   * 一括編集
   * データが下書き中の場合のみ実行される
   * （バックエンドでも対応しているがフロントエンドでも対応）
   */
  handleClickChangeStatus() {
    // 送信済みの場合はエラーモーダルを表示
    if (this.isSent) {
      this.handleError(422, '');
      return;
    }
    // モーダルのタイトル
    const modalTitle = 'レンタル商品' + statusCahngeString.TITLE.STATUS;
    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'danger';

    // 削除確認モーダル呼び出し
    this.modalService.setModal(
      modalTitle,
      statusCahngeString.BODY.STATUS,
      modalPurposeDanger,
      statusCahngeString.BUTTON_TITLE.STATUS,
      statusCahngeString.BUTTON_TITLE.CANCEL
    );

    console.log(this.statusFc.status_division_id.value);

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          ) // 削除のモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (
            res === statusCahngeString.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE
          ) {
            // ローディング開始
            this.common.loading = true;
            const postData: RentalProductChangeStatus = {
              status_division_id: this.selectedItem,
              product_id_list: this.list_string,
            };
            // 削除実行
            this.rentalProductService
              .listchangee(this.list_string, postData)
              .pipe(
                finalize(() => (this.common.loading = false)),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  this.handleError(res.status, res.message);
                  return;
                }
                const flashMessagePurpose: FlashMessagePurpose = 'success';
                this.flashMessageService.setFlashMessage(
                  res.message,
                  flashMessagePurpose,
                  15000
                );

                this.resetSelectItems();

                this.ngOnDestroy();
                this.ngOnInit(); // イベントを購読
                this.router.navigateByUrl('rental-product');
              });
          }
        })
    );
  }
}
