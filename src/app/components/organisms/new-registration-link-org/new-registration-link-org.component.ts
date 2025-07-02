import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-new-registration-link-org',
  templateUrl: './new-registration-link-org.component.html',
  styleUrls: ['./new-registration-link-org.component.scss'],
})
export class NewRegistrationLinkOrgComponent {
  @Input() path!: string;
  @Input() text = '新規登録';

  constructor() {}
}
