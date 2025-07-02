import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ToggleButtonComponent],
  imports: [CommonModule, RouterModule],
  exports: [ToggleButtonComponent],
})
export class ToggleButtonModule {}
