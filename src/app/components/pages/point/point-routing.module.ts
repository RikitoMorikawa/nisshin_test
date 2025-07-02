import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointDetailComponent } from './point-detail/point-detail.component';
import { PointListComponent } from './point-list/point-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PointListComponent,
      },
      {
        path: 'detail/:id',
        component: PointDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PointRoutingModule {}
