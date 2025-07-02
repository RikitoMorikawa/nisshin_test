import { InventoryForm } from 'src/app/components/organisms/inventory/table/table.component';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

type LinkData = {
  href: string;
  text: string;
};

type ImageData = {
  src: string;
};

export type TableData =
  | string
  | number
  | boolean
  | null
  | TemplateRef<unknown>
  | InventoryForm
  | ImageData
  | LinkData;

export interface TableSortStatus {
  column: string;
  order: 'asc' | 'desc';
}

@Component({
  selector: 'app-table-inventory',
  templateUrl: './table-inventory.component.html',
  styleUrls: ['./table-inventory.component.scss'],
})
export class TableInventoryComponent implements OnInit {
  @Input() header?: string[];
  @Input() data!: TableData[][];
  @Output() event = new EventEmitter<TableSortStatus>();
  sort!: TableSortStatus;

  constructor() {}

  ngOnInit(): void {
    this.sort = {
      column: this.header ? this.header.filter((value) => value)[0] : '',
      order: 'asc',
    };
  }

  changeSort(column: string) {
    if (!column) {
      return;
    }
    this.sort.order =
      this.sort.column === column && this.sort.order === 'asc' ? 'desc' : 'asc';
    this.sort.column = column;
    this.event.emit(this.sort);
  }

  isLinkData(arg: any): arg is LinkData {
    const actual = arg as LinkData;
    return typeof actual.href === 'string' && typeof actual.text === 'string';
  }

  isImageData(arg: any): arg is ImageData {
    const actual = arg as ImageData;
    return typeof actual.src === 'string';
  }

  isInputText(arg: any) {
    if (typeof arg !== 'object') {
      return false;
    }
    if (typeof arg.src === undefined) {
      return false;
    }
    if (arg.controls === undefined) {
      return false;
    }
    return true;
  }

  ctrls(item: any) {
    return item.controls.inventory_stock_quantity;
  }

  isTemplateRef(arg: any) {
    return arg instanceof TemplateRef;
  }
}
