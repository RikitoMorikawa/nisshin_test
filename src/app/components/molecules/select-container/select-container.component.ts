import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';
import { SelectOption } from '../../atoms/select/select.component';

@Component({
  selector: 'app-select-container',
  templateUrl: './select-container.component.html',
  styleUrls: ['./select-container.component.scss'],
})
export class SelectContainerComponent {
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() invalid = false;
  @Input() labelSize?: LabelSize;
  @Input() options!: SelectOption[];

  constructor() {}
}
