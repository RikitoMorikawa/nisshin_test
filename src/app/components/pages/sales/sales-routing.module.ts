import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';
import { SalesDetailsComponent } from './sales-details/sales-details.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesSlipComponent } from './sales-slip/sales-slip.component';
import { SalesComponent } from './sales.component';

const routes: Routes = [
  {
    path: '',
    component: SalesComponent,
    children: [
      {
        path: '',
        component: SalesListComponent,
      },
      {
        path: 'detail/:code/:id',
        children: [
          {
            path: '',
            component: SalesSlipComponent,
          },
          {
            path: 'details',
            component: SalesDetailsComponent,
          },
          {
            path: 'details/:id',
            component: SalesDetailComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
