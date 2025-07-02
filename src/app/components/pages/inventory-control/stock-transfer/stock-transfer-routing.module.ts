import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockTransferComponent } from './stock-transfer.component';
// import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';
// import { BulkAddComponent } from './bulk-add/bulk-add.component';

const routes: Routes = [
  {
    path: '',
    //component: StockTransferComponent,
    children: [
      {
        path: '',
        component: StockTransferComponent,
      },
      {
        path: 'add',
        component: AddComponent,
      },
      {
        path: ':id',
        component: DetailComponent,
      },
      {
        path: ':id/edit',
        component: EditComponent,
      },
      // {
      //   path: 'bulk-add',
      //   component: BulkAddComponent,
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockTransferRoutingModule {}
