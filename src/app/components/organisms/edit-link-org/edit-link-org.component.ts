import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edit-link-org',
  templateUrl: './edit-link-org.component.html',
  styleUrls: ['./edit-link-org.component.scss'],
})
export class EditLinkOrgComponent {
  @Input() path!: string;
  @Input() params?: {};
  constructor() {}
}
