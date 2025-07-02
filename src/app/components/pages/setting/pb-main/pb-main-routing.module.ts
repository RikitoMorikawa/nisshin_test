import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { PbMainComponent } from './pb-main.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';

const routes: Routes = [
  {
    path: '',
    component: PbMainComponent,
    children: [
      {
        path: '',
        component: ListComponent,
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
        path: 'add',
        component: AddComponent,
      },
      {
        path: 'bulk-add',
        component: BulkAddComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PbMainRoutingModule {}
