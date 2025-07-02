import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrderComponent } from './purchase-order.component';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { InspectionComponent } from './inspection/inspection.component';
import { OrderDataCreationComponent } from './order-data-creation/order-data-creation.component';

const routes: Routes = [
  {
    path: '',
    component: PurchaseOrderComponent,
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: 'add',
        component: AddComponent,
      },
      {
        path: 'detail/:id',
        component: DetailComponent,
      },
      {
        path: 'edit/:id',
        component: EditComponent,
      },
      {
        path: 'inspection/:id',
        component: InspectionComponent,
      },
      {
        path: 'order-data-creation',
        component: OrderDataCreationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseOrderRoutingModule {}
