import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientWorkingFieldComponent } from './client-working-field.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';

const routes: Routes = [
  {
    path: '',
    component: ClientWorkingFieldComponent,
    children: [
      { path: '', component: ListComponent },
      { path: 'detail/:id', component: DetailComponent },
      { path: 'add', component: AddEditComponent },
      { path: 'edit/:id', component: AddEditComponent },
      { path: 'bulk-add', component: BulkAddComponent },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientWorkingFieldRoutingModule {}
