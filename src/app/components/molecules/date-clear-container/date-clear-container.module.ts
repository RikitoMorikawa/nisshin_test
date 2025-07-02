import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateClearContainerComponent } from './date-clear-container.component';
import { LabelModule } from '../../atoms/label/label.module';
import { DatepickerModule } from '../../atoms/datepicker/datepicker.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [DateClearContainerComponent],
  imports: [CommonModule, IconModule, LabelModule, DatepickerModule],
  exports: [DateClearContainerComponent],
})
export class DateClearContainerModule {}
