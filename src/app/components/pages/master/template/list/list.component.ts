import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { TableSortStatus } from 'src/app/components/atoms/table/table.component';
import {
  ItemsPerPageDefault,
  TableWithPaginationEvent,
  TableWithPaginationParams,
} from 'src/app/components/molecules/table-with-pagination/table-with-pagination.component';
import { ExportStatus } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { AuthorService } from 'src/app/services/author.service'; // Employee削除

@Component({
  selector: 'app-template-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  // 各種パラメータ
  _tableParams = new Subject<TableWithPaginationParams>();
  @Input() set tableParams(arg: TableWithPaginationParams) {
    this._tableParams.next(arg);
  }
  @Input() formCtrl!: FormGroup;
  @Input() export$!: Observable<string>;
  @Input() fileNamePrefix = '';
  @Input() exportFileExtension = '';
  @Output() paramsChange = new EventEmitter<TableWithPaginationEvent>();
  @Output() exportStatusChange = new EventEmitter<ExportStatus>();

  constructor(public authorService: AuthorService) {}
  private readonly defaultSort = {
    column: 'ID',
    order: 'desc',
  } as TableSortStatus;
  // ページネーションの状態
  private _pages = {
    page: 1,
    itemsPerPage: ItemsPerPageDefault,
    sort: this.defaultSort,
  } as TableWithPaginationEvent;
  set pages(arg: TableWithPaginationEvent) {
    this._pages = arg;
    if (Object.keys(this._pages.sort).length === 0) {
      this._pages.sort = this.defaultSort;
    }
    this.emitEvent();
  }

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    // ページネーションの初期状態を親コンポーネントへ通知
    this.emitEvent();
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  listenSubmit() {
    this._pages.page = 1; // 絞り込み条件変更でテーブルが先頭ページになるため
    this.emitEvent();
  }

  /**
   * 表示更新のリクエストを親コンポーネントへ通知する。
   */
  private emitEvent() {
    this.paramsChange.emit(this._pages);
  }
}
