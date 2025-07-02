import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb-org',
  templateUrl: './breadcrumb-org.component.html',
  styleUrls: ['./breadcrumb-org.component.scss'],
})
export class BreadcrumbOrgComponent {
  constructor() {}
  @Input() breadcrumbList!: {
    text: string;
    path?: string;
    queryParams?: { [key: string]: string | number };
  }[];
}
