import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent {
  @Input() inputType?: string = 'text';
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() maxLength?: number;
  @Input() formCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() textRight = false;
  @Input() min?: number;
  @Output() focusEvent = new EventEmitter<Event>();
  @Output() blurEvent = new EventEmitter<Event>();

  constructor() {}
  onFocus() {
    console.log(this.maxLength);
  }
}
