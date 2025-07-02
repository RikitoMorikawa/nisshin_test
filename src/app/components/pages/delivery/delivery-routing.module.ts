import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryAddComponent } from './delivery-add/delivery-add.component';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';
import { DeliveryEditComponent } from './delivery-edit/delivery-edit.component';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DeliveryComponent } from './delivery.component';

const routes: Routes = [
  {
    path: '',
    component: DeliveryComponent,
    children: [
      {
        path: '',
        component: DeliveryListComponent,
      },
      {
        path: 'detail/:id',
        component: DeliveryDetailComponent,
      },
      {
        path: 'edit/:id',
        component: DeliveryEditComponent,
      },
      {
        path: 'add',
        component: DeliveryAddComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryRoutingModule {}
