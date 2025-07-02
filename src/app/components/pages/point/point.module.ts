import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PointRoutingModule } from './point-routing.module';
import { PointComponent } from './point.component';
import { PointListComponent } from './point-list/point-list.component';
import { PointDetailComponent } from './point-detail/point-detail.component';

@NgModule({
  declarations: [PointComponent, PointListComponent, PointDetailComponent],
  imports: [CommonModule, PointRoutingModule],
})
export class PointModule {}
