import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { AccountsReceivableAggregateRoutingModule } from '../accounts-receivable-aggregate-routing.module';

@NgModule({
  declarations: [ToggleButtonComponent],
  imports: [CommonModule, AccountsReceivableAggregateRoutingModule],
  exports: [ToggleButtonComponent],
})
export class ToggleButtonModule {}
