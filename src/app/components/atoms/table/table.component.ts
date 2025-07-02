import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';

type LinkData = {
  href: string;
  text: string;
  queryParams?: object;
  target?: boolean;
};
type CheckBox = {
  checkbox: boolean;
  name: string;
  value: string;
  selected: boolean;
};
type InputText = {
  id: string;
  text: boolean;
  name: string;
  value: string;
};

type DummyText = {
  text: string;
  dummy: string | null;
  dummy_flg: boolean;
};

type ConsumptionTax = {
  text: string;
  value: string;
  tax_flg: boolean;
};

type Currency = {
  unit: boolean;
  align: string;
  text: number;
};

type StringCurrency = {
  unit: boolean;
  align: string;
  text: string;
};

export type TableData =
  | string
  | number
  | boolean
  | null
  | TemplateRef<unknown>
  | LinkData
  | CheckBox
  | InputText
  | DummyText
  | ConsumptionTax
  | Currency
  | StringCurrency;

export interface TableSortStatus {
  column: string;
  order: 'asc' | 'desc';
}
export interface InputData {
  id: string;
  name: string;
  value: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() header?: string[];
  @Input() footer?: any[];
  @Input() data!: TableData[][];
  @Output() event = new EventEmitter<TableSortStatus>();
  @Output() newItemEvent = new EventEmitter<string>();
  @Output() changeItemEvent = new EventEmitter<InputData>();
  @Input() selctedlist?: string;

  sort!: TableSortStatus;

  constructor(private router: Router) {}

  checkedlistItem?: [];

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

  isDummyText(arg: any): arg is DummyText {
    const actual = arg as DummyText;
    return (
      typeof actual.text === 'string' &&
      typeof actual.dummy_flg === 'boolean' &&
      typeof actual.dummy === 'string'
    );
  }

  isConsumptionTax(arg: any): arg is ConsumptionTax {
    const actual = arg as ConsumptionTax;
    return (
      typeof actual.text === 'string' &&
      typeof actual.tax_flg === 'boolean' &&
      typeof actual.value === 'string'
    );
  }

  isLinkData(arg: any): arg is LinkData {
    const actual = arg as LinkData;
    return typeof actual.href === 'string' && typeof actual.text === 'string';
  }

  isTemplateRef(arg: any) {
    return arg instanceof TemplateRef;
  }

  isCheckBox(arg: any): arg is CheckBox {
    const actual = arg as CheckBox;
    return (
      typeof actual.name === 'string' &&
      typeof actual.value === 'string' &&
      typeof actual.selected === 'boolean' &&
      typeof actual.checkbox === 'boolean'
    );
  }

  isInputNumber(arg: any): arg is InputText {
    const actual = arg as InputText;
    return (
      typeof actual.name === 'string' &&
      typeof actual.value === 'string' &&
      typeof actual.text === 'boolean'
    );
  }

  isCurrency(arg: any): arg is Currency {
    const actual = arg as Currency;
    return (
      typeof actual.unit === 'boolean' &&
      typeof actual.align === 'string' &&
      typeof actual.text === 'number'
    );
  }

  isStringCurrency(arg: any): arg is StringCurrency {
    const actual = arg as StringCurrency;
    return (
      typeof actual.unit === 'boolean' &&
      typeof actual.align === 'string' &&
      typeof actual.text === 'string'
    );
  }
  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  getValue(event: Event): any {
    let targ_value = (event.target as HTMLInputElement).value;
    let targ_name = (event.target as HTMLInputElement).id;
    let split_id = targ_name.split('__');
    let changeItemData = {
      id: split_id[1],
      name: split_id[0],
      value: targ_value,
    };
    this.changeItemEvent.emit(changeItemData);
    return targ_value;
  }
  textClick(item_href: string) {
    let rootPath =
      window.location.origin + window.location.pathname + '#' + item_href;
    window.open(rootPath);
  }
}
