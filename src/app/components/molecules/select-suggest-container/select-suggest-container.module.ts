import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectSuggestContainerComponent } from './select-suggest-container.component';
import { LabelModule } from 'src/app/components/atoms/label/label.module';
import { TextModule } from 'src/app/components/atoms/text/text.module';
import { IconModule } from '../../atoms/icon/icon.module';

@NgModule({
  declarations: [SelectSuggestContainerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelModule,
    TextModule,
    IconModule,
  ],
  exports: [SelectSuggestContainerComponent],
})
export class SelectSuggestContainerModule {}
