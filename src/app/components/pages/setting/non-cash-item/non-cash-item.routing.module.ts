import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditComponent } from './credit/credit.component';
import { CreditListComponent } from './credit/credit-list/credit-list.component';
import { CreditAddComponent } from './credit/credit-add/credit-add.component';
import { CreditDetailComponent } from './credit/credit-detail/credit-detail.component';
import { CreditEditComponent } from './credit/credit-edit/credit-edit.component';
import { Gift1Component } from './gift1/gift1.component';
import { Gift1ListComponent } from './gift1/gift1-list/gift1-list.component';
import { Gift1AddComponent } from './gift1/gift1-add/gift1-add.component';
import { Gift1DetailComponent } from './gift1/gift1-detail/gift1-detail.component';
import { Gift1EditComponent } from './gift1/gift1-edit/gift1-edit.component';
import { Gift2Component } from './gift2/gift2.component';
import { Gift2ListComponent } from './gift2/gift2-list/gift2-list.component';
import { Gift2AddComponent } from './gift2/gift2-add/gift2-add.component';
import { Gift2DetailComponent } from './gift2/gift2-detail/gift2-detail.component';
import { Gift2EditComponent } from './gift2/gift2-edit/gift2-edit.component';
import { Gift3Component } from './gift3/gift3.component';
import { Gift3ListComponent } from './gift3/gift3-list/gift3-list.component';
import { Gift3AddComponent } from './gift3/gift3-add/gift3-add.component';
import { Gift3DetailComponent } from './gift3/gift3-detail/gift3-detail.component';
import { Gift3EditComponent } from './gift3/gift3-edit/gift3-edit.component';
import { Gift4Component } from './gift4/gift4.component';
import { Gift4ListComponent } from './gift4/gift4-list/gift4-list.component';
import { Gift4AddComponent } from './gift4/gift4-add/gift4-add.component';
import { Gift4DetailComponent } from './gift4/gift4-detail/gift4-detail.component';
import { Gift4EditComponent } from './gift4/gift4-edit/gift4-edit.component';
import { QrComponent } from './qr/qr.component';
import { QrListComponent } from './qr/qr-list/qr-list.component';
import { QrAddComponent } from './qr/qr-add/qr-add.component';
import { QrDetailComponent } from './qr/qr-detail/qr-detail.component';
import { QrEditComponent } from './qr/qr-edit/qr-edit.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'credit',
    pathMatch: 'full',
  },
  {
    path: 'credit',
    component: CreditComponent,
    children: [
      { path: '', component: CreditListComponent, pathMatch: 'full' },
      { path: 'add', component: CreditAddComponent },
      { path: 'detail/:id', component: CreditDetailComponent },
      { path: 'edit/:id', component: CreditEditComponent },
    ],
  },
  {
    path: 'gift1',
    component: Gift1Component,
    children: [
      { path: '', component: Gift1ListComponent, pathMatch: 'full' },
      { path: 'add', component: Gift1AddComponent },
      { path: 'detail/:id', component: Gift1DetailComponent },
      { path: 'edit/:id', component: Gift1EditComponent },
    ],
  },
  {
    path: 'gift2',
    component: Gift2Component,
    children: [
      { path: '', component: Gift2ListComponent, pathMatch: 'full' },
      { path: 'add', component: Gift2AddComponent },
      { path: 'detail/:id', component: Gift2DetailComponent },
      { path: 'edit/:id', component: Gift2EditComponent },
    ],
  },
  {
    path: 'gift3',
    component: Gift3Component,
    children: [
      { path: '', component: Gift3ListComponent, pathMatch: 'full' },
      { path: 'add', component: Gift3AddComponent },
      { path: 'detail/:id', component: Gift3DetailComponent },
      { path: 'edit/:id', component: Gift3EditComponent },
    ],
  },
  {
    path: 'gift4',
    component: Gift4Component,
    children: [
      { path: '', component: Gift4ListComponent, pathMatch: 'full' },
      { path: 'add', component: Gift4AddComponent },
      { path: 'detail/:id', component: Gift4DetailComponent },
      { path: 'edit/:id', component: Gift4EditComponent },
    ],
  },
  {
    path: 'qr',
    component: QrComponent,
    children: [
      { path: '', component: QrListComponent, pathMatch: 'full' },
      { path: 'add', component: QrAddComponent },
      { path: 'detail/:id', component: QrDetailComponent },
      { path: 'edit/:id', component: QrEditComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NonCashItemRoutingModule {}
