import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-last-updater-org',
  templateUrl: './last-updater-org.component.html',
  styleUrls: ['./last-updater-org.component.scss'],
})
export class LastUpdaterOrgComponent {
  @Input() roleTypeName?: string;

  constructor() {}
}
