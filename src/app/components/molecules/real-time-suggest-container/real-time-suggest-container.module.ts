import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RealTimeSuggestContainerComponent } from './real-time-suggest-container.component';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { LabelModule } from '../../atoms/label/label.module';

@NgModule({
  declarations: [RealTimeSuggestContainerComponent],
  imports: [CommonModule, ReactiveFormsModule, SpinnerModule, LabelModule],
  exports: [RealTimeSuggestContainerComponent],
})
export class RealTimeSuggestContainerModule {}
