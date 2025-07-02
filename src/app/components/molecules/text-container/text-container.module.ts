import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextContainerComponent } from './text-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { TextModule } from 'src/app/components/atoms/text/text.module';

@NgModule({
  declarations: [TextContainerComponent],
  exports: [TextContainerComponent],
  imports: [CommonModule, LabelModule, TextModule],
})
export class TextContainerModule {}
