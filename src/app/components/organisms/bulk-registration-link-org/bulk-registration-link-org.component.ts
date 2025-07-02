import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bulk-registration-link-org',
  templateUrl: './bulk-registration-link-org.component.html',
  styleUrls: ['./bulk-registration-link-org.component.scss'],
})
export class BulkRegistrationLinkOrgComponent {
  @Input() path!: string;
  @Input() text: string = '一括登録';

  constructor() {}
}
