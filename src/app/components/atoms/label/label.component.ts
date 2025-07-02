import { Component, Input } from '@angular/core';

export type LabelSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | undefined;
export type textColor = 'black' | 'red' | 'green' | 'blue' | undefined;

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
})
export class LabelComponent {
  @Input() forAttrValue?: string;
  @Input() labelSize?: LabelSize = 'base';
  @Input() textColor?: textColor = 'black';

  constructor() {}
}
