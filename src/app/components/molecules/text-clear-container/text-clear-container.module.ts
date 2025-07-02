import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextClearContainerComponent } from './text-clear-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { TextModule } from 'src/app/components/atoms/text/text.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';

@NgModule({
  declarations: [TextClearContainerComponent],
  exports: [TextClearContainerComponent],
  imports: [CommonModule, IconModule, LabelModule, TextModule],
})
export class TextClearContainerModule {}
