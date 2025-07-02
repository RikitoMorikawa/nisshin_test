import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-file-container',
  templateUrl: './file-container.component.html',
  styleUrls: ['./file-container.component.scss'],
})
export class FileContainerComponent {
  @Input() formCtrl!: FormControl;
  @Input() buttonText?: string;
  @Input() labelSize?: LabelSize = 'base';
  @Input() accept?: string;

  constructor() {}
}
