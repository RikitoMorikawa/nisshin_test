import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTermClearContainerComponent } from './date-term-clear-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { DatepickerModule } from 'src/app/components/atoms/datepicker/datepicker.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [DateTermClearContainerComponent],
  exports: [DateTermClearContainerComponent],
  imports: [CommonModule, IconModule, LabelModule, DatepickerModule],
})
export class DateTermClearContainerModule {}
