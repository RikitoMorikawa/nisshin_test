import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonCashItemRoutingModule } from './non-cash-item.routing.module';
import { ToggleButtonModule } from './toggle-button/toggle-button.module';
import { CreditModule } from './credit/credit.module';
import { Gift1Module } from './gift1/gift1.module';
import { Gift2Module } from './gift2/gift2.module';
import { Gift3Module } from './gift3/gift3.module';
import { Gift4Module } from './gift4/gift4.module';
import { QrModule } from './qr/qr.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NonCashItemRoutingModule,
    ToggleButtonModule,
    CreditModule,
    Gift1Module,
    Gift2Module,
    Gift3Module,
    Gift4Module,
    QrModule,
  ],
})
export class NonCashItemModule {}
