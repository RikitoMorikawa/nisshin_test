import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { DetailComponent } from './detail/detail.component';
import { ListComponent } from './list/list.component';
import { StorePriceComponent } from './store-price.component';

const routes: Routes = [
  {
    path: '',
    component: StorePriceComponent,
    children: [
      { path: '', component: ListComponent },
      { path: 'detail/:id', component: DetailComponent },
      { path: 'edit/:id', component: AddEditComponent },
      { path: 'add', component: AddEditComponent },
      { path: 'bulk-add', component: BulkAddComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorePriceRoutingModule {}
