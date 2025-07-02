import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectContainerComponent } from './select-container.component';
import { LabelModule } from '../../atoms/label/label.module';
import { SelectModule } from '../../atoms/select/select.module';

@NgModule({
  declarations: [SelectContainerComponent],
  imports: [CommonModule, LabelModule, SelectModule],
  exports: [SelectContainerComponent],
})
export class SelectContainerModule {}
