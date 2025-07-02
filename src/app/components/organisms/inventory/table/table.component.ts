import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  Subject,
  tap,
  switchMap,
  catchError,
  of,
  finalize,
  Subscription,
} from 'rxjs';
import { TableData } from 'src/app/components/atoms/table-inventory/table-inventory.component';
import {
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-inventory-with-pagination/table-inventory-with-pagination.component';
import { Inventory, InventoryApiResponse } from 'src/app/models/inventory';
import { InventoryService } from 'src/app/services/inventory.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ModalService } from 'src/app/services/modal.service';

export interface InventoryForm extends FormGroup {
  controls: {
    id: FormControl;
    inventory_stock_quantity: FormControl;
  };
}

export interface InventoriesForm extends FormGroup {
  controls: {
    inventory: FormArray<InventoryForm>;
  };
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  // 各種パラメータ
  @Input() eventListener!: Subject<object>;
  private subscription?: Subscription;
  @Output() err = new EventEmitter<HttpErrorResponse>();
  private filter = {};
  private pages = {
    page: 1,
    itemsPerPage: 10,
    sort: {},
  } as TableWithPaginationEvent;

  //get ctrls() {
  //  return this.formGroup.controls;
  //}

  // テーブル周りで使用する変数
  tableParams = new Subject<TableWithPaginationParams>();
  loading = false;

  inventoryForm: InventoryForm = this.fb.group({
    id: '',
    inventory_stock_quantity: '',
  });

  inventoriesForm: InventoriesForm = this.fb.group({
    inventory: this.fb.array([this.inventoryForm]),
  });

  // APIのレスポンスとヘッダ名のマッピング表
  tableNameMapping: { name: keyof Inventory; name_jp: string }[] = [
    { name: 'id', name_jp: '棚卸ID' }, // createTableParams 内で値を修正
    { name: 'product_image_path', name_jp: '商品画像' },
    { name: 'product_name', name_jp: '商品名' },
    { name: 'management_cd', name_jp: '管理コード' },
    { name: 'stock_quantity', name_jp: '在庫数量' },
    { name: 'inventory_stock_quantity', name_jp: '棚卸在庫数' },
    { name: 'difference_quantity', name_jp: '差異数量	' },
    // { name: 'receiving_quantity', name_jp: '受入数量' }, // createTableParams 内で値を修正
    // { name: 'inventory_date', name_jp: '発注日時' }, // createTableParams 内で値を修正
    //{ name: 'name', name_jp: '仕入先名' },
    //{ name: 'mail', name_jp: 'メールアドレス' },
    //{ name: 'tel', name_jp: '電話番号' },
    //{ name: 'pic_name', name_jp: '担当者名' }, // createTableParams 内で値を修正
    //{ name: 'province', name_jp: '住所' }, // createTableParams 内で値を修正
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private router: Router,
    private modal: ModalService,
    private flash: FlashMessageService
  ) {}

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    this.subscribeEventListener(); // イベントを購読
    this.eventListener.next(this.pages); // 初回のデータを取得
  }

  /**
   * APIパラメータの生成 ～ テーブルの更新処理を、`eventListener`へサブスクライブする。
   */
  subscribeEventListener() {
    this.subscription?.unsubscribe(); // 念のため
    this.subscription = this.eventListener
      .pipe(
        tap(() => (this.loading = true)),
        switchMap((x) => this.inventoryService.getAll(this.createApiParams(x))), // APIコールへスイッチ
        catchError(this.handleError())
      )
      .subscribe({
        next: (res) => {
          this.tableParams.next(this.createTableParams(res));
          this.loading = false;
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
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`InventoryApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (err: HttpErrorResponse) => {
      this.err.emit(err);
      return of({ data: [] as Inventory[] } as InventoryApiResponse);
    };
  }

  /**
   * ユーザーへエラーを通知するモーダルを表示し、アプリの動作を止めないよう空のオブジェクトを返却する。
   * @returns `catchError`関数へ渡す関数。
   */
  private handleError2<T>() {
    return (err: HttpErrorResponse) => {
      console.error(err);
      this.modal.setModal(
        `通信エラー(${err.status})`,
        err.message,
        'danger',
        '閉じる',
        ''
      );
      return of({} as T);
    };
  }

  /**
   * APIレスポンスからテーブルコンポーネントへ渡すオブジェクトを生成する。
   * @param res APIレスポンスのオブジェクト
   * @returns 生成された`TableWithPaginationParams`オブジェクト
   */
  private createTableParams(
    res: InventoryApiResponse
  ): TableWithPaginationParams {
    const header = this.tableNameMapping.map((x) => x.name_jp);
    const body = res.data.map((record) =>
      this.tableNameMapping.map((x) => record[x.name] as TableData)
    );
    const controls: FormControl[] = [];

    res.data.map((record) => {
      //const form = this.formGroup.controls
      const formValue = {
        id: record.id,
        inventory_stock_quantity: record.inventory_stock_quantity,
      };
      //controls.push(new FormControl(form.patchValue(formValue)))
      this.inventoriesForm.controls.inventory.push(this.fb.group(formValue));
    });

    body.forEach((row, index) => {
      let column: number = -1;
      const inventory = res.data[index];

      column = header.indexOf('棚卸ID');
      const inventory_id = row[column];
      //console.log(inventory_id);
      //row[column] = { formCtrl: "", text: inventory.id};

      column = header.indexOf('棚卸在庫数');
      this.inventoriesForm.controls.inventory.controls.forEach(
        (formRow, formIndex) => {
          if (formRow.controls.id.value != inventory_id) {
            return;
          }
          row[column] = formRow;
          //row.unshift(checkboxArray[index]);
        }
      );

      // IDをリンクへ変更
      column = header.indexOf('商品画像');
      if (inventory.product_image_path == '') {
        return;
      }
      row[column] = { src: inventory.product_image_path };

      // const inventory = res.data[index];
      // row[column] = `${inventory.inventory_date}`;
    });

    return {
      total: res.totalItems,
      header,
      body,
    };
  }

  onClickSave() {
    const values = { ...this.inventoriesForm.value };

    values.inventory[3].inventory_stock_quantity = 10;
    //console.log(values.inventory);
    values.inventory = values.inventory?.filter((x: any) => x.id);
    this.update(values as InventoriesForm);
  }

  private update(params: InventoriesForm) {
    this.inventoryService
      .update(params)
      .pipe(
        catchError(this.handleError2<InventoryApiResponse>()),
        finalize(() => (this.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '更新しました') {
          this.flash.setFlashMessage(
            '棚卸し情報が正常に更新されました。',
            'success',
            15000
          );
        }
        this.router.navigateByUrl(`inventory`);
      });
  }
}
