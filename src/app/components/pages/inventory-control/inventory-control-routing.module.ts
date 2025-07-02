import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryControlComponent } from './inventory-control.component';
import { StockComponent } from './stock/stock.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { InventoryGroupComponent } from './inventory-group/inventory-group.component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { AddComponent as StockTransferAddComponent } from './stock-transfer/add/add.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';
import { InventoryBulkAddComponent } from './inventory-bulk-add/inventory-bulk-add.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryControlComponent,
    children: [
      { path: '', component: StockComponent },
      { path: 'detail/:id', component: StockDetailComponent },
      { path: 'inventory', component: InventoryGroupComponent },
      { path: 'inventory/:management_cd', component: InventoryComponent },
      {
        path: 'inventory/:management_cd/detail/:id',
        component: InventoryDetailComponent,
      },
      {
        path: 'inventory/bulk-add/:management_cd',
        component: InventoryBulkAddComponent,
      },
      // { path: 'stock-transfer', component: StockTransferComponent },
      // { path: 'stock-transfer/add', component: StockTransferAddComponent },
      {
        path: 'stock-transfer',
        loadChildren: () =>
          import('./stock-transfer/stock-transfer.module').then(
            (m) => m.StockTransferModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryControlRoutingModule {}
