import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-textarea-container',
  templateUrl: './textarea-container.component.html',
  styleUrls: ['./textarea-container.component.scss'],
})
export class TextareaContainerComponent {
  @Input() formCtrl!: FormControl;
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() labelSize?: LabelSize = 'base';
  @Input() rows?: number;

  constructor() {}
}
