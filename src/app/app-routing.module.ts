import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AuthGuard } from './guard/auth.guard';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

/**
 * MSAL Angular can protect routes in your application
 * using MsalGuard. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/initialization.md#secure-the-routes-in-your-application
 */
const routes: Routes = [
  {
    // Needed for hash routing
    path: 'error',
    component: AppComponent,
    canActivate: [AuthGuard],
  },
  {
    // Needed for hash routing
    path: 'state',
    component: AppComponent,
    canActivate: [AuthGuard],
  },
  {
    // Needed for hash routing
    path: 'code',
    component: AppComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: AppComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('src/app/components/pages/employee/employee.module').then(
        (m) => m.EmployeeModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'setting',
    loadChildren: () =>
      import('src/app/components/pages/setting/setting.module').then(
        (m) => m.SettingModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'master',
    loadChildren: () =>
      import('src/app/components/pages/master/master.module').then(
        (m) => m.MasterModule
      ),
    canActivate: [MsalGuard],
  },

  {
    path: 'sales',
    loadChildren: () =>
      import('src/app/components/pages/sales/sales.module').then(
        (m) => m.SalesModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'point',
    loadChildren: () =>
      import('src/app/components/pages/point/point.module').then(
        (m) => m.PointModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'purchase-order/specification',
    loadChildren: () =>
      import('src/app/components/pages/order/order.module').then(
        (m) => m.OrderModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'purchase-order',
    loadChildren: () =>
      import(
        'src/app/components/pages/purchase-order/purchase-order.module'
      ).then((m) => m.PurchaseOrderModule),
    canActivate: [MsalGuard],
  },
  {
    path: 'inventory-control',
    loadChildren: () =>
      import(
        'src/app/components/pages/inventory-control/inventory-control.module'
      ).then((m) => m.InventoryControlModule),
    canActivate: [MsalGuard],
  },
  {
    path: 'repair-slip',
    loadChildren: () =>
      import('src/app/components/pages/repair-slip/repair-slip.module').then(
        (m) => m.RepairSlipModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'customer-order-reception-slip',
    loadChildren: () =>
      import(
        'src/app/components/pages/customer-order-reception-slip/customer-order-reception-slip.module'
      ).then((m) => m.CustomerOrderReceptionSlipModule),
    canActivate: [MsalGuard],
  },
  {
    path: 'delivery',
    loadChildren: () =>
      import('src/app/components/pages/delivery/delivery.module').then(
        (m) => m.DeliveryModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'member',
    loadChildren: () =>
      import('src/app/components/pages/member/member.module').then(
        (m) => m.MemberModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'rental-slip',
    loadChildren: () =>
      import('./components/pages/rental-slip/rental-slip.module').then(
        (m) => m.RentalSlipModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'rental-slip/rental-product',
    loadChildren: () =>
      import('./components/pages/rental-product/rental-product.module').then(
        (m) => m.RentalProductModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'setting/accounts-receivable-aggregate',
    loadChildren: () =>
      import(
        './components/pages/accounts-receivable-aggregate/accounts-receivable-aggregate.module'
      ).then((m) => m.AccountsReceivableAggregateModule),
    canActivate: [MsalGuard],
  },
  {
    path: 'setting/accounts-payable-aggregate',
    loadChildren: () =>
      import(
        './components/pages/accounts-payable-aggregate/accounts-payable-aggregate.module'
      ).then((m) => m.AccountsPayableAggregateModule),
    canActivate: [MsalGuard],
  },
  {
    path: 'setting/price-change',
    loadChildren: () =>
      import('./components/pages/price-change/price-change.module').then(
        (m) => m.PriceChangeModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: 'setting/price-ranking',
    loadChildren: () =>
      import('./components/pages/price-ranking/price-ranking.module').then(
        (m) => m.PriceRankingModule
      ),
    canActivate: [MsalGuard],
  },
];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      // Don't perform initial navigation in iframes
      initialNavigation: !isIframe ? 'enabledNonBlocking' : 'disabled',
      //initialNavigation: isIframe ? 'disabled' : 'enabled'
      //initialNavigation: 'enabledNonBlocking'
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
