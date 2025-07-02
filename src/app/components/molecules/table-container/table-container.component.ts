import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { FormControl } from '@angular/forms';
import { TableData, TableSortStatus } from '../../atoms/table/table.component';
import { SelectOption } from '../../atoms/select/select.component';

@Component({
  selector: 'app-table-container',
  templateUrl: './table-container.component.html',
  styleUrls: ['./table-container.component.scss'],
})
export class TableContainerComponent implements OnInit, OnChanges {
  @Input() instanceId = 'custom';
  @Input() tableHeader?: string[];
  @Input() tableData!: TableData[][];

  pageLimits: SelectOption[] = [
    { value: 10, text: '1ページに10レコード表示' },
    { value: 25, text: '1ページに25レコード表示' },
  ];

  frmPageLimit = new FormControl(this.pageLimits[0].value, {
    updateOn: 'change',
  });

  @Input() totalItems!: any;
  @Input() itemsPerPage?: number;
  @Output() sender = new EventEmitter();

  public pagerConfig: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    totalItems: 0,
    currentPage: 1,
  };

  sort = {} as TableSortStatus;
  sortColumn: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';

  /**
   * ページネーションのダミー用に
   * ※ これがないとページャーが表示されない？
   */
  meals: string[] = [];

  constructor() {}
  // constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.pagerConfig.id = this.instanceId;
    console.log(this.pagerConfig);
    // console.log(this.tableData);
    //this.pagerConfig.totalItems = this.totalItems;
    this.pagerConfig.totalItems = this.totalItems;
    this.frmPageLimit.valueChanges.subscribe((value) => {
      this.setLimit(value);
    });
  }

  ngOnChanges(changes: any): void {
    if (changes.hasOwnProperty('totalItems') === false) {
      return;
    }

    if (changes.totalItems.currentValue == undefined) {
      return;
    }
    this.pagerConfig.totalItems = changes.totalItems.currentValue;
  }

  setLimit(event: any): void {
    if (event.target === undefined) {
      return;
    }
    // console.log("setLimit event:: ", event);
    // console.log("setLimit event.target:: ", event.target);
    const limit = event.target.value;
    const params = {
      currentPage: 1,
      itemsPerPage: limit,
    };
    this.pagerConfig.currentPage = 1;
    this.pagerConfig.itemsPerPage = limit;
    this.itemsPerPage = limit;
    this.sender.emit(params);
  }

  renderPage(event: number) {
    const itemsPerPage = Number(this.pagerConfig.itemsPerPage);
    const params = {
      currentPage: event,
      itemsPerPage: itemsPerPage,
    };
    this.pagerConfig.currentPage = event;
    this.sender.emit(params);
  }

  // get paginatedData(): TableData[][] {
  //   if (this.tableData === undefined) {
  //     return [];
  //   }
  //   const start = (this.pagerConfig.currentPage - 1) * this.pagerConfig.itemsPerPage;
  //   const end = start + this.pagerConfig.itemsPerPage;
  //   return this.tableData.slice(start, end);
  // }
  get paginatedData(): TableData[][] {
    if (this.tableData === undefined) {
      return [];
    }
    let sortedData = this.tableData;
    // console.log("paginatedData this.sortColumn:: ", this.sortColumn);
    // console.log("paginatedData this.sortOrder:: ", this.sortOrder);
    // console.log("paginatedData this.tableHeader:: ", this.tableHeader);

    if (this.sortColumn !== null) {
      const index = this.tableHeader?.indexOf(this.sortColumn as string);
      sortedData = this.tableData.sort((a, b) => {
        if (index === undefined) {
          return 0;
        }
        const aValue = a[index];
        const bValue = b[index];

        const aValueText =
          typeof aValue === 'object' && aValue !== null && 'text' in aValue
            ? Number(aValue.text)
            : aValue;
        const bValueText =
          typeof bValue === 'object' && bValue !== null && 'text' in bValue
            ? Number(bValue.text)
            : bValue;
        if (aValueText === null || bValueText === null) {
          return 0;
        }
        if (aValueText < bValueText) {
          return this.sortOrder === 'asc' ? -1 : 1;
        } else if (aValueText > bValueText) {
          return this.sortOrder === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
    const start =
      (this.pagerConfig.currentPage - 1) * this.pagerConfig.itemsPerPage;
    const end = start + this.pagerConfig.itemsPerPage;
    return sortedData.slice(start, end);
  }

  updatePage() {
    // this.sortData(this.sort);
    this.sortColumn = this.sort.column;
    this.sortOrder = this.sort.order;
    this.renderPage(1);
    // this.page = page;
    // this.pageChange.emit({
    //   page: this.page,
    //   itemsPerPage: this.itemsPerPage,
    //   sort: this.sort,
    // });
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.renderPage(1); // ソート後は1ページ目に戻る
  }
}
