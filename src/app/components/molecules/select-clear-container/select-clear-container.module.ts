import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectClearContainerComponent } from './select-clear-container.component';
import { LabelModule } from '../../atoms/label/label.module';
import { SelectModule } from '../../atoms/select/select.module';
import { IconModule } from '../../atoms/icon/icon.module';

@NgModule({
  declarations: [SelectClearContainerComponent],
  imports: [CommonModule, LabelModule, SelectModule, IconModule],
  exports: [SelectClearContainerComponent],
})
export class SelectClearContainerModule {}
