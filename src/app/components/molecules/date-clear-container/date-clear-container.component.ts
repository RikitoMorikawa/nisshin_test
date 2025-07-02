import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-date-clear-container',
  templateUrl: './date-clear-container.component.html',
  styleUrls: ['./date-clear-container.component.scss'],
})
export class DateClearContainerComponent {
  @Input() inputType?: string = 'text';
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() labelSize?: LabelSize = 'base';

  constructor() {}

  onClear(): void {
    this.formCtrl.setValue('');
  }
}
