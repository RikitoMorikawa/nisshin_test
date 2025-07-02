import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Input() appendClassForSpinner:
    | string
    | string[]
    | Set<string>
    | { [key: string]: any } = '';

  @Input() width = 'w-4';
  @Input() height = 'h-4';
  @Input() borderWidth = 'border-[1em]';
}
