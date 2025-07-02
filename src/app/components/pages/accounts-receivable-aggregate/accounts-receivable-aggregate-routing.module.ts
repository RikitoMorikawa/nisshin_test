import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsReceivableAggregateComponent } from './accounts-receivable-aggregate.component';

import { IndividualBillComponent } from './individual-bill/individual-bill.component';
import { ListComponent as BillList } from './bill/list/list.component';
import { SlipListComponent as SlipList } from './bill/slip-list/slip-list.component';
import { SlipDetailComponent as SlipDetail } from './bill/slip-detail/slip-detail.component';
import { ListComponent as DepositList } from './deposit/list/list.component';
import { AddEditComponent } from './deposit/add-edit/add-edit.component';
import { AddComponent } from './deposit/add-edit/add.component';
import { DetailViewComponent } from './deposit/detail-view/detail-view.component';
import { AccountsReceivableBalanceComponent } from './accounts-receivable-balance/accounts-receivable-balance.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bill',
    pathMatch: 'full',
  },
  {
    path: 'individual-bill',
    component: AccountsReceivableAggregateComponent,
    children: [
      { path: '', component: IndividualBillComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'bill',
    component: AccountsReceivableAggregateComponent,
    children: [
      { path: '', component: BillList, pathMatch: 'full' },
      { path: 'list', component: BillList },
      { path: 'slip-list/:id', component: SlipList },
      {
        path: 'slip-detail/:bill_id/:id/:sales_slip_cd',
        component: SlipDetail,
      },
    ],
  },
  {
    path: 'deposit',
    component: AccountsReceivableAggregateComponent,
    children: [
      { path: '', component: DepositList, pathMatch: 'full' },
      { path: 'list', component: DepositList },
      { path: 'add', component: AddComponent },
      { path: 'detail-view/:id', component: DetailViewComponent },
      { path: 'detail-edit/:id', component: AddEditComponent },
    ],
  },
  {
    path: 'accounts-receivable-balance',
    component: AccountsReceivableAggregateComponent,
    children: [
      {
        path: '',
        component: AccountsReceivableBalanceComponent,
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsReceivableAggregateRoutingModule {}
