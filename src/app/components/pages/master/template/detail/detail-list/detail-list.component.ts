import { Component, Input } from '@angular/core';

type DetailItem = {
  name: string;
  value: string;
};

@Component({
  selector: 'app-detail-list',
  templateUrl: './detail-list.component.html',
  styleUrls: ['./detail-list.component.scss'],
})
export class DetailListComponent {
  @Input() details!: DetailItem[];
}
