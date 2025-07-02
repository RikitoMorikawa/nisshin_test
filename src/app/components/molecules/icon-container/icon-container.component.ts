import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-container',
  templateUrl: './icon-container.component.html',
  styleUrls: ['./icon-container.component.scss'],
})
export class IconContainerComponent {
  @Input() icon!: string;
  @Input() appendClassForIcon:
    | string
    | string[]
    | Set<string>
    | { [klass: string]: any } = '';
}
