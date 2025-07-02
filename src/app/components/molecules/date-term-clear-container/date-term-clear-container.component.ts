import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-date-term-clear-container',
  templateUrl: './date-term-clear-container.component.html',
  styleUrls: ['./date-term-clear-container.component.scss'],
})
export class DateTermClearContainerComponent {
  @Input() inputType?: string = 'text';
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() toNameAttrValue?: string;
  @Input() toIdAttrValue?: string;
  @Input() dateFromFormCtrl!: FormControl;
  @Input() dateToFormCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() labelSize?: LabelSize = 'base';
  @Input() cutoffDateBilling = 98;

  constructor() {}

  onClear(): void {
    this.dateFromFormCtrl.setValue('');
    this.dateToFormCtrl.setValue('');
  }
}
