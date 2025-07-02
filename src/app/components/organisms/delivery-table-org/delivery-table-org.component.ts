import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-delivery-table-org',
  templateUrl: './delivery-table-org.component.html',
  styleUrls: ['./delivery-table-org.component.scss'],
})
export class DeliveryTableOrgComponent {
  @Input() deliveries: any[] = [];
  constructor() {}
}
