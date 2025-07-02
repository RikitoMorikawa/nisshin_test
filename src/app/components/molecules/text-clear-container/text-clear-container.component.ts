import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-text-clear-container',
  templateUrl: './text-clear-container.component.html',
  styleUrls: ['./text-clear-container.component.scss'],
})
export class TextClearContainerComponent {
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
