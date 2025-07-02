import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';
import { SelectOption } from '../../atoms/select/select.component';

@Component({
  selector: 'app-select-clear-container',
  templateUrl: './select-clear-container.component.html',
  styleUrls: ['./select-clear-container.component.scss'],
})
export class SelectClearContainerComponent {
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() invalid = false;
  @Input() labelSize?: LabelSize;
  @Input() options!: SelectOption[];

  constructor() {}

  onClear(): void {
    this.formCtrl.setValue('');
  }
}
