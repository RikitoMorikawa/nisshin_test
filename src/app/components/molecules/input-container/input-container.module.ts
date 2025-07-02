import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputContainerComponent } from './input-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { TextModule } from 'src/app/components/atoms/text/text.module';

@NgModule({
  declarations: [InputContainerComponent],
  exports: [InputContainerComponent],
  imports: [CommonModule, LabelModule, TextModule],
})
export class InputContainerModule {}
