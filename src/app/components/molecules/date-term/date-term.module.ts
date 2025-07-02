import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTermComponent } from './date-term.component';
import { LabelModule } from '../../atoms/label/label.module';
import { DatepickerModule } from '../../atoms/datepicker/datepicker.module';

@NgModule({
  declarations: [DateTermComponent],
  imports: [CommonModule, LabelModule, DatepickerModule],
  exports: [DateTermComponent],
})
export class DateTermModule {}
