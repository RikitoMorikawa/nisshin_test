import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { SuggestContainerComponent } from './suggest-container.component';
import { SelectModule } from '../../atoms/select/select.module';

@NgModule({
  declarations: [SuggestContainerComponent],
  imports: [CommonModule, SelectModule, TextContainerModule],
  exports: [SuggestContainerComponent],
})
export class SuggestContainerModule {}
