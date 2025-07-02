import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-back-to-link-org',
  templateUrl: './back-to-link-org.component.html',
  styleUrls: ['./back-to-link-org.component.scss'],
})
export class BackToLinkOrgComponent {
  @Input() path!: string;
  constructor() {}
}
