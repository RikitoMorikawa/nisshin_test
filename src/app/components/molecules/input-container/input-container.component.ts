import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-input-container',
  templateUrl: './input-container.component.html',
  styleUrls: ['./input-container.component.scss'],
  providers: [{ provide: COMPOSITION_BUFFER_MODE, useValue: false }],
})
export class InputContainerComponent {
  // 各種パラメータ
  @Input() inputType?: string = 'text';
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() textRight = false;
  @Input() labelSize?: LabelSize = 'base';
  @Output() focusEvent = new EventEmitter<Event>();
  @Output() blurEvent = new EventEmitter<Event>();
}
