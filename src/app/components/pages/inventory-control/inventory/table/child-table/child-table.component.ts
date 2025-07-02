import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { InventoryService } from 'src/app/services/inventory.service';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import { ActivatedRoute } from '@angular/router';

type LinkData = {
  href: string;
  text: string;
  queryParams?: object;
};

type InventoryStockQuantity = {
  id: string;
  value: string;
};

type textToLeftData = {
  header: string;
  name: string;
};

export type TableData =
  | string
  | number
  | boolean
  | null
  | textToLeftData
  | InventoryStockQuantity
  | LinkData;

export interface TableSortStatus {
  column: string;
  order: 'asc' | 'desc';
}

@Component({
  selector: 'app-child-table',
  templateUrl: './child-table.component.html',
  styleUrls: ['./child-table.component.scss'],
})
export class ChildTableComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private route: ActivatedRoute
  ) {}

  private subscription = new Subscription();

  // テーブルヘッダー
  @Input() header?: string[];

  // テーブルデータ
  @Input() data!: TableData[][];

  // ソート変更時の処理を親コンポーネントに伝える
  @Output() event = new EventEmitter<TableSortStatus>();

  // ソート状態
  sort!: TableSortStatus;

  // 編集モードかどうか
  isEditable: boolean = false;

  // 編集対象ID
  editTargetId!: string;
  // 編集対象の初期値
  editTargetInitialValue!: string;

  // エラー定数
  errorConst = errorConst;

  // 棚卸完了フラグ
  isInventoryCompleted!: boolean;

  // 棚卸管理コード
  managementCd!: string;

  // 実在庫登録フォーム
  form = this.fb.group({
    inventory_stock_quantity: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.min(0)],
    ],
  });
  get fc() {
    return this.form.controls;
  }

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    this.sort = {
      column: this.header ? this.header.filter((value) => value)[0] : '',
      order: 'asc',
    };
    // パスパラメータからidを取得、メンバへセット（パラメータチェックはinventoryコンポーネントで実施）
    const managementCd = this.route.snapshot.params['management_cd'];
    this.managementCd = managementCd;

    this.inventoryService
      .getGroupAll({ management_cd: this.managementCd })
      .subscribe((res) => {
        res.data[0].inventory_complete_date === ''
          ? (this.isInventoryCompleted = false)
          : (this.isInventoryCompleted = true);
      });
  }

  /**
   * ソート変更時の処理
   * @param column
   * @returns
   */
  changeSort(column: string) {
    if (!column) {
      return;
    }
    this.sort.order =
      this.sort.column === column && this.sort.order === 'asc' ? 'desc' : 'asc';
    this.sort.column = column;
    this.event.emit(this.sort);
  }

  /**
   * リンクデータかどうか
   * @param item
   * @returns
   */
  isLinkData(item: TableData): item is LinkData {
    if (this.itemIsEmpty(item)) {
      return false;
    } else {
      return (item as LinkData).href !== undefined;
    }
  }

  /**
   * 実在庫数かどうか
   * @param item
   * @returns
   */
  isInventoryStockQuantity(item: TableData): item is InventoryStockQuantity {
    if (this.itemIsEmpty(item)) {
      return false;
    } else {
      return (item as InventoryStockQuantity).id !== undefined;
    }
  }

  /**
   * 左寄せテキストデータかどうか
   * @param item
   * @returns
   */
  isTextToLeftData(item: TableData): item is textToLeftData {
    if (this.itemIsEmpty(item)) {
      return false;
    } else {
      return (item as textToLeftData).header !== undefined;
    }
  }

  /**
   * 通常データかどうか
   * @param item
   * @returns
   */
  isNormalData(item: TableData): boolean {
    if (this.itemIsEmpty(item)) {
      return false;
    } else {
      return (
        !this.isLinkData(item) &&
        !this.isInventoryStockQuantity(item) &&
        typeof item !== 'object'
      );
    }
  }

  /**
   * itemが空かどうか
   * @param item
   * @returns
   */
  itemIsEmpty(item: TableData): boolean {
    return item === null || item === undefined || item === '';
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
   * 実在庫数編集モードを開く
   * @param item
   * @returns
   */
  openEditField(item: TableData) {
    if (this.itemIsEmpty(item)) {
      return;
    }
    this.editTargetId = (item as InventoryStockQuantity).id;
    this.editTargetInitialValue = (item as InventoryStockQuantity).value;
    this.fc.inventory_stock_quantity.patchValue(this.editTargetInitialValue);
    this.isEditable = true;
  }

  /**
   * 実在庫数編集モードを閉じる
   */
  closeEditField() {
    this.isEditable = false;
    this.editTargetId = '';
    this.editTargetInitialValue = '';
    this.form.reset({ inventory_stock_quantity: '' });
  }

  /**
   * 実在庫数編集モードの値をクリアする
   */
  clearValue() {
    this.fc.inventory_stock_quantity.patchValue(this.editTargetInitialValue);
  }

  /**
   * 実在庫数編集モードの値を送信する
   */
  submitInventoryStockQuantity() {
    const inventory = {
      inventory: [
        {
          id: this.editTargetId,
          inventory_stock_quantity: this.form.value.inventory_stock_quantity,
        },
      ],
    };
    const values = { ...inventory };
    values.inventory = values.inventory?.filter((x: any) => x.id);
    this.inventoryService.sendInventoryUpdateEvent(values);
    this.closeEditField();
  }
}
