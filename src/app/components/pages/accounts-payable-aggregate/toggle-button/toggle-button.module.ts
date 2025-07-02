import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { AccountsPayableAggregateRoutingModule } from '../accounts-payable-aggregate-routing.module';

@NgModule({
  declarations: [ToggleButtonComponent],
  imports: [CommonModule, AccountsPayableAggregateRoutingModule],
  exports: [ToggleButtonComponent],
})
export class ToggleButtonModule {}
