import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
})
export class TextareaComponent {
  @Input() formCtrl!: FormControl;
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() placeholder?: string;
  @Input() invalid = false;
  _rows!: number;
  @Input() set rows(args: number | undefined) {
    this._rows = args ?? 2;
  }

  constructor() {}
}
