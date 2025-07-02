import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { SelectOption } from '../../atoms/select/select.component';
import { TableData, TableSortStatus } from '../../atoms/table/table.component';

/**
 * コンポーネントで使用するパラメータのインターフェイス
 */
export interface TableWithPaginationParams {
  header: string[];
  body: TableData[][];
  total: number;
  footer?: any[];
}

export interface InputData {
  id: string;
  name: string;
  value: string;
}

/**
 * 親コンポーネントへのイベント通知に利用するオブジェクトのインターフェイス
 */
export interface TableWithPaginationEvent {
  page: number;
  itemsPerPage: number;
  sort: TableSortStatus;
}

export const ItemsPerPageDefault = 10;

/**
 * ページネーションつきテーブルコンポーネント
 */
@Component({
  selector: 'app-table-with-pagination',
  templateUrl: './table-with-pagination.component.html',
  styleUrls: ['./table-with-pagination.component.scss'],
})
export class TableWithPaginationComponent implements OnInit {
  // 各種パラメータ
  @Input() loading = false;
  @Input() params!: Subject<TableWithPaginationParams>;
  _params: TableWithPaginationParams = {
    total: 0,
    header: [],
    body: [],
    footer: [],
  };
  @Output() pageChange = new EventEmitter<TableWithPaginationEvent>();
  @Output() checkItem = new EventEmitter<string>();
  @Output() changeItem = new EventEmitter<InputData>();
  @Input() selectitemList?: string;

  // 表示数選択用
  options: SelectOption[] = [
    {
      value: ItemsPerPageDefault,
      text: `1ページに${ItemsPerPageDefault}レコード表示`,
    },
    { value: 25, text: '1ページに25レコード表示' },
  ];
  select = new FormControl(this.options[0].value);

  selecteditemList?: string;

  // テーブルのイベント取得用
  sort = {} as TableSortStatus;

  // ページネーション用
  page = 1;
  itemsPerPage = Number(this.options[0].value);
  counts = {
    start: 0,
    end: 0,
  };

  /**
   * 初期化処理。
   */
  ngOnInit(): void {
    // データの変更をサブスクライブ
    this.params.subscribe((params) => {
      if (params.total !== this._params.total) {
        this.page = 1;
      }
      console.log('-- params.footer--');
      console.log(params.footer);
      this._params = { ...params, footer: params.footer || [] };
      this.updateCounts();
    });

    // 表示数の変更をサブスクライブ
    this.select.valueChanges.subscribe((value) => {
      this.changeSelect(Number(value));
    });
  }

  /**
   * 現在表示されているページを更新し、親コンポーネントへイベントを通知する。
   * @param page 次に表示したいページ番号
   */
  updatePage(page: number) {
    this.page = page;
    this.pageChange.emit({
      page: this.page,
      itemsPerPage: this.itemsPerPage,
      sort: this.sort,
    });
  }

  /**
   * レコード表示数を変更して、ページの更新処理を呼び出す。
   * @param value 設定されるレコード表示数
   */
  private changeSelect(value: number) {
    this.page = Math.ceil(this.counts.start / value); // 現在のページを再計算
    this.page = this.page > 0 ? this.page : 1;
    this.itemsPerPage = value;
    this.updatePage(this.page);
  }

  /**
   * 件数表示用オブジェクトを更新する。
   */
  private updateCounts() {
    const start = (this.page - 1) * this.itemsPerPage + 1;
    this.counts.start = start < this._params.total ? start : this._params.total;
    const end = start + this.itemsPerPage - 1;
    this.counts.end = end < this._params.total ? end : this._params.total;
  }

  // セレクトボックス選択 id 中継
  addItem(newItem: string) {
    this.checkItem.emit(newItem);
  }
  // セレクトボックス選択 id 中継
  changeItemData(Item: InputData) {
    this.changeItem.emit(Item);
  }
}
