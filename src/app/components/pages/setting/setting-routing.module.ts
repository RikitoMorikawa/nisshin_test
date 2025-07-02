import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then((m) => m.MenuModule),
  },
  {
    path: 'basic-information',
    loadChildren: () =>
      import('./basic-information/basic-information.module').then(
        (m) => m.BasicInformationModule
      ),
  },
  {
    path: 'division',
    loadChildren: () =>
      import('./division/division.module').then((m) => m.DivisionModule),
  },
  {
    path: 'role',
    loadChildren: () => import('./role/role.module').then((m) => m.RoleModule),
  },
  {
    path: 'store',
    loadChildren: () =>
      import('./store/store.module').then((m) => m.StoreModule),
  },
  {
    path: 'large-category',
    loadChildren: () =>
      import('./large-category/large-category.module').then(
        (m) => m.LargeCategoryModule
      ),
  },
  {
    path: 'medium-category',
    loadChildren: () =>
      import('./medium-category/medium-category.module').then(
        (m) => m.MediumCategoryModule
      ),
  },
  {
    path: 'small-category',
    loadChildren: () =>
      import('./small-category/small-category.module').then(
        (m) => m.SmallCategoryModule
      ),
  },
  {
    path: 'custom-large-category',
    loadChildren: () =>
      import('./custom-large-category/custom-large-category.module').then(
        (m) => m.CustomLargeCategoryModule
      ),
  },
  {
    path: 'custom-medium-category',
    loadChildren: () =>
      import('./custom-medium-category/custom-medium-category.module').then(
        (m) => m.CustomMediumCategoryModule
      ),
  },
  {
    path: 'custom-small-category',
    loadChildren: () =>
      import('./custom-small-category/custom-small-category.module').then(
        (m) => m.CustomSmallCategoryModule
      ),
  },
  {
    path: 'custom-tag',
    loadChildren: () =>
      import('./custom-tag/custom-tag.module').then((m) => m.CustomTagModule),
  },
  {
    path: 'quality-customer',
    loadChildren: () =>
      import('./quality-customer/quality-customer.module').then(
        (m) => m.QualityCustomerModule
      ),
  },
  {
    path: 'product-book-first-category',
    loadChildren: () =>
      import('./pb-first-category/pb-first-category.module').then(
        (m) => m.PbFirstCategoryModule
      ),
  },
  {
    path: 'product-book-second-category',
    loadChildren: () =>
      import('./pb-second-category/pb-second-category.module').then(
        (m) => m.PbSecondCategoryModule
      ),
  },
  {
    path: 'main-product-book',
    loadChildren: () =>
      import('./pb-main/pb-main.module').then((m) => m.PbMainModule),
  },
  {
    path: 'liquidation',
    loadChildren: () =>
      import('./liquidation/liquidation.module').then(
        (m) => m.LiquidationModule
      ),
  },
  // {
  //   path: 'price-ranking',
  //   loadChildren: () =>
  //     import('./price-ranking/price-ranking.module').then(
  //       (m) => m.PriceRankingModule
  //     ),
  // },
  {
    path: 'special-sale',
    loadChildren: () =>
      import('./special-sale/special-sale.module').then(
        (m) => m.SpecialSaleModule
      ),
  },
  {
    path: 'non-cash-item',
    loadChildren: () =>
      import('./non-cash-item/non-cash-item.module').then(
        (m) => m.NonCashItemModule
      ),
  },
  {
    path: 'store-price',
    loadChildren: () =>
      import('./store-price/store-price.module').then(
        (m) => m.StorePriceModule
      ),
  },
  {
    path: 'client-working-field',
    loadChildren: () =>
      import('./client-working-field/client-working-field.module').then(
        (m) => m.ClientWorkingFieldModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule {}
