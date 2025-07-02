import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

// 「選択してください」等の初期値を設定するときは
// SelectOptions[] に要素を追加し
// FormControlをNewするときの引数で[this.selectOption[n].value, （必要なら）バリデーション]のように指定
export interface SelectOption {
  value: number | string;
  text: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() invalid = false;
  @Input() options!: SelectOption[];

  constructor() {}
}
