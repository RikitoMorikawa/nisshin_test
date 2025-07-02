import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule } from './setting-routing.module';
import { MenuModule } from './menu/menu.module';
import { BasicInformationModule } from './basic-information/basic-information.module';
import { DivisionModule } from './division/division.module';
import { RoleModule } from './role/role.module';
import { StoreModule } from './store/store.module';
import { LargeCategoryModule } from './large-category/large-category.module';
import { MediumCategoryModule } from './medium-category/medium-category.module';
import { SmallCategoryModule } from './small-category/small-category.module';
import { CustomLargeCategoryModule } from './custom-large-category/custom-large-category.module';
import { CustomMediumCategoryModule } from './custom-medium-category/custom-medium-category.module';
import { CustomSmallCategoryModule } from './custom-small-category/custom-small-category.module';
import { QualityCustomerModule } from './quality-customer/quality-customer.module';
import { NonCashItemModule } from './non-cash-item/non-cash-item.module';
import { ClientWorkingFieldModule } from './client-working-field/client-working-field.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SettingRoutingModule,
    MenuModule,
    BasicInformationModule,
    DivisionModule,
    RoleModule,
    StoreModule,
    LargeCategoryModule,
    MediumCategoryModule,
    SmallCategoryModule,
    CustomLargeCategoryModule,
    CustomMediumCategoryModule,
    CustomSmallCategoryModule,
    QualityCustomerModule,
    NonCashItemModule,
    ClientWorkingFieldModule,
  ],
})
export class SettingModule {}
