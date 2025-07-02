import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import {
  download,
  generatePdfBlobUrl,
} from 'src/app/functions/shared-functions';
import {
  AccountsReceivableAggregateService,
  PaymentData,
} from 'src/app/services/accounts-receivable-aggregate.service';

/**
 * エクスポート処理のステータスコード。
 */
export const ExportStatus = {
  START: 1,
  FETCHED: 3,
  END: 0,
} as const;

/**
 * ステータスコードの型
 */
export type ExportStatus = (typeof ExportStatus)[keyof typeof ExportStatus];

type CheckBox = {
  checkbox: boolean;
  name: string;
  value: string;
  selected: boolean;
};

type LinkData = {
  position: string;
  href: string;
  text: string;
  queryParams?: object;
};
type InputText = {
  id: string;
  text: boolean;
  name: string;
  value: string;
};
type IconLinkData = {
  position: string;
  href: string;
  icon: string;
};

type NormalData = {
  position: string;
  text: string;
};

export type TableData =
  | string
  | number
  | boolean
  | null
  | IconLinkData
  | CheckBox
  | NormalData
  | InputText
  | LinkData;

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
  selector: 'app-accounts-receivable-aggregate-bill-list-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private araService: AccountsReceivableAggregateService
  ) {}

  @Input() header?: string[];
  @Input() data!: TableData[][];
  @Output() event = new EventEmitter<TableSortStatus>();
  @Output() newItemEvent = new EventEmitter<string>();
  @Output() changeItemEvent = new EventEmitter<InputData>();
  @Output() statusChange = new EventEmitter<ExportStatus>();
  @Input() selctedlist?: string;
  @Input() bulkIds!: string[];

  // ソート状態
  sort!: TableSortStatus;

  // 編集モードかどうか
  isEditable: boolean = false;

  // 編集対象ID
  editTargetId!: string;

  errorConst = errorConst;

  form = this.fb.group({
    payment_date: ['', [Validators.required]],
    payment_amount: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
  });

  get fc() {
    return this.form.controls;
  }

  /**
   * 初期処理
   */
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
    return (item as LinkData).href !== undefined;
  }

  /**
   * アイコンリンクデータかどうか
   * @param item
   * @returns
   */
  isIconLinkData(item: TableData): item is IconLinkData {
    return this.isLinkData(item) && (item as any).icon !== undefined;
  }

  /**
   * 通常データかどうか
   * @param item
   * @returns
   */
  isNormalData(item: TableData): item is NormalData {
    return !this.isLinkData(item) && !this.isIconLinkData(item);
  }

  isInputNumber(arg: any): arg is InputText {
    const actual = arg as InputText;
    return (
      typeof actual.name === 'string' &&
      typeof actual.value === 'string' &&
      typeof actual.text === 'boolean'
    );
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
   * 行押下時の処理
   * @param targetId
   * @returns
   */
  editPanelOpen(targetId: string) {
    if (
      targetId === '' ||
      targetId === undefined ||
      targetId === null ||
      this.editTargetId === targetId
    ) {
      return;
    }
    this.isEditable = true;
    this.editTargetId = targetId;
  }

  /**
   * PDFダウンロードの処理
   * @param value
   * @returns
   */
  getPdfItem(value: string) {
    (async () => {
      this.statusChange.emit(ExportStatus.FETCHED);
      fetch(value)
        .then((x) => x.blob())
        .then((b) => {
          const url = window.URL.createObjectURL(b);
          var a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display: none');
          a.href = url;
          a.download = '請求書.pdf';
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 250);
        });
      this.statusChange.emit(ExportStatus.END);
    })();
  }

  checkUnCheck(event: any, item: any) {
    const checkedValue = item.value;
    if (event.target.checked == true) {
      this.bulkIds.push(checkedValue);
      return;
    }
    const index = this.bulkIds.indexOf(checkedValue);
    if (index > -1) {
      this.bulkIds.splice(index, 1);
    }
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

  getPositionClass(item: any): string {
    return item && typeof item === 'object' && 'position' in item
      ? item.position
      : 'text-center';
  }
}
