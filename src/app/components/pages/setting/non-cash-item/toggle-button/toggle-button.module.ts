import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { NonCashItemRoutingModule } from '../non-cash-item.routing.module';

@NgModule({
  declarations: [ToggleButtonComponent],
  imports: [CommonModule, NonCashItemRoutingModule],
  exports: [ToggleButtonComponent],
})
export class ToggleButtonModule {}
