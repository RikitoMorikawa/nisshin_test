import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { MasterRoutingModule } from '../master-routing.module';

@NgModule({
  declarations: [ToggleButtonComponent],
  imports: [CommonModule, MasterRoutingModule],
  exports: [ToggleButtonComponent],
})
export class ToggleButtonModule {}
