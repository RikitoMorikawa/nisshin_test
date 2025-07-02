import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderComponent } from './order.component';
//import { OrderAddComponent } from './order-add/order-add.component';
//import { OrderBulkAddComponent } from './order-bulk-add/order-bulk-add.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderEditComponent } from './order-edit/order-edit.component';
//import { OrderListComponent } from './order-list/order-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: OrderComponent,
      },
      {
        path: 'detail/:id',
        component: OrderDetailComponent,
      },
      {
        path: 'edit/:id',
        component: OrderEditComponent,
      },
      {
        path: 'add',
        component: OrderEditComponent,
      },
      //{
      //  path: 'bulk-add',
      //  component: OrderBulkAddComponent,
      //},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
