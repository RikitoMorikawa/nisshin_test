import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterComponent } from './master.component';
import { ListComponent as SupplierList } from './supplier/list/list.component';
import { DetailComponent as SupplierDetail } from './supplier/detail/detail.component';
import { AddEditComponent as SupplierAddEdit } from './supplier/add-edit/add-edit.component';
import { BulkAddComponent as SupplierBulkAdd } from './supplier/bulk-add/bulk-add.component';
import { ListComponent as SupProdList } from './supplier-product/list/list.component';
import { DetailComponent as SupProdDetail } from './supplier-product/detail/detail.component';
import { ListComponent as ClientListComponent } from './client/list/list.component';
import { DetailComponent as ClientDetailComponent } from './client/detail/detail.component';
import { AddEditComponent as ClientAddEditComponent } from './client/add-edit/add-edit.component';
import { BulkAddComponent as ClientBulkAddComponent } from './client/bulk-add/bulk-add.component';
import { ListComponent as ProductList } from './product/list/list.component';
import { DetailComponent as ProductDetail } from './product/detail/detail.component';
import { BulkAddComponent as ProductBulkAdd } from './product/bulk-add/bulk-add.component';
import { AddEditComponent as ProductAddEdit } from './product/add-edit/add-edit.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'supplier',
    pathMatch: 'full',
  },
  {
    path: 'supplier',
    component: MasterComponent,
    children: [
      { path: '', component: SupplierList },
      { path: 'detail/:id', component: SupplierDetail },
      { path: 'add', component: SupplierAddEdit },
      { path: 'edit/:id', component: SupplierAddEdit },
      { path: 'bulk-add', component: SupplierBulkAdd },
      {
        path: 'detail/:id/products',
        children: [
          { path: '', component: SupProdList },
          { path: ':pid', component: SupProdDetail },
        ],
      },
    ],
  },
  {
    path: 'product',
    component: MasterComponent,
    children: [
      { path: '', component: ProductList },
      { path: 'detail/:id', component: ProductDetail },
      { path: 'add', component: ProductAddEdit },
      { path: 'edit/:id', component: ProductAddEdit },
      { path: 'bulk-add', component: ProductBulkAdd },
    ],
  },
  {
    path: 'client',
    component: MasterComponent,
    children: [
      { path: '', component: ClientListComponent, pathMatch: 'full' },
      { path: 'detail/:id', component: ClientDetailComponent },
      { path: 'edit/:id', component: ClientAddEditComponent },
      { path: 'add', component: ClientAddEditComponent },
      { path: 'bulk-add', component: ClientBulkAddComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
