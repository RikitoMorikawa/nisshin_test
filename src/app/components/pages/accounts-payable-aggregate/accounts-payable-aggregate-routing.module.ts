import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsPayableAggregateComponent } from './accounts-payable-aggregate.component';
import { PaymentCutoffComponent } from './payment-cutoff/payment-cutoff.component';
import { ListComponent as PaymentSlipList } from './payment-slip/list/list.component';
import { SlipListComponent } from './payment-slip/slip-list/slip-list.component';
import { SlipDetailComponent as SlipDetail } from './payment-slip/slip-detail/slip-detail.component';
import { RepairSlipDetailComponent as RepairSlipDetail } from './payment-slip/repair-slip-detail/repair-slip-detail.component';
import { ListComponent as PaymentClearingList } from './payment-clearing/list/list.component';
import { AddEditComponent } from './payment-clearing/add-edit/add-edit.component';
import { AddComponent } from './payment-clearing/add-edit/add.component';
import { AddEditComponent as PaymentAddEditComponent } from './payment-slip/add-edit/add-edit.component';
import { DetailViewComponent } from './payment-clearing/detail-view/detail-view.component';
import { AccountsPayableBalanceComponent } from './accounts-payable-balance/accounts-payable-balance.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'payment-slip',
    pathMatch: 'full',
  },
  {
    path: 'payment-cutoff',
    component: AccountsPayableAggregateComponent,
    children: [
      { path: '', component: PaymentCutoffComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'payment-slip',
    component: AccountsPayableAggregateComponent,
    children: [
      { path: '', component: PaymentSlipList, pathMatch: 'full' },
      { path: 'list', component: PaymentSlipList },
      {
        path: ':accounts_payable_aggregate_id/add',
        component: PaymentAddEditComponent,
      },
      {
        path: ':accounts_payable_aggregate_id/purchase/:purchase_id/edit',
        component: PaymentAddEditComponent,
      },
      { path: ':id/purchase/:purchase_id', component: SlipDetail },
      { path: ':id/repair/:repair_id', component: RepairSlipDetail },
      { path: ':id', component: SlipListComponent },
    ],
  },
  {
    path: 'payment-clearing',
    component: AccountsPayableAggregateComponent,
    children: [
      { path: '', component: PaymentClearingList, pathMatch: 'full' },
      { path: 'list', component: PaymentClearingList },
      { path: 'add', component: AddComponent },
      { path: 'detail-view/:id', component: DetailViewComponent },
      { path: 'detail-edit/:id', component: AddEditComponent },
    ],
  },
  {
    path: 'accounts-payable-balance',
    component: AccountsPayableAggregateComponent,
    children: [
      {
        path: '',
        component: AccountsPayableBalanceComponent,
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsPayableAggregateRoutingModule {}
