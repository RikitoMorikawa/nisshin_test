import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
  constructor() {}

  // テーブルヘッダー
  @Input() header?: string[];

  // テーブルデータ
  @Input() data!: TableData[][];

  // ソート変更時の処理を親コンポーネントに伝える
  @Output() event = new EventEmitter<TableSortStatus>();

  // ソート状態
  sort!: TableSortStatus;

  ngOnInit(): void {
    this.sort = {
      column: this.header ? this.header.filter((value) => value)[0] : '',
      order: 'asc',
    };
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
   * itemが空かどうか
   * @param item
   * @returns
   */
  itemIsEmpty(item: TableData): boolean {
    return item === null || item === undefined || item === '';
  }
}
