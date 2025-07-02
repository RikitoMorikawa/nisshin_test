import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaContainerComponent } from './textarea-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { TextareaModule } from 'src/app/components/atoms/textarea/textarea.module';

@NgModule({
  declarations: [TextareaContainerComponent],
  exports: [TextareaContainerComponent],
  imports: [CommonModule, LabelModule, TextareaModule],
})
export class TextareaContainerModule {}
