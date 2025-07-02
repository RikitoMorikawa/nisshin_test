import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-date-term',
  templateUrl: './date-term.component.html',
  styleUrls: ['./date-term.component.scss'],
})
export class DateTermComponent {
  @Input() inputType?: string = 'text';
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() labelSize: LabelSize;

  constructor() {}
}
